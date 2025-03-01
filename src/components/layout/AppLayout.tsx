
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-800 z-40 flex items-center justify-between px-4">
        <span className="text-white text-xl font-semibold">Enterprise</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'lg:ml-52' : 'lg:ml-12'}`}>
        <main className={`px-6 py-8 mt-16 lg:mt-0 ${isMobileMenuOpen ? 'lg:opacity-100' : 'lg:opacity-100'} transition-opacity duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
};
