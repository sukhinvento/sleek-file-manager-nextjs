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
    setFilters(prev => ({ ...prev, amountRange: { ...prev.amountRange, [field]: value } }));
  }, []);

  const handleDateRangeChange = useCallback((field: 'dateRange' | 'dueDateRange', range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [field]: range }));
  }, []);

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="sm:max-w-[520px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <FileText className="h-4 w-4 text-white" />
            Filter Billing Records
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="invoiceNumber" className="text-xs font-medium">Invoice Number</Label>
              <Input id="invoiceNumber" placeholder="INV-2024-001" className="h-8 text-xs" value={filters.invoiceNumber} onChange={(e) => handleInputChange('invoiceNumber', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="patientId" className="text-xs font-medium">Patient ID</Label>
              <Input id="patientId" placeholder="P001" className="h-8 text-xs" value={filters.patientId} onChange={(e) => handleInputChange('patientId', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="patientName" className="text-xs font-medium">Patient Name</Label>
              <Input id="patientName" placeholder="John Smith" className="h-8 text-xs" value={filters.patientName} onChange={(e) => handleInputChange('patientName', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="department" className="text-xs font-medium">Department</Label>
              <Input id="department" placeholder="Cardiology" className="h-8 text-xs" value={filters.department} onChange={(e) => handleInputChange('department', e.target.value)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="doctor" className="text-xs font-medium">Doctor</Label>
              <Input id="doctor" placeholder="Dr. Sarah Johnson" className="h-8 text-xs" value={filters.doctor} onChange={(e) => handleInputChange('doctor', e.target.value)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="status" className="text-xs font-medium">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger id="status" className="h-8 text-xs"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="All">All Statuses</SelectItem>
                  {statuses.filter(s => s !== 'All').map(status => <SelectItem className="text-xs" key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-medium">Invoice Date Range</Label>
              <DatePickerWithRange date={filters.dateRange} onDateChange={(range) => handleDateRangeChange('dateRange', range)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-medium">Due Date Range</Label>
              <DatePickerWithRange date={filters.dueDateRange} onDateChange={(range) => handleDateRangeChange('dueDateRange', range)} />
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

export const BillingFilterModal = memo(BillingFilterModalComponent);
