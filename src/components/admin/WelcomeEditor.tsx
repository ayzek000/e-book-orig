import React, { useState, useEffect } from 'react';
import RichTextEditor from '../common/RichTextEditor';
import { db } from '../../services/db';

const WelcomeEditor: React.FC = () => {
  const [book, setBook] = useState<{ id?: number; title: string; welcomeContent: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      try {
        // Get the first book
        const firstBook = await db.books.toCollection().first();
        
        if (firstBook) {
          setBook(firstBook);
        } else {
          // Create a default book if none exists
          const id = await db.books.add({
            title: 'Yangi kitob',
            welcomeContent: '<p>Xush kelibsiz!</p>',
            bibliography: '<p>Adabiyotlar ro\'yxati</p>'
          });
          
          const newBook = await db.books.get(id);
          setBook(newBook || null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading welcome content:', error);
        setIsLoading(false);
      }
    };
    
    loadBook();
  }, []);

  const handleContentChange = (html: string) => {
    if (book) {
      setBook({ ...book, welcomeContent: html });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (book) {
      setBook({ ...book, title: e.target.value });
    }
  };

  const saveChanges = async () => {
    if (!book || !book.id) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      await db.books.update(book.id, {
        title: book.title,
        welcomeContent: book.welcomeContent
      });
      
      setSaveStatus('saved');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving welcome content:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Salom sahifasi</h1>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-green-500 text-sm">Saqlandi</span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-gray-500 text-sm">Saqlanmoqda...</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-sm">Xatolik yuz berdi</span>
          )}
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition"
          >
            Saqlash
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Kitob sarlavhasi
          </label>
          <input
            type="text"
            id="bookTitle"
            value={book.title}
            onChange={handleTitleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Kitob sarlavhasini kiriting"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salom sahifasi mazmuni
          </label>
          <RichTextEditor
            content={book.welcomeContent}
            onChange={handleContentChange}
            placeholder="Salom sahifasi mazmunini kiriting..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Bu sahifa kitobingizning asosiy sahifasi bo'ladi. Kirish so'zi va umumiy ma'lumotlarni yozing.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Ko'rinishi</h2>
        <div 
          className="bg-white p-6 rounded-lg border border-gray-200"
          dangerouslySetInnerHTML={{ __html: book.welcomeContent }}
        />
      </div>
    </div>
  );
};

export default WelcomeEditor;