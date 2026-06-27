import { useState, useRef, useEffect } from 'react';
import { Menu, ChevronLeft, ChevronRight, Plus, User, Stethoscope, BedDouble, FlaskConical, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sidebar } from './Sidebar';
import { PageHeader } from './PageHeader';
import { NotificationPopover } from '@/components/notifications/NotificationPopover';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
interface AppLayoutProps {
  children: React.ReactNode;
}
export const AppLayout = ({
  children
}: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);
  const navigate = useNavigate();
  const { user, displayName, logout } = useAuth();

  const userName = displayName || 'User';
  const userEmail = user?.username || '';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
  const userRole = user?.roles?.[0] || '';
  const getPageTitle = (pathname: string) => {
    const titleMap: Record<string, string> = {
      '/': 'Dashboard',
      '/dashboard': 'Hospital Overview',
      '/files-dashboard': 'File Management',
      '/inventory-dashboard': 'Inventory Dashboard',
      '/inventory': 'Inventory Management',
      '/purchase-orders': 'Purchase Orders',
      '/sales-orders': 'Sales Orders',
      '/vendors': 'Vendor Management',
      '/stock-transfer': 'Stock Transfer',
      '/invoices': 'Invoices',
      '/diagnostics': 'Diagnostics',
      '/patients': 'Patients',
      '/patients/admit': 'New Patient Admission',
      '/rooms': 'Room Management',
      '/doctors': 'Doctor Management',
      '/settings': 'Profile Settings',
      '/upload': 'Upload Files',
      '/files': 'View Files',
      '/edit': 'Edit Files',
      '/analytics/usage': 'Usage Statistics',
      '/analytics/trends': 'Trends Analytics',
      '/analytics/distribution': 'Distribution Analytics',
      '/finance/accounts': 'Chart of Accounts',
      '/finance/journal': 'Journal Entries',
      '/finance/aging': 'AR/AP Aging',
      '/finance/pnl': 'P&L Statement',
      '/finance/bank-accounts': 'Bank Accounts',
      '/finance/payroll': 'Payroll',
      '/finance/fixed-assets': 'Fixed Assets',
      '/finance/balance-sheet': 'Balance Sheet',
    };
    return titleMap[pathname] || 'Dashboard';
  };
  const getCreateButtonConfig = (pathname: string, search: string = '') => {
    const tab = new URLSearchParams(search).get('tab') ?? 'ipd';
    const configMap: Record<string, {
      text: string;
      action: () => void;
      items?: { label: string; icon?: React.ReactNode; action: () => void }[];
    }> = {
      '/inventory-dashboard': {
        text: 'Add Item',
        action: () => navigate('/inventory')
      },
      '/inventory': {
        text: 'Add Item',
        action: () => {
          // Trigger inventory modal - this will be handled by the page component
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: {
              type: 'inventory'
            }
          }));
        }
      },
      '/purchase-orders': {
        text: 'New Order',
        action: () => {
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: {
              type: 'purchase-order'
            }
          }));
        }
      },
      '/sales-orders': {
        text: 'New Order',
        action: () => {
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: {
              type: 'sales-order'
            }
          }));
        }
      },
      '/vendors': {
        text: 'Add Vendor',
        action: () => {
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: {
              type: 'vendor'
            }
          }));
        }
      },
      '/patients': {
        text: 'Add Patient',
        action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'patient' } })),
        items: [
          {
            label: 'Add Patient',
            icon: <User className="h-3.5 w-3.5" />,
            action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'patient' } })),
          },
          {
            label: 'Admit Patient (IPD)',
            icon: <BedDouble className="h-3.5 w-3.5" />,
            action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'ipd' } })),
          },
          {
            label: 'Register OPD Visit',
            icon: <Stethoscope className="h-3.5 w-3.5" />,
            action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'opd' } })),
          },
        ],
      },
      '/billing': {
        text: 'New Invoice',
        action: () => {
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: {
              type: 'invoice'
            }
          }));
        }
      },
      '/diagnostics': {
        text: 'Book Test',
        action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'diagnostic' } })),
      },
      '/stock-transfer': {
        text: 'New Transfer',
        action: () => {
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: { type: 'stock-transfer' }
          }));
        }
      },
      '/finance/accounts': {
        text: 'Add Account',
        action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'chart-of-accounts' } })),
      },
      '/finance/journal': {
        text: 'New Entry',
        action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'journal-entry' } })),
      },
      '/finance/bank-accounts': {
        text: 'Add Account',
        action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'bank-account' } })),
      },
      '/finance/payroll': {
        text: 'Run Payroll',
        action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'payroll' } })),
      },
      '/finance/fixed-assets': {
        text: 'Add Asset',
        action: () => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { type: 'fixed-asset' } })),
      },
    };
    return configMap[pathname];
  };
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  return <div className="flex h-[100dvh] w-full bg-background">
      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && <div className="fixed inset-0 z-40 lg:hidden overlay-backdrop" onClick={() => setIsMobileMenuOpen(false)} />}
      
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-12 z-30 flex items-center justify-between px-3 lg:hidden border-b border-border bg-card" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Left - Hamburger Menu */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          <Menu size={20} />
        </button>
        
        {/* Center - Page Title */}
        <span className="text-foreground text-lg font-semibold truncate flex-1 text-center tracking-tight">
          {getPageTitle(location.pathname)}
        </span>
        
        {/* Right - Create Button, Notifications and Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Create Button */}
          {(() => {
            const cfg = getCreateButtonConfig(location.pathname, location.search);
            if (!cfg) return null;
            if (cfg.items && cfg.items.length > 0) {
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="action-button-primary h-8 w-8 p-0" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {cfg.items.map((item, i) => (
                      <DropdownMenuItem key={i} onClick={item.action} className="gap-2 text-sm">
                        {item.icon}
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <Button
                onClick={cfg.action}
                className="action-button-primary h-8 w-8 p-0"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            );
          })()}

          {/* Notification + User section with border */}
          <div className="flex items-center gap-1 border border-border rounded-full px-1 py-0.5">
            {/* Notifications */}
            <NotificationPopover />

            {/* Divider */}
            <div className="h-5 w-px bg-border" />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-muted p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userRole && <span className="capitalize">{userRole}</span>}
                    {userRole && userEmail ? ' · ' : ''}{userEmail}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Desktop Header - Only show on desktop */}
      <div className={`fixed top-0 right-0 z-20 transition-all duration-300 ${isCollapsed ? 'lg:left-16' : 'lg:left-60'} left-0 hidden lg:block`}>
        <PageHeader title={getPageTitle(location.pathname)} notificationCount={0} userName={userName} userEmail={userEmail} userRole={userRole} onProfileClick={() => navigate('/settings')} onCreateClick={getCreateButtonConfig(location.pathname, location.search)?.items ? undefined : getCreateButtonConfig(location.pathname, location.search)?.action} createButtonText={getCreateButtonConfig(location.pathname, location.search)?.text} createButtonItems={getCreateButtonConfig(location.pathname, location.search)?.items} onLogout={logout} />
      </div>

      <div className={`flex-1 transition-all duration-300 ml-0 min-w-0 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <main className="h-[100dvh] pt-12 lg:pt-12 bg-background flex flex-col min-w-0">
          {location.pathname === '/patients/admit' ? (
            <div className="flex-1 overflow-hidden min-w-0">
              {children}
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 min-w-0 pb-safe">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>;
};