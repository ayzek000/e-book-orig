import React, { useState, useEffect } from 'react';
import { BookmarkIcon } from 'lucide-react';
import { db } from '../../services/db';

const Bibliography: React.FC = () => {
  const [bibliography, setBibliography] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBibliography = async () => {
      try {
        // Get the first book
        const firstBook = await db.books.toCollection().first();
        
        if (firstBook) {
          setBibliography(firstBook.bibliography);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading bibliography:', error);
        setIsLoading(false);
      }
    };
    
    loadBibliography();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center mb-6">
          <BookmarkIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold">Adabiyotlar ro'yxati</h1>
        </div>
        
        <div 
          className="prose prose-indigo max-w-none"
          dangerouslySetInnerHTML={{ __html: bibliography }}
        />
      </div>
    </div>
  );
};

export default Bibliography;