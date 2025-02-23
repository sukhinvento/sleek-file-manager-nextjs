
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Columns } from "lucide-react";

interface ColumnSelectorProps {
  columns: string[];
  visibleColumns: string[];
  onColumnToggle: (column: string) => void;
}

export function ColumnSelector({
  columns,
  visibleColumns,
  onColumnToggle,
}: ColumnSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 w-fit min-w-24">
          <Columns className="mr-2 h-4 w-4" />
          <span>Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column}
            className="capitalize"
            checked={visibleColumns.includes(column)}
            onCheckedChange={() => onColumnToggle(column)}
          >
            {column === 'subCategory' ? 'Region' : column}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
