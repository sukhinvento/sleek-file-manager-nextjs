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
import { Building2, X } from "lucide-react";
import { DateRange } from "react-day-picker";

interface VendorFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  categories: string[];
}

const VendorFilterModalComponent = ({
  isOpen,
  onClose,
  onApplyFilters,
  categories
}: VendorFilterModalProps) => {
  const [filters, setFilters] = useState({
    vendorId: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    category: '',
    status: '',
    paymentTerms: '',
    registrationDateRange: undefined as DateRange | undefined,
    creditLimitRange: { min: '', max: '' },
    outstandingBalanceRange: { min: '', max: '' }
  });

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setFilters({
      vendorId: '',
      contactPerson: '',
      phone: '',
      email: '',
      city: '',
      state: '',
      category: '',
      status: '',
      paymentTerms: '',
      registrationDateRange: undefined,
      creditLimitRange: { min: '', max: '' },
      outstandingBalanceRange: { min: '', max: '' }
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
            <Building2 className="h-4 w-4 text-white" />
            Filter Vendors
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="vendorId" className="text-xs font-medium">Vendor ID</Label>
              <Input id="vendorId" placeholder="Enter vendor ID..." className="h-8 text-xs" value={filters.vendorId} onChange={(e) => handleInputChange('vendorId', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="contactPerson" className="text-xs font-medium">Contact Person</Label>
              <Input id="contactPerson" placeholder="Enter contact person..." className="h-8 text-xs" value={filters.contactPerson} onChange={(e) => handleInputChange('contactPerson', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-medium">Phone</Label>
              <Input id="phone" type="tel" placeholder="Enter phone number..." className="h-8 text-xs" value={filters.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input id="email" type="email" placeholder="Enter email..." className="h-8 text-xs" value={filters.email} onChange={(e) => handleInputChange('email', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="city" className="text-xs font-medium">City</Label>
              <Input id="city" placeholder="Enter city..." className="h-8 text-xs" value={filters.city} onChange={(e) => handleInputChange('city', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="state" className="text-xs font-medium">State</Label>
              <Input id="state" placeholder="Enter state..." className="h-8 text-xs" value={filters.state} onChange={(e) => handleInputChange('state', e.target.value)} />
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
              <Label htmlFor="status" className="text-xs font-medium">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="all">All Statuses</SelectItem>
                  {['Active','Inactive','Pending'].map(s => <SelectItem className="text-xs" key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="paymentTerms" className="text-xs font-medium">Payment Terms</Label>
              <Input id="paymentTerms" placeholder="Enter payment terms (e.g., Net 30)..." className="h-8 text-xs" value={filters.paymentTerms} onChange={(e) => handleInputChange('paymentTerms', e.target.value)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-medium">Registration Date Range</Label>
              <DatePickerWithRange date={filters.registrationDateRange} onDateChange={(range) => handleDateChange('registrationDateRange', range)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="minCreditLimit" className="text-xs font-medium">Min Credit Limit (₹)</Label>
              <Input id="minCreditLimit" type="number" placeholder="0" className="h-8 text-xs" value={filters.creditLimitRange.min} onChange={(e) => handleRangeChange('creditLimitRange', 'min', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxCreditLimit" className="text-xs font-medium">Max Credit Limit (₹)</Label>
              <Input id="maxCreditLimit" type="number" placeholder="999999" className="h-8 text-xs" value={filters.creditLimitRange.max} onChange={(e) => handleRangeChange('creditLimitRange', 'max', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="minOutstanding" className="text-xs font-medium">Min Outstanding (₹)</Label>
              <Input id="minOutstanding" type="number" placeholder="0" className="h-8 text-xs" value={filters.outstandingBalanceRange.min} onChange={(e) => handleRangeChange('outstandingBalanceRange', 'min', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxOutstanding" className="text-xs font-medium">Max Outstanding (₹)</Label>
              <Input id="maxOutstanding" type="number" placeholder="999999" className="h-8 text-xs" value={filters.outstandingBalanceRange.max} onChange={(e) => handleRangeChange('outstandingBalanceRange', 'max', e.target.value)} />
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

export const VendorFilterModal = memo(VendorFilterModalComponent);
