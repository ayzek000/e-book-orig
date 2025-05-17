import React from 'react';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  count?: number;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'gradient' | 'neon';
  onClick?: () => void;
  isLoading?: boolean;
}

/**
 * A modern dashboard card component with various visual styles
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  count,
  icon = <BookOpen size={24} />,
  variant = 'primary',
  onClick,
  isLoading = false,
}) => {
  const getCardClasses = () => {
    const baseClasses = 'card p-6 transition-all duration-300 h-full';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} card-primary shadow-glow-primary dark:bg-neutral-800 dark:border-primary-700`;
      case 'secondary':
        return `${baseClasses} card-secondary shadow-glow-secondary dark:bg-neutral-800 dark:border-secondary-700`;
      case 'accent':
        return `${baseClasses} card-accent shadow-glow-accent dark:bg-neutral-800 dark:border-accent-700`;
      case 'gradient':
        return `${baseClasses} card-gradient`; // Градиентные карточки всегда имеют свой фон
      case 'neon':
        return `${baseClasses} card-neon`; // Неоновые карточки всегда темные
      default:
        return `${baseClasses} card-primary dark:bg-neutral-800 dark:border-primary-700`;
    }
  };

  return (
    <div 
      className={`${getCardClasses()} ${onClick ? 'cursor-pointer hover:-translate-y-2' : ''}`}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex flex-col space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-200 rounded-md dark:bg-neutral-700 w-3/4"></div>
          <div className="h-4 bg-neutral-200 rounded-md dark:bg-neutral-700 w-full"></div>
          <div className="h-4 bg-neutral-200 rounded-md dark:bg-neutral-700 w-5/6"></div>
          <div className="h-10 bg-neutral-200 rounded-md dark:bg-neutral-700 w-1/4"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${
              variant === 'neon' 
                ? 'bg-neutral-800 shadow-neon-primary' 
                : variant === 'gradient' 
                  ? 'bg-primary-700' 
                  : 'bg-primary-100 dark:bg-primary-900/50'
            }`}>
              {icon}
            </div>
            {count !== undefined && (
              <div className={`text-3xl font-bold ${
                variant === 'gradient' || variant === 'neon' 
                  ? 'text-white' 
                  : 'text-neutral-900 dark:text-white'
              }`}>
                {count}
              </div>
            )}
          </div>
          
          <h3 className={`text-xl font-semibold mb-2 ${
            variant === 'gradient' || variant === 'neon' 
              ? 'text-white' 
              : 'text-neutral-900 dark:text-neutral-100'
          }`}>
            {title}
          </h3>
          
          <p className={`mb-4 ${
            variant === 'gradient' || variant === 'neon' 
              ? 'text-neutral-100' 
              : 'text-neutral-700 dark:text-neutral-300'
          }`}>
            {description}
          </p>
          
          {onClick && (
            <div className={`flex items-center text-sm font-medium mt-auto ${
              variant === 'gradient' 
                ? 'text-white' 
                : variant === 'neon'
                  ? 'text-primary-400'
                  : 'text-primary-700 dark:text-primary-400'
            }`}>
              <span>View details</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          )}
          
          {variant === 'gradient' && (
            <div className="absolute top-2 right-2">
              <Sparkles size={16} className="text-white opacity-50" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * A dashboard stats grid component to display multiple cards in a responsive grid
 */
export const DashboardStatsGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}> = ({ children, columns = 3 }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {children}
    </div>
  );
};
