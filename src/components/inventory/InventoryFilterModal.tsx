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
      <ResponsiveDialogContent className="!max-w-[700px] max-w-[700px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Package className="h-5 w-5 text-white" />
            Filter Inventory Items
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Enter SKU..."
                value={filters.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => handleInputChange('category', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(c => c !== 'All').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                placeholder="Enter supplier name..."
                value={filters.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
              />
            </div>

            {/* Manufacturer */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="Enter manufacturer..."
                value={filters.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location..."
                value={filters.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            {/* Batch Number */}
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                placeholder="Enter batch number..."
                value={filters.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Stock Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleInputChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low Stock</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Expiry Date Range</Label>
              <DatePickerWithRange
                date={filters.expiryDateRange}
                onDateChange={(range) => handleDateChange('expiryDateRange', range)}
              />
            </div>

            {/* Quantity Range */}
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Min Quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                placeholder="0"
                value={filters.quantityRange.min}
                onChange={(e) => handleRangeChange('quantityRange', 'min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxQuantity">Max Quantity</Label>
              <Input
                id="maxQuantity"
                type="number"
                placeholder="999999"
                value={filters.quantityRange.max}
                onChange={(e) => handleRangeChange('quantityRange', 'max', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Unit Price (₹)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filters.priceRange.min}
                onChange={(e) => handleRangeChange('priceRange', 'min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Unit Price (₹)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="999999"
                value={filters.priceRange.max}
                onChange={(e) => handleRangeChange('priceRange', 'max', e.target.value)}
              />
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter className="justify-between">
          <Button variant="outline" onClick={handleClear} className="flex-1 sm:flex-initial">
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1 sm:flex-initial">
            Apply Filters
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export const InventoryFilterModal = memo(InventoryFilterModalComponent);
