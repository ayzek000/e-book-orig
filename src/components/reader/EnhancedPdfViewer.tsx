import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { createPdfObjectUrl } from '../../services/pdfUtils';
import * as pdfjsLib from 'pdfjs-dist';

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
  const [pdfScale, setPdfScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      
      // Адаптивный масштаб на основе ширины контейнера
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsLoading(false);
        return;
      }
      
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const calculatedScale = containerWidth / viewport.width * 0.95; // 95% от ширины контейнера
      setPdfScale(calculatedScale);
      
      const scaledViewport = page.getViewport({ scale: calculatedScale });
      const context = canvas.getContext('2d');
      if (!context) {
        setIsLoading(false);
        return;
      }
      
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      
      await page.render(renderContext).promise;
      setIsLoading(false);
    } catch (error) {
      console.error('Error rendering page:', error);
      setIsLoading(false);
    }
  };

  // Получаем размеры окна для адаптивного отображения
  const getWindowDimensions = () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Рендерим текущую страницу при изменении номера страницы или размера окна
  useEffect(() => {
    renderCurrentPage(pdfDocRef.current, currentPage);
  }, [currentPage, windowDimensions.width]);

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

  // Обработчик клавиш для навигации
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages]);

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
        
        <div className="pdf-container w-full overflow-auto flex justify-center py-6" ref={containerRef}>
          <canvas 
            ref={canvasRef} 
            className="shadow-lg"
          />
        </div>
      </div>

      {/* Минималистичная панель навигации */}
      <div className="flex items-center justify-between p-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className={`btn btn-icon btn-soft ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-100 dark:hover:bg-primary-900/30'}`}
            aria-label="Oldingi sahifa"
          >
            <ChevronLeft className="h-5 w-5 text-primary-700 dark:text-primary-300" />
          </button>
          
          <button
            onClick={refreshCurrentPage}
            className="btn btn-icon btn-soft hover:bg-primary-100 dark:hover:bg-primary-900/30"
            aria-label="Yangilash"
            title="Sahifani yangilash"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary-700 dark:text-primary-300">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>
        </div>
        
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
      ` }} />
    </div>
  );
};

export default EnhancedPdfViewer;
