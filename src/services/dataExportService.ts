import { Book, Module, db } from './db';
import { loadInitialData } from './initialData';

/**
 * Сервис для экспорта данных из базы данных в статические JSON-файлы
 */

/**
 * Экспортировать все книги и модули в JSON-формат
 * @param books Список книг
 * @param modules Список модулей
 * @returns JSON-строка с данными
 */
export function exportDataToJson(books: Book[], modules: Module[]): string {
  const data = {
    books,
    modules,
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Создать Blob с данными для скачивания
 * @param jsonData JSON-строка с данными
 * @returns URL для скачивания файла
 */
export function createDownloadableBlob(jsonData: string): string {
  const blob = new Blob([jsonData], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

/**
 * Скачать данные как JSON-файл
 * @param books Список книг
 * @param modules Список модулей
 * @param filename Имя файла (по умолчанию "dressline-data.json")
 */
export function downloadDataAsJson(books: Book[], modules: Module[], filename = 'dressline-data.json'): void {
  const jsonData = exportDataToJson(books, modules);
  const url = createDownloadableBlob(jsonData);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Очистка
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * Сохранить данные в локальное хранилище (IndexedDB)
 * Эта функция сохраняет данные в IndexedDB и возвращает их в виде JSON-строки
 * @param books Список книг
 * @param modules Список модулей
 * @returns Promise с JSON-строкой данных
 */
export async function saveDataToLocalStorage(books: Book[], modules: Module[]): Promise<string> {
  try {
    // Очищаем базу данных
    await db.books.clear();
    await db.modules.clear();
    
    console.log('База данных очищена');
    
    // Сохраняем книги
    if (books && books.length > 0) {
      await db.books.bulkAdd(books);
      console.log(`Сохранено ${books.length} книг`);
    }
    
    // Сохраняем модули
    if (modules && modules.length > 0) {
      await db.modules.bulkAdd(modules);
      console.log(`Сохранено ${modules.length} модулей`);
    }
    
    const jsonData = exportDataToJson(books, modules);
    
    // Сохраняем в localStorage для резервной копии
    localStorage.setItem('dressline-backup', jsonData);
    console.log('Данные сохранены в localStorage');
    
    return jsonData;
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
    throw error;
  }
}

/**
 * Тип данных для статического JSON-файла
 */
export interface StaticData {
  books: Book[];
  modules: Module[];
  exportDate: string;
}

/**
 * Загрузить данные из локального хранилища (localStorage)
 * @returns Promise с данными из localStorage или null, если данных нет
 */
export async function loadDataFromLocalStorage(): Promise<StaticData | null> {
  try {
    const jsonData = localStorage.getItem('dressline-backup');
    if (!jsonData) {
      console.log('Резервная копия не найдена в localStorage');
      return null;
    }
    
    const data = JSON.parse(jsonData) as StaticData;
    console.log('Данные загружены из localStorage:', data);
    
    // Сохраняем данные в IndexedDB
    await saveDataToLocalStorage(data.books, data.modules);
    
    return data;
  } catch (error) {
    console.error('Ошибка при загрузке данных из localStorage:', error);
    return null;
  }
}

/**
 * Импортировать данные из JSON-файла
 * @param file JSON-файл для импорта
 * @returns Promise с результатом импорта
 */
export async function importDataFromJsonFile(file: File): Promise<boolean> {
  try {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const jsonData = event.target?.result as string;
          const data = JSON.parse(jsonData) as StaticData;
          
          // Сохраняем данные в IndexedDB
          await saveDataToLocalStorage(data.books, data.modules);
          
          console.log('Данные успешно импортированы');
          resolve(true);
        } catch (error) {
          console.error('Ошибка при импорте данных:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Ошибка при чтении файла:', error);
        reject(error);
      };
      
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Ошибка при импорте данных:', error);
    return false;
  }
}
