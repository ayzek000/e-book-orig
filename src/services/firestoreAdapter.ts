import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db as firestoreDb } from './firebase';
import { db as localDb, Book, Module } from './db';

// Имена коллекций в Firestore
const BOOKS_COLLECTION = 'books';
const MODULES_COLLECTION = 'modules';

// Интерфейсы для данных из Firestore
interface FirestoreBook {
  id: string;
  title: string;
  welcomeContent: string;
  bibliography: string;
}

interface FirestoreModule {
  id: string;
  bookId: string;
  title: string;
  content: string;
  order: number;
  pdfAttachment?: {
    name: string;
    data: string;
  };
}

// Функция для преобразования FirestoreBook в Book
function convertToLocalBook(firestoreBook: FirestoreBook): Omit<Book, 'id'> {
  return {
    title: firestoreBook.title,
    welcomeContent: firestoreBook.welcomeContent,
    bibliography: firestoreBook.bibliography
  };
}

// Функция для преобразования FirestoreModule в Module
function convertToLocalModule(firestoreModule: FirestoreModule, bookId: number): Omit<Module, 'id'> {
  return {
    bookId,
    title: firestoreModule.title,
    content: firestoreModule.content,
    order: firestoreModule.order || 0, // Добавляем значение по умолчанию
    pdfAttachment: firestoreModule.pdfAttachment || undefined
  };
}

// Функция для синхронизации данных из Firestore в локальную базу данных
export async function syncDataFromFirestore(): Promise<void> {
  try {
    // Очищаем локальную базу данных перед синхронизацией
    await localDb.books.clear();
    await localDb.modules.clear();
    
    // Получаем книги из Firestore
    const booksCollection = collection(firestoreDb, BOOKS_COLLECTION);
    const booksQuery = query(booksCollection, limit(10)); // Ограничиваем количество книг
    const booksSnapshot = await getDocs(booksQuery);
    
    // Если книг нет, выходим
    if (booksSnapshot.empty) {
      console.log('No books found in Firestore');
      return;
    }
    
    // Обрабатываем каждую книгу
    for (const bookDoc of booksSnapshot.docs) {
      const firestoreBook: FirestoreBook = {
        id: bookDoc.id,
        ...bookDoc.data() as Omit<FirestoreBook, 'id'>
      };
      
      // Добавляем книгу в локальную базу данных
      const bookId = await localDb.books.add(convertToLocalBook(firestoreBook));
      
      // Получаем модули для этой книги
      const modulesCollection = collection(firestoreDb, MODULES_COLLECTION);
      const modulesQuery = query(
        modulesCollection,
        orderBy('order', 'asc')
      );
      
      const modulesSnapshot = await getDocs(modulesQuery);
      
      // Добавляем модули в локальную базу данных
      for (const moduleDoc of modulesSnapshot.docs) {
        const firestoreModule: FirestoreModule = {
          id: moduleDoc.id,
          ...moduleDoc.data() as Omit<FirestoreModule, 'id'>
        };
        
        // Проверяем, что модуль принадлежит текущей книге
        if (firestoreModule.bookId === firestoreBook.id) {
          await localDb.modules.add(convertToLocalModule(firestoreModule, bookId));
        }
      }
    }
    
    console.log('Data successfully synced from Firestore to local database');
  } catch (error) {
    console.error('Error syncing data from Firestore:', error);
  }
}

// Функция для проверки наличия данных в локальной базе данных
export async function checkLocalData(): Promise<boolean> {
  const bookCount = await localDb.books.count();
  return bookCount > 0;
}

// Функция для инициализации данных
export async function initializeData(): Promise<void> {
  const hasLocalData = await checkLocalData();
  
  if (!hasLocalData) {
    // Если локальных данных нет, пытаемся синхронизировать с Firestore
    await syncDataFromFirestore();
    
    // Если после синхронизации данных все еще нет, используем начальные данные
    const bookCount = await localDb.books.count();
    if (bookCount === 0) {
      // Используем функцию loadInitialData из initialData.ts
      const { loadInitialData } = await import('./initialData');
      await loadInitialData();
    }
  }
}
