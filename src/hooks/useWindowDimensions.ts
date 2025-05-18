import { useState, useEffect } from 'react';

/**
 * Хук для получения размеров окна браузера
 * Возвращает текущую ширину и высоту окна и обновляет их при изменении размера окна
 */
export function useWindowDimensions() {
  // Функция для получения текущих размеров окна
  const getWindowDimensions = () => {
    // Используем значения по умолчанию для SSR
    const defaultWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const defaultHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    return {
      width: defaultWidth,
      height: defaultHeight,
    };
  };

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    // Функция-обработчик изменения размера окна
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    // Добавляем слушатель события изменения размера окна
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      
      // Удаляем слушатель при размонтировании компонента
      return () => window.removeEventListener('resize', handleResize);
    }
    
    return undefined;
  }, []);

  return windowDimensions;
}

export default useWindowDimensions;
