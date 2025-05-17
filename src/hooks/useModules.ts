import { useState, useEffect } from 'react';
import { db, Module } from '../services/db';

export const useModules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        // Get the first book
        const firstBook = await db.books.toCollection().first();
        
        if (firstBook) {
          // Get modules sorted by order
          const modulesList = await db.modules
            .where('bookId')
            .equals(firstBook.id || 1)
            .sortBy('order');
          
          setModules(modulesList);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading modules:', error);
        setError('Modullarni yuklashda xatolik yuz berdi');
        setIsLoading(false);
      }
    };
    
    loadModules();
  }, []);

  return { modules, isLoading, error };
};