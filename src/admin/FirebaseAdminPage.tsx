import { useState } from 'react';
import { firestoreDataService, loadInitialDataToFirestore } from './firebaseDataService';
import { db } from '../services/db';

function FirebaseAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [books, setBooks] = useState<{ id: string; title: string }[]>([]);

  // Загрузить начальные данные в Firestore
  const handleLoadInitialData = async () => {
    try {
      setIsLoading(true);
      setMessage('Загрузка начальных данных...');
      
      await loadInitialDataToFirestore();
      
      setMessage('Начальные данные успешно загружены в Firestore');
      await loadFirestoreBooks();
    } catch (error) {
      console.error('Error loading initial data:', error);
      setMessage(`Ошибка при загрузке начальных данных: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузить все данные из локальной базы данных в Firestore
  const handleUploadAllData = async () => {
    try {
      setIsLoading(true);
      setMessage('Загрузка всех данных из локальной базы данных...');
      
      // Получаем все книги и модули из локальной базы данных
      const localBooks = await db.books.toArray();
      const localModules = await db.modules.toArray();
      
      await firestoreDataService.uploadAllDataToFirestore(localBooks, localModules);
      
      setMessage('Все данные успешно загружены в Firestore');
      await loadFirestoreBooks();
    } catch (error) {
      console.error('Error uploading all data:', error);
      setMessage(`Ошибка при загрузке всех данных: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузить список книг из Firestore
  const loadFirestoreBooks = async () => {
    try {
      const firestoreBooks = await firestoreDataService.getAllBooks();
      setBooks(firestoreBooks);
    } catch (error) {
      console.error('Error loading Firestore books:', error);
      setMessage(`Ошибка при загрузке списка книг: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Удалить книгу из Firestore
  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту книгу и все её модули?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage(`Удаление книги ${bookId}...`);
      
      await firestoreDataService.deleteBook(bookId);
      
      setMessage('Книга успешно удалена из Firestore');
      await loadFirestoreBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      setMessage(`Ошибка при удалении книги: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Firebase Admin</h1>
      
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Управление данными Firestore</h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleLoadInitialData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Загрузить начальные данные
          </button>
          
          <button
            onClick={handleUploadAllData}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Загрузить все данные из локальной БД
          </button>
          
          <button
            onClick={() => loadFirestoreBooks()}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Обновить список книг
          </button>
        </div>
        
        {isLoading && (
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}
        
        {message && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p>{message}</p>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Книги в Firestore</h2>
        
        {books.length === 0 ? (
          <p>Нет доступных книг в Firestore</p>
        ) : (
          <div className="space-y-4">
            {books.map(book => (
              <div key={book.id} className="p-4 border rounded flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-gray-500">ID: {book.id}</p>
                </div>
                <button
                  onClick={() => handleDeleteBook(book.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FirebaseAdminPage;
