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

interface SalesOrderFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

const SalesOrderFilterModalComponent = ({
  isOpen,
  onClose,
  onApplyFilters
}: SalesOrderFilterModalProps) => {
  const [filters, setFilters] = useState({
    orderNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    orderDateRange: undefined as DateRange | undefined,
    deliveryDateRange: undefined as DateRange | undefined,
    amountRange: { min: '', max: '' }
  });

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setFilters({
      orderNumber: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      status: '',
      paymentStatus: '',
      paymentMethod: '',
      orderDateRange: undefined,
      deliveryDateRange: undefined,
      amountRange: { min: '', max: '' }
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDateChange = useCallback((field: string, range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [field]: range }));
  }, []);

  const handleAmountChange = useCallback((field: 'min' | 'max', value: string) => {
    setFilters(prev => ({ ...prev, amountRange: { ...prev.amountRange, [field]: value } }));
  }, []);

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent className="sm:max-w-[520px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Calendar className="h-4 w-4 text-white" />
            Filter Sales Orders
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="orderNumber" className="text-xs font-medium">Order Number</Label>
              <Input id="orderNumber" placeholder="Enter order number..." className="h-8 text-xs" value={filters.orderNumber} onChange={(e) => handleInputChange('orderNumber', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="customerName" className="text-xs font-medium">Customer Name</Label>
              <Input id="customerName" placeholder="Enter customer name..." className="h-8 text-xs" value={filters.customerName} onChange={(e) => handleInputChange('customerName', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="customerEmail" className="text-xs font-medium">Customer Email</Label>
              <Input id="customerEmail" type="email" placeholder="Enter customer email..." className="h-8 text-xs" value={filters.customerEmail} onChange={(e) => handleInputChange('customerEmail', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="customerPhone" className="text-xs font-medium">Customer Phone</Label>
              <Input id="customerPhone" type="tel" placeholder="Enter customer phone..." className="h-8 text-xs" value={filters.customerPhone} onChange={(e) => handleInputChange('customerPhone', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="status" className="text-xs font-medium">Order Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Statuses</SelectItem>
                  {['Pending','Processing','Shipped','Delivered','Cancelled','Partially Shipped'].map(s => <SelectItem className="text-xs" key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="paymentStatus" className="text-xs font-medium">Payment Status</Label>
              <Select value={filters.paymentStatus} onValueChange={(value) => handleInputChange('paymentStatus', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select payment status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Statuses</SelectItem>
                  {['Pending','Paid','Partial','Overdue'].map(s => <SelectItem className="text-xs" key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="paymentMethod" className="text-xs font-medium">Payment Method</Label>
              <Select value={filters.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select payment method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Methods</SelectItem>
                  {['Credit Card','Debit Card','Bank Transfer','Cash','Check','UPI','Wallet'].map(m => <SelectItem className="text-xs" key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Label htmlFor="minAmount" className="text-xs font-medium">Min Amount (₹)</Label>
              <Input id="minAmount" type="number" placeholder="0" className="h-8 text-xs" value={filters.amountRange.min} onChange={(e) => handleAmountChange('min', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxAmount" className="text-xs font-medium">Max Amount (₹)</Label>
              <Input id="maxAmount" type="number" placeholder="999999" className="h-8 text-xs" value={filters.amountRange.max} onChange={(e) => handleAmountChange('max', e.target.value)} />
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

export const SalesOrderFilterModal = memo(SalesOrderFilterModalComponent);
