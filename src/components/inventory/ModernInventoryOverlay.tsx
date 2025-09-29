import React from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ModernInventoryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  status?: string;
  statusColor?: 'pending' | 'approved' | 'delivered' | 'cancelled';
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  quickActions?: React.ReactNode;
  size?: 'default' | 'large' | 'full' | 'medium' | 'wide';
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const sizeClasses = {
  default: 'w-full sm:w-[90vw] sm:max-w-[1200px]',
  large: 'w-full sm:w-[95vw] sm:max-w-[1400px]',
  full: 'w-full sm:w-[98vw] sm:max-w-[1600px]',
  medium: 'w-full sm:w-[80vw] md:w-[70vw] lg:w-[60vw] sm:max-w-[60vw]',
  wide: 'w-full sm:w-[75vw] sm:max-w-[75vw]'
};

export const ModernInventoryOverlay = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  status,
  statusColor = 'pending',
  children, 
  headerActions,
  quickActions,
  size = 'medium'
}: ModernInventoryOverlayProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className={`${sizeClasses[size]} p-0 flex flex-col h-full bg-gradient-to-br from-background to-muted/20`}
        side="right"
      >
        {/* Modern Header */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 p-3 sm:p-6">
          <div className="flex items-start justify-between mb-2 sm:mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight truncate">{title}</h1>
                {status && (
                  <Badge variant="outline" className={`${statusColors[statusColor]} text-xs shrink-0`}>
                    {status}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-muted-foreground text-xs sm:text-sm font-medium truncate">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 ml-2">
              <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-3 bg-background/90 hover:bg-destructive hover:text-destructive-foreground border-border/70">
                <X className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Close</span>
              </Button>
            </div>
          </div>
          
          {/* Header Actions */}
          {headerActions && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                {quickActions}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {headerActions}
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModernInventoryOverlay;