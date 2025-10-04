import { DateRange } from "react-day-picker";

/**
 * Count the number of active filters in a filter object
 */
export const countActiveFilters = (filters: Record<string, any>): number => {
  let count = 0;

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    // Handle string values
    if (typeof value === 'string' && value !== '') {
      count++;
    }
    // Handle DateRange objects
    else if (value && typeof value === 'object' && ('from' in value || 'to' in value)) {
      const dateRange = value as DateRange | { from: string; to: string };
      if (dateRange.from || dateRange.to) {
        count++;
      }
    }
    // Handle range objects (min/max)
    else if (value && typeof value === 'object' && ('min' in value || 'max' in value)) {
      const range = value as { min: string; max: string };
      if (range.min !== '' || range.max !== '') {
        count++;
      }
    }
    // Handle arrays
    else if (Array.isArray(value) && value.length > 0) {
      count++;
    }
  });

  return count;
};

/**
 * Check if any filters are active
 */
export const hasActiveFilters = (filters: Record<string, any>): boolean => {
  return countActiveFilters(filters) > 0;
};
