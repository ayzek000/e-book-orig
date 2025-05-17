import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, Module } from '../../services/db';
import EnhancedPdfViewer from './EnhancedPdfViewer';
import { BookOpenCheck, FileText, Clock, Sparkles, BookmarkIcon } from 'lucide-react';

const ModuleViewer = () => {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Bo\'lim identifikatori topilmadi');
      setIsLoading(false);
      return;
    }
    
    const loadModuleContent = async () => {
      try {
        // Get the module
        const moduleData = await db.modules.get(parseInt(id));
        
        if (moduleData) {
          setModule(moduleData);
          setError(null);
        } else {
          setError('Bo\'lim topilmadi');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading module content:', error);
        setError('Bo\'lim yuklashda xatolik yuz berdi');
        setIsLoading(false);
      }
    };
    
    loadModuleContent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 animate-fade-in">
        <div className="w-16 h-16 mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center animate-pulse shadow-glow-primary">
          <Sparkles className="h-8 w-8 text-primary-500 dark:text-primary-400 animate-spin" />
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium animate-pulse">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-danger-100/50 dark:bg-danger-900/20 rounded-2xl p-8 shadow-glow-accent animate-fade-in">
        <div className="w-16 h-16 mb-4 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center shadow-neon-accent">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger-500 dark:text-danger-400">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p className="text-danger-700 dark:text-danger-300 font-medium text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card-glass p-8 dark:bg-neutral-800/90 dark:border-neutral-700/50 dark:backdrop-blur-xl">
        {/* Modern Header with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-r from-primary-500 to-accent-500 p-6 shadow-neon-primary">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M42.8,-73.2C54.9,-67.7,63.6,-54.8,69.7,-41.2C75.8,-27.7,79.3,-13.8,79.2,-0.1C79.1,13.7,75.3,27.3,68.3,39.5C61.3,51.7,51.1,62.3,38.8,69.1C26.6,75.9,13.3,78.8,-0.5,79.6C-14.3,80.4,-28.5,79.1,-40.3,72.4C-52.1,65.7,-61.4,53.6,-68.8,40.3C-76.2,27,-81.6,13.5,-81.9,-0.2C-82.2,-13.8,-77.4,-27.6,-69.4,-39.1C-61.3,-50.6,-50,-59.8,-37.5,-64.9C-25,-70,-12.5,-71,1.1,-72.9C14.7,-74.8,29.3,-77.5,42.8,-73.2Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-neon-primary">
              <BookOpenCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-display">{module?.title}</h1>
              <div className="flex items-center mt-2 text-white/80 text-sm">
                <Sparkles className="h-3 w-3 mr-2" />
                <span>Premium Content</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Module Metadata */}
        <div className="flex flex-wrap items-center text-sm mb-8 space-x-6">
          <div className="flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>~{Math.ceil((module?.content?.length || 0) / 1000)} daqiqa o'qish</span>
          </div>
          {module?.pdfAttachment && (
            <div className="flex items-center px-4 py-2 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              <span>PDF ilova mavjud</span>
            </div>
          )}
          <div className="flex items-center px-4 py-2 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 shadow-sm">
            <BookmarkIcon className="h-4 w-4 mr-2" />
            <span>Saqlangan</span>
          </div>
        </div>
        
        {/* Content with enhanced styling */}
        <div 
          className="prose prose-lg max-w-none dark:prose-invert
            prose-headings:text-primary-800 dark:prose-headings:text-primary-300 prose-headings:font-display
            prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:border-primary-200 dark:prose-h1:border-primary-800 prose-h1:pb-2
            prose-h2:text-xl prose-h2:font-semibold prose-h2:text-primary-700 dark:prose-h2:text-primary-400
            prose-p:text-neutral-700 dark:prose-p:text-neutral-300
            prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline prose-a:font-medium hover:prose-a:text-primary-500 dark:hover:prose-a:text-primary-300 prose-a:transition-colors
            prose-strong:text-primary-700 dark:prose-strong:text-primary-400 prose-strong:font-semibold
            prose-img:rounded-xl prose-img:shadow-lg
            prose-blockquote:border-l-4 prose-blockquote:border-primary-300 dark:prose-blockquote:border-primary-700 prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:text-primary-700 dark:prose-code:text-primary-400 prose-code:bg-primary-50 dark:prose-code:bg-primary-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-neutral-800 dark:prose-pre:bg-neutral-900 prose-pre:text-neutral-200 prose-pre:shadow-md
            prose-li:marker:text-primary-500 dark:prose-li:marker:text-primary-400
            prose-table:shadow-md prose-table:rounded-lg overflow-hidden prose-thead:bg-primary-50 dark:prose-thead:bg-primary-900/30 prose-th:text-primary-700 dark:prose-th:text-primary-400
          "
          dangerouslySetInnerHTML={{ __html: module?.content || '' }}
        />
        
        {/* PDF Attachment with enhanced styling - автоматически отображается */}
        {module?.pdfAttachment && (
          <div className="mt-12">
            <EnhancedPdfViewer pdfAttachment={module.pdfAttachment} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleViewer;