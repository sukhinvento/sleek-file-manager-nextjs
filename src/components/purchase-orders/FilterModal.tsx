import { useState, useCallback, useMemo, memo } from 'react';
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
import { Calendar, X } from "lucide-react";
import { DateRange } from "react-day-picker";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  vendors: string[];
  statuses: string[];
}

const FilterModalComponent = ({ isOpen, onClose, onApplyFilters, vendors, statuses }: FilterModalProps) => {
  const [filters, setFilters] = useState({
    poNumber: '',
    vendorName: '',
    vendorContact: '',
    status: '',
    createdBy: '',
    orderDateRange: undefined as DateRange | undefined,
    deliveryDateRange: undefined as DateRange | undefined,
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
  });

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setFilters({
      poNumber: '',
      vendorName: '',
      vendorContact: '',
      status: '',
      createdBy: '',
      orderDateRange: undefined,
      deliveryDateRange: undefined,
      minAmount: '',
      maxAmount: '',
      paymentMethod: '',
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDateChange = useCallback((field: string, range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [field]: range }));
  }, []);

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="!max-w-[500px] max-w-[500px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Calendar className="h-5 w-5 text-white" />
            Filter Purchase Orders
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* PO Details */}
            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                placeholder="Enter PO number..."
                value={filters.poNumber}
                onChange={(e) => handleInputChange('poNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="createdBy">Created By</Label>
              <Input
                id="createdBy"
                placeholder="Enter creator name..."
                value={filters.createdBy}
                onChange={(e) => handleInputChange('createdBy', e.target.value)}
              />
            </div>

            {/* Vendor Information */}
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Select value={filters.vendorName} onValueChange={(value) => handleInputChange('vendorName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-vendors">All Vendors</SelectItem>
                  {vendors.filter(v => v !== 'All').map(vendor => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorContact">Vendor Contact</Label>
              <Input
                id="vendorContact"
                placeholder="Enter contact info..."
                value={filters.vendorContact}
                onChange={(e) => handleInputChange('vendorContact', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  {statuses.filter(s => s !== 'All').map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={filters.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-methods">All Methods</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Ranges */}
            <div className="space-y-2 md:col-span-2">
              <Label>Order Date Range</Label>
              <DatePickerWithRange
                date={filters.orderDateRange}
                onDateChange={(range) => handleDateChange('orderDateRange', range)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Delivery Date Range</Label>
              <DatePickerWithRange
                date={filters.deliveryDateRange}
                onDateChange={(range) => handleDateChange('deliveryDateRange', range)}
              />
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount ($)</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleInputChange('minAmount', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Amount ($)</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="999999"
                value={filters.maxAmount}
                onChange={(e) => handleInputChange('maxAmount', e.target.value)}
              />
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter className="justify-between">
          <Button variant="outline" onClick={handleClear} className="flex-1 sm:flex-initial">
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button onClick={handleApply} className="flex-1 sm:flex-initial">
            Apply Filters
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export const FilterModal = memo(FilterModalComponent);