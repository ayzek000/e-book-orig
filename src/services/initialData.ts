import { db } from './db';

export const loadInitialData = async () => {
  try {
    // Полностью очищаем базу данных и создаем только нужные модули
    console.log('Initializing database with clean data...');
    
    // Получаем количество книг и модулей
    const bookCount = await db.books.count();
    const moduleCount = await db.modules.count();
    
    // Если база данных пуста, создаем новую книгу
    if (bookCount === 0) {
      // Создаем книгу
      await db.books.add({
        id: 1, // Явно указываем ID
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
      
      console.log('Created new book');
    }
    
    // Удаляем все существующие модули
    if (moduleCount > 0) {
      await db.modules.clear();
      console.log('Cleared all modules');
    }
    
    // Создаем только модуль Kirish
    await db.modules.add({
      id: 1, // Явно указываем ID
      bookId: 1,
      title: 'Kirish',
      content: `
        <h2>Kirish</h2>
        <p>Bu yerda siz kitobning kirish qismini yozishingiz mumkin.</p>
        <p>Matnni tahrirlash uchun matn maydoniga bosing va tahrirlash tugmalaridan foydalaning.</p>
      `,
      order: 1
    });
    
    console.log('Created Kirish module');
    
    // Создаем дополнительные модули для примера
    await db.modules.bulkAdd([
      {
        id: 2,
        bookId: 1,
        title: '1-Mavzu: Kirish. Kiyimlarni konstruksiyalashga doir dastlabki ma\'lumotar.',
        content: `
          <h2>1-Mavzu: Kirish. Kiyimlarni konstruksiyalashga doir dastlabki ma'lumotar.</h2>
          <p>Bu yerda siz mavzu haqida ma'lumot yozishingiz mumkin.</p>
        `,
        order: 2
      },
      {
        id: 3,
        bookId: 1,
        title: '2-Mavzu: Gavdadan o\'lchov olish qoidalari. Kiyimni loyihalash usullari',
        content: `
          <h2>2-Mavzu: Gavdadan o'lchov olish qoidalari. Kiyimni loyihalash usullari</h2>
          <p>Bu yerda siz mavzu haqida ma'lumot yozishingiz mumkin.</p>
        `,
        order: 3
      },
      {
        id: 4,
        bookId: 1,
        title: '3-Mavzu: Oshxonada kiyiladigan kiyimlarni konstruksiyalash haqida umumiy ma\'lumot',
        content: `
          <h2>3-Mavzu: Oshxonada kiyiladigan kiyimlarni konstruksiyalash haqida umumiy ma'lumot</h2>
          <p>Bu yerda siz mavzu haqida ma'lumot yozishingiz mumkin.</p>
        `,
        order: 4
      },
      {
        id: 5,
        bookId: 1,
        title: '4-Mavzu: Chaqaloqlar kiyimlari turlari haqida umumiy ma\'lumot',
        content: `
          <h2>4-Mavzu: Chaqaloqlar kiyimlari turlari haqida umumiy ma'lumot</h2>
          <p>Bu yerda siz mavzu haqida ma'lumot yozishingiz mumkin.</p>
        `,
        order: 5
      }
    ]);
    
    console.log('Created additional modules');
    console.log('Database initialization complete');
    
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
};