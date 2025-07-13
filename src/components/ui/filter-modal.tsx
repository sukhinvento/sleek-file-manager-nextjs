import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from 'lucide-react';
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";

interface FilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const FilterModal = ({ isOpen, onOpenChange, children }: FilterModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-muted-foreground hover:text-foreground border-border/50">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Advanced Filters
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};