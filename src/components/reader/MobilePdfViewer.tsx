import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Loader, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

// Динамический импорт PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface MobilePdfViewerProps {
  pdfData: string; // Base64 encoded PDF data
  fileName: string;
  onClose: () => void;
}

const MobilePdfViewer: React.FC<MobilePdfViewerProps> = ({ pdfData, fileName, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  
  // Функция для преобразования base64 в Blob
  const base64ToBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1] || base64);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: 'application/pdf' });
  };
  
  // Загружаем PDF документ при монтировании компонента
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        
        // Создаем Blob из base64 данных
        const blob = base64ToBlob(pdfData);
        const url = URL.createObjectURL(blob);
        
        // Загружаем PDF документ
        const loadingTask = pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        pdfDocRef.current = pdfDoc;
        
        setTotalPages(pdfDoc.numPages);
        renderPage(pdfDoc, 1);
        
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Не удалось загрузить PDF документ');
        setIsLoading(false);
      }
    };
    
    loadPdf();
    
    // Очистка при размонтировании
    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [pdfData]);
  
  // Рендерим страницу PDF
  const renderPage = async (pdfDoc: pdfjsLib.PDFDocumentProxy | null, pageNumber: number) => {
    if (!pdfDoc || !canvasRef.current) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Получаем страницу
      const page = await pdfDoc.getPage(pageNumber);
      
      // Получаем плотность пикселей устройства
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Настраиваем canvas
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        setError('Не удалось создать контекст canvas');
        setIsLoading(false);
        return;
      }
      
      // Получаем размеры контейнера
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth - 30;
      
      // Создаем viewport с учетом масштаба
      const viewport = page.getViewport({ scale: 1 });
      const calculatedScale = (containerWidth / viewport.width) * scale;
      const scaledViewport = page.getViewport({ scale: calculatedScale });
      
      // Устанавливаем размеры canvas с учетом плотности пикселей
      canvas.width = scaledViewport.width * pixelRatio;
      canvas.height = scaledViewport.height * pixelRatio;
      canvas.style.width = `${scaledViewport.width}px`;
      canvas.style.height = `${scaledViewport.height}px`;
      
      // Масштабируем контекст
      context.scale(pixelRatio, pixelRatio);
      
      // Рендерим страницу
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      
      await page.render(renderContext).promise;
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Не удалось отобразить страницу');
      setIsLoading(false);
    }
  };
  
  // Обработчики навигации
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Обработчики масштабирования
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const resetZoom = () => {
    setScale(1);
  };
  
  // Обновляем страницу при изменении номера страницы или масштаба
  useEffect(() => {
    renderPage(pdfDocRef.current, currentPage);
  }, [currentPage, scale]);
  
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900 bg-opacity-95 flex flex-col">
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 text-white p-4 flex items-center justify-between">
        <h1 className="text-lg font-medium truncate max-w-[70%]">{fileName}</h1>
        <button 
          onClick={onClose}
          className="bg-white bg-opacity-20 rounded px-4 py-2 text-sm font-medium"
        >
          Закрыть
        </button>
      </div>
      
      {/* Основной контент */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 bg-opacity-70 z-10">
            <Loader className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        )}
        
        {error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg max-w-md mx-auto">
            <h2 className="text-lg font-medium text-red-700 mb-2">Ошибка</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={onClose}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <canvas ref={canvasRef} className="shadow-lg bg-white" />
        )}
      </div>
      
      {/* Панель управления */}
      <div className="bg-neutral-800 p-4 flex flex-col gap-4">
        {/* Навигация по страницам */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className={`p-2 rounded ${currentPage <= 1 ? 'opacity-50' : 'bg-neutral-700'}`}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          
          <div className="text-white font-medium">
            {currentPage} / {totalPages}
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className={`p-2 rounded ${currentPage >= totalPages ? 'opacity-50' : 'bg-neutral-700'}`}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>
        
        {/* Управление масштабом */}
        <div className="flex items-center justify-between">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className={`p-2 rounded ${scale <= 0.5 ? 'opacity-50' : 'bg-neutral-700'}`}
          >
            <ZoomOut className="h-6 w-6 text-white" />
          </button>
          
          <button
            onClick={resetZoom}
            className="px-3 py-1 bg-neutral-700 rounded text-white text-sm font-medium"
          >
            {Math.round(scale * 100)}%
          </button>
          
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className={`p-2 rounded ${scale >= 3 ? 'opacity-50' : 'bg-neutral-700'}`}
          >
            <ZoomIn className="h-6 w-6 text-white" />
          </button>
          
          <button
            onClick={() => renderPage(pdfDocRef.current, currentPage)}
            className="p-2 rounded bg-neutral-700"
          >
            <RotateCw className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePdfViewer;
