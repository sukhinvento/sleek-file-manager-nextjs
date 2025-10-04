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
  statuses,
  categories,
  priorities
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
      <ResponsiveDialogContent className="!max-w-[600px] max-w-[600px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Activity className="h-5 w-5 text-white" />
            Filter Diagnostic Tests
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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
                placeholder="John Doe"
                value={filters.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
              />
            </div>

            {/* Test Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="testName">Test Name</Label>
              <Input
                id="testName"
                placeholder="Complete Blood Count"
                value={filters.testName}
                onChange={(e) => handleInputChange('testName', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.filter(c => c !== 'All').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordered By */}
            <div className="space-y-2">
              <Label htmlFor="orderedBy">Ordered By</Label>
              <Input
                id="orderedBy"
                placeholder="Dr. Smith"
                value={filters.orderedBy}
                onChange={(e) => handleInputChange('orderedBy', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
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

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priorities</SelectItem>
                  {priorities.filter(p => p !== 'All').map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordered Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Ordered Date Range</Label>
              <DatePickerWithRange
                date={filters.orderedDateRange}
                onDateChange={(range) => handleDateRangeChange('orderedDateRange', range)}
              />
            </div>

            {/* Scheduled Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Scheduled Date Range</Label>
              <DatePickerWithRange
                date={filters.scheduledDateRange}
                onDateChange={(range) => handleDateRangeChange('scheduledDateRange', range)}
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

export const DiagnosticFilterModal = memo(DiagnosticFilterModalComponent);
