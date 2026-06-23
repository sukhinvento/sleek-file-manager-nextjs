import React from 'react';
import { User, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { NotificationPopover } from '@/components/notifications/NotificationPopover';

interface CreateButtonItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
}

interface PageHeaderProps {
  title: string;
  notificationCount?: number;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userAvatar?: string;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onCreateClick?: () => void;
  onLogout?: () => void;
  createButtonText?: string;
  createButtonItems?: CreateButtonItem[];
  children?: React.ReactNode;
}

export const PageHeader = ({
  title,
  userName = "User",
  userEmail = "",
  userRole = "",
  userAvatar,
  onProfileClick,
  onCreateClick,
  onLogout,
  createButtonText = "Create New",
  createButtonItems,
  children
}: PageHeaderProps) => {
  return (
    <div className="bg-card border-b border-border px-4 py-2">
      <div className="flex items-center justify-between gap-2">
        {/* Left side - Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate tracking-tight">{title}</h1>
        </div>

        {/* Right side - Actions, Notifications and Profile */}
        <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          {/* Additional content from children */}
          {children}

          {/* Create Button — dropdown variant */}
          {createButtonItems && createButtonItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="action-button-primary hidden sm:flex" size="sm">
                  <Plus className="mr-1.5 h-4 w-4" />
                  <span className="hidden md:inline">{createButtonText}</span>
                  <span className="md:hidden">Add</span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {createButtonItems.map((item, i) => (
                  <DropdownMenuItem key={i} onClick={item.action} className="gap-2 text-sm">
                    {item.icon}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Create Button — single action variant */}
          {onCreateClick && !createButtonItems && (
            <Button
              onClick={onCreateClick}
              className="action-button-primary hidden sm:flex"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{createButtonText}</span>
              <span className="md:hidden">Add</span>
            </Button>
          )}

          {/* Mobile Create Button */}
          {(onCreateClick && !createButtonItems) && (
            <Button
              onClick={onCreateClick}
              className="action-button-primary sm:hidden"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {createButtonItems && createButtonItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="action-button-primary sm:hidden" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {createButtonItems.map((item, i) => (
                  <DropdownMenuItem key={i} onClick={item.action} className="gap-2 text-sm">
                    {item.icon}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

        {/* Notification + User section with border */}
        <div className="flex items-center gap-1.5 border border-border rounded-full px-1.5 py-1">
          {/* Notifications */}
          <NotificationPopover />

          {/* Divider */}
          <div className="h-5 w-px bg-border" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-muted p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
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
              <DropdownMenuItem onClick={onProfileClick}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
      </div>
    </div>
  );
};
