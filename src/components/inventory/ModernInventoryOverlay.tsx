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
  size?: 'default' | 'large' | 'full' | 'medium';
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const sizeClasses = {
  default: 'w-[90vw] max-w-[1200px]',
  large: 'w-[95vw] max-w-[1400px]',
  full: 'w-[98vw] max-w-[1600px]',
  medium: 'w-[60vw] max-w-[60vw]'
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
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
                {status && (
                  <Badge variant="outline" className={statusColors[statusColor]}>
                    {status}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-muted-foreground text-sm font-medium">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Header Actions */}
          {headerActions && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {quickActions}
              </div>
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModernInventoryOverlay;