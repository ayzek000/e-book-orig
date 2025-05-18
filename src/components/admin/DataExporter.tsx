import { useState } from 'react';
import { db } from '../../services/db';
import { downloadDataAsJson } from '../../services/dataExportService';
import { Save, Download, Check } from 'lucide-react';

/**
 * Компонент для экспорта всех данных из базы данных
 */
const DataExporter = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');
  
  /**
   * Экспортировать все данные из базы данных
   */
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setMessage('Экспорт данных...');
      
      // Получаем все книги и модули из базы данных
      const books = await db.books.toArray();
      const modules = await db.modules.toArray();
      
      // Скачиваем данные как JSON-файл
      downloadDataAsJson(books, modules);
      
      setMessage('Данные успешно экспортированы');
      
      // Создаем копию данных в папке public/data
      // В реальном приложении здесь был бы код для сохранения файла на сервере
      console.log('Данные для сохранения в статический файл:', { books, modules });
      
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage('Ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
      
      // Очистка сообщения через 3 секунды
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Экспорт данных</h2>
      <p className="text-gray-600 mb-4">
        Экспортируйте все данные (книги и модули) в JSON-файл. Этот файл можно будет использовать для восстановления данных или для создания статической версии приложения.
      </p>
      
      <div className="flex items-center">
        <button
          onClick={handleExportData}
          disabled={isExporting}
          className={`flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'}`}
        >
          {isExporting ? (
            <>
              <Save className="w-5 h-5 mr-2 animate-pulse" />
              Экспорт...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Экспортировать данные
            </>
          )}
        </button>
        
        {message && (
          <div className="ml-4 flex items-center text-sm">
            <Check className="w-4 h-4 mr-1 text-green-500" />
            <span>{message}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>Примечание:</strong> После экспорта данных вы можете сохранить JSON-файл в папку <code>public/data</code> с именем <code>static-data.json</code>, чтобы данные загружались автоматически при запуске приложения.
        </p>
      </div>
    </div>
  );
};

export default DataExporter;
