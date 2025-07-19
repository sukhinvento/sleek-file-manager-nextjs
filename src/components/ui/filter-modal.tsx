import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Filter, X } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    categories?: string[];
    selectedCategory?: string;
    onCategoryChange?: (category: string) => void;
    priorities?: string[];
    selectedPriority?: string;
    onPriorityChange?: (priority: string) => void;
    vendors?: string[];
    selectedVendor?: string;
    onVendorChange?: (vendor: string) => void;
    priceRange?: { min: number; max: number };
    onPriceRangeChange?: (range: { min: number; max: number }) => void;
    toggles?: Array<{
      id: string;
      label: string;
      value: boolean;
      onChange: (value: boolean) => void;
      isNew?: boolean;
    }>;
  };
  onClear?: () => void;
  onApply?: () => void;
}

export const FilterModal = ({ 
  isOpen, 
  onOpenChange, 
  filters,
  onClear,
  onApply 
}: FilterModalProps) => {
  const handleClear = () => {
    onClear?.();
    filters.onCategoryChange?.('All');
    filters.onPriorityChange?.('All');
    filters.onVendorChange?.('All');
  };

  const handleApply = () => {
    onApply?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-border/50 hover:bg-accent hover:text-accent-foreground"
        >
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto bg-background border-border sm:max-w-lg">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold text-foreground">Filters</DialogTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 p-0 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Category Filter */}
          {filters.categories && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Category</Label>
              <div className="flex flex-wrap gap-2">
                {filters.categories.map(category => (
                  <Button
                    key={category}
                    variant={filters.selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full text-xs ${
                      filters.selectedCategory === category 
                        ? 'bg-slate-600 text-white hover:bg-slate-700' 
                        : 'border-border/50 hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => filters.onCategoryChange?.(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Switches */}
          {filters.toggles && filters.toggles.map(toggle => (
            <div key={toggle.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-foreground">{toggle.label}</Label>
                {toggle.isNew && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    New
                  </span>
                )}
              </div>
              <Switch
                checked={toggle.value}
                onCheckedChange={toggle.onChange}
                className="data-[state=checked]:bg-slate-600"
              />
            </div>
          ))}

          {/* Price Range */}
          {filters.priceRange && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Price Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Minimum</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      placeholder="Min"
                      className="pl-8 border-border/50 focus:border-primary"
                      value={filters.priceRange.min || ''}
                      onChange={(e) => filters.onPriceRangeChange?.({
                        ...filters.priceRange,
                        min: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Maximum</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="pl-8 border-border/50 focus:border-primary"
                      value={filters.priceRange.max || ''}
                      onChange={(e) => filters.onPriceRangeChange?.({
                        ...filters.priceRange,
                        max: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Priority Filter */}
          {filters.priorities && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Priority</Label>
              <Select value={filters.selectedPriority} onValueChange={filters.onPriorityChange}>
                <SelectTrigger className="border-border/50 focus:border-primary">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {filters.priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Vendor Filter */}
          {filters.vendors && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Vendor</Label>
              <Select value={filters.selectedVendor} onValueChange={filters.onVendorChange}>
                <SelectTrigger className="border-border/50 focus:border-primary">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {filters.vendors.map(vendor => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            className="flex-1 border-border/50 hover:bg-accent hover:text-accent-foreground"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button 
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};