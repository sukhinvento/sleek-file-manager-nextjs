
import { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { PageHeader } from './PageHeader';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    const titleMap: Record<string, string> = {
      '/': 'Dashboard',
      '/inventory-dashboard': 'Inventory Dashboard',
      '/inventory': 'Inventory Management',
      '/purchase-orders': 'Purchase Orders',
      '/sales-orders': 'Sales Orders',
      '/vendors': 'Vendor Management',
      '/stock-transfer': 'Stock Transfer',
      '/billing': 'Billing',
      '/patients': 'Patients',
      '/settings': 'Settings',
      '/upload': 'Upload Files',
      '/files': 'View Files',
      '/edit': 'Edit Files'
    };
    return titleMap[pathname] || 'Dashboard';
  };

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
        toggleSidebar={toggleSidebar}
      />
      
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <main className="h-full overflow-auto">
          <div className="px-6 py-4 mt-16 lg:mt-0">
            <PageHeader 
              title={getPageTitle(location.pathname)}
              notificationCount={3}
              userName="John Smith"
              userEmail="john.smith@company.com"
            />
          </div>
          <div className="px-6 pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
