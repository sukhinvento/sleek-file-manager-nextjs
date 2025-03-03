
import { useState, Dispatch, SetStateAction } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  Settings,
  FileUp,
  FileText,
  Edit,
  ChevronRight,
  PieChart,
  BarChart3,
  Database,
  TrendingUp,
  Clock,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  isCollapsed?: boolean;
}

export const Sidebar = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  isCollapsed = false 
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (basePath: string) => {
    return location.pathname.startsWith(basePath);
  };

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  return (
    <div 
      className={`enterprise-sidebar fixed top-0 bottom-0 transform transition-transform duration-300 ease-in-out will-change-transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'lg:w-16' : 'w-64'} z-50`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-white whitespace-nowrap">Enterprise</h2>
        )}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`lg:hidden text-gray-400 hover:text-white ${isCollapsed ? 'mx-auto' : ''}`}
        >
          &times;
        </button>
      </div>

      <div className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">Main</p>}
          <nav className="mt-2 space-y-1">
            <Link 
              to="/dashboard" 
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">File Management</p>}
          <nav className="mt-2 space-y-1">
            <Link 
              to="/upload" 
              className={`nav-item ${isActive('/upload') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Upload Files"
            >
              <FileUp className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!isCollapsed && <span>Upload Files</span>}
            </Link>
            <Link 
              to="/files" 
              className={`nav-item ${isActive('/files') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="View Files"
            >
              <FileText className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!isCollapsed && <span>View Files</span>}
            </Link>
            <Link 
              to="/edit" 
              className={`nav-item ${isActive('/edit') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Edit Files"
            >
              <Edit className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!isCollapsed && <span>Edit Files</span>}
            </Link>
            <Link 
              to="/consolidated" 
              className={`nav-item ${isActive('/consolidated') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Consolidated Data View"
            >
              <Database className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!isCollapsed && <span>Consolidated Data View</span>}
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">Analytics</p>}
          <nav className="mt-2 space-y-1">
            <Link 
              to="/analytics/usage" 
              className={`nav-item ${isActive('/analytics/usage') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Usage Stats"
            >
              <BarChart3 className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!isCollapsed && <span>Usage Stats</span>}
            </Link>
            <Link 
              to="/analytics/trends" 
              className={`nav-item ${isActive('/analytics/trends') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Trends"
            >
              <TrendingUp className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!isCollapsed && <span>Trends</span>}
            </Link>
            <Link 
              to="/analytics/distribution" 
              className={`nav-item ${isActive('/analytics/distribution') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Distribution"
            >
              <PieChart className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
              {!isCollapsed && <span>Distribution</span>}
            </Link>
          </nav>
        </div>

        <div className="mt-auto pt-8">
          <Link 
            to="/login" 
            className={`nav-item ${isCollapsed ? 'justify-center px-2' : ''}`}
            title="Logout"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            <LogOut className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
            {!isCollapsed && <span>Logout</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};
