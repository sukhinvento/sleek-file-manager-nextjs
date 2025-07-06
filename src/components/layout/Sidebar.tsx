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
  ChevronLeft,
  PieChart,
  BarChart3,
  Database,
  TrendingUp,
  Clock,
  LogOut,
  ShoppingCart,
  Package,
  Receipt,
  Users
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  isCollapsed?: boolean;
  toggleSidebar: () => void;
}

export const Sidebar = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  isCollapsed = false,
  toggleSidebar 
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
      className={`enterprise-sidebar fixed top-0 bottom-0 transform transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'lg:w-16' : 'w-64'} z-50`}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        <div className="flex-1 overflow-hidden">
          <h2 className={`text-xl font-bold text-white whitespace-nowrap nav-text ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>MedSystem</h2>
        </div>
        <div className="flex items-center flex-shrink-0">
          <button 
            onClick={toggleSidebar}
            className="hidden lg:flex text-white p-1 rounded-md hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white ml-2"
          >
            &times;
          </button>
        </div>
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
              <LayoutDashboard className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Dashboard</span>
            </Link>
            
            <Link 
              to="/patients" 
              className={`nav-item ${isActive('/patients') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Patients"
            >
              <Users className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Patients</span>
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">Inventory & Orders</p>}
          <nav className="mt-2 space-y-1">
            <Link 
              to="/inventory" 
              className={`nav-item ${isActive('/inventory') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Inventory"
            >
              <Package className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Inventory</span>
            </Link>
            
            <Link 
              to="/purchase-orders" 
              className={`nav-item ${isActive('/purchase-orders') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Purchase Orders"
            >
              <ShoppingCart className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Purchase Orders</span>
            </Link>

            <Link 
              to="/sales-orders" 
              className={`nav-item ${isActive('/sales-orders') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Sales Orders"
            >
              <Receipt className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Sales Orders</span>
            </Link>

            <Link 
              to="/vendors" 
              className={`nav-item ${isActive('/vendors') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Vendor Management"
            >
              <Users className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Vendors</span>
            </Link>

            <Link 
              to="/stock-transfer" 
              className={`nav-item ${isActive('/stock-transfer') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Stock Transfer"
            >
              <TrendingUp className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Stock Transfer</span>
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">Billing & Finance</p>}
          <nav className="mt-2 space-y-1">
            <Link 
              to="/billing" 
              className={`nav-item ${isActive('/billing') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Billing"
            >
              <Receipt className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Billing</span>
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
              <FileUp className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Upload Files</span>
            </Link>
            <Link 
              to="/files" 
              className={`nav-item ${isActive('/files') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="View Files"
            >
              <FileText className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>View Files</span>
            </Link>
            <Link 
              to="/edit" 
              className={`nav-item ${isActive('/edit') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Edit Files"
            >
              <Edit className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Edit Files</span>
            </Link>
            <Link 
              to="/consolidated" 
              className={`nav-item ${isActive('/consolidated') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Consolidated Data View"
            >
              <Database className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Consolidated Data</span>
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
              <BarChart3 className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Usage Stats</span>
            </Link>
            <Link 
              to="/analytics/trends" 
              className={`nav-item ${isActive('/analytics/trends') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Trends"
            >
              <TrendingUp className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Trends</span>
            </Link>
            <Link 
              to="/analytics/distribution" 
              className={`nav-item ${isActive('/analytics/distribution') ? 'active' : ''} ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Distribution"
            >
              <PieChart className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Distribution</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto pt-8">
          <Link 
            to="/settings" 
            className={`nav-item ${isActive('/settings') ? 'active' : ''} ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Settings"
          >
            <Settings className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
            <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Settings</span>
          </Link>
          
          <Link 
            to="/login" 
            className={`nav-item ${isCollapsed ? 'justify-center px-2' : ''}`}
            title="Logout"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            <LogOut className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
            <span className={`nav-text truncate w-full ${isCollapsed ? 'opacity-0 absolute left-0 pointer-events-none' : 'opacity-100'}`}>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
