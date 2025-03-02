
import { useState, Dispatch, SetStateAction } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Laptop,
  LineChart,
  Settings,
  FileUp,
  FileText,
  Edit,
  ChevronRight,
  PieChart,
  BarChart3,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useIsMobile } from '../../hooks/use-mobile';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
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

  const sidebarItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: Laptop,
    },
    {
      name: 'Upload Files',
      path: '/upload',
      icon: FileUp,
    },
    {
      name: 'View Files',
      path: '/files',
      icon: FileText,
    },
    {
      name: 'Edit Files',
      path: '/edit',
      icon: Edit,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: LineChart,
      submenu: [
        {
          name: 'Usage Statistics',
          path: '/analytics/usage',
          icon: BarChart3,
        },
        {
          name: 'Trends',
          path: '/analytics/trends',
          icon: LineChart,
        },
        {
          name: 'Distribution',
          path: '/analytics/distribution',
          icon: PieChart,
        },
      ],
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className={`min-h-screen bg-white shadow-sm border-r fixed lg:relative z-50 transition-all duration-300 ${
      isMobileMenuOpen ? 'left-0' : '-left-64 lg:left-0'
    } w-64 lg:w-auto`}>
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-900">Enterprise File Manager</h2>
      </div>
      <div className="py-2">
        {sidebarItems.map((item) => (
          <div key={item.name}>
            {item.submenu ? (
              <div>
                <Button
                  variant="ghost"
                  className={`w-full justify-between px-4 py-2 ${
                    isSubmenuActive(item.path) ? 'bg-gray-50 text-gray-900' : ''
                  }`}
                  onClick={() => toggleSubmenu(item.name)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-5 w-5" />
                    <span className={isMobile ? 'sr-only' : ''}>{item.name}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      openSubmenu === item.name ? 'rotate-90' : ''
                    }`}
                  />
                </Button>
                {openSubmenu === item.name && (
                  <div className="pl-8 py-1">
                    {item.submenu.map((submenuItem) => (
                      <Link
                        to={submenuItem.path}
                        key={submenuItem.path}
                        className={`flex items-center px-4 py-2 text-sm rounded-md ${
                          isActive(submenuItem.path)
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <submenuItem.icon className="mr-2 h-4 w-4" />
                        <span className={isMobile ? 'sr-only' : ''}>{submenuItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2 ${
                  isActive(item.path)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="mr-2 h-5 w-5" />
                <span className={isMobile ? 'sr-only' : ''}>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
