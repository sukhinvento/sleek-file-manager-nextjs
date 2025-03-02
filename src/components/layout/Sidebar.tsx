
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
}

export const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
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
      className={`enterprise-sidebar transition-all duration-300 ${
        isMobileMenuOpen ? 'left-0' : '-left-64 lg:left-0'
      } w-64`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Enterprise</h2>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          &times;
        </button>
      </div>

      <div className="px-3 py-4">
        <div className="nav-section">
          <p className="nav-section-title">Main</p>
          <nav className="mt-2 space-y-1">
            <Link 
              to="/dashboard" 
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          <p className="nav-section-title">File Management</p>
          <nav className="mt-2 space-y-1">
            <Link 
              to="/upload" 
              className={`nav-item ${isActive('/upload') ? 'active' : ''}`}
            >
              <FileUp className="mr-3 h-5 w-5" />
              <span>Upload Files</span>
            </Link>
            <Link 
              to="/files" 
              className={`nav-item ${isActive('/files') ? 'active' : ''}`}
            >
              <FileText className="mr-3 h-5 w-5" />
              <span>View Files</span>
            </Link>
            <Link 
              to="/edit" 
              className={`nav-item ${isActive('/edit') ? 'active' : ''}`}
            >
              <Edit className="mr-3 h-5 w-5" />
              <span>Edit Files</span>
            </Link>
            <Link 
              to="/consolidated" 
              className={`nav-item ${isActive('/consolidated') ? 'active' : ''}`}
            >
              <Database className="mr-3 h-5 w-5" />
              <span>Consolidated Data View</span>
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          <p className="nav-section-title">Analytics</p>
          <nav className="mt-2 space-y-1">
            <Link 
              to="/analytics/usage" 
              className={`nav-item ${isActive('/analytics/usage') ? 'active' : ''}`}
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              <span>Usage Stats</span>
            </Link>
            <Link 
              to="/analytics/trends" 
              className={`nav-item ${isActive('/analytics/trends') ? 'active' : ''}`}
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              <span>Trends</span>
            </Link>
            <Link 
              to="/analytics/distribution" 
              className={`nav-item ${isActive('/analytics/distribution') ? 'active' : ''}`}
            >
              <PieChart className="mr-3 h-5 w-5" />
              <span>Distribution</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto pt-8">
          <Link 
            to="/login" 
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
