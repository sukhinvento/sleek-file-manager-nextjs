'use client';

import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <BrowserRouter>
      <AppLayout>
        {children}
      </AppLayout>
    </BrowserRouter>
  );
};