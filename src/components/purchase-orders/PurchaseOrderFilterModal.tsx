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
      <ResponsiveDialogContent className="sm:max-w-[520px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Calendar className="h-4 w-4 text-white" />
            Filter Purchase Orders
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="poNumber" className="text-xs font-medium">PO Number</Label>
              <Input id="poNumber" placeholder="Enter PO number..." className="h-8 text-xs" value={filters.poNumber} onChange={(e) => handleInputChange('poNumber', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vendor" className="text-xs font-medium">Vendor</Label>
              <Select value={filters.vendor} onValueChange={(value) => handleInputChange('vendor', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Vendors</SelectItem>
                  {vendors.map(vendor => <SelectItem className="text-xs" key={vendor} value={vendor}>{vendor}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="vendorContact" className="text-xs font-medium">Vendor Contact</Label>
              <Input id="vendorContact" placeholder="Enter vendor contact..." className="h-8 text-xs" value={filters.vendorContact} onChange={(e) => handleInputChange('vendorContact', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="status" className="text-xs font-medium">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Statuses</SelectItem>
                  {['Draft','Pending','Approved','Received','Partially Received','Delivered','Cancelled'].map(s => <SelectItem className="text-xs" key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="paymentMethod" className="text-xs font-medium">Payment Method</Label>
              <Select value={filters.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select payment method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Methods</SelectItem>
                  {['Credit Card','Bank Transfer','Cash','Check','Net 30','Net 60','Net 90'].map(m => <SelectItem className="text-xs" key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="createdBy" className="text-xs font-medium">Created By</Label>
              <Input id="createdBy" placeholder="Enter creator name..." className="h-8 text-xs" value={filters.createdBy} onChange={(e) => handleInputChange('createdBy', e.target.value)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="approvedBy" className="text-xs font-medium">Approved By</Label>
              <Input id="approvedBy" placeholder="Enter approver name..." className="h-8 text-xs" value={filters.approvedBy} onChange={(e) => handleInputChange('approvedBy', e.target.value)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-medium">Order Date Range</Label>
              <DatePickerWithRange date={filters.orderDateRange} onDateChange={(range) => handleDateChange('orderDateRange', range)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-medium">Delivery Date Range</Label>
              <DatePickerWithRange date={filters.deliveryDateRange} onDateChange={(range) => handleDateChange('deliveryDateRange', range)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="minAmount" className="text-xs font-medium">Min Total Amount (₹)</Label>
              <Input id="minAmount" type="number" placeholder="0" className="h-8 text-xs" value={filters.amountRange.min} onChange={(e) => handleRangeChange('amountRange', 'min', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxAmount" className="text-xs font-medium">Max Total Amount (₹)</Label>
              <Input id="maxAmount" type="number" placeholder="999999" className="h-8 text-xs" value={filters.amountRange.max} onChange={(e) => handleRangeChange('amountRange', 'max', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="minPaidAmount" className="text-xs font-medium">Min Paid Amount (₹)</Label>
              <Input id="minPaidAmount" type="number" placeholder="0" className="h-8 text-xs" value={filters.paidAmountRange.min} onChange={(e) => handleRangeChange('paidAmountRange', 'min', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxPaidAmount" className="text-xs font-medium">Max Paid Amount (₹)</Label>
              <Input id="maxPaidAmount" type="number" placeholder="999999" className="h-8 text-xs" value={filters.paidAmountRange.max} onChange={(e) => handleRangeChange('paidAmountRange', 'max', e.target.value)} />
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

export const PurchaseOrderFilterModal = memo(PurchaseOrderFilterModalComponent);
