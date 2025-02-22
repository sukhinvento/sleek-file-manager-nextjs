
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
  LogOut
} from 'lucide-react';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload Files', path: '/upload' },
  { icon: FileText, label: 'View Files', path: '/files' },
  { icon: Edit, label: 'Edit Files', path: '/edit' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`h-screen bg-enterprise-800 text-white fixed transition-[width] ease-in-out duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col overflow-hidden`}
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
  );
};
