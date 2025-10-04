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
import { Truck, X } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";

interface StockTransferFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  locations: string[];
  statuses: string[];
}

const StockTransferFilterModalComponent = ({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  locations, 
  statuses 
}: StockTransferFilterModalProps) => {
  const [filters, setFilters] = useState({
    transferId: '',
    fromLocation: '',
    toLocation: '',
    requestedBy: '',
    status: '',
    priority: '',
    requestDateRange: undefined as DateRange | undefined,
    expectedDateRange: undefined as DateRange | undefined
  });

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setFilters({
      transferId: '',
      fromLocation: '',
      toLocation: '',
      requestedBy: '',
      status: '',
      priority: '',
      requestDateRange: undefined,
      expectedDateRange: undefined
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDateRangeChange = useCallback((field: 'requestDateRange' | 'expectedDateRange', range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [field]: range }));
  }, []);

  const priorities = ['Low', 'Normal', 'Medium', 'High', 'Critical'];

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="!max-w-[600px] max-w-[600px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Truck className="h-5 w-5 text-white" />
            Filter Stock Transfers
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Transfer ID */}
            <div className="space-y-2">
              <Label htmlFor="transferId">Transfer ID</Label>
              <Input
                id="transferId"
                placeholder="TRN-2024-001"
                value={filters.transferId}
                onChange={(e) => handleInputChange('transferId', e.target.value)}
              />
            </div>

            {/* Requested By */}
            <div className="space-y-2">
              <Label htmlFor="requestedBy">Requested By</Label>
              <Input
                id="requestedBy"
                placeholder="John Doe"
                value={filters.requestedBy}
                onChange={(e) => handleInputChange('requestedBy', e.target.value)}
              />
            </div>

            {/* From Location */}
            <div className="space-y-2">
              <Label htmlFor="fromLocation">From Location</Label>
              <Select 
                value={filters.fromLocation} 
                onValueChange={(value) => handleInputChange('fromLocation', value === 'All' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {locations.filter(l => l !== 'All').map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <Label htmlFor="toLocation">To Location</Label>
              <Select 
                value={filters.toLocation} 
                onValueChange={(value) => handleInputChange('toLocation', value === 'All' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {locations.filter(l => l !== 'All').map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Request Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Request Date Range</Label>
              <DatePickerWithRange
                date={filters.requestDateRange}
                onDateChange={(range) => handleDateRangeChange('requestDateRange', range)}
              />
            </div>

            {/* Expected Date Range */}
            <div className="space-y-2 md:col-span-2">
              <Label>Expected Delivery Date Range</Label>
              <DatePickerWithRange
                date={filters.expectedDateRange}
                onDateChange={(range) => handleDateRangeChange('expectedDateRange', range)}
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

export const StockTransferFilterModal = memo(StockTransferFilterModalComponent);
