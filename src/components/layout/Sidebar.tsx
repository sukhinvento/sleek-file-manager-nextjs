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
  Users,
  Activity,
  BedDouble,
  Stethoscope
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
      } ${isCollapsed ? 'lg:w-16' : 'w-60'} z-50`}
    >
      <div className="flex items-center h-13 px-3 py-3" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        {isCollapsed ? (
          /* Collapsed: just the logo mark centered, click to expand */
          <button
            onClick={toggleSidebar}
            className="mx-auto flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'linear-gradient(135deg, hsl(220 52% 48%), hsl(222 55% 30%))' }}
            aria-label="Expand sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="20" height="20">
              <path d="M16 2.5 L25.5 7.5 L25.5 18.5 Q25.5 26.5 16 30.5 Q6.5 26.5 6.5 18.5 L6.5 7.5 Z"
                    stroke="white" strokeWidth="1.75" strokeLinejoin="round"/>
              <polyline points="8,18 11,18 13,14 16,22 19,15 21,18 24,18"
                        stroke="#4dd8c8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          /* Expanded: logo + name + collapse button */
          <>
            <div className="flex-1 overflow-hidden flex items-center gap-2.5">
              <div className="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(220 52% 48%), hsl(222 55% 30%))' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="20" height="20">
                  <path d="M16 2.5 L25.5 7.5 L25.5 18.5 Q25.5 26.5 16 30.5 Q6.5 26.5 6.5 18.5 L6.5 7.5 Z"
                        stroke="white" strokeWidth="1.75" strokeLinejoin="round"/>
                  <polyline points="8,18 11,18 13,14 16,22 19,15 21,18 24,18"
                            stroke="#4dd8c8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-sm font-bold tracking-tight whitespace-nowrap" style={{ color: 'hsl(0 0% 100%)' }}>
                MedSystem
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 gap-1">
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-1.5 rounded-md transition-colors"
                style={{ color: 'hsl(var(--sidebar-text))' }}
                onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--sidebar-hover))'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-md"
                style={{ color: 'hsl(var(--sidebar-text))' }}
              >
                &times;
              </button>
            </div>
          </>
        )}
      </div>

      <div className="px-2 py-2 overflow-y-auto scrollbar-hide max-h-[calc(100vh-3.25rem)]">
        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">Main</p>}
          <nav className="mt-1 space-y-0.5">
            <Link
              to="/dashboard"
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Dashboard</span>}
            </Link>

            <Link
              to="/patients"
              className={`nav-item ${isActive('/patients') && location.pathname === '/patients' ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Patients"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Patients</span>}
            </Link>
            <Link
              to="/rooms"
              className={`nav-item ${isActive('/rooms') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Room Management"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BedDouble className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Rooms</span>}
            </Link>
            <Link
              to="/doctors"
              className={`nav-item ${isActive('/doctors') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Doctor Management"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Stethoscope className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Doctors</span>}
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">Inventory & Orders</p>}
          <nav className="mt-1 space-y-0.5">
            <Link
              to="/inventory-dashboard"
              className={`nav-item ${isActive('/inventory-dashboard') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Inventory Dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Inventory Dashboard</span>}
            </Link>

            <Link
              to="/inventory"
              className={`nav-item ${isActive('/inventory') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Inventory Management"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Inventory</span>}
            </Link>

            <Link
              to="/purchase-orders"
              className={`nav-item ${isActive('/purchase-orders') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Purchase Orders"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCart className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Purchase Orders</span>}
            </Link>

            <Link
              to="/sales-orders"
              className={`nav-item ${isActive('/sales-orders') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Sales Orders"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Receipt className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Sales Orders</span>}
            </Link>

            <Link
              to="/vendors"
              className={`nav-item ${isActive('/vendors') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Vendor Management"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Vendors</span>}
            </Link>

            <Link
              to="/stock-transfer"
              className={`nav-item ${isActive('/stock-transfer') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Stock Transfer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <TrendingUp className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Stock Transfer</span>}
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">Billing & Finance</p>}
          <nav className="mt-1 space-y-0.5">
            <Link
              to="/billing"
              className={`nav-item ${isActive('/billing') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Billing"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Receipt className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Billing</span>}
            </Link>
            <Link
              to="/diagnostics"
              className={`nav-item ${isActive('/diagnostics') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Diagnostics"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Activity className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Diagnostics</span>}
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">File Management</p>}
          <nav className="mt-1 space-y-0.5">
            <Link
              to="/files-dashboard"
              className={`nav-item ${isActive('/files-dashboard') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="File Dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">File Dashboard</span>}
            </Link>
            <Link
              to="/upload"
              className={`nav-item ${isActive('/upload') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Upload Files"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileUp className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Upload Files</span>}
            </Link>
            <Link
              to="/files"
              className={`nav-item ${isActive('/files') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="View Files"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">View Files</span>}
            </Link>
            <Link
              to="/edit"
              className={`nav-item ${isActive('/edit') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Edit Files"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Edit className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Edit Files</span>}
            </Link>
            <Link
              to="/consolidated"
              className={`nav-item ${isActive('/consolidated') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Consolidated Data View"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Database className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Consolidated Data</span>}
            </Link>
          </nav>
        </div>

        <div className="nav-section">
          {!isCollapsed && <p className="nav-section-title">Analytics</p>}
          <nav className="mt-1 space-y-0.5">
            <Link
              to="/analytics/usage"
              className={`nav-item ${isActive('/analytics/usage') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Usage Stats"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BarChart3 className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Usage Stats</span>}
            </Link>
            <Link
              to="/analytics/trends"
              className={`nav-item ${isActive('/analytics/trends') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Trends"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <TrendingUp className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Trends</span>}
            </Link>
            <Link
              to="/analytics/distribution"
              className={`nav-item ${isActive('/analytics/distribution') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Distribution"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PieChart className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Distribution</span>}
            </Link>
          </nav>
        </div>

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
          <Link
            to="/settings"
            className={`nav-item ${isActive('/settings') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
            title="Settings"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
            {!isCollapsed && <span className="nav-text truncate">Settings</span>}
          </Link>

          <Link
            to="/login"
            className={`nav-item ${isCollapsed ? 'justify-center' : ''}`}
            title="Logout"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
            {!isCollapsed && <span className="nav-text truncate">Logout</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};
