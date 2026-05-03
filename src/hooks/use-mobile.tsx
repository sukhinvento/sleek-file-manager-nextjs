import { useState, useEffect } from 'react';

const getIsMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < 640;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(getIsMobile);

  useEffect(() => {
    const checkMobile = () => setIsMobile(getIsMobile());
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
