import React from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface ModernInventoryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Optional icon rendered in a rounded tinted container left of the title */
  icon?: React.ReactNode;
  status?: string;
  statusColor?: 'pending' | 'approved' | 'delivered' | 'cancelled';
  children: React.ReactNode;
  /** @deprecated pass footer prop instead — CTAs belong in the footer */
  headerActions?: React.ReactNode;
  /** @deprecated pass footer prop instead */
  quickActions?: React.ReactNode;
  /** Sticky footer bar — place all primary CTAs here */
  footer?: React.ReactNode;
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
  icon,
  status,
  statusColor = 'pending',
  children,
  headerActions,
  quickActions,
  footer,
  size = 'medium'
}: ModernInventoryOverlayProps) => {

  // Resolve what shows in the footer:
  // Prefer the explicit `footer` prop; fall back to legacy headerActions/quickActions
  const footerContent = footer ?? (
    (headerActions || quickActions || status) ? (
      <div className="flex flex-wrap items-center gap-2 w-full">
        {status && (
          <Badge variant="outline" className={`${statusColors[statusColor]} text-xs font-semibold pointer-events-none`}>
            {status}
          </Badge>
        )}
        {quickActions && (
          <div className="flex items-center gap-1.5 overflow-x-auto flex-wrap">
            {quickActions}
          </div>
        )}
        {headerActions && (
          <div className="flex items-center gap-1.5 ml-auto flex-wrap justify-end">
            {headerActions}
          </div>
        )}
      </div>
    ) : null
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className={`${sizeClasses[size]} p-0 flex flex-col h-full bg-background`}
        side="right"
      >
        {/* Header — title + subtitle + close only */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground tracking-tight leading-tight break-words">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">{subtitle}</p>
              )}
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer — all CTAs live here */}
        {footerContent && (
          <div className="flex-shrink-0 border-t border-border bg-background/95 px-4 sm:px-6 py-3">
            {footerContent}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ModernInventoryOverlay;
