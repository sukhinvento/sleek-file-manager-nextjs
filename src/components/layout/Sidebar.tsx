import { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Stethoscope,
  LucideIcon
} from 'lucide-react';

// --- Scope-to-nav mapping ---

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Scopes required to see this item (any match = visible). Empty/undefined = always visible. */
  scopes?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, // always visible
      { path: '/patients', label: 'Patients', icon: Users, scopes: ['patients'] },
      { path: '/rooms', label: 'Rooms', icon: BedDouble, scopes: ['rooms'] },
      { path: '/doctors', label: 'Doctors', icon: Stethoscope, scopes: ['doctors'] },
    ],
  },
  {
    title: 'Inventory & Orders',
    items: [
      { path: '/inventory-dashboard', label: 'Inventory Dashboard', icon: LayoutDashboard, scopes: ['inventory'] },
      { path: '/inventory', label: 'Inventory', icon: Package, scopes: ['inventory'] },
      { path: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, scopes: ['purchase-orders'] },
      { path: '/sales-orders', label: 'Sales Orders', icon: Receipt, scopes: ['sales-orders'] },
      { path: '/vendors', label: 'Vendors', icon: Users, scopes: ['vendors'] },
      { path: '/stock-transfer', label: 'Stock Transfer', icon: TrendingUp, scopes: ['inventory'] },
    ],
  },
  {
    title: 'Billing & Finance',
    items: [
      { path: '/invoices', label: 'Invoices', icon: FileText, scopes: ['invoices'] },
      { path: '/diagnostics', label: 'Diagnostics', icon: Activity, scopes: ['diagnostics'] },
    ],
  },
  {
    title: 'File Management',
    items: [
      { path: '/files-dashboard', label: 'File Dashboard', icon: LayoutDashboard },
      { path: '/upload', label: 'Upload Files', icon: FileUp },
      { path: '/files', label: 'View Files', icon: FileText },
      { path: '/edit', label: 'Edit Files', icon: Edit },
      { path: '/consolidated', label: 'Consolidated Data', icon: Database },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { path: '/analytics/usage', label: 'Usage Stats', icon: BarChart3 },
      { path: '/analytics/trends', label: 'Trends', icon: TrendingUp },
      { path: '/analytics/distribution', label: 'Distribution', icon: PieChart },
    ],
  },
];

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
  const location = useLocation();
  const { hasScope, hasRole, logout } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Filter nav items based on user scopes.
  // Items without scopes are always visible.
  // Items with scopes are visible if the user has ANY of the listed scopes.
  // Admin role bypasses scope checks and sees everything.
  const isAdmin = hasRole('admin');

  const visibleSections = useMemo(() => {
    return NAV_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!item.scopes || item.scopes.length === 0) return true; // no scope required
          if (isAdmin) return true; // admin sees all
          return item.scopes.some((scope) => hasScope(scope));
        }),
      }))
      .filter((section) => section.items.length > 0); // hide empty sections
  }, [isAdmin, hasScope]);

  // Settings visible to admin or users with settings/system-admin scope
  const canSeeSettings = isAdmin || hasScope('settings') || hasScope('system-admin');

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
        {visibleSections.map((section) => (
          <div className="nav-section" key={section.title}>
            {!isCollapsed && <p className="nav-section-title">{section.title}</p>}
            <nav className="mt-1 space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                    title={item.label}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
                    {!isCollapsed && <span className="nav-text truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
          {canSeeSettings && (
            <Link
              to="/settings"
              className={`nav-item ${isActive('/settings') ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              title="Settings"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
              {!isCollapsed && <span className="nav-text truncate">Settings</span>}
            </Link>
          )}

          <button
            className={`nav-item w-full ${isCollapsed ? 'justify-center' : ''}`}
            title="Logout"
            onClick={() => logout()}
          >
            <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
            {!isCollapsed && <span className="nav-text truncate">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
