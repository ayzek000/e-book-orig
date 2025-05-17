import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, Lock } from 'lucide-react';

interface SplashScreenProps {
  minDisplayTime?: number;
  onLoadComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  minDisplayTime = 2500, // Минимальное время отображения (2.5 секунды)
  onLoadComplete 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingText, setLoadingText] = useState('Xavfsizlik tekshirilmoqda...');
  
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLoadingStep(2);
      setLoadingText('Ma\'lumotlar shifrlash...');
    }, 800);
    
    const timer2 = setTimeout(() => {
      setLoadingStep(3);
      setLoadingText('Xavfsiz ulanish o\'rnatilmoqda...');
    }, 1600);
    
    const timer3 = setTimeout(() => {
      setLoadingStep(4);
      setLoadingText('Xavfsizlik tasdiqlandi!');
    }, 2200);
    
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      if (onLoadComplete) {
        onLoadComplete();
      }
    }, minDisplayTime);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(hideTimer);
    };
  }, [minDisplayTime, onLoadComplete]);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
      <div className="relative flex flex-col items-center">
        {/* Анимированные круги безопасности */}
        <div className="relative mb-8">
          <div className={`absolute inset-0 rounded-full bg-primary-500/20 animate-ping ${loadingStep >= 2 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} style={{ animationDuration: '2s' }}></div>
          <div className={`absolute inset-0 rounded-full bg-primary-500/40 animate-pulse ${loadingStep >= 3 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} style={{ animationDuration: '1.5s' }}></div>
          
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center shadow-2xl shadow-primary-500/50 border border-primary-500/30">
            {loadingStep < 4 ? (
              <Shield className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <div className="animate-scale-in">
                <Shield className="w-12 h-12 text-white" />
                <CheckCircle className="absolute bottom-0 right-0 w-8 h-8 text-green-400 bg-primary-800 rounded-full p-1 shadow-lg border border-green-500/50" />
              </div>
            )}
          </div>
        </div>
        
        {/* Текст загрузки */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-wide text-shadow-glow">
            DressLine
          </h2>
          <div className="h-8">
            <p className="text-primary-200 text-sm animate-fade-in backdrop-blur-sm bg-black/20 px-4 py-1 rounded-full inline-block">
              {loadingText}
            </p>
          </div>
        </div>
        
        {/* Индикатор прогресса */}
        <div className="w-64 h-1 bg-neutral-800 rounded-full mt-6 overflow-hidden border border-neutral-700/50">
          <div 
            className="h-full bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600 rounded-full transition-all duration-300 ease-out animate-gradient-shift"
            style={{ width: `${(loadingStep / 4) * 100}%`, backgroundSize: '200% 100%' }}
          ></div>
        </div>
        
        {/* Иконки безопасности */}
        <div className="flex space-x-4 mt-8">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${loadingStep >= 2 ? 'bg-primary-700 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
            <Lock className="w-5 h-5" />
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${loadingStep >= 3 ? 'bg-primary-700 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${loadingStep >= 4 ? 'bg-green-600 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
