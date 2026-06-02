import React from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
  size?: 'default' | 'large' | 'full' | 'medium' | 'wide' | 'small';
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
  small: 'w-full sm:w-[50vw] sm:max-w-[50vw]',
  wide: 'w-full sm:w-[80vw] sm:max-w-[80vw]'
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className={`${sizeClasses[size]} p-0 flex flex-col h-full bg-background`}
        side="right"
      >
        {/* Professional Header */}
        <div className="flex-shrink-0 border-b border-border px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">{title}</h1>
                {status && (
                  <Badge variant="outline" className={`${statusColors[statusColor]} text-xs font-semibold shrink-0 pointer-events-none`}>
                    {status}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{subtitle}</p>
              )}
            </div>

            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Header Actions + Quick Actions */}
          {headerActions && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {quickActions}
              </div>
              <div className="flex items-center gap-1.5">
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
