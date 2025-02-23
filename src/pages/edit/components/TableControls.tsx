
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnSelector } from "@/components/ui/column-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SortField, SortOrder } from "../types";

interface TableControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  columns: string[];
  visibleColumns: string[];
  onColumnToggle: (column: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onSortOrderChange: () => void;
}

export const TableControls = ({
  searchTerm,
  setSearchTerm,
  columns,
  visibleColumns,
  onColumnToggle,
  sortField,
  sortOrder,
  onSort,
  onSortOrderChange,
}: TableControlsProps) => {
  const getSortLabel = () => {
    return `${sortField.charAt(0).toUpperCase() + sortField.slice(1)} ${sortOrder === 'asc' ? '↑' : '↓'}`;
  };

  return (
    <div className="px-4 py-3 border-b flex items-center justify-between gap-4 bg-white sticky top-0 z-20">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search in table..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 h-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <ColumnSelector
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={onColumnToggle}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 w-fit min-w-24">
                    <span className="text-sm">{getSortLabel()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem onClick={() => onSort('name')}>
                    {sortField === 'name' ? (sortOrder === 'asc' ? '↑ ' : '↓ ') : '  '}Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSort('department')}>
                    {sortField === 'department' ? (sortOrder === 'asc' ? '↑ ' : '↓ ') : '  '}Department
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSort('value')}>
                    {sortField === 'value' ? (sortOrder === 'asc' ? '↑ ' : '↓ ') : '  '}Value
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSort('date')}>
                    {sortField === 'date' ? (sortOrder === 'asc' ? '↑ ' : '↓ ') : '  '}Date
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSortOrderChange}>
                    Order: {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sort by: {sortField} ({sortOrder === 'asc' ? 'ascending' : 'descending'})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
