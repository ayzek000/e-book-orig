import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Menu, ChevronLeft, ChevronRight, Home, Sparkles, BookMarked, Download, Settings } from 'lucide-react';
import { db } from '../services/db';
import { exportBookToPDF } from '../services/pdfExport';

// Определяем тип Module локально
interface Module {
  id?: number;
  title: string;
  content?: string;
  order?: number;
  pdfAttachment?: { name: string; data: string; } | string;
}
import { appModeState } from '../services/state';

const ReaderLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    // Check user preference or system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const location = useLocation();
  const navigate = useNavigate();
  // Используем название книги для заголовка страницы
  const [, setBookTitle] = useState<string>('DressLine');
  const [isSidebarOpen, setSidebarOpenState] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const allModules = await db.modules.toArray();
        // Преобразуем модули из БД в локальный формат
        const typedModules: Module[] = allModules.map(m => ({
          id: m.id,
          title: m.title,
          content: m.content,
          order: m.order,
          pdfAttachment: m.pdfAttachment
        }));
        setModules(typedModules);
      } catch (error) {
        console.error('Error loading modules:', error);
      }
    };

    loadModules();
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const getBookTitle = async () => {
      const book = await db.books.get(1);
      if (book) {
        setBookTitle(book.title);
      }
    };
    
    getBookTitle();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setSidebarOpenState(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getCurrentModuleIndex = () => {
    if (!location.pathname.startsWith('/module/')) return -1;
    const moduleId = location.pathname.split('/').pop();
    return modules.findIndex(m => m.id?.toString() === moduleId);
  };

  const currentIndex = getCurrentModuleIndex();
  const hasNext = currentIndex < modules.length - 1 && currentIndex !== -1;
  const hasPrev = currentIndex > 0;

  const goToNextModule = () => {
    if (hasNext && modules[currentIndex + 1].id) {
      navigate(`/module/${modules[currentIndex + 1].id}`);
    }
  };

  const goToPrevModule = () => {
    if (hasPrev && modules[currentIndex - 1].id) {
      navigate(`/module/${modules[currentIndex - 1].id}`);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportLoading(true);
      await exportBookToPDF();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const switchToAdminMode = () => {
    appModeState.setMode('admin');
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-neutral-900 text-neutral-200' : 'bg-gradient-to-br from-primary-50 to-secondary-50'}`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 ${darkMode ? 'bg-neutral-800 border-r border-neutral-700' : 'bg-white/90 backdrop-blur-md'} shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className={`flex items-center justify-between h-20 px-6 ${darkMode ? 'bg-gradient-to-r from-primary-900 to-accent-900' : 'bg-gradient-to-r from-primary-600 to-accent-500'} text-white`}>
          <div className="flex items-center">
            <Link to="/" className={`flex items-center p-4 text-white`}>
              <div className="mr-2 bg-white/10 p-2 rounded-lg shadow-neon-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="4" fill="#8B5CF6" fillOpacity="0.2" />
                  <path d="M7 18V15M7 15V7C7 5.89543 7.89543 5 9 5H15C16.1046 5 17 5.89543 17 7V15M7 15H17M17 15V18M9 9H15M9 12H13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-white">DressLine</div>
                <div className="text-xs text-white/80 flex items-center">
                  <Sparkles size={12} className="mr-1" />
                  <span>Modern E-Book</span>
                </div>
              </div>
            </Link>
          </div>
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-white`}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="px-4 py-6">
          <ul className="space-y-3">
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-3 rounded-xl ${darkMode ? 'text-white hover:bg-white/10' : 'text-neutral-800 hover:bg-primary-50'} transition-all duration-200 hover:shadow-md`}
              >
                <Home className={`mr-3 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} size={20} />
                <span className="font-medium">Bosh sahifa</span>
              </Link>
            </li>
            <li className="pt-6 pb-2">
              <div className={`px-4 text-xs font-semibold ${darkMode ? 'text-neutral-400' : 'text-neutral-500'} uppercase tracking-wider flex items-center`}>
                <div className="flex-1 border-b border-dashed mr-2 mb-1 opacity-30"></div>
                Bo'limlar
                <div className="flex-1 border-b border-dashed ml-2 mb-1 opacity-30"></div>
              </div>
            </li>
            {modules.map((module) => (
              <li key={module.id}>
                <Link
                  to={`/module/${module.id}`}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === `/module/${module.id}` 
                    ? darkMode 
                      ? 'bg-primary-900/50 text-white shadow-neon-primary' 
                      : 'bg-primary-100 text-primary-900 shadow-glow-primary' 
                    : darkMode 
                      ? 'text-neutral-300 hover:bg-neutral-800' 
                      : 'text-neutral-700 hover:bg-neutral-100'}`}
                >
                  <BookMarked
                    className={`mr-3 ${location.pathname === `/module/${module.id}` 
                      ? darkMode ? 'text-primary-400' : 'text-primary-600' 
                      : darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
                    size={20}
                  />
                  <span className="font-medium">{module.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${darkMode ? 'bg-neutral-800 shadow-lg border-b border-neutral-700' : 'bg-white/80 backdrop-blur-md shadow-lg'} z-10`}>
          <div className="flex items-center justify-between h-20 px-6">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-primary-50 hover:bg-primary-100'} transition-colors md:hidden focus:outline-none`}
            >
              <Menu size={22} className={darkMode ? 'text-white' : 'text-primary-600'} />
            </button>

            <div className="flex items-center space-x-4">
              {location.pathname.startsWith('/module/') && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPrevModule}
                    disabled={!hasPrev}
                    className={`p-2 rounded-full transition-all ${hasPrev 
                      ? darkMode 
                        ? 'text-white bg-primary-800 hover:bg-primary-700' 
                        : 'text-white bg-primary-500 hover:bg-primary-600 shadow-md hover:shadow-lg' 
                      : darkMode 
                        ? 'text-neutral-600 bg-neutral-800 cursor-not-allowed' 
                        : 'text-neutral-300 bg-neutral-100 cursor-not-allowed'}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goToNextModule}
                    disabled={!hasNext}
                    className={`p-2 rounded-full transition-all ${hasNext 
                      ? darkMode 
                        ? 'text-white bg-primary-800 hover:bg-primary-700' 
                        : 'text-white bg-primary-500 hover:bg-primary-600 shadow-md hover:shadow-lg' 
                      : darkMode 
                        ? 'text-neutral-600 bg-neutral-800 cursor-not-allowed' 
                        : 'text-neutral-300 bg-neutral-100 cursor-not-allowed'}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              
              {/* Dark mode toggle */}
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all ${darkMode 
                  ? 'bg-neutral-700 hover:bg-neutral-600 text-yellow-300' 
                  : 'bg-primary-100 hover:bg-primary-200 text-primary-700 shadow-md'}`}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={handleExportPDF}
                className="btn btn-soft text-primary-700 hidden sm:flex"
                disabled={exportLoading}
              >
                <Download size={16} className="mr-2" />
                {exportLoading ? "Yuklanmoqda..." : "PDF yuklab olish"}
              </button>
              <button 
                onClick={switchToAdminMode}
                className="btn btn-gradient px-4 py-2 text-white rounded-xl flex items-center gap-2 font-medium shadow-neon-multi hover:shadow-neon-accent transition-all duration-300"
              >
                <Settings size={16} />
                Admin rejimi
              </button>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-neutral-900' : 'bg-gradient-to-br from-primary-50 to-secondary-50'}`} style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className={`max-w-5xl mx-auto ${darkMode ? 'bg-neutral-800 shadow-xl' : 'bg-white/90 backdrop-blur-sm shadow-xl'} rounded-2xl p-8`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReaderLayout;