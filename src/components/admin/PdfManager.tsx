import { useState, useRef, useEffect } from 'react';
import { Trash2, Upload, Download, Check } from 'lucide-react';
import { PdfFile, getAllPdfFiles, addPdfFile, deletePdfFile, formatFileSize } from '../../services/pdfStorageService';

const PdfManager = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Загрузка списка PDF-файлов при монтировании компонента
  useEffect(() => {
    // Получаем список PDF-файлов из сервиса
    const files = getAllPdfFiles();
    setPdfFiles(files);
  }, []);
  
  // Обработчик загрузки файла
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setMessage('Загрузка файла...');
    
    try {
      // Используем сервис для загрузки файла
      const newPdfFile = await addPdfFile(files[0]);
      
      // Обновляем список файлов
      setPdfFiles(prevFiles => [...prevFiles, newPdfFile]);
      setMessage('Файл успешно загружен');
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
      
      // Очистка сообщения через 3 секунды
      setTimeout(() => setMessage(''), 3000);
      
      // Сброс input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Обработчик удаления файла
  const handleDeleteFile = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      try {
        // Используем сервис для удаления файла
        const success = await deletePdfFile(id);
        
        if (success) {
          // Обновляем список файлов
          setPdfFiles(prevFiles => prevFiles.filter(file => file.id !== id));
          setMessage('Файл успешно удален');
        } else {
          setMessage('Не удалось найти файл для удаления');
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        setMessage('Ошибка при удалении файла');
      } finally {
        // Очистка сообщения через 3 секунды
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Управление PDF-файлами</h1>
      
      {/* Секция загрузки файла */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Загрузить новый PDF</h2>
        <div className="flex items-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            ref={fileInputRef}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className={`flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'}`}
          >
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? 'Загрузка...' : 'Выбрать PDF-файл'}
          </label>
          
          {message && (
            <div className="ml-4 flex items-center text-sm">
              <Check className="w-4 h-4 mr-1 text-green-500" />
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Список PDF-файлов */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Доступные PDF-файлы</h2>
        
        {pdfFiles.length === 0 ? (
          <p className="text-gray-500">Нет доступных PDF-файлов</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Размер
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pdfFiles.map(file => (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{file.lastModified}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a
                          href={file.url}
                          download={file.name}
                          className="text-primary-600 hover:text-primary-900"
                          title="Скачать"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Удалить"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Инструкция по отключению админ-панели */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Как отключить админ-панель</h3>
        <p className="text-blue-700">
          После загрузки всех необходимых PDF-файлов вы можете отключить админ-панель, изменив значение <code>showAdminPanel</code> на <code>false</code> в файле конфигурации.
        </p>
      </div>
    </div>
  );
};

export default PdfManager;
