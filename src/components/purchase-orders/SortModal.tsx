import { useState } from 'react';
import { 
  ResponsiveDialog, 
  ResponsiveDialogContent, 
  ResponsiveDialogFooter, 
  ResponsiveDialogHeader, 
  ResponsiveDialogTitle,
  ResponsiveDialogBody
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySort: (sortConfig: { field: string; direction: 'asc' | 'desc' }) => void;
}

export const SortModal = ({ isOpen, onClose, onApplySort }: SortModalProps) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortOptions = [
    { value: 'poNumber', label: 'PO Number' },
    { value: 'vendorName', label: 'Vendor Name' },
    { value: 'status', label: 'Status' },
    { value: 'orderDate', label: 'Order Date' },
    { value: 'deliveryDate', label: 'Delivery Date' },
    { value: 'total', label: 'Total Amount' },
    { value: 'createdBy', label: 'Created By' },
  ];

  const handleApply = () => {
    if (sortField) {
      onApplySort({ field: sortField, direction: sortDirection });
      onClose();
    }
  };

  const SortContent = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="sortField">Sort By</Label>
        <Select value={sortField} onValueChange={setSortField}>
          <SelectTrigger>
            <SelectValue placeholder="Select field to sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Sort Direction</Label>
        <RadioGroup value={sortDirection} onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="asc" id="asc" />
            <Label htmlFor="asc" className="flex items-center gap-2 cursor-pointer">
              <ArrowUp className="h-4 w-4" />
              Ascending (A-Z, 1-9, Oldest first)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="desc" id="desc" />
            <Label htmlFor="desc" className="flex items-center gap-2 cursor-pointer">
              <ArrowDown className="h-4 w-4" />
              Descending (Z-A, 9-1, Newest first)
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const ActionButtons = () => (
    <>
      <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
        Cancel
      </Button>
      <Button 
        onClick={handleApply} 
        disabled={!sortField}
        className="flex-1 sm:flex-initial"
      >
        Apply Sort
      </Button>
    </>
  );

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <ArrowUpDown className="h-5 w-5 text-white" />
            Sort Purchase Orders
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <SortContent />
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <ActionButtons />
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};