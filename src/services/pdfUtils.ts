/**
 * Utility functions for handling PDF files
 */

/**
 * Convert a File object to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Convert a base64 string to a Blob object
 */
export const base64ToBlob = (base64: string, mimeType: string = 'application/pdf'): Blob => {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
};

/**
 * Create an object URL for a PDF from base64 data
 */
export const createPdfObjectUrl = (base64: string): string => {
  const blob = base64ToBlob(base64);
  return URL.createObjectURL(blob);
};

/**
 * Validate if a file is a PDF
 */
export const validatePdfFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

/**
 * Open PDF in a new tab without download option
 * This creates a direct PDF viewer that prevents easy downloading
 * and works well on both desktop and mobile devices
 */
export const openPdfInNewTab = (base64: string, fileName: string = 'document.pdf'): void => {
  // Создаем Blob из base64 данных
  const blob = base64ToBlob(base64);
  const blobUrl = URL.createObjectURL(blob);
  
  // Определяем, является ли устройство мобильным
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Для мобильных устройств создаем специальный просмотрщик
  if (isMobile) {
    // Открываем новую вкладку с мобильным просмотрщиком
    const newTab = window.open('', '_blank');
    
    if (!newTab) {
      alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
      return;
    }
    
    // Создаем HTML с PDF.js для мобильных устройств
    const mobileViewerHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${fileName}</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
            background-color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100%;
          }
          .header {
            background: linear-gradient(to right, #4f46e5, #7c3aed);
            color: white;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 10;
          }
          .header h1 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 70%;
          }
          .close-btn {
            background-color: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            min-width: 70px;
            min-height: 32px;
          }
          .content {
            flex: 1;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            padding: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .pdf-frame {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .fallback {
            text-align: center;
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
          }
          .fallback h2 {
            margin-top: 0;
            color: #333;
          }
          .fallback p {
            margin-bottom: 20px;
            color: #666;
          }
          .download-btn {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${fileName}</h1>
            <button class="close-btn" onclick="window.close()">Закрыть</button>
          </div>
          <div class="content">
            <iframe src="${blobUrl}" class="pdf-frame" title="${fileName}" sandbox="allow-same-origin allow-scripts"></iframe>
            <div class="fallback" style="display: none;" id="fallback">
              <h2>Не удалось отобразить PDF</h2>
              <p>Ваш браузер не может отобразить этот PDF-документ напрямую.</p>
              <a href="${blobUrl}" download="${fileName}" class="download-btn">Скачать PDF</a>
            </div>
          </div>
        </div>
        <script>
          // Проверяем загрузку PDF в iframe
          window.addEventListener('load', function() {
            const iframe = document.querySelector('.pdf-frame');
            const fallback = document.getElementById('fallback');
            
            // Проверяем, загрузился ли PDF
            setTimeout(function() {
              try {
                // Пытаемся получить доступ к содержимому iframe
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                // Если содержимое пустое или содержит ошибку, показываем запасной вариант
                if (iframeDoc.body.innerHTML.includes('error') || iframeDoc.body.innerHTML === '') {
                  iframe.style.display = 'none';
                  fallback.style.display = 'block';
                }
              } catch (e) {
                // Если не можем получить доступ к содержимому iframe, показываем запасной вариант
                console.error('Error checking PDF loading:', e);
              }
            }, 2000); // Даем 2 секунды на загрузку
          });
        </script>
      </body>
      </html>
    `;
    
    // Записываем HTML в новую вкладку
    newTab.document.write(mobileViewerHtml);
    newTab.document.close();
    
    // Освобождаем URL объект при закрытии вкладки
    newTab.addEventListener('beforeunload', () => {
      URL.revokeObjectURL(blobUrl);
    });
    
    return;
  }
  
  // Для десктопных устройств открываем новую вкладку
  const newTab = window.open('', '_blank');
  
  if (!newTab) {
    alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
    return;
  }
  
  // Создаем HTML-контент для новой вкладки с PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>${fileName}</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
          background-color: #f5f5f5;
          touch-action: manipulation;
        }
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .header {
          background: linear-gradient(to right, #4f46e5, #7c3aed);
          color: white;
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 80%;
        }
        .close-btn {
          background-color: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          min-width: 70px;
          min-height: 32px;
        }
        .close-btn:hover {
          background-color: rgba(255,255,255,0.3);
        }
        .pdf-container {
          flex: 1;
          width: 100%;
          height: calc(100% - 60px);
          position: relative;
        }
        /* Скрываем меню скачивания в PDF вьюере */
        #pdf-viewer {
          width: 100%;
          height: 100%;
          border: none;
          overflow: hidden;
        }
        /* Скрываем контекстное меню */
        #pdf-viewer::-webkit-context-menu {
          display: none !important;
        }
        
        /* Мобильные стили */
        @media (max-width: 768px) {
          .header {
            padding: 8px 12px;
          }
          .header h1 {
            font-size: 16px;
            max-width: 70%;
          }
          .close-btn {
            padding: 6px 12px;
            font-size: 14px;
          }
          /* Улучшаем отзывчивость на сенсорных экранах */
          #pdf-viewer {
            -webkit-overflow-scrolling: touch;
          }
        }
        
        /* Стили для разных ориентаций экрана */
        .mobile-view.portrait #pdf-viewer {
          height: calc(100vh - 60px);
        }
        
        .mobile-view.landscape #pdf-viewer {
          height: calc(100vh - 50px);
        }
        
        /* Стили для ландшафтной ориентации */
        body.landscape .header {
          padding: 5px 15px;
        }
        
        body.landscape .header h1 {
          font-size: 14px;
        }
        
        body.landscape .close-btn {
          padding: 4px 8px;
          font-size: 12px;
        }
        
        /* Стили для портретной ориентации */
        body.portrait .pdf-container {
          height: calc(100% - 60px);
        }
      </style>
      <script>
        // Добавляем обработчики для отключения контекстного меню и сохранения
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          return false;
        });
        
        document.addEventListener('keydown', function(e) {
          // Блокируем Ctrl+S, Ctrl+P, Ctrl+Shift+S
          if ((e.ctrlKey && e.key === 's') || 
              (e.ctrlKey && e.key === 'p') || 
              (e.ctrlKey && e.shiftKey && e.key === 'S')) {
            e.preventDefault();
            return false;
          }
        });
        
        // Определяем ориентацию экрана и адаптируем интерфейс
        function handleOrientationChange() {
          const isLandscape = window.innerWidth > window.innerHeight;
          document.body.classList.toggle('landscape', isLandscape);
          document.body.classList.toggle('portrait', !isLandscape);
        }
        
        // Вызываем функцию при загрузке и при изменении ориентации
        window.addEventListener('load', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);
      </script>
    </head>
    <body>
      <div class="container ${isMobile ? 'mobile-view' : ''}">
        <div class="header">
          <h1>${fileName}</h1>
          <button class="close-btn" onclick="window.close()">${isMobile ? 'Закрыть' : 'Закрыть'}</button>
        </div>
        <div class="pdf-container">
          <object id="pdf-viewer" data="${blobUrl}" type="application/pdf">
            <p>Ваш браузер не поддерживает просмотр PDF. Вы можете <a href="${blobUrl}" target="_blank">скачать PDF</a> и просмотреть его с помощью другой программы.</p>
          </object>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Записываем HTML в новую вкладку
  newTab.document.write(htmlContent);
  newTab.document.close();
  
  // Освобождаем URL объект при закрытии вкладки
  newTab.addEventListener('beforeunload', () => {
    URL.revokeObjectURL(blobUrl);
  });
};
