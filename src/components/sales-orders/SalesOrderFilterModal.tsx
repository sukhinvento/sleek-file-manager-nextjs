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
    setFilters(prev => ({ 
      ...prev, 
      amountRange: { ...prev.amountRange, [field]: value }
    }));
  }, []);

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent className="!max-w-[700px] max-w-[700px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Calendar className="h-5 w-5 text-white" />
            Filter Sales Orders
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Order Number */}
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="Enter order number..."
                value={filters.orderNumber}
                onChange={(e) => handleInputChange('orderNumber', e.target.value)}
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name..."
                value={filters.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
              />
            </div>

            {/* Customer Email */}
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="Enter customer email..."
                value={filters.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="Enter customer phone..."
                value={filters.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleInputChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Partially Shipped">Partially Shipped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select 
                value={filters.paymentStatus} 
                onValueChange={(value) => handleInputChange('paymentStatus', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2 md:col-span-2">
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
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Amount Range */}
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount (₹)</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="0"
                value={filters.amountRange.min}
                onChange={(e) => handleAmountChange('min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Amount (₹)</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="999999"
                value={filters.amountRange.max}
                onChange={(e) => handleAmountChange('max', e.target.value)}
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

export const SalesOrderFilterModal = memo(SalesOrderFilterModalComponent);
