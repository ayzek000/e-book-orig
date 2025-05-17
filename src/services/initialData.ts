import { db, getDefaultBookId } from './db';

export const loadInitialData = async () => {
  try {
    // Check if we already have data
    const bookCount = await db.books.count();
    
    if (bookCount === 0) {
      // Create a default book
      const bookId = await db.books.add({
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
      
      // Create sample modules
      await db.modules.bulkAdd([
        {
          bookId,
          title: 'Kirish',
          content: `
            <h2>Kirish</h2>
            <p>Bu yerda siz kitobning kirish qismini yozishingiz mumkin.</p>
            <p>Matnni tahrirlash uchun matn maydoniga bosing va tahrirlash tugmalaridan foydalaning.</p>
          `,
          order: 1
        },
        {
          bookId,
          title: 'Asosiy qism',
          content: `
            <h2>Asosiy qism</h2>
            <p>Bu yerda siz kitobning asosiy qismini yozishingiz mumkin.</p>
            <p>Kerakli modullarni qo'shish va tartibini o'zgartirish mumkin.</p>
          `,
          order: 2
        },
        {
          bookId,
          title: 'Xulosa',
          content: `
            <h2>Xulosa</h2>
            <p>Bu yerda siz kitobning xulosasini yozishingiz mumkin.</p>
          `,
          order: 3
        }
      ]);
      
      console.log('Initial data loaded successfully');
    }
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
};