
import { useState } from 'react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-enterprise-50">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <main className={`p-8 ${isMobileMenuOpen ? 'lg:opacity-100' : 'lg:opacity-100'} transition-opacity duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
};
