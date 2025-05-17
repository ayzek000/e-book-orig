import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, ChevronDown, Loader } from 'lucide-react';
import { useLazyModules } from '../../hooks/useLazyModules';

const TableOfContents: React.FC = () => {
  const { modules, isLoading, hasMore, loadMore, totalCount, visibleCount } = useLazyModules({
    initialCount: 4, // Начинаем с меньшего количества модулей
    incrementCount: 3, // Загружаем меньше модулей за раз
    loadThreshold: 200 // Загружаем раньше при прокрутке
  });
  
  // Реф для отслеживания контейнера списка
  const listContainerRef = useRef<HTMLDivElement>(null);
  
  // Для анимации появления модулей
  const [visibleModules, setVisibleModules] = useState<number[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const moduleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Настраиваем IntersectionObserver для анимации появления
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute('data-id'));
            if (!visibleModules.includes(id)) {
              setVisibleModules(prev => [...prev, id]);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleModules]);
  
  // Обновляем наблюдаемые элементы при изменении списка модулей
  useEffect(() => {
    moduleRefs.current = moduleRefs.current.slice(0, modules.length);
    
    moduleRefs.current.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });
  }, [modules]);
  
  // Отслеживание прокрутки для загрузки дополнительных модулей
  const handleScroll = useCallback(() => {
    if (!listContainerRef.current || !hasMore || isLoading) return;
    
    const container = listContainerRef.current;
    const scrollPosition = container.scrollTop + container.clientHeight;
    const scrollHeight = container.scrollHeight;
    
    // Если прокрутили достаточно вниз, загружаем еще модули
    if (scrollPosition >= scrollHeight - 200) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);
  
  // Добавляем обработчик прокрутки
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (isLoading && modules.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-primary-500 animate-spin mb-2" />
          <p className="text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Mundarija</h1>
        </div>
        
        {modules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Bo'limlar mavjud emas</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2" ref={listContainerRef}>
              {modules.map((module, index) => (
                <div 
                  key={module.id} 
                  ref={(el) => { moduleRefs.current[index] = el; return undefined; }}
                  data-id={module.id}
                  className={`border-b border-gray-100 dark:border-neutral-700 pb-3 last:border-b-0 transition-all duration-500 ${visibleModules.includes(module.id || 0) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <NavLink 
                    to={`/module/${module.id}`}
                    className={({ isActive }) => 
                      `block px-4 py-3 rounded-md transition shadow-sm ${isActive 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold shadow-glow-primary' 
                        : 'hover:bg-gray-50 dark:hover:bg-neutral-700/50'}`
                    }
                  >
                    <div className="flex">
                      <span className="font-semibold w-10 text-primary-600 dark:text-primary-400">{index + 1}.</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200 text-shadow-sm">{module.title}</span>
                    </div>
                  </NavLink>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button 
                  onClick={loadMore}
                  className="flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors"
                >
                  <span className="mr-2">Ko'proq ko'rsatish</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {isLoading && modules.length > 0 && (
              <div className="flex justify-center mt-4 py-2 bg-primary-50/50 dark:bg-primary-900/20 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Loader className="h-5 w-5 text-primary-500 dark:text-primary-400 animate-spin" />
                  <span className="text-sm text-primary-600 dark:text-primary-400">Yuklanmoqda...</span>
                </div>
              </div>
            )}
            
            <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
              {visibleCount} / {totalCount} bo'limlar ko'rsatilmoqda
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;