import { useState, memo } from 'react';
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

interface InventorySortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySort: (sortConfig: { field: string; direction: 'asc' | 'desc' }) => void;
}

const InventorySortModalComponent = ({ isOpen, onClose, onApplySort }: InventorySortModalProps) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortOptions = [
    { value: 'itemCode', label: 'Item Code' },
    { value: 'itemName', label: 'Item Name' },
    { value: 'category', label: 'Category' },
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'stock', label: 'Stock Level' },
    { value: 'reorderLevel', label: 'Reorder Level' },
    { value: 'unitPrice', label: 'Unit Price' },
    { value: 'expiryDate', label: 'Expiry Date' },
    { value: 'lastRestocked', label: 'Last Restocked' },
  ];

  const handleApply = () => {
    if (sortField) {
      onApplySort({ field: sortField, direction: sortDirection });
      onClose();
    }
  };

  const handleClear = () => {
    setSortField('');
    setSortDirection('asc');
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent className="sm:max-w-[360px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sort By</Label>
              <Select value={sortField} onValueChange={setSortField}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Direction</Label>
              <RadioGroup
                value={sortDirection}
                onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}
                className="space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="asc" id="asc" className="h-3.5 w-3.5" />
                  <Label htmlFor="asc" className="text-xs font-normal cursor-pointer flex items-center gap-1.5">
                    <ArrowUp className="h-3 w-3" />
                    Ascending (A–Z, oldest first)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="desc" id="desc" className="h-3.5 w-3.5" />
                  <Label htmlFor="desc" className="text-xs font-normal cursor-pointer flex items-center gap-1.5">
                    <ArrowDown className="h-3 w-3" />
                    Descending (Z–A, newest first)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button variant="outline" size="sm" onClick={handleClear} className="h-8 text-xs">
            Clear
          </Button>
          <Button size="sm" onClick={handleApply} disabled={!sortField} className="h-8 text-xs">
            Apply
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export const InventorySortModal = memo(InventorySortModalComponent);
