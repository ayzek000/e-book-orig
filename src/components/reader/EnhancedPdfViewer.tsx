import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader, ZoomIn, ZoomOut, RotateCw, ExternalLink, Smartphone } from 'lucide-react';
import { createPdfObjectUrl, openPdfInNewTab } from '../../services/pdfUtils';
import * as pdfjsLib from 'pdfjs-dist';
import { useWindowDimensions } from '../../hooks/useWindowDimensions';

// Динамический импорт PDF.js worker
if (typeof window !== 'undefined') {
  // @ts-ignore - игнорируем ошибку типа для динамического импорта
  const pdfjsWorker = import('pdfjs-dist/build/pdf.worker.entry');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface EnhancedPdfViewerProps {
  pdfAttachment: {
    name: string;
    data: string; // Base64 encoded PDF data
  };
}

const EnhancedPdfViewer = ({ pdfAttachment }: EnhancedPdfViewerProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userScale, setUserScale] = useState(1); // Пользовательский масштаб (1 = 100%)
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth } = useWindowDimensions();

  // Создаем URL объект для PDF при монтировании компонента
  useEffect(() => {
    const url = createPdfObjectUrl(pdfAttachment.data);
    setObjectUrl(url);

    // Очистка URL при размонтировании
    return () => {
      if (url) URL.revokeObjectURL(url);
      if (pdfDocRef.current) pdfDocRef.current.destroy();
    };
  }, [pdfAttachment.data]);

  // Загружаем PDF документ
  useEffect(() => {
    if (!objectUrl) return;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        const loadingTask = pdfjsLib.getDocument(objectUrl);
        const pdfDoc = await loadingTask.promise;
        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        
        // Принудительно вызываем рендеринг первой страницы после загрузки документа
        // с небольшой задержкой для гарантии инициализации всех компонентов
        setTimeout(() => {
          renderCurrentPage(pdfDoc, 1);
          // Дополнительный рендеринг через 300мс для гарантии корректного отображения
          setTimeout(() => {
            renderCurrentPage(pdfDoc, 1);
          }, 300);
        }, 100);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [objectUrl]);
  
  // Выделяем функцию рендеринга страницы в отдельную функцию для повторного использования
  const renderCurrentPage = async (pdfDoc: pdfjsLib.PDFDocumentProxy | null, pageNumber: number) => {
    if (!pdfDoc || !canvasRef.current) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const page = await pdfDoc.getPage(pageNumber);
      
      // Получаем плотность пикселей устройства для высококачественного рендеринга
      const pixelRatio = window.devicePixelRatio || 1;
      
      const canvas = canvasRef.current;
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const calculatedScale = containerWidth / viewport.width * 0.95 * userScale; // 95% от ширины контейнера с учетом пользовательского масштаба
      
      // Создаем масштабированный viewport с учетом плотности пикселей
      const scaledViewport = page.getViewport({ scale: calculatedScale * pixelRatio });
      
      // Устанавливаем размеры canvas с учетом плотности пикселей для четкого рендеринга
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      // Устанавливаем стиль размера canvas для правильного отображения
      canvas.style.width = Math.floor(scaledViewport.width / pixelRatio) + 'px';
      canvas.style.height = Math.floor(scaledViewport.height / pixelRatio) + 'px';
      
      const context = canvas.getContext('2d');
      if (!context) {
        setIsLoading(false);
        return;
      }
      
      // Масштабируем контекст для высокого разрешения
      context.scale(pixelRatio, pixelRatio);
      
      const renderContext = {
        canvasContext: context,
        viewport: page.getViewport({ scale: calculatedScale }),
      };
      
      await page.render(renderContext).promise;
      setIsLoading(false);
    } catch (error) {
      console.error('Error rendering page:', error);
      setIsLoading(false);
    }
  };

  // Определяем, является ли текущий вид мобильным
  useEffect(() => {
    setIsMobileView(windowWidth < 768); // 768px - стандартная точка перехода для мобильных устройств
  }, [windowWidth]);

  // Рендерим текущую страницу при изменении номера страницы, размера окна или масштаба
  useEffect(() => {
    renderCurrentPage(pdfDocRef.current, currentPage);
  }, [currentPage, windowWidth, userScale]);
  
  // Обработчики для перетаскивания PDF на мобильных устройствах
  const handleTouchStart = (e: React.TouchEvent) => {
    if (userScale > 1) { // Активируем перетаскивание только при увеличении
      setIsDragging(true);
      const touch = e.touches[0];
      setDragPosition({ x: touch.clientX, y: touch.clientY });
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || userScale <= 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragPosition.x;
    const deltaY = touch.clientY - dragPosition.y;
    
    if (containerRef.current) {
      containerRef.current.scrollLeft -= deltaX;
      containerRef.current.scrollTop -= deltaY;
    }
    
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Обработчики навигации
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Функция для принудительного обновления текущей страницы
  const refreshCurrentPage = () => {
    renderCurrentPage(pdfDocRef.current, currentPage);
  };
  
  // Функции для управления масштабом
  const zoomIn = () => {
    setUserScale(prev => Math.min(prev + 0.25, 3)); // Максимальный масштаб 300%
  };
  
  const zoomOut = () => {
    setUserScale(prev => Math.max(prev - 0.25, 0.5)); // Минимальный масштаб 50%
  };
  
  const resetZoom = () => {
    setUserScale(1); // Сбросить масштаб до 100%
  };
  
  // Функция для переключения в мобильный режим просмотра
  const toggleMobileView = () => {
    // Если уже в мобильном режиме, возвращаемся к обычному масштабу
    // Иначе устанавливаем масштаб, оптимизированный для мобильного просмотра
    if (isMobileView) {
      setUserScale(prev => prev === 1 ? 1.5 : 1);
    } else {
      setUserScale(1);
    }
  };
  
  // Функция для открытия PDF в новой вкладке без возможности скачивания
  const handleOpenInNewTab = () => {
    openPdfInNewTab(pdfAttachment.data, pdfAttachment.name);
  };

  return (
    <div className="relative bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden shadow-xl transition-all duration-300">
      {/* PDF Viewer */}
      <div className="relative flex flex-col items-center justify-center min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center">
              <Loader className="h-8 w-8 text-primary-500 animate-spin mb-2" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Yuklanmoqda...</span>
            </div>
          </div>
        )}
        
        <div 
          className="pdf-container w-full overflow-auto flex justify-center py-6" 
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <canvas 
            ref={canvasRef} 
            className={`shadow-lg ${isDragging ? 'cursor-grabbing' : userScale > 1 ? 'cursor-grab' : ''}`}
          />
        </div>
      </div>

      {/* Панель навигации с элементами масштабирования - адаптивная для мобильных устройств */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-700">
        {/* Первая строка управления для мобильных устройств */}
        <div className={`flex items-center ${isMobileView ? 'w-full justify-between mb-2' : 'space-x-2'}`}>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className={`btn btn-icon btn-soft ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-100 dark:hover:bg-primary-900/30'}`}
              aria-label="Oldingi sahifa"
            >
              <ChevronLeft className="h-5 w-5 text-primary-700 dark:text-primary-300" />
            </button>
            
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <span className="text-primary-700 dark:text-primary-300">{currentPage}</span> / {totalPages}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className={`btn btn-icon btn-soft ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-100 dark:hover:bg-primary-900/30'}`}
              aria-label="Keyingi sahifa"
            >
              <ChevronRight className="h-5 w-5 text-primary-700 dark:text-primary-300" />
            </button>
          </div>
          
          {isMobileView && (
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMobileView}
                className="btn btn-icon btn-soft hover:bg-primary-100 dark:hover:bg-primary-900/30"
                aria-label="Mobile view"
                title="Mobile view"
              >
                <Smartphone className="h-5 w-5 text-primary-700 dark:text-primary-300" />
              </button>
              
              <button
                onClick={refreshCurrentPage}
                className="btn btn-icon btn-soft hover:bg-primary-100 dark:hover:bg-primary-900/30"
                aria-label="Yangilash"
                title="Sahifani yangilash"
              >
                <RotateCw className="h-5 w-5 text-primary-700 dark:text-primary-300" />
              </button>
            </div>
          )}
          
          {!isMobileView && (
            <button
              onClick={refreshCurrentPage}
              className="btn btn-icon btn-soft hover:bg-primary-100 dark:hover:bg-primary-900/30"
              aria-label="Yangilash"
              title="Sahifani yangilash"
            >
              <RotateCw className="h-5 w-5 text-primary-700 dark:text-primary-300" />
            </button>
          )}
        </div>
        
        {/* Вторая строка управления для мобильных устройств */}
        <div className={`flex items-center ${isMobileView ? 'w-full justify-between' : ''}`}>
          {/* Элементы управления масштабом */}
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              disabled={userScale <= 0.5}
              className={`btn btn-icon btn-soft ${userScale <= 0.5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-100 dark:hover:bg-primary-900/30'}`}
              aria-label="Kichiklashtirish"
              title="Kichiklashtirish"
            >
              <ZoomOut className="h-5 w-5 text-primary-700 dark:text-primary-300" />
            </button>
            
            <button
              onClick={resetZoom}
              className="btn btn-soft px-2 py-1 text-xs hover:bg-primary-100 dark:hover:bg-primary-900/30 font-medium"
              aria-label="Masshtabni tiklash"
              title="Masshtabni tiklash"
            >
              {Math.round(userScale * 100)}%
            </button>
            
            <button
              onClick={zoomIn}
              disabled={userScale >= 3}
              className={`btn btn-icon btn-soft ${userScale >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-100 dark:hover:bg-primary-900/30'}`}
              aria-label="Kattalashtirish"
              title="Kattalashtirish"
            >
              <ZoomIn className="h-5 w-5 text-primary-700 dark:text-primary-300" />
            </button>
          </div>
          
          {/* Кнопка открытия PDF в новой вкладке */}
          <button
            onClick={handleOpenInNewTab}
            className="btn btn-icon btn-soft hover:bg-primary-100 dark:hover:bg-primary-900/30 ml-2"
            aria-label="Yangi oynada ochish"
            title="Yangi oynada ochish"
          >
            <ExternalLink className="h-5 w-5 text-primary-700 dark:text-primary-300" />
          </button>
        </div>
      </div>
      
      {/* Стили для улучшения пользовательского опыта */}
      <style dangerouslySetInnerHTML={{ __html: `
        .pdf-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .pdf-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .pdf-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .pdf-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .dark .pdf-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .dark .pdf-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .dark .pdf-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Мобильные стили */
        @media (max-width: 768px) {
          .pdf-container {
            touch-action: pan-x pan-y;
          }
          .btn {
            padding: 0.5rem;
          }
          .btn-icon {
            width: 2rem;
            height: 2rem;
          }
        }
      ` }} />
    </div>
  );
};

export default EnhancedPdfViewer;
