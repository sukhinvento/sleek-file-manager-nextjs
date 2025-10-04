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
import { Calendar, X } from "lucide-react";
import { DateRange } from "react-day-picker";

interface PurchaseOrderFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  vendors: string[];
}

const PurchaseOrderFilterModalComponent = ({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  vendors 
}: PurchaseOrderFilterModalProps) => {
  const [filters, setFilters] = useState({
    vendor: '',
    poNumber: '',
    vendorContact: '',
    status: '',
    paymentMethod: '',
    createdBy: '',
    approvedBy: '',
    orderDateRange: undefined as DateRange | undefined,
    deliveryDateRange: undefined as DateRange | undefined,
    amountRange: { min: '', max: '' },
    paidAmountRange: { min: '', max: '' }
  });

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setFilters({
      vendor: '',
      poNumber: '',
      vendorContact: '',
      status: '',
      paymentMethod: '',
      createdBy: '',
      approvedBy: '',
      orderDateRange: undefined,
      deliveryDateRange: undefined,
      amountRange: { min: '', max: '' },
      paidAmountRange: { min: '', max: '' }
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
            <Calendar className="h-5 w-5 text-white" />
            Filter Purchase Orders
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* PO Number */}
            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                placeholder="Enter PO number..."
                value={filters.poNumber}
                onChange={(e) => handleInputChange('poNumber', e.target.value)}
              />
            </div>

            {/* Vendor Filter */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select 
                value={filters.vendor} 
                onValueChange={(value) => handleInputChange('vendor', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vendor Contact */}
            <div className="space-y-2">
              <Label htmlFor="vendorContact">Vendor Contact</Label>
              <Input
                id="vendorContact"
                placeholder="Enter vendor contact..."
                value={filters.vendorContact}
                onChange={(e) => handleInputChange('vendorContact', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleInputChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Partially Received">Partially Received</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={filters.paymentMethod} 
                onValueChange={(value) => handleInputChange('paymentMethod', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                  <SelectItem value="Net 90">Net 90</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Created By */}
            <div className="space-y-2">
              <Label htmlFor="createdBy">Created By</Label>
              <Input
                id="createdBy"
                placeholder="Enter creator name..."
                value={filters.createdBy}
                onChange={(e) => handleInputChange('createdBy', e.target.value)}
              />
            </div>

            {/* Approved By */}
            <div className="space-y-2">
              <Label htmlFor="approvedBy">Approved By</Label>
              <Input
                id="approvedBy"
                placeholder="Enter approver name..."
                value={filters.approvedBy}
                onChange={(e) => handleInputChange('approvedBy', e.target.value)}
              />
            </div>

            {/* Order Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Order Date Range</Label>
              <DatePickerWithRange
                date={filters.orderDateRange}
                onDateChange={(range) => handleDateChange('orderDateRange', range)}
              />
            </div>

            {/* Delivery Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Delivery Date Range</Label>
              <DatePickerWithRange
                date={filters.deliveryDateRange}
                onDateChange={(range) => handleDateChange('deliveryDateRange', range)}
              />
            </div>

            {/* Total Amount Range */}
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Total Amount (₹)</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="0"
                value={filters.amountRange.min}
                onChange={(e) => handleRangeChange('amountRange', 'min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Total Amount (₹)</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="999999"
                value={filters.amountRange.max}
                onChange={(e) => handleRangeChange('amountRange', 'max', e.target.value)}
              />
            </div>

            {/* Paid Amount Range */}
            <div className="space-y-2">
              <Label htmlFor="minPaidAmount">Min Paid Amount (₹)</Label>
              <Input
                id="minPaidAmount"
                type="number"
                placeholder="0"
                value={filters.paidAmountRange.min}
                onChange={(e) => handleRangeChange('paidAmountRange', 'min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPaidAmount">Max Paid Amount (₹)</Label>
              <Input
                id="maxPaidAmount"
                type="number"
                placeholder="999999"
                value={filters.paidAmountRange.max}
                onChange={(e) => handleRangeChange('paidAmountRange', 'max', e.target.value)}
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

export const PurchaseOrderFilterModal = memo(PurchaseOrderFilterModalComponent);
