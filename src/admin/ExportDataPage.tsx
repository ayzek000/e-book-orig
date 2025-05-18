import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { 
  downloadDataAsJson, 
  saveDataToLocalStorage, 
  loadDataFromLocalStorage,
  importDataFromJsonFile
} from '../services/dataExportService';
import { Book, Module } from '../services/db';
import { Download, Upload, Save, RefreshCw, Database } from 'lucide-react';

const ExportDataPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  // Загрузка данных из базы данных
  const loadData = async () => {
    setIsLoading(true);
    setMessage('Загрузка данных...');
    setMessageType('info');

    try {
      const booksData = await db.books.toArray();
      const modulesData = await db.modules.toArray();
      
      setBooks(booksData);
      setModules(modulesData);
      
      setMessage(`Загружено ${booksData.length} книг и ${modulesData.length} модулей`);
      setMessageType('success');
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setMessage('Ошибка при загрузке данных');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Экспорт данных в JSON-файл
  const handleExport = () => {
    try {
      if (books.length === 0 || modules.length === 0) {
        setMessage('Нет данных для экспорта');
        setMessageType('error');
        return;
      }
      
      downloadDataAsJson(books, modules, 'dressline-data.json');
      
      setMessage('Данные успешно экспортированы');
      setMessageType('success');
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      setMessage('Ошибка при экспорте данных');
      setMessageType('error');
    }
  };

  // Сохранение данных в локальное хранилище
  const handleSave = async () => {
    setIsLoading(true);
    setMessage('Сохранение данных...');
    setMessageType('info');

    try {
      if (books.length === 0 || modules.length === 0) {
        setMessage('Нет данных для сохранения');
        setMessageType('error');
        setIsLoading(false);
        return;
      }
      
      await saveDataToLocalStorage(books, modules);
      
      setMessage('Данные успешно сохранены в локальное хранилище');
      setMessageType('success');
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      setMessage('Ошибка при сохранении данных');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка данных из локального хранилища
  const handleLoad = async () => {
    setIsLoading(true);
    setMessage('Загрузка данных из локального хранилища...');
    setMessageType('info');

    try {
      const data = await loadDataFromLocalStorage();
      
      if (!data) {
        setMessage('Данные не найдены в локальном хранилище');
        setMessageType('error');
        setIsLoading(false);
        return;
      }
      
      // Обновляем состояние
      setBooks(data.books);
      setModules(data.modules);
      
      setMessage('Данные успешно загружены из локального хранилища');
      setMessageType('success');
    } catch (error) {
      console.error('Ошибка при загрузке данных из локального хранилища:', error);
      setMessage('Ошибка при загрузке данных из локального хранилища');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Импорт данных из файла
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage('Импорт данных из файла...');
    setMessageType('info');

    try {
      const success = await importDataFromJsonFile(file);
      
      if (success) {
        // Перезагружаем данные
        await loadData();
        
        setMessage('Данные успешно импортированы из файла');
        setMessageType('success');
      } else {
        setMessage('Ошибка при импорте данных из файла');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Ошибка при импорте данных из файла:', error);
      setMessage('Ошибка при импорте данных из файла');
      setMessageType('error');
    } finally {
      setIsLoading(false);
      // Сбрасываем значение input
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  // Инициализация
  useEffect(() => {
    loadData();
    
    // Создаем скрытый input для загрузки файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    input.addEventListener('change', handleImport as any);
    document.body.appendChild(input);
    setFileInput(input);
    
    return () => {
      if (input && document.body.contains(input)) {
        document.body.removeChild(input);
      }
    };
  }, []);

  // Открыть диалог выбора файла
  const openFileDialog = () => {
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="card-glass p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Экспорт и импорт данных</h1>
        <p className="text-gray-600 mb-6">
          Здесь вы можете экспортировать данные из базы данных в JSON-файл, а также импортировать данные из JSON-файла в базу данных.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card-glass p-4">
            <h2 className="text-xl font-semibold mb-3">Статистика данных</h2>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span>Количество книг:</span>
                <span className="font-semibold">{books.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Количество модулей:</span>
                <span className="font-semibold">{modules.length}</span>
              </div>
            </div>
          </div>
          
          <div className="card-glass p-4">
            <h2 className="text-xl font-semibold mb-3">Статус</h2>
            <div className={`p-3 rounded-lg ${
              messageType === 'success' ? 'bg-green-100 text-green-800' : 
              messageType === 'error' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {message || 'Готов к работе'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button 
            className="btn btn-primary shadow-glow-primary flex items-center"
            onClick={handleExport}
            disabled={isLoading || books.length === 0 || modules.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт в JSON
          </button>
          
          <button 
            className="btn btn-secondary flex items-center"
            onClick={openFileDialog}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Импорт из JSON
          </button>
          
          <button 
            className="btn btn-success flex items-center"
            onClick={handleSave}
            disabled={isLoading || books.length === 0 || modules.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить в хранилище
          </button>
          
          <button 
            className="btn btn-warning flex items-center"
            onClick={handleLoad}
            disabled={isLoading}
          >
            <Database className="h-4 w-4 mr-2" />
            Загрузить из хранилища
          </button>
          
          <button 
            className="btn btn-info flex items-center"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить данные
          </button>
        </div>
      </div>
      
      <div className="card-glass p-6">
        <h2 className="text-xl font-bold mb-4">Инструкция по использованию</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Экспорт данных</h3>
            <p className="text-gray-600">
              Нажмите кнопку "Экспорт в JSON", чтобы сохранить все данные из базы данных в JSON-файл на вашем компьютере.
              Этот файл можно использовать для резервного копирования или переноса данных на другое устройство.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Импорт данных</h3>
            <p className="text-gray-600">
              Нажмите кнопку "Импорт из JSON", чтобы загрузить данные из JSON-файла в базу данных.
              Это полностью заменит все существующие данные в базе данных.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Локальное хранилище</h3>
            <p className="text-gray-600">
              Вы можете сохранить данные в локальное хранилище браузера, чтобы иметь возможность быстро восстановить их в случае необходимости.
              Данные в локальном хранилище сохраняются даже после закрытия браузера.
            </p>
          </div>
          
          <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
            <h3 className="text-lg font-semibold text-yellow-800">Важно!</h3>
            <p className="text-yellow-800">
              Импорт данных полностью заменит все существующие данные в базе данных.
              Перед импортом рекомендуется сделать резервную копию текущих данных.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDataPage;
