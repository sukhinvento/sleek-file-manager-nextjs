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
      <ResponsiveDialogContent className="!max-w-[700px] max-w-[700px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Building2 className="h-5 w-5 text-white" />
            Filter Vendors
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Vendor ID */}
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor ID</Label>
              <Input
                id="vendorId"
                placeholder="Enter vendor ID..."
                value={filters.vendorId}
                onChange={(e) => handleInputChange('vendorId', e.target.value)}
              />
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="Enter contact person..."
                value={filters.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number..."
                value={filters.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email..."
                value={filters.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Enter city..."
                value={filters.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Enter state..."
                value={filters.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Terms */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                placeholder="Enter payment terms (e.g., Net 30)..."
                value={filters.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              />
            </div>

            {/* Registration Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Registration Date Range</Label>
              <DatePickerWithRange
                date={filters.registrationDateRange}
                onDateChange={(range) => handleDateChange('registrationDateRange', range)}
              />
            </div>

            {/* Credit Limit Range */}
            <div className="space-y-2">
              <Label htmlFor="minCreditLimit">Min Credit Limit (₹)</Label>
              <Input
                id="minCreditLimit"
                type="number"
                placeholder="0"
                value={filters.creditLimitRange.min}
                onChange={(e) => handleRangeChange('creditLimitRange', 'min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCreditLimit">Max Credit Limit (₹)</Label>
              <Input
                id="maxCreditLimit"
                type="number"
                placeholder="999999"
                value={filters.creditLimitRange.max}
                onChange={(e) => handleRangeChange('creditLimitRange', 'max', e.target.value)}
              />
            </div>

            {/* Outstanding Balance Range */}
            <div className="space-y-2">
              <Label htmlFor="minOutstanding">Min Outstanding (₹)</Label>
              <Input
                id="minOutstanding"
                type="number"
                placeholder="0"
                value={filters.outstandingBalanceRange.min}
                onChange={(e) => handleRangeChange('outstandingBalanceRange', 'min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxOutstanding">Max Outstanding (₹)</Label>
              <Input
                id="maxOutstanding"
                type="number"
                placeholder="999999"
                value={filters.outstandingBalanceRange.max}
                onChange={(e) => handleRangeChange('outstandingBalanceRange', 'max', e.target.value)}
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

export const VendorFilterModal = memo(VendorFilterModalComponent);
