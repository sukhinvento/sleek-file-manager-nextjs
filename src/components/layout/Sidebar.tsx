
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  FileText, 
  Edit, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload Files', path: '/upload' },
  { icon: FileText, label: 'View Files', path: '/files' },
  { icon: Edit, label: 'Edit Files', path: '/edit' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-enterprise-800 text-white hover:bg-enterprise-700 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-enterprise-800 z-40 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4 pt-16">
          <nav className="flex-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center p-4 mb-2 rounded-lg hover:bg-enterprise-700 transition-colors text-white"
              >
                <item.icon size={24} className="flex-shrink-0" />
                <span className="ml-4 text-lg">{item.label}</span>
              </button>
            ))}
          </nav>
          <button 
            className="w-full flex items-center p-4 rounded-lg hover:bg-enterprise-700 transition-colors text-white"
          >
            <LogOut size={24} className="flex-shrink-0" />
            <span className="ml-4 text-lg">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex fixed inset-y-0 left-0 z-20 h-screen bg-enterprise-800 text-white transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        } flex-col`}
      >
        <div className="p-4 flex items-center justify-between min-h-[64px]">
          <div className={`overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <span className="text-xl font-semibold whitespace-nowrap">Enterprise</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-enterprise-700 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center p-3 mb-2 rounded-lg hover:bg-enterprise-700 transition-colors"
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span 
                className={`ml-3 transition-opacity duration-200 ${
                  isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                } whitespace-nowrap`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-enterprise-700 transition-colors">
            <LogOut size={20} className="flex-shrink-0" />
            <span 
              className={`ml-3 transition-opacity duration-200 ${
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
              } whitespace-nowrap`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
      <div className={`hidden lg:block transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`} />
    </>
  );
};
