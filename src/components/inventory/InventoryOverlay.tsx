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
  sm: 'w-[50vw] max-w-[600px]',
  md: 'w-[65vw] max-w-[800px]',
  lg: 'w-[75vw] max-w-[1000px]',
  xl: 'w-[85vw] max-w-[1200px]'
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
        <SheetHeader className="border-b border-border/50 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="section-header text-xl">
              {title}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {/* Default header actions */}
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
              
              {/* Custom header actions */}
              {headerActions}
              
              {/* Close button */}
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted/50">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 animate-slide-up">
          {children}
        </div>

        {footerActions && (
          <div className="flex justify-end gap-3 pt-6 border-t border-border/50 mt-8">
            {footerActions}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InventoryOverlay;