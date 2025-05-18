import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Book, Module } from '../services/db';

// Имена коллекций
const BOOKS_COLLECTION = 'books';
const MODULES_COLLECTION = 'modules';

// Интерфейсы для Firestore
interface FirestoreBook {
  title: string;
  welcomeContent: string;
  bibliography: string;
}

interface FirestoreModule {
  bookId: string;
  title: string;
  content: string;
  order: number;
  pdfAttachment?: {
    name: string;
    data: string;
  };
}

/**
 * Сервис для администрирования данных в Firestore
 */
export const firestoreDataService = {
  /**
   * Получить все книги из Firestore
   */
  async getAllBooks(): Promise<{ id: string; title: string }[]> {
    try {
      const booksCollection = collection(db, BOOKS_COLLECTION);
      const booksSnapshot = await getDocs(booksCollection);
      return booksSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title as string
      }));
    } catch (error) {
      console.error('Error getting books from Firestore:', error);
      return [];
    }
  },

  /**
   * Загрузить книгу в Firestore
   */
  async uploadBook(book: Omit<Book, 'id'>): Promise<string> {
    try {
      const firestoreBook: FirestoreBook = {
        title: book.title,
        welcomeContent: book.welcomeContent,
        bibliography: book.bibliography
      };
      
      const booksCollection = collection(db, BOOKS_COLLECTION);
      const docRef = await addDoc(booksCollection, firestoreBook);
      return docRef.id;
    } catch (error) {
      console.error('Error uploading book to Firestore:', error);
      throw error;
    }
  },

  /**
   * Загрузить модуль в Firestore
   */
  async uploadModule(module: Omit<Module, 'id'>, firestoreBookId: string): Promise<string> {
    try {
      const firestoreModule: FirestoreModule = {
        bookId: firestoreBookId,
        title: module.title,
        content: module.content,
        order: module.order,
        pdfAttachment: module.pdfAttachment
      };
      
      const modulesCollection = collection(db, MODULES_COLLECTION);
      const docRef = await addDoc(modulesCollection, firestoreModule);
      return docRef.id;
    } catch (error) {
      console.error('Error uploading module to Firestore:', error);
      throw error;
    }
  },

  /**
   * Удалить книгу из Firestore
   */
  async deleteBook(bookId: string): Promise<void> {
    try {
      // Удаляем книгу
      await deleteDoc(doc(db, BOOKS_COLLECTION, bookId));
      
      // Получаем все модули для этой книги и удаляем их
      const modulesCollection = collection(db, MODULES_COLLECTION);
      const modulesQuery = query(modulesCollection, where('bookId', '==', bookId));
      const modulesSnapshot = await getDocs(modulesQuery);
      
      const deletePromises = modulesSnapshot.docs.map(moduleDoc => 
        deleteDoc(doc(db, MODULES_COLLECTION, moduleDoc.id))
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting book from Firestore:', error);
      throw error;
    }
  },

  /**
   * Загрузить все данные из локальной базы данных в Firestore
   */
  async uploadAllDataToFirestore(localBooks: Book[], localModules: Module[]): Promise<void> {
    try {
      // Создаем отображение ID книг: локальный ID -> Firestore ID
      const bookIdMap = new Map<number, string>();
      
      // Загружаем книги
      for (const book of localBooks) {
        const firestoreBookId = await this.uploadBook({
          title: book.title,
          welcomeContent: book.welcomeContent,
          bibliography: book.bibliography
        });
        
        bookIdMap.set(book.id, firestoreBookId);
      }
      
      // Загружаем модули
      for (const module of localModules) {
        // Проверяем, что bookId существует и является числом
        const bookId = module.bookId;
        if (typeof bookId === 'number') {
          const firestoreBookId = bookIdMap.get(bookId);
          if (firestoreBookId) {
            await this.uploadModule({
              bookId, // Это значение не используется, так как bookId передается отдельно
              title: module.title,
              content: module.content,
              order: module.order || 0, // Добавляем значение по умолчанию
              pdfAttachment: module.pdfAttachment || undefined
            }, firestoreBookId);
          }
        }
      }
    } catch (error) {
      console.error('Error uploading all data to Firestore:', error);
      throw error;
    }
  }
};

/**
 * Функция для загрузки начальных данных в Firestore
 */
export async function loadInitialDataToFirestore(): Promise<void> {
  try {
    // Проверяем, есть ли уже данные в Firestore
    const books = await firestoreDataService.getAllBooks();
    
    if (books.length > 0) {
      console.log('Data already exists in Firestore');
      return;
    }
    
    // Создаем книгу по умолчанию
    const bookId = await firestoreDataService.uploadBook({
      title: 'Yangi Elektron Kitob',
      welcomeContent: `
        <h1>Elektron kitobga xush kelibsiz!</h1>
        <p>Bu yerda siz kitob haqida umumiy ma'lumot yozishingiz mumkin.</p>
        <p>O'zingizning kitobingizni yaratish uchun chap tomondagi menyu orqali harakatlaningiz.</p>
      `,
      bibliography: `
        <h2>Adabiyotlar ro'yxati</h2>
        <p>Bu yerda siz foydalangan adabiyotlar ro'yxatini kiritishingiz mumkin.</p>
        <ol>
          <li>Muallif A. Kitob nomi. - Nashriyot, yil. - bet.</li>
          <li>Muallif B. Kitob nomi. - Nashriyot, yil. - bet.</li>
        </ol>
      `
    });
    
    // Создаем примеры модулей
    await firestoreDataService.uploadModule({
      bookId: 1, // Это значение не используется, так как bookId передается отдельно
      title: 'Kirish',
      content: `
        <h1>Kirish</h1>
        <p>Bu yerda siz kirish qismini yozishingiz mumkin.</p>
        <p>Kitobning asosiy maqsadi va vazifalari haqida ma'lumot bering.</p>
      `,
      order: 1
    }, bookId);
    
    await firestoreDataService.uploadModule({
      bookId: 1, // Это значение не используется, так как bookId передается отдельно
      title: 'Asosiy qism',
      content: `
        <h1>Asosiy qism</h1>
        <p>Bu yerda siz asosiy ma'lumotlarni yozishingiz mumkin.</p>
        <p>Kitobning asosiy mazmuni shu yerda bo'ladi.</p>
      `,
      order: 2
    }, bookId);
    
    await firestoreDataService.uploadModule({
      bookId: 1, // Это значение не используется, так как bookId передается отдельно
      title: 'Xulosa',
      content: `
        <h1>Xulosa</h1>
        <p>Bu yerda siz xulosa qismini yozishingiz mumkin.</p>
        <p>Kitobning yakuniy xulosalari va tavsiyalari shu yerda bo'ladi.</p>
      `,
      order: 3
    }, bookId);
    
    console.log('Initial data loaded to Firestore successfully');
  } catch (error) {
    console.error('Error loading initial data to Firestore:', error);
  }
}
