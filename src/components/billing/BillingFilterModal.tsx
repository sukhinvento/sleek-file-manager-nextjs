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
import { FileText, X } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

interface BillingFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  statuses: string[];
}

const BillingFilterModalComponent = ({ 
  isOpen, 
  onClose, 
  onApplyFilters,
  statuses
}: BillingFilterModalProps) => {
  const [filters, setFilters] = useState({
    invoiceNumber: '',
    patientId: '',
    patientName: '',
    department: '',
    doctor: '',
    status: '',
    dateRange: undefined as DateRange | undefined,
    dueDateRange: undefined as DateRange | undefined,
    amountRange: { min: '', max: '' }
  });

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setFilters({
      invoiceNumber: '',
      patientId: '',
      patientName: '',
      department: '',
      doctor: '',
      status: '',
      dateRange: undefined,
      dueDateRange: undefined,
      amountRange: { min: '', max: '' }
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAmountChange = useCallback((field: 'min' | 'max', value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      amountRange: { ...prev.amountRange, [field]: value }
    }));
  }, []);

  const handleDateRangeChange = useCallback((field: 'dateRange' | 'dueDateRange', range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [field]: range }));
  }, []);

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="!max-w-[600px] max-w-[600px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <FileText className="h-5 w-5 text-white" />
            Filter Billing Records
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                placeholder="INV-2024-001"
                value={filters.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              />
            </div>

            {/* Patient ID */}
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                placeholder="P001"
                value={filters.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
              />
            </div>

            {/* Patient Name */}
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                placeholder="John Smith"
                value={filters.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="Cardiology"
                value={filters.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>

            {/* Doctor */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Input
                id="doctor"
                placeholder="Dr. Sarah Johnson"
                value={filters.doctor}
                onChange={(e) => handleInputChange('doctor', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {statuses.filter(s => s !== 'All').map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Invoice Date Range</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range) => handleDateRangeChange('dateRange', range)}
              />
            </div>

            {/* Due Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Due Date Range</Label>
              <DatePickerWithRange
                date={filters.dueDateRange}
                onDateChange={(range) => handleDateRangeChange('dueDateRange', range)}
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

export const BillingFilterModal = memo(BillingFilterModalComponent);
