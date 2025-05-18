import { db } from './db';

/**
 * Загрузить начальные данные в базу данных
 */
export const loadInitialData = async () => {
  console.log('Initializing database with default data...');
  
  try {
    // Создаем книгу
    const bookId = await db.books.add({
      title: 'DressLine',
      welcomeContent: '<h1>DressLine</h1><p>Modern E-Book</p>',
      bibliography: '<h2>Bibliography</h2><p>List of references...</p>'
    });
    
    console.log(`Created book with ID: ${bookId}`);
    
    // Создаем модуль Kirish
    await db.modules.add({
      bookId,
      title: 'Kirish',
      content: '<h1>Kirish</h1><p>Bu yerda siz kitobning kirish qismini yozishingiz mumkin.</p><p>Matnni tahrirlash uchun matn maydoniga bosing va tahrirlash tugmalaridan foydalaning.</p>',
      order: 1
    });
    
    // Создаем модуль 1-Mavzu
    await db.modules.add({
      bookId,
      title: '1-Mavzu: Kirish. Kiyimlarni konstruksiyalashga doir dastlabki ma\'lumotlar.',
      content: '<h1>1-Mavzu: Kirish</h1><p>Kiyimlarni konstruksiyalashga doir dastlabki ma\'lumotlar haqida ma\'lumot.</p>',
      order: 2
    });
    
    // Создаем модуль 2-Mavzu
    await db.modules.add({
      bookId,
      title: '2-Mavzu: Gavdadan o\'lchov olish qoidalari. Kiyimni loyihalash usullari',
      content: '<h1>2-Mavzu: Gavdadan o\'lchov olish qoidalari</h1><p>Kiyimni loyihalash usullari haqida ma\'lumot.</p>',
      order: 3
    });
    
    // Создаем модуль 3-Mavzu
    await db.modules.add({
      bookId,
      title: '3-Mavzu: Oshxonada kiyiladigan kiyimlarni konstruksiyalash haqida umumiy ma\'lumot',
      content: '<h1>3-Mavzu: Oshxonada kiyiladigan kiyimlar</h1><p>Oshxonada kiyiladigan kiyimlarni konstruksiyalash haqida umumiy ma\'lumot.</p>',
      order: 4
    });
    
    // Создаем модуль 4-Mavzu
    await db.modules.add({
      bookId,
      title: '4-Mavzu: Chaqaloqlar kiyimlari turlari haqida umumiy ma\'lumot',
      content: '<h1>4-Mavzu: Chaqaloqlar kiyimlari</h1><p>Chaqaloqlar kiyimlari turlari haqida umumiy ma\'lumot.</p>',
      order: 5
    });
    
    console.log('Initial data loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading initial data:', error);
    return false;
  }
};

/**
 * Создать JSON для статического файла
 * Эта функция возвращает JSON для сохранения в статический файл
 */
export const createStaticDataJson = () => {
  // Данные книги
  const books = [
    {
      id: 1,
      title: 'DressLine',
      welcomeContent: '<h1>DressLine</h1><p>Modern E-Book</p>',
      bibliography: '<h2>Bibliography</h2><p>List of references...</p>'
    }
  ];
  
  // Данные модулей
  const modules = [
    {
      id: 1,
      bookId: 1,
      title: 'Kirish',
      content: '<h1>Kirish</h1><p>Bu yerda siz kitobning kirish qismini yozishingiz mumkin.</p><p>Matnni tahrirlash uchun matn maydoniga bosing va tahrirlash tugmalaridan foydalaning.</p>',
      order: 1
    },
    {
      id: 2,
      bookId: 1,
      title: '1-Mavzu: Kirish. Kiyimlarni konstruksiyalashga doir dastlabki ma\'lumotlar.',
      content: '<h1>1-Mavzu: Kirish</h1><p>Kiyimlarni konstruksiyalashga doir dastlabki ma\'lumotlar haqida ma\'lumot.</p>',
      order: 2
    },
    {
      id: 3,
      bookId: 1,
      title: '2-Mavzu: Gavdadan o\'lchov olish qoidalari. Kiyimni loyihalash usullari',
      content: '<h1>2-Mavzu: Gavdadan o\'lchov olish qoidalari</h1><p>Kiyimni loyihalash usullari haqida ma\'lumot.</p>',
      order: 3
    },
    {
      id: 4,
      bookId: 1,
      title: '3-Mavzu: Oshxonada kiyiladigan kiyimlarni konstruksiyalash haqida umumiy ma\'lumot',
      content: '<h1>3-Mavzu: Oshxonada kiyiladigan kiyimlar</h1><p>Oshxonada kiyiladigan kiyimlarni konstruksiyalash haqida umumiy ma\'lumot.</p>',
      order: 4
    },
    {
      id: 5,
      bookId: 1,
      title: '4-Mavzu: Chaqaloqlar kiyimlari turlari haqida umumiy ma\'lumot',
      content: '<h1>4-Mavzu: Chaqaloqlar kiyimlari</h1><p>Chaqaloqlar kiyimlari turlari haqida umumiy ma\'lumot.</p>',
      order: 5
    }
  ];
  
  // Создаем объект с данными
  const data = {
    books,
    modules,
    exportDate: new Date().toISOString()
  };
  
  // Возвращаем JSON-строку
  return JSON.stringify(data, null, 2);
};