import React, { useState, useEffect } from 'react';
import { Book, Module } from '../../services/db';
import { db } from '../../services/db';
import { Book as BookIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const BookPreview: React.FC = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(-1); // -1 means welcome page
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookContent = async () => {
      try {
        // Get the first book
        const firstBook = await db.books.toCollection().first();
        
        if (firstBook) {
          setBook(firstBook);
          
          // Get modules sorted by order
          const modulesList = await db.modules
            .where('bookId')
            .equals(firstBook.id || 1)
            .sortBy('order');
          
          setModules(modulesList);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading book content:', error);
        setIsLoading(false);
      }
    };
    
    loadBookContent();
  }, []);
  
  const showWelcomePage = () => {
    setCurrentModuleIndex(-1);
  };
  
  const showBibliography = () => {
    setCurrentModuleIndex(-2);
  };
  
  const showModule = (index: number) => {
    setCurrentModuleIndex(index);
  };
  
  const goNext = () => {
    if (currentModuleIndex === -1) { // If on welcome page
      if (modules.length > 0) {
        setCurrentModuleIndex(0); // Go to first module
      } else {
        setCurrentModuleIndex(-2); // Go to bibliography if no modules
      }
    } else if (currentModuleIndex >= 0 && currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1); // Go to next module
    } else if (currentModuleIndex === modules.length - 1) {
      setCurrentModuleIndex(-2); // Go to bibliography after last module
    }
  };
  
  const goPrevious = () => {
    if (currentModuleIndex === -2) { // If on bibliography
      if (modules.length > 0) {
        setCurrentModuleIndex(modules.length - 1); // Go to last module
      } else {
        setCurrentModuleIndex(-1); // Go to welcome page if no modules
      }
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1); // Go to previous module
    } else if (currentModuleIndex === 0) {
      setCurrentModuleIndex(-1); // Go to welcome page before first module
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Kitob ma'lumotlari topilmadi</p>
      </div>
    );
  }

  const renderContent = () => {
    if (currentModuleIndex === -1) {
      // Welcome page
      return (
        <div>
          <h1 className="text-2xl font-bold mb-4">{book.title}</h1>
          <div 
            className="prose prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: book.welcomeContent }}
          />
        </div>
      );
    } else if (currentModuleIndex === -2) {
      // Bibliography
      return (
        <div>
          <h1 className="text-2xl font-bold mb-4">Adabiyotlar ro'yxati</h1>
          <div 
            className="prose prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: book.bibliography }}
          />
        </div>
      );
    } else if (currentModuleIndex >= 0 && currentModuleIndex < modules.length) {
      // Module content
      const module = modules[currentModuleIndex];
      return (
        <div>
          <h1 className="text-2xl font-bold mb-4">{module.title}</h1>
          <div 
            className="prose prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: module.content }}
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kitob ko'rinishi</h1>
        <p className="text-gray-500 mt-1">
          Bu yerda siz kitobning qanday ko'rinishini oldindan ko'rishingiz mumkin.
        </p>
      </div>
      
      <div className="flex">
        {/* Table of Contents */}
        <div className="w-64 mr-6">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <BookIcon className="h-4 w-4 mr-2" />
              Mundarija
            </h3>
            
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={showWelcomePage}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    currentModuleIndex === -1 ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Bosh sahifa
                </button>
              </li>
              
              {modules.map((module, index) => (
                <li key={module.id}>
                  <button 
                    onClick={() => showModule(index)}
                    className={`w-full text-left px-3 py-2 rounded-md transition ${
                      currentModuleIndex === index ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {module.title}
                  </button>
                </li>
              ))}
              
              <li>
                <button 
                  onClick={showBibliography}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    currentModuleIndex === -2 ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Adabiyotlar
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-6 min-h-[600px]">
            {renderContent()}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-4">
            <button
              onClick={goPrevious}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Oldingi
            </button>
            
            <button
              onClick={goNext}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Keyingi
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPreview;