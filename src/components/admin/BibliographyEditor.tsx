import React, { useState, useEffect } from 'react';
import RichTextEditor from '../common/RichTextEditor';
import { db } from '../../services/db';

const BibliographyEditor: React.FC = () => {
  const [bibliography, setBibliography] = useState('');
  const [bookId, setBookId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  useEffect(() => {
    const loadBibliography = async () => {
      try {
        // Get the first book
        const firstBook = await db.books.toCollection().first();
        
        if (firstBook) {
          setBibliography(firstBook.bibliography);
          setBookId(firstBook.id || null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading bibliography:', error);
        setIsLoading(false);
      }
    };
    
    loadBibliography();
  }, []);

  const handleContentChange = (html: string) => {
    setBibliography(html);
  };

  const saveChanges = async () => {
    if (!bookId) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      await db.books.update(bookId, { bibliography });
      
      setSaveStatus('saved');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving bibliography:', error);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Adabiyotlar ro'yxati</h1>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adabiyotlar ro'yxati
          </label>
          <RichTextEditor
            content={bibliography}
            onChange={handleContentChange}
            placeholder="Adabiyotlar ro'yxatini kiriting..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Bu yerda kitobda foydalanilgan manbalar ro'yxatini kiritishingiz mumkin.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Ko'rinishi</h2>
        <div 
          className="bg-white p-6 rounded-lg border border-gray-200"
          dangerouslySetInnerHTML={{ __html: bibliography }}
        />
      </div>
    </div>
  );
};

export default BibliographyEditor;