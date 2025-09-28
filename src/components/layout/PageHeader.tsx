import React from 'react';
import { Bell, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface PageHeaderProps {
  title: string;
  notificationCount?: number;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onCreateClick?: () => void;
  createButtonText?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ 
  title, 
  notificationCount = 0,
  userName = "John Doe",
  userEmail = "john@company.com",
  userAvatar,
  onNotificationClick,
  onProfileClick,
  onCreateClick,
  createButtonText = "Create New",
  children 
}: PageHeaderProps) => {
  return (
    <div className="bg-card border-b border-border px-3 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-2">
        {/* Left side - Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-card-foreground truncate">{title}</h1>
        </div>

        {/* Right side - Actions, Notifications and Profile */}
        <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          {/* Additional content from children */}
          {children}
          
          {/* Create Button */}
          {onCreateClick && (
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
          {onCreateClick && (
            <Button
              onClick={onCreateClick}
              className="action-button-primary sm:hidden"
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
            onClick={onNotificationClick}
            className="relative text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 p-0"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </div>

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
                {userEmail}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfileClick}>
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
    </div>
  );
};