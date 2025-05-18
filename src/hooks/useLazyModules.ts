import { useState, useEffect, useCallback, useRef } from 'react';
import { db, Module } from '../services/db';

interface UseLazyModulesOptions {
  initialCount?: number;
  incrementCount?: number;
  loadThreshold?: number;
}

export const useLazyModules = (options: UseLazyModulesOptions = {}) => {
  const {
    initialCount = 5,
    incrementCount = 5,
    loadThreshold = 200
  } = options;

  const [modules, setModules] = useState<Module[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Состояние загрузки всех модулей
  const allModulesLoaded = useRef(false);
  
  // Загрузка всех модулей из базы данных
  useEffect(() => {
    const loadAllModules = async () => {
      try {
        if (allModulesLoaded.current) {
          // Если модули уже загружены, просто обновляем видимые модули
          setModules(allModules.slice(0, visibleCount));
          setHasMore(allModules.length > visibleCount);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        // Get the first book
        const firstBook = await db.books.toCollection().first();
        
        if (firstBook) {
          // Get modules sorted by order
          let modulesList = await db.modules
            .where('bookId')
            .equals(firstBook.id || 1)
            .sortBy('order');
          
          // Не фильтруем модули, так как в базе данных теперь только нужные модули
          
          // Добавляем небольшую задержку для демонстрации загрузки
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setAllModules(modulesList);
          setModules(modulesList.slice(0, visibleCount));
          setHasMore(modulesList.length > visibleCount);
          allModulesLoaded.current = true;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading modules:', error);
        setError('Modullarni yuklashda xatolik yuz berdi');
        setIsLoading(false);
      }
    };
    
    loadAllModules();
  }, [visibleCount, allModules]);

  // Функция для загрузки дополнительных модулей
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    const newVisibleCount = Math.min(visibleCount + incrementCount, allModules.length);
    setVisibleCount(newVisibleCount);
    setModules(allModules.slice(0, newVisibleCount));
    setHasMore(newVisibleCount < allModules.length);
  }, [visibleCount, incrementCount, allModules, isLoading, hasMore]);

  // Обработчик прокрутки
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + loadThreshold >= 
          document.documentElement.offsetHeight) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadThreshold]);

  return { 
    modules, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    totalCount: allModules.length,
    visibleCount
  };
};
