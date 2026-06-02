import { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
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
      '/billing': 'Billing',
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
    };
    return titleMap[pathname] || 'Dashboard';
  };
  const getCreateButtonConfig = (pathname: string) => {
    const configMap: Record<string, {
      text: string;
      action: () => void;
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
        text: 'Admit Patient',
        action: () => navigate('/patients/admit'),
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
        action: () => {
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: {
              type: 'diagnostic'
            }
          }));
        }
      },
      '/stock-transfer': {
        text: 'New Transfer',
        action: () => {
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: {
              type: 'stock-transfer'
            }
          }));
        }
      }
    };
    return configMap[pathname];
  };
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  return <div className="flex h-screen w-full bg-background">
      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && <div className="fixed inset-0 z-40 lg:hidden overlay-backdrop" onClick={() => setIsMobileMenuOpen(false)} />}
      
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-12 z-30 flex items-center justify-between px-3 lg:hidden border-b border-border bg-card">
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
          {getCreateButtonConfig(location.pathname) && (
            <Button
              onClick={getCreateButtonConfig(location.pathname)?.action}
              className="action-button-primary h-8 w-8 p-0"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}

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
        <PageHeader title={getPageTitle(location.pathname)} notificationCount={0} userName={userName} userEmail={userEmail} userRole={userRole} onProfileClick={() => navigate('/settings')} onCreateClick={getCreateButtonConfig(location.pathname)?.action} createButtonText={getCreateButtonConfig(location.pathname)?.text} onLogout={logout} />
      </div>

      <div className={`flex-1 transition-all duration-300 ml-0 min-w-0 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <main className="h-screen pt-12 lg:pt-12 bg-background flex flex-col min-w-0">
          {location.pathname === '/patients/admit' ? (
            <div className="flex-1 overflow-hidden min-w-0">
              {children}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4 min-w-0">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>;
};