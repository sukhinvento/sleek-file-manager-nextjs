import { useState, useCallback, memo } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Package, X } from "lucide-react";
import { DateRange } from "react-day-picker";

interface InventoryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  categories: string[];
}

const InventoryFilterModalComponent = ({
  isOpen,
  onClose,
  onApplyFilters,
  categories
}: InventoryFilterModalProps) => {
  const [filters, setFilters] = useState({
    sku: '',
    supplier: '',
    manufacturer: '',
    location: '',
    batchNumber: '',
    category: '',
    status: '',
    expiryDateRange: undefined as DateRange | undefined,
    quantityRange: { min: '', max: '' },
    priceRange: { min: '', max: '' }
  });

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setFilters({
      sku: '',
      supplier: '',
      manufacturer: '',
      location: '',
      batchNumber: '',
      category: '',
      status: '',
      expiryDateRange: undefined,
      quantityRange: { min: '', max: '' },
      priceRange: { min: '', max: '' }
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDateChange = useCallback((field: string, range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [field]: range }));
  }, []);

  const handleRangeChange = useCallback((rangeField: string, field: 'min' | 'max', value: string) => {
    setFilters(prev => ({
      ...prev,
      [rangeField]: { ...(prev[rangeField as keyof typeof prev] as any), [field]: value }
    }));
  }, []);

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent className="sm:max-w-[520px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Package className="h-4 w-4 text-white" />
            Filter Inventory Items
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="sku" className="text-xs font-medium">SKU</Label>
              <Input id="sku" placeholder="Enter SKU..." className="h-8 text-xs" value={filters.sku} onChange={(e) => handleInputChange('sku', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs font-medium">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleInputChange('category', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Categories</SelectItem>
                  {categories.filter(c => c !== 'All').map(category => <SelectItem className="text-xs" key={category} value={category}>{category}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="supplier" className="text-xs font-medium">Supplier</Label>
              <Input id="supplier" placeholder="Enter supplier name..." className="h-8 text-xs" value={filters.supplier} onChange={(e) => handleInputChange('supplier', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="manufacturer" className="text-xs font-medium">Manufacturer</Label>
              <Input id="manufacturer" placeholder="Enter manufacturer..." className="h-8 text-xs" value={filters.manufacturer} onChange={(e) => handleInputChange('manufacturer', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="location" className="text-xs font-medium">Location</Label>
              <Input id="location" placeholder="Enter location..." className="h-8 text-xs" value={filters.location} onChange={(e) => handleInputChange('location', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="batchNumber" className="text-xs font-medium">Batch Number</Label>
              <Input id="batchNumber" placeholder="Enter batch number..." className="h-8 text-xs" value={filters.batchNumber} onChange={(e) => handleInputChange('batchNumber', e.target.value)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="status" className="text-xs font-medium">Stock Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Statuses</SelectItem>
                  {['Normal','Low','Critical','Out of Stock'].map(s => <SelectItem className="text-xs" key={s} value={s}>{s === 'Low' ? 'Low Stock' : s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-medium">Expiry Date Range</Label>
              <DatePickerWithRange date={filters.expiryDateRange} onDateChange={(range) => handleDateChange('expiryDateRange', range)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="minQuantity" className="text-xs font-medium">Min Quantity</Label>
              <Input id="minQuantity" type="number" placeholder="0" className="h-8 text-xs" value={filters.quantityRange.min} onChange={(e) => handleRangeChange('quantityRange', 'min', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxQuantity" className="text-xs font-medium">Max Quantity</Label>
              <Input id="maxQuantity" type="number" placeholder="999999" className="h-8 text-xs" value={filters.quantityRange.max} onChange={(e) => handleRangeChange('quantityRange', 'max', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="minPrice" className="text-xs font-medium">Min Unit Price (₹)</Label>
              <Input id="minPrice" type="number" placeholder="0" className="h-8 text-xs" value={filters.priceRange.min} onChange={(e) => handleRangeChange('priceRange', 'min', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxPrice" className="text-xs font-medium">Max Unit Price (₹)</Label>
              <Input id="maxPrice" type="number" placeholder="999999" className="h-8 text-xs" value={filters.priceRange.max} onChange={(e) => handleRangeChange('priceRange', 'max', e.target.value)} />
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter className="justify-between">
          <Button variant="outline" size="sm" onClick={handleClear} className="h-8 text-xs flex-1 sm:flex-initial">
            <X className="h-3 w-3 mr-1.5" />
            Clear All
          </Button>
          <Button size="sm" onClick={handleApply} className="h-8 text-xs flex-1 sm:flex-initial">
            Apply Filters
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export const InventoryFilterModal = memo(InventoryFilterModalComponent);
