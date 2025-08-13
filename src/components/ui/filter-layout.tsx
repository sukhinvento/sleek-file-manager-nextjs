import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterModal } from "@/components/ui/filter-modal";

interface FilterItem {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

interface FilterGroup {
  id: string;
  label: string;
  items: FilterItem[];
}

interface FilterLayoutProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterGroups: FilterGroup[];
  filterModalConfig?: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    filters: any;
    onClear?: () => void;
    onApply?: () => void;
  };
  resultsCount: number;
  totalCount: number;
  itemLabel: string;
  onClearAll?: () => void;
}

export const FilterLayout = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterGroups,
  filterModalConfig,
  resultsCount,
  totalCount,
  itemLabel,
  onClearAll
}: FilterLayoutProps) => {
  return (
    <div className="space-y-4">
      {/* Primary Filter Row - Fixed horizontal scroll containment */}
      <div className="w-full overflow-hidden">
        <div className="flex items-center gap-4">
          {/* More Filters Button */}
          {filterModalConfig && (
            <div className="flex-shrink-0">
              <FilterModal 
                isOpen={filterModalConfig.isOpen} 
                onOpenChange={filterModalConfig.onOpenChange}
                filters={filterModalConfig.filters}
                onClear={filterModalConfig.onClear}
                onApply={filterModalConfig.onApply}
              />
            </div>
          )}

          {/* Quick Filter Groups - Properly contained scrollable area */}
          <div className="flex-1 max-w-0 overflow-hidden">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-1">
              {filterGroups.map((group) => (
                <div key={group.id} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {group.label}:
                  </span>
                  <div className="flex gap-1">
                    {group.items.map((item) => (
                      <Button
                        key={item.id}
                        variant={item.isActive ? 'default' : 'outline'}
                        size="sm"
                        className={`rounded-full h-8 px-3 text-xs whitespace-nowrap ${
                          item.isActive 
                            ? 'bg-slate-600 text-white hover:bg-slate-700' 
                            : 'border-border/50 hover:bg-accent hover:text-accent-foreground'
                        }`}
                        onClick={item.onClick}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-shrink-0 w-80 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-10 h-10 border-border/50 focus:border-primary"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Summary Row */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {resultsCount} of {totalCount} {itemLabel}
        </p>
        {onClearAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="border-border/50 hover:bg-accent hover:text-accent-foreground"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
};