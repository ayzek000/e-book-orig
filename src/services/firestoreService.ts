import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { Book, Module } from './db';

// Имена коллекций
const BOOKS_COLLECTION = 'books';
const MODULES_COLLECTION = 'modules';

// Сервис для работы с книгами (только чтение)
export const bookService = {
  // Получить все книги
  async getAll(): Promise<Book[]> {
    const booksCollection = collection(db, BOOKS_COLLECTION);
    const booksSnapshot = await getDocs(booksCollection);
    return booksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title as string,
        welcomeContent: data.welcomeContent as string,
        bibliography: data.bibliography as string
      };
    });
  },

  // Получить книгу по ID
  async getById(id: string): Promise<Book | null> {
    const bookDoc = doc(db, BOOKS_COLLECTION, id);
    const bookSnapshot = await getDoc(bookDoc);
    
    if (!bookSnapshot.exists()) {
      return null;
    }
    
    return {
      id: bookSnapshot.id,
      ...bookSnapshot.data()
    } as Book;
  },

  // Получить первую книгу (для пользователей)
  async getFirst(): Promise<Book | null> {
    const booksCollection = collection(db, BOOKS_COLLECTION);
    const q = query(booksCollection, limit(1));
    const booksSnapshot = await getDocs(q);
    
    if (booksSnapshot.empty) {
      return null;
    }
    
    const doc = booksSnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Book;
  }
};

// Сервис для работы с модулями (только чтение)
export const moduleService = {
  // Получить все модули для книги
  async getAllByBookId(bookId: string): Promise<Module[]> {
    const modulesCollection = collection(db, MODULES_COLLECTION);
    const q = query(
      modulesCollection, 
      where('bookId', '==', bookId),
      orderBy('order', 'asc')
    );
    
    const modulesSnapshot = await getDocs(q);
    return modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Module));
  },

  // Получить модуль по ID
  async getById(id: string): Promise<Module | null> {
    const moduleDoc = doc(db, MODULES_COLLECTION, id);
    const moduleSnapshot = await getDoc(moduleDoc);
    
    if (!moduleSnapshot.exists()) {
      return null;
    }
    
    return {
      id: moduleSnapshot.id,
      ...moduleSnapshot.data()
    } as Module;
  }
};

// Функция для загрузки данных из Firestore в IndexedDB
export const syncDataFromFirestore = async (): Promise<void> => {
  try {
    // Получаем первую книгу из Firestore
    const book = await bookService.getFirst();
    
    if (!book) {
      console.error('No books found in Firestore');
      return;
    }
    
    // Получаем все модули для этой книги
    const modules = await moduleService.getAllByBookId(book.id);
    
    // Здесь можно добавить код для синхронизации с IndexedDB
    // Например, используя функции из db.ts
    
    console.log('Data synced from Firestore:', { book, modules });
    return;
  } catch (error) {
    console.error('Error syncing data from Firestore:', error);
  }
};
