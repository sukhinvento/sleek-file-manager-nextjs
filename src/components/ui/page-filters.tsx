import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterOption {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

interface PageFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions: FilterOption[];
  onAdvancedFiltersClick?: () => void;
  showAdvancedFilters?: boolean;
}

export const PageFilters = ({ 
  searchValue, 
  onSearchChange, 
  searchPlaceholder = "Search...",
  filterOptions,
  onAdvancedFiltersClick,
  showAdvancedFilters = true
}: PageFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map(option => (
          <Button
            key={option.id}
            variant={option.isActive ? 'default' : 'outline'}
            className={`rounded-full whitespace-nowrap ${
              option.isActive ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={option.onClick}
          >
            {option.label}
          </Button>
        ))}
      </div>
      
      {/* Search and Advanced Filters */}
      <div className="flex gap-3 flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {showAdvancedFilters && (
          <Button variant="outline" onClick={onAdvancedFiltersClick}>
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        )}
      </div>
    </div>
  );
};