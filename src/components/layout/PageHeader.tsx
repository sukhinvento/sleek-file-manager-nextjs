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
    <div className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>

        {/* Right side - Actions, Notifications and Profile */}
        <div className="flex items-center gap-4">
          {/* Additional content from children */}
          {children}
          
          {/* Create Button */}
          {onCreateClick && (
            <Button
              onClick={onCreateClick}
              className="action-button-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createButtonText}
            </Button>
          )}
        
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
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