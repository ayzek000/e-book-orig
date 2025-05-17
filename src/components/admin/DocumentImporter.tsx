import React, { useState } from 'react';
import { db } from '../../services/db';
import FileConverter from './FileConverter';
import { FileText, Save, X } from 'lucide-react';

interface DocumentImporterProps {
  onImportComplete?: () => void;
}

const DocumentImporter: React.FC<DocumentImporterProps> = ({ onImportComplete }) => {
  const [convertedContent, setConvertedContent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleConversionComplete = (content: string, title: string) => {
    setConvertedContent(content);
    setDocumentTitle(title);
    setSaveStatus('idle');
  };

  const handleSaveDocument = async () => {
    if (!convertedContent || !documentTitle) {
      setErrorMessage('Необходимо сконвертировать документ перед сохранением');
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Получаем текущую книгу
      const book = await db.books.get(1);
      
      if (!book) {
        throw new Error('Книга не найдена');
      }
      
      // Определяем порядковый номер для нового модуля
      const modules = await db.modules.toArray();
      const maxOrder = modules.length > 0 
        ? Math.max(...modules.map(m => m.order || 0)) 
        : 0;
      
      // Создаем новый модуль
      await db.modules.add({
        title: documentTitle,
        content: convertedContent,
        order: maxOrder + 1,
        bookId: book.id
      });
      
      setSaveStatus('success');
      
      // Вызываем callback, если он предоставлен
      if (onImportComplete) {
        onImportComplete();
      }
      
      // Сбрасываем форму через 2 секунды
      setTimeout(() => {
        setConvertedContent('');
        setDocumentTitle('');
        setSaveStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка при сохранении документа:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Неизвестная ошибка');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center mb-6">
        <FileText className="mr-3 text-primary-500 dark:text-primary-400" size={24} />
        <h2 className="text-2xl font-semibold">Импорт документа</h2>
      </div>
      
      <div className="mb-6">
        <FileConverter onConversionComplete={handleConversionComplete} />
      </div>
      
      {convertedContent && (
        <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <div className="mb-4">
            <label htmlFor="documentTitle" className="block text-sm font-medium mb-2">
              Название документа
            </label>
            <input
              type="text"
              id="documentTitle"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 
                        dark:bg-neutral-700 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Введите название документа"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Предпросмотр конвертированного содержимого
            </label>
            <div className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg max-h-60 overflow-y-auto">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: convertedContent.substring(0, 1000) + (convertedContent.length > 1000 ? '...' : '') }}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setConvertedContent('');
                setDocumentTitle('');
                setSaveStatus('idle');
              }}
              className="btn btn-outline mr-3 flex items-center"
              disabled={isSaving}
            >
              <X size={16} className="mr-2" />
              Отмена
            </button>
            
            <button
              onClick={handleSaveDocument}
              className={`btn flex items-center ${
                saveStatus === 'success' 
                  ? 'btn-success' 
                  : saveStatus === 'error' 
                    ? 'btn-danger' 
                    : 'btn-primary'
              }`}
              disabled={isSaving || !documentTitle}
            >
              <Save size={16} className="mr-2" />
              {isSaving ? 'Сохранение...' : 
               saveStatus === 'success' ? 'Сохранено!' : 
               saveStatus === 'error' ? 'Ошибка' : 
               'Сохранить документ'}
            </button>
          </div>
          
          {saveStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
              {errorMessage || 'Произошла ошибка при сохранении документа.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentImporter;
