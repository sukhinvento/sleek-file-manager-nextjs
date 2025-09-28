import { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight, Bell, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useLocation, useNavigate } from 'react-router-dom';
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
        text: 'Add Patient',
        action: () => {
          window.dispatchEvent(new CustomEvent('openCreateModal', {
            detail: {
              type: 'patient'
            }
          }));
        }
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
  return <div className="flex h-screen w-full bg-[#f7fafc]">
      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#1a202c] z-30 flex items-center justify-between px-4 lg:hidden">
        {/* Left - Hamburger Menu */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 rounded-lg text-white hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <Menu size={20} />
        </button>
        
        {/* Center - Page Title */}
        <span className="text-white text-lg font-semibold truncate flex-1 text-center">
          {getPageTitle(location.pathname)}
        </span>
        
        {/* Right - Alert, Create Button, and Profile */}
        <div className="flex items-center gap-1 flex-shrink-0">
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

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0"
            >
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </div>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-700 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="John Smith" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    JS
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">John Smith</p>
                <p className="text-xs leading-none text-muted-foreground">
                  john.smith@company.com
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Desktop Header - Only show on desktop */}
      <div className={`fixed top-0 right-0 z-20 transition-all duration-300 ${isCollapsed ? 'lg:left-16' : 'lg:left-64'} left-0 hidden lg:block`}>
        <PageHeader title={getPageTitle(location.pathname)} notificationCount={3} userName="John Smith" userEmail="john.smith@company.com" onCreateClick={getCreateButtonConfig(location.pathname)?.action} createButtonText={getCreateButtonConfig(location.pathname)?.text} />
      </div>
      
      <div className={`flex-1 transition-all duration-300 ml-0 min-w-0 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <main className="h-screen pt-14 lg:pt-16 bg-[#f7fafc] flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-6 sm:py-6 min-w-0 bg-white">
            {children}
          </div>
        </main>
      </div>
    </div>;
};