import { useState, useEffect, useRef } from 'react';
import { db } from '../../services/db';
import { 
  downloadDataAsJson, 
  saveDataToLocalStorage, 
  loadDataFromLocalStorage,
  importDataFromJsonFile
} from '../../services/dataExportService';
import { Book, Module } from '../../services/db';
import { Save, Download, Check, X, Upload, RefreshCw, Database } from 'lucide-react';

/**
 * Страница для экспорта данных и отключения админ-панели
 */
const DataExportPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [bookCount, setBookCount] = useState(0);
  const [moduleCount, setModuleCount] = useState(0);
  
  // Загрузка статистики при монтировании компонента
  useEffect(() => {
    const loadStats = async () => {
      const books = await db.books.count();
      const modules = await db.modules.count();
      
      setBookCount(books);
      setModuleCount(modules);
    };
    
    loadStats();
  }, []);
  
  // Ссылка на скрытый input для загрузки файла
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /**
   * Экспортировать все данные из базы данных
   */
  const handleExportData = async () => {
    console.log('Начинаем экспорт данных...');
    try {
      setIsExporting(true);
      setMessage('Экспорт данных...');
      
      // Получаем все книги и модули из базы данных
      const books = await db.books.toArray();
      const modules = await db.modules.toArray();
      
      console.log('Книги:', books);
      console.log('Модули:', modules);
      
      // Скачиваем данные как JSON-файл
      downloadDataAsJson(books, modules, 'dressline-data.json');
      
      setMessage('Данные успешно экспортированы');
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage('Ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
      
      // Очистка сообщения через 5 секунд
      setTimeout(() => setMessage(''), 5000);
    }
  };
  
  /**
   * Сохранить данные в локальное хранилище
   */
  const handleSaveToLocalStorage = async () => {
    try {
      setIsExporting(true);
      setMessage('Сохранение данных в локальное хранилище...');
      
      // Получаем все книги и модули из базы данных
      const books = await db.books.toArray();
      const modules = await db.modules.toArray();
      
      // Сохраняем данные в локальное хранилище
      await saveDataToLocalStorage(books, modules);
      
      setMessage('Данные успешно сохранены в локальное хранилище');
      
      // Обновляем статистику
      setBookCount(books.length);
      setModuleCount(modules.length);
    } catch (error) {
      console.error('Error saving data to local storage:', error);
      setMessage('Ошибка при сохранении данных в локальное хранилище');
    } finally {
      setIsExporting(false);
      
      // Очистка сообщения через 5 секунд
      setTimeout(() => setMessage(''), 5000);
    }
  };
  
  /**
   * Загрузить данные из локального хранилища
   */
  const handleLoadFromLocalStorage = async () => {
    try {
      setIsExporting(true);
      setMessage('Загрузка данных из локального хранилища...');
      
      // Загружаем данные из локального хранилища
      const data = await loadDataFromLocalStorage();
      
      if (!data) {
        setMessage('Данные не найдены в локальном хранилище');
        setIsExporting(false);
        return;
      }
      
      setMessage('Данные успешно загружены из локального хранилища');
      
      // Обновляем статистику
      setBookCount(data.books.length);
      setModuleCount(data.modules.length);
    } catch (error) {
      console.error('Error loading data from local storage:', error);
      setMessage('Ошибка при загрузке данных из локального хранилища');
    } finally {
      setIsExporting(false);
      
      // Очистка сообщения через 5 секунд
      setTimeout(() => setMessage(''), 5000);
    }
  };
  
  /**
   * Импортировать данные из JSON-файла
   */
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsExporting(true);
      setMessage('Импорт данных из файла...');
      
      // Импортируем данные из файла
      const success = await importDataFromJsonFile(file);
      
      if (success) {
        setMessage('Данные успешно импортированы из файла');
        
        // Обновляем статистику
        const books = await db.books.count();
        const modules = await db.modules.count();
        setBookCount(books);
        setModuleCount(modules);
      } else {
        setMessage('Ошибка при импорте данных из файла');
      }
    } catch (error) {
      console.error('Error importing data from file:', error);
      setMessage('Ошибка при импорте данных из файла');
    } finally {
      setIsExporting(false);
      
      // Очистка input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Очистка сообщения через 5 секунд
      setTimeout(() => setMessage(''), 5000);
    }
  };
  
  /**
   * Открыть диалог выбора файла
   */
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  /**
   * Отключить админ-панель
   */
  const handleDisableAdminPanel = () => {
    if (window.confirm('Вы уверены, что хотите отключить админ-панель? Это действие нельзя отменить без редактирования кода.')) {
      // Инструкции для отключения админ-панели
      alert('Чтобы отключить админ-панель, откройте файл src/App.tsx и измените значение константы SHOW_ADMIN_PANEL на false.');
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Экспорт данных и отключение админ-панели</h1>
      
      {/* Статистика */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Статистика данных</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{bookCount}</div>
            <div className="text-sm text-blue-700">Книг в базе данных</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{moduleCount}</div>
            <div className="text-sm text-green-700">Модулей в базе данных</div>
          </div>
        </div>
      </div>
      
      {/* Экспорт и импорт данных */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Экспорт и импорт данных</h2>
        <p className="text-gray-600 mb-4">
          Экспортируйте все данные (книги и модули) в JSON-файл или сохраните их в локальное хранилище браузера.
          Вы также можете импортировать данные из JSON-файла или загрузить их из локального хранилища.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Экспорт в JSON */}
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="btn btn-primary flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            {isExporting ? 'Экспорт...' : 'Экспортировать в JSON'}
          </button>
          
          {/* Импорт из JSON */}
          <button
            onClick={openFileDialog}
            disabled={isExporting}
            className="btn btn-secondary flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Импортировать из JSON
          </button>
          
          {/* Сохранить в локальное хранилище */}
          <button
            onClick={handleSaveToLocalStorage}
            disabled={isExporting}
            className="btn btn-success flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Сохранить в хранилище
          </button>
          
          {/* Загрузить из локального хранилища */}
          <button
            onClick={handleLoadFromLocalStorage}
            disabled={isExporting}
            className="btn btn-warning flex items-center"
          >
            <Database className="w-5 h-5 mr-2" />
            Загрузить из хранилища
          </button>
          
          {/* Обновить статистику */}
          <button
            onClick={() => {
              const loadStats = async () => {
                const books = await db.books.count();
                const modules = await db.modules.count();
                setBookCount(books);
                setModuleCount(modules);
                setMessage('Статистика обновлена');
                setTimeout(() => setMessage(''), 3000);
              };
              loadStats();
            }}
            disabled={isExporting}
            className="btn btn-info flex items-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Обновить статистику
          </button>
        </div>
        
        {/* Скрытый input для загрузки файла */}
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImportData}
          style={{ display: 'none' }}
        />
        
        {/* Сообщение о статусе */}
        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-green-700">{message}</span>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Инструкции по работе с данными</h3>
          <ul className="list-disc pl-5 text-yellow-700 space-y-2">
            <li><strong>Экспортировать в JSON</strong> - скачать все данные в JSON-файл на компьютер</li>
            <li><strong>Импортировать из JSON</strong> - загрузить данные из JSON-файла в базу данных</li>
            <li><strong>Сохранить в хранилище</strong> - сохранить данные в локальное хранилище браузера</li>
            <li><strong>Загрузить из хранилища</strong> - загрузить данные из локального хранилища браузера</li>
            <li><strong>Обновить статистику</strong> - обновить информацию о количестве книг и модулей</li>
          </ul>
        </div>
      </div>
      
      {/* Отключение админ-панели */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Отключение админ-панели</h2>
        <p className="text-gray-600 mb-4">
          После того как вы экспортировали все данные и сохранили их в статический файл, вы можете отключить админ-панель, чтобы она не отображалась пользователям.
        </p>
        
        <div className="flex items-center">
          <button
            onClick={handleDisableAdminPanel}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <X className="w-5 h-5 mr-2" />
            Отключить админ-панель
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Инструкции по отключению админ-панели</h3>
          <ol className="list-decimal pl-5 text-blue-700 space-y-2">
            <li>Откройте файл <code>src/App.tsx</code></li>
            <li>Найдите константу <code>SHOW_ADMIN_PANEL</code> в начале файла</li>
            <li>Измените значение с <code>true</code> на <code>false</code></li>
            <li>Сохраните файл и перезапустите приложение</li>
          </ol>
        </div>
      </div>
      
      {/* Дополнительная информация */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Дополнительная информация</h2>
        <p className="text-gray-600 mb-4">
          После отключения админ-панели все данные будут загружаться из статического файла <code>public/data/static-data.json</code>. Если вам понадобится внести изменения в данные, вам придется снова включить админ-панель, внести изменения и снова экспортировать данные.
        </p>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Структура статического файла</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
{`{
  "books": [
    {
      "id": 1,
      "title": "Название книги",
      "welcomeContent": "Содержимое приветственной страницы",
      "bibliography": "Библиография"
    }
  ],
  "modules": [
    {
      "id": 1,
      "bookId": 1,
      "title": "Название модуля",
      "content": "Содержимое модуля",
      "order": 1
    }
  ],
  "exportDate": "2025-05-18T01:00:00.000Z"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DataExportPage;
