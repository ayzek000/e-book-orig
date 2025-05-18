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
    // Базовые классы с улучшенными стилями для темной темы
    const baseClasses = 'card p-6 transition-all duration-300 h-full rounded-xl border border-neutral-700/50';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-neutral-800 shadow-glow-primary border-primary-700/70`;
      case 'secondary':
        return `${baseClasses} bg-neutral-800 shadow-glow-secondary border-secondary-700/70`;
      case 'accent':
        return `${baseClasses} bg-neutral-800 shadow-glow-accent border-accent-700/70`;
      case 'gradient':
        return `${baseClasses} card-gradient shadow-lg`; // Градиентные карточки всегда имеют свой фон
      case 'neon':
        return `${baseClasses} bg-neutral-900 shadow-neon-primary border-primary-700/70`; // Неоновые карточки с ярким свечением
      default:
        return `${baseClasses} bg-neutral-800 shadow-glow-primary border-primary-700/70`;
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
                ? 'bg-neutral-800 shadow-neon-primary border border-primary-600/30' 
                : variant === 'gradient' 
                  ? 'bg-primary-700/80 backdrop-blur-sm' 
                  : 'bg-primary-900/70 border border-primary-700/50'
            }`}>
              {icon}
            </div>
            {count !== undefined && (
              <div className={`text-3xl font-bold ${
                variant === 'gradient' 
                  ? 'text-white' 
                  : variant === 'neon'
                    ? 'text-primary-300'
                    : 'text-white'
              }`}>
                {count}
              </div>
            )}
          </div>
          
          <h3 className={`text-xl font-semibold mb-2 ${
            variant === 'gradient'
              ? 'text-white' 
              : variant === 'neon'
                ? 'text-primary-200'
                : 'text-white'
          }`}>
            {title}
          </h3>
          
          <p className={`mb-4 ${
            variant === 'gradient'
              ? 'text-neutral-100' 
              : variant === 'neon'
                ? 'text-neutral-300'
                : 'text-neutral-300'
          }`}>
            {description}
          </p>
          
          {onClick && (
            <div className={`flex items-center text-sm font-medium mt-auto px-3 py-2 rounded-lg transition-colors ${
              variant === 'gradient' 
                ? 'text-white bg-white/10 hover:bg-white/20' 
                : variant === 'neon'
                  ? 'text-primary-300 bg-primary-900/50 hover:bg-primary-800/50 border border-primary-700/30'
                  : 'text-primary-300 bg-primary-900/30 hover:bg-primary-800/50'
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
