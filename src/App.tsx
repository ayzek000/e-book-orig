import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ReaderLayout from './layouts/ReaderLayout';
import SplashScreen from './components/common/SplashScreen';
import WelcomeEditor from './components/admin/WelcomeEditor';
import ModuleManager from './components/admin/ModuleManager';
import TableOfContentsEditor from './components/admin/TableOfContentsEditor';
import BibliographyEditor from './components/admin/BibliographyEditor';
import BookPreview from './components/admin/BookPreview';
import WelcomePage from './components/reader/WelcomePage';
import ModuleViewer from './components/reader/ModuleViewer';
import TableOfContents from './components/reader/TableOfContents';
import Bibliography from './components/reader/Bibliography';
import FirebaseAdminPage from './admin/FirebaseAdminPage';
import PdfManager from './components/admin/PdfManager';
import DataExportPage from './components/admin/DataExportPage';
import { BookOpenCheck, Sparkles } from 'lucide-react';
import { db } from './services/db';
import { loadInitialData } from './services/initialData';
import { appModeState } from './services/state';

// Import styles
import './styles/modern.css';
import './styles/animations.css';

// Константа для включения/отключения админ-панели
// Установите значение false, чтобы полностью отключить админ-панель
const SHOW_ADMIN_PANEL = true; // Панель админа доступна, но не открывается по умолчанию

// Функция для удаления дубликатов модулей по названию
function removeDuplicateModules(modules: any[]): any[] {
  const uniqueTitles = new Set<string>();
  const uniqueModules: any[] = [];
  
  modules.forEach(module => {
    // Если такого названия еще нет, добавляем модуль
    if (!uniqueTitles.has(module.title)) {
      uniqueTitles.add(module.title);
      uniqueModules.push(module);
    } else {
      console.log(`Обнаружен дубликат модуля: ${module.title}`);
    }
  });
  
  console.log(`Удалено ${modules.length - uniqueModules.length} дубликатов модулей`);
  return uniqueModules;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [appMode, setAppMode] = useState<'admin' | 'reader'>('reader'); // По умолчанию открываем в режиме чтения

  useEffect(() => {
    // Initialize the database and load initial data if needed
    const initializeApp = async () => {
      try {
        // Проверяем, есть ли данные в базе данных
        const bookCount = await db.books.count();
        const moduleCount = await db.modules.count();
        
        console.log(`Найдено книг: ${bookCount}, модулей: ${moduleCount}`);
        
        // Если данных нет, пробуем загрузить их из статического файла
        if (bookCount === 0 || moduleCount === 0) {
          console.log('База данных пуста, пытаемся загрузить данные из статического файла...');
          
          try {
            // Пытаемся загрузить данные из статического файла
            const response = await fetch('/data/static-data.json');
            
            if (response.ok) {
              const data = await response.json();
              console.log('Данные успешно загружены из статического файла', data);
              
              // Очищаем базу данных
              await db.books.clear();
              await db.modules.clear();
              
              // Проверяем данные на наличие дубликатов
              const uniqueModules = data.modules ? removeDuplicateModules(data.modules) : [];
              
              // Загружаем книги
              if (data.books && data.books.length > 0) {
                await db.books.bulkAdd(data.books);
                console.log(`Загружено ${data.books.length} книг`);
              }
              
              // Загружаем модули (без дубликатов)
              if (uniqueModules.length > 0) {
                await db.modules.bulkAdd(uniqueModules);
                console.log(`Загружено ${uniqueModules.length} модулей (после удаления дубликатов)`);
              }
            } else {
              console.log('Не удалось загрузить данные из статического файла, загружаем начальные данные');
              await loadInitialData();
            }
          } catch (error) {
            console.error('Ошибка при загрузке данных из статического файла:', error);
            console.log('Загружаем начальные данные...');
            await loadInitialData();
          }
        } else {
          console.log('База данных уже содержит данные, пропускаем инициализацию');
        }
        
        // Загружаем режим приложения из localStorage
        const storedMode = localStorage.getItem('appMode');
        if (storedMode && (storedMode === 'admin' || storedMode === 'reader')) {
          // Если админ-панель отключена, то всегда используем режим чтения
          setAppMode(SHOW_ADMIN_PANEL ? storedMode : 'reader');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
    
    // Subscribe to app mode changes
    const unsubscribe = appModeState.subscribe((mode) => {
      setAppMode(mode);
      localStorage.setItem('appMode', mode);
    });
    
    return () => unsubscribe();
  }, []);

  // Обработчик завершения анимации SplashScreen
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Показываем экран загрузки безопасности
  if (showSplash) {
    return <SplashScreen onLoadComplete={handleSplashComplete} minDisplayTime={3000} />;
  }
  
  // Показываем стандартный экран загрузки, если данные еще загружаются
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center shadow-neon-multi animate-pulse">
                <BookOpenCheck className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-neon-primary animate-spin">
                <Sparkles className="h-5 w-5 text-primary-500" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 font-display mb-2">DressLine</h2>
          <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-500 mb-4">Yuklanmoqda...</h3>
          <p className="text-neutral-500 dark:text-neutral-400">Iltimos, kuting</p>
          
          <div className="mt-8 w-64 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {appMode === 'admin' ? (
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/welcome" replace />} />
            <Route path="admin/welcome" element={<WelcomeEditor />} />
            <Route path="admin/modules" element={<ModuleManager />} />
            <Route path="admin/contents" element={<TableOfContentsEditor />} />
            <Route path="admin/bibliography" element={<BibliographyEditor />} />
            <Route path="admin/preview" element={<BookPreview />} />
            <Route path="admin/firebase" element={<FirebaseAdminPage />} />
            <Route path="admin/pdf" element={<PdfManager />} />
            <Route path="admin/export" element={<DataExportPage />} />
            <Route path="*" element={<Navigate to="/admin/welcome" replace />} />
          </Route>
        ) : (
          <Route path="/" element={<ReaderLayout />}>
            <Route index element={<WelcomePage />} />
            <Route path="contents" element={<TableOfContents />} />
            <Route path="module/:id" element={<ModuleViewer />} />
            <Route path="bibliography" element={<Bibliography />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;