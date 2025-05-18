import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { BookOpen, Home, Book, List, BookmarkIcon, Eye, Menu, X, Moon, Sun, Database, Save } from 'lucide-react';
import { appModeState } from '../services/state';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark-mode');
  };
  
  const switchToReaderMode = () => {
    appModeState.setMode('reader');
  };
  


  return (
    <div className="min-h-screen flex flex-col">
      {/* Modern Navbar */}
      <header className="navbar shadow-glow-primary" style={{ background: 'var(--gradient-primary)' }}>
        <div className="layout-container flex items-center justify-between py-2">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="btn btn-ghost text-white mr-3 md:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">E-Kitob <span className="font-light">| Admin</span></h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleDarkMode}
              className="btn btn-ghost text-white p-2"
              aria-label="Toggle dark mode"
              title={darkMode ? "Yorug' rejim" : "Qorong'i rejim"}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button 
              onClick={switchToReaderMode}
              className="btn btn-gradient px-4 py-2 text-white rounded-xl flex items-center gap-2 font-medium shadow-neon-multi hover:shadow-neon-accent transition-all duration-300"
            >
              <Eye className="h-5 w-5" />
              O'quvchi rejimi
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Modern Sidebar */}
        <nav className={`sidebar card-glass ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} transition-all duration-300`}>
          {sidebarOpen ? (
            <ul className="space-y-1 py-2">
              <li>
                <NavLink 
                  to="/admin/welcome" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-medium shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                >
                  <div className="p-2 rounded-lg bg-neutral-100">
                    <Home className="h-5 w-5" />
                  </div>
                  <span className="ml-3">Salom sahifasi</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/contents" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-medium shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                >
                  <div className="p-2 rounded-lg bg-neutral-100">
                    <List className="h-5 w-5" />
                  </div>
                  <span className="ml-3">Mundarija</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/modules" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-medium shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                >
                  <div className="p-2 rounded-lg bg-neutral-100">
                    <Book className="h-5 w-5" />
                  </div>
                  <span className="ml-3">Bo'limlar</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/bibliography" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-medium shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                >
                  <div className="p-2 rounded-lg bg-neutral-100">
                    <BookmarkIcon className="h-5 w-5" />
                  </div>
                  <span className="ml-3">Adabiyotlar</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/preview" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-medium shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                >
                  <div className="p-2 rounded-lg bg-neutral-100">
                    <Eye className="h-5 w-5" />
                  </div>
                  <span className="ml-3">Ko'rib chiqish</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/firebase" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-medium shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                >
                  <div className="p-2 rounded-lg bg-neutral-100">
                    <Database className="h-5 w-5" />
                  </div>
                  <span className="ml-3">Firebase</span>
                </NavLink>
              </li>

              <li>
                <NavLink 
                  to="/admin/export" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-medium shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                >
                  <div className="p-2 rounded-lg bg-neutral-100">
                    <Save className="h-5 w-5" />
                  </div>
                  <span className="ml-3">Экспорт данных</span>
                </NavLink>
              </li>
            </ul>
          ) : (
            <ul className="space-y-4 py-4 flex flex-col items-center">
              <li>
                <NavLink 
                  to="/admin/welcome" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `p-3 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-100 text-primary-700 shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                  title="Salom sahifasi"
                >
                  <Home className="h-5 w-5" />
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/contents" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `p-3 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-100 text-primary-700 shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                  title="Mundarija"
                >
                  <List className="h-5 w-5" />
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/modules" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `p-3 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-100 text-primary-700 shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                  title="Bo'limlar"
                >
                  <Book className="h-5 w-5" />
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/bibliography" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `p-3 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-100 text-primary-700 shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                  title="Adabiyotlar"
                >
                  <BookmarkIcon className="h-5 w-5" />
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/preview" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `p-3 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-100 text-primary-700 shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                  title="Ko'rib chiqish"
                >
                  <Eye className="h-5 w-5" />
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/firebase" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `p-3 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-100 text-primary-700 shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                  title="Firebase"
                >
                  <Database className="h-5 w-5" />
                </NavLink>
              </li>

              <li>
                <NavLink 
                  to="/admin/export" 
                  className={({ isActive }: { isActive: boolean }) => 
                    `p-3 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-100 text-primary-700 shadow-glow-primary' : 'hover:bg-neutral-100'}`
                  }
                  title="Экспорт данных"
                >
                  <Save className="h-5 w-5" />
                </NavLink>
              </li>
            </ul>
          )}
        </nav>
        
        {/* Modern Main Content */}
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          <div className="layout-container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;