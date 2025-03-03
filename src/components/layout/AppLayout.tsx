
import { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1a202c] z-30 flex items-center justify-between px-4">
        <span className="text-white text-xl font-semibold">Enterprise</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        isCollapsed={isCollapsed} 
      />
      
      {/* Sidebar toggle button (only visible on desktop) */}
      <button 
        onClick={toggleSidebar}
        className="hidden lg:flex fixed bottom-8 bg-[#1a202c] text-white p-2 rounded-r-md z-50 transition-all duration-300"
        style={{ 
          left: isCollapsed ? '4rem' : '16rem', 
          transform: 'translateX(-2px)'
        }}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <main className="px-6 py-8 mt-16 lg:mt-0 h-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
