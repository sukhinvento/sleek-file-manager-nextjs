import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Calendar, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  vendors: string[];
  statuses: string[];
}

export const FilterModal = ({ isOpen, onClose, onApplyFilters, vendors, statuses }: FilterModalProps) => {
  const isMobile = useIsMobile();
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

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
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
  };

  const FilterContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      {/* PO Details */}
      <div className="space-y-2">
        <Label htmlFor="poNumber">PO Number</Label>
        <Input
          id="poNumber"
          placeholder="Enter PO number..."
          value={filters.poNumber}
          onChange={(e) => setFilters({ ...filters, poNumber: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="createdBy">Created By</Label>
        <Input
          id="createdBy"
          placeholder="Enter creator name..."
          value={filters.createdBy}
          onChange={(e) => setFilters({ ...filters, createdBy: e.target.value })}
        />
      </div>

      {/* Vendor Information */}
      <div className="space-y-2">
        <Label htmlFor="vendorName">Vendor Name</Label>
        <Select value={filters.vendorName} onValueChange={(value) => setFilters({ ...filters, vendorName: value })}>
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
          onChange={(e) => setFilters({ ...filters, vendorContact: e.target.value })}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
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
        <Select value={filters.paymentMethod} onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}>
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
          onDateChange={(range) => setFilters({ ...filters, orderDateRange: range })}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Delivery Date Range</Label>
        <DatePickerWithRange
          date={filters.deliveryDateRange}
          onDateChange={(range) => setFilters({ ...filters, deliveryDateRange: range })}
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
          onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxAmount">Max Amount ($)</Label>
        <Input
          id="maxAmount"
          type="number"
          placeholder="999999"
          value={filters.maxAmount}
          onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
        />
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
      <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto">
        <X className="h-4 w-4 mr-2" />
        Clear All
      </Button>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button onClick={handleApply} className="w-full sm:w-auto">
          Apply Filters
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter Purchase Orders
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto px-4">
            <FilterContent />
          </div>
          
          <DrawerFooter>
            <ActionButtons />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:w-[90vw] sm:max-w-2xl md:max-w-3xl sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Purchase Orders
          </DialogTitle>
        </DialogHeader>

        <FilterContent />

        <DialogFooter>
          <ActionButtons />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};