'use client';

import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

interface ClientLayoutProps {
  children: ReactNode;
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