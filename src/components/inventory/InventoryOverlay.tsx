import React from 'react';
import { X, FileText, Mail, Download, Copy } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface InventoryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-[60vw] max-w-[700px]',
  md: 'w-[75vw] max-w-[900px]',
  lg: 'w-[85vw] max-w-[1100px]',
  xl: 'w-[95vw] max-w-[1400px]'
};

export const InventoryOverlay = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  headerActions,
  footerActions,
  size = 'lg' 
}: InventoryOverlayProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={`${sizeClasses[size]} overflow-y-auto overlay-content`}>
        <SheetHeader className="border-b border-border/50 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="section-header text-xl">
              {title}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {/* Custom header actions - Primary CTAs first */}
              {headerActions}
              
              {/* Secondary actions */}
              <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                <FileText className="h-4 w-4 icon-accent" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                <Mail className="h-4 w-4 icon-accent" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                <Download className="h-4 w-4 icon-accent" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                <Copy className="h-4 w-4 icon-accent" />
              </Button>
              
              {/* Close button */}
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted/50">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 animate-slide-up flex-1 min-h-0">
          {children}
        </div>

        {footerActions && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-6 bg-background sticky bottom-0">
            {footerActions}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InventoryOverlay;