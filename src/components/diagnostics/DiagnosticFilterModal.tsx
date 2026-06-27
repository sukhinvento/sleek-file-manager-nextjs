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
import { Activity, X } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

interface DiagnosticFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  statuses: string[];
  categories: string[];
  priorities: string[];
}

const DiagnosticFilterModalComponent = ({
  isOpen,
  onClose,
  onApplyFilters,
  statuses = [],
  categories = [],
  priorities = []
}: DiagnosticFilterModalProps) => {
  const [filters, setFilters] = useState({
    patientId: '',
    patientName: '',
    testName: '',
    category: '',
    orderedBy: '',
    status: '',
    priority: '',
    orderedDateRange: undefined as DateRange | undefined,
    scheduledDateRange: undefined as DateRange | undefined
  });

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setFilters({
      patientId: '',
      patientName: '',
      testName: '',
      category: '',
      orderedBy: '',
      status: '',
      priority: '',
      orderedDateRange: undefined,
      scheduledDateRange: undefined
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDateRangeChange = useCallback((field: 'orderedDateRange' | 'scheduledDateRange', range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [field]: range }));
  }, []);

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="!max-w-[520px] max-w-[520px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Activity className="h-4 w-4 text-white" />
            Filter Diagnostics
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
            {/* Patient ID */}
            <div className="space-y-1">
              <Label htmlFor="patientId" className="text-xs font-medium">Patient ID</Label>
              <Input
                id="patientId"
                placeholder="P001"
                className="h-8 text-xs"
                value={filters.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
              />
            </div>

            {/* Patient Name */}
            <div className="space-y-1">
              <Label htmlFor="patientName" className="text-xs font-medium">Patient Name</Label>
              <Input
                id="patientName"
                placeholder="John Doe"
                className="h-8 text-xs"
                value={filters.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
              />
            </div>

            {/* Test Name */}
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="testName" className="text-xs font-medium">Test Name</Label>
              <Input
                id="testName"
                placeholder="Complete Blood Count"
                className="h-8 text-xs"
                value={filters.testName}
                onChange={(e) => handleInputChange('testName', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs font-medium">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger id="category" className="h-8 text-xs">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All" className="text-xs">All Categories</SelectItem>
                  {categories.filter(c => c !== 'All').map(category => (
                    <SelectItem key={category} value={category} className="text-xs">{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordered By */}
            <div className="space-y-1">
              <Label htmlFor="orderedBy" className="text-xs font-medium">Ordered By</Label>
              <Input
                id="orderedBy"
                placeholder="Dr. Smith"
                className="h-8 text-xs"
                value={filters.orderedBy}
                onChange={(e) => handleInputChange('orderedBy', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Label htmlFor="status" className="text-xs font-medium">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger id="status" className="h-8 text-xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All" className="text-xs">All Statuses</SelectItem>
                  {statuses.filter(s => s !== 'All').map(status => (
                    <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label htmlFor="priority" className="text-xs font-medium">Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger id="priority" className="h-8 text-xs">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All" className="text-xs">All Priorities</SelectItem>
                  {priorities.filter(p => p !== 'All').map(priority => (
                    <SelectItem key={priority} value={priority} className="text-xs">{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordered Date Range */}
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-medium">Ordered Date Range</Label>
              <DatePickerWithRange
                date={filters.orderedDateRange}
                onDateChange={(range) => handleDateRangeChange('orderedDateRange', range)}
              />
            </div>

            {/* Scheduled Date Range */}
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-medium">Scheduled Date Range</Label>
              <DatePickerWithRange
                date={filters.scheduledDateRange}
                onDateChange={(range) => handleDateRangeChange('scheduledDateRange', range)}
              />
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter className="justify-between">
          <Button variant="outline" size="sm" onClick={handleClear} className="flex-1 sm:flex-initial h-8 text-xs gap-1.5">
            <X className="h-3.5 w-3.5" />
            Clear All
          </Button>
          <Button size="sm" onClick={handleApply} className="flex-1 sm:flex-initial h-8 text-xs">
            Apply Filters
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export const DiagnosticFilterModal = memo(DiagnosticFilterModalComponent);
