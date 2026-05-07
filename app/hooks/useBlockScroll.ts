import { useEffect } from 'react';

/**
 * Хук для блокировки скролла страницы при открытии модального окна
 * @param isOpen - состояние открытия модального окна
 */
export function useBlockScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      
      // Блокируем скролл
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Восстанавливаем скролл при закрытии
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Возвращаем позицию скролла
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
}
