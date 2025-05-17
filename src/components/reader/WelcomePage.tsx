import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenCheck, Sparkles, ArrowRight, BookMarked } from 'lucide-react';
import { db } from '../../services/db';
import { useModules } from '../../hooks/useModules';
import { DashboardCard, DashboardStatsGrid } from '../common/DashboardCard';

const WelcomePage: React.FC = () => {
  const [bookTitle, setBookTitle] = useState('');
  const [welcomeContent, setWelcomeContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { modules } = useModules();

  useEffect(() => {
    const loadWelcomeContent = async () => {
      try {
        // Get the first book
        const firstBook = await db.books.toCollection().first();
        
        if (firstBook) {
          setBookTitle(firstBook.title);
          setWelcomeContent(firstBook.welcomeContent);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading welcome content:', error);
        setIsLoading(false);
      }
    };
    
    loadWelcomeContent();
  }, []);

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

  const firstModuleId = modules.length > 0 ? modules[0].id : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-r from-primary-800 to-accent-800 p-8 shadow-neon-multi dark:from-primary-900 dark:to-accent-900 border border-white/30">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M42.8,-73.2C54.9,-67.7,63.6,-54.8,69.7,-41.2C75.8,-27.7,79.3,-13.8,79.2,-0.1C79.1,13.7,75.3,27.3,68.3,39.5C61.3,51.7,51.1,62.3,38.8,69.1C26.6,75.9,13.3,78.8,-0.5,79.6C-14.3,80.4,-28.5,79.1,-40.3,72.4C-52.1,65.7,-61.4,53.6,-68.8,40.3C-76.2,27,-81.6,13.5,-81.9,-0.2C-82.2,-13.8,-77.4,-27.6,-69.4,-39.1C-61.3,-50.6,-50,-59.8,-37.5,-64.9C-25,-70,-12.5,-71,1.1,-72.9C14.7,-74.8,29.3,-77.5,42.8,-73.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="flex items-center space-x-5 relative z-10 mb-6">
          <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm shadow-neon-primary border border-white/30">
            <BookOpenCheck className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white font-display drop-shadow-md">{bookTitle}</h1>
            <div className="flex items-center mt-2 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 inline-block">
              <Sparkles className="h-4 w-4 mr-2 text-white" />
              <span className="text-white font-medium">Elektron kitobga xush kelibsiz!</span>
            </div>
          </div>
        </div>
        
        <div 
          className="relative z-10 p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/20 shadow-lg prose prose-lg max-w-none mb-8 text-white font-medium"
          dangerouslySetInnerHTML={{ __html: welcomeContent }}
          style={{ 
            textShadow: '0 2px 4px rgba(0,0,0,0.5)', 
            '--tw-prose-headings': 'white',
            '--tw-prose-links': 'white',
            '--tw-prose-bold': 'white',
            fontWeight: 600,
            letterSpacing: '0.01em'
          } as React.CSSProperties}
        />
        
        <div className="flex">
          {firstModuleId ? (
            <NavLink 
              to={`/module/${firstModuleId}`}
              className="btn btn-gradient px-6 py-3 text-white rounded-xl hover:shadow-neon-multi transition-all duration-300 flex items-center gap-2 font-medium"
            >
              Boshlash
              <ArrowRight className="h-5 w-5" />
            </NavLink>
          ) : (
            <NavLink 
              to="/contents"
              className="btn btn-gradient px-6 py-3 text-white rounded-xl hover:shadow-neon-multi transition-all duration-300 flex items-center gap-2 font-medium"
            >
              Mundarija
              <ArrowRight className="h-5 w-5" />
            </NavLink>
          )}
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <DashboardStatsGrid columns={3}>
        <DashboardCard 
          title="O'zingizning kitobingizni yarating"
          description="Bu yerda siz kitob haqida umumiy ma'lumot yozishingiz mumkin."
          variant="primary"
          icon={<BookOpenCheck size={24} className="text-primary-700 dark:text-primary-400" />}
          onClick={() => window.location.href = '/module/' + firstModuleId}
        />
        
        <DashboardCard 
          title="Chap tomondagi menyu orqali!"
          description="O'zingizning kitobingizni yaratish uchun chap tomondagi menyu orqali harakatlaningiz."
          variant="secondary"
          count={modules.length}
          icon={<BookMarked size={24} className="text-secondary-700 dark:text-secondary-400" />}
        />
        
        <DashboardCard 
          title="Zamonaviy dizayn"
          description="Elektron kitobga xush kelibsiz! Bu yerda siz kitob haqida umumiy ma'lumot yozishingiz mumkin."
          variant="gradient"
          icon={<Sparkles size={24} className="text-white" />}
        />
      </DashboardStatsGrid>
    </div>
  );
};

export default WelcomePage;