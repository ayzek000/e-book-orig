import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
import { Upload, FileUp, Check, AlertCircle } from 'lucide-react';

// Динамический импорт PDF.js для работы в браузере
let pdfjs: any = null;

// Функция для инициализации PDF.js
const initPdfJs = async () => {
  if (!pdfjs) {
    pdfjs = await import('pdfjs-dist');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }
  return pdfjs;
};

interface FileConverterProps {
  onConversionComplete?: (content: string, title: string) => void;
}

const FileConverter: React.FC<FileConverterProps> = ({ onConversionComplete }) => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [fileName, setFileName] = useState('');

  const handleConversion = useCallback(async (file: File) => {
    setIsConverting(true);
    setConversionStatus('converting');
    setStatusMessage(`Конвертация файла ${file.name}...`);
    setFileName(file.name.replace(/\.[^/.]+$/, "")); // Имя файла без расширения

    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        // Конвертация PDF
        const pdfJsLib = await initPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        const pdf = await pdfJsLib.getDocument({ data: typedArray }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        text = fullText;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Конвертация DOCX
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        throw new Error('Неподдерживаемый формат файла');
      }

      // Форматирование текста в HTML
      const formattedText = formatTextToHtml(text);
      setConvertedText(formattedText);
      
      if (onConversionComplete) {
        onConversionComplete(formattedText, fileName);
      }
      
      setConversionStatus('success');
      setStatusMessage('Файл успешно конвертирован!');
    } catch (error) {
      console.error('Ошибка конвертации:', error);
      setConversionStatus('error');
      setStatusMessage(`Ошибка конвертации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsConverting(false);
    }
  }, [onConversionComplete]);

  // Форматирование текста в HTML с автоматическим определением заголовков и параграфов
  const formatTextToHtml = (text: string): string => {
    // Разделяем текст на строки
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Определяем заголовки по длине и другим признакам
    let html = '';
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '') continue;
      
      // Проверяем, является ли строка заголовком
      if (line.length < 100 && (line.endsWith(':') || (i > 0 && lines[i-1] === '') && (i < lines.length - 1 && lines[i+1] === ''))) {
        // Определяем уровень заголовка
        let headingLevel = 2;
        if (line.length < 30) headingLevel = 1;
        else if (line.length < 50) headingLevel = 2;
        else headingLevel = 3;
        
        html += `<h${headingLevel}>${line}</h${headingLevel}>\n`;
      } 
      // Проверяем, является ли строка элементом списка
      else if (line.match(/^[\d\-\*\•]\s+/)) {
        if (!inList) {
          html += '<ul>\n';
          inList = true;
        }
        html += `<li>${line.replace(/^[\d\-\*\•]\s+/, '')}</li>\n`;
      } 
      // Иначе это обычный параграф
      else {
        if (inList) {
          html += '</ul>\n';
          inList = false;
        }
        html += `<p>${line}</p>\n`;
      }
    }
    
    if (inList) {
      html += '</ul>\n';
    }
    
    return html;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleConversion(acceptedFiles[0]);
      }
    }, [handleConversion]),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-primary-500 bg-primary-100/20 dark:bg-primary-900/20' 
            : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`p-4 rounded-full ${
            conversionStatus === 'idle' ? 'bg-neutral-100 dark:bg-neutral-800' :
            conversionStatus === 'converting' ? 'bg-primary-100 dark:bg-primary-900/50 animate-pulse' :
            conversionStatus === 'success' ? 'bg-green-100 dark:bg-green-900/50' :
            'bg-red-100 dark:bg-red-900/50'
          }`}>
            {conversionStatus === 'idle' && <Upload size={32} className="text-neutral-500 dark:text-neutral-400" />}
            {conversionStatus === 'converting' && <FileUp size={32} className="text-primary-500 dark:text-primary-400 animate-bounce" />}
            {conversionStatus === 'success' && <Check size={32} className="text-green-500 dark:text-green-400" />}
            {conversionStatus === 'error' && <AlertCircle size={32} className="text-red-500 dark:text-red-400" />}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {conversionStatus === 'idle' ? 'Загрузите файл для конвертации' : statusMessage}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {conversionStatus === 'idle' && 'Перетащите файл .docx или .pdf сюда или нажмите для выбора'}
            </p>
          </div>
          
          {conversionStatus === 'success' && (
            <div className="mt-4 w-full">
              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg max-h-40 overflow-y-auto">
                <div className="text-sm font-mono whitespace-pre-wrap">
                  {convertedText.substring(0, 200)}...
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <button 
                  className="btn btn-primary px-4 py-2 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onConversionComplete) {
                      onConversionComplete(convertedText, fileName);
                    }
                  }}
                >
                  Использовать конвертированный текст
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileConverter;
