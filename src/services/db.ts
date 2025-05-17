import Dexie, { Table } from 'dexie';

// Define types
export interface Book {
  id?: number;
  title: string;
  welcomeContent: string;
  bibliography: string;
}

export interface Module {
  id?: number;
  bookId: number;
  title: string;
  content: string;
  order: number;
  pdfAttachment?: {
    name: string;
    data: string; // Base64 encoded PDF data
  };
}

// Define the database
class EbookDatabase extends Dexie {
  books!: Table<Book, number>;
  modules!: Table<Module, number>;

  constructor() {
    super('EbookDatabase');
    this.version(1).stores({
      books: '++id, title',
      modules: '++id, bookId, order'
    });
  }
}

export const db = new EbookDatabase();

// Helper function to get default book ID
export const getDefaultBookId = async (): Promise<number> => {
  // Get the first book or create one if none exists
  const bookCount = await db.books.count();
  
  if (bookCount === 0) {
    const id = await db.books.add({
      title: 'Yangi kitob',
      welcomeContent: '<p>Xush kelibsiz!</p>',
      bibliography: '<p>Adabiyotlar ro\'yxati</p>'
    });
    return id;
  }
  
  const firstBook = await db.books.toCollection().first();
  return firstBook?.id || 1;
};