
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Edit, History, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataRow, EditableRow } from "../types";
import { Input } from "@/components/ui/input";

interface DataTableProps {
  processedData: DataRow[];
  visibleColumns: string[];
  selectedRow: number | null;
  setSelectedRow: (id: number | null) => void;
  editingRow: number | null;
  editedData: EditableRow | null;
  handleEdit: (row: DataRow) => void;
  handleSave: () => void;
  handleCellEdit: (field: keyof EditableRow, value: string) => void;
  handleAuditClick: (rowId: number, e: React.MouseEvent) => void;
  renderCellWithValidation: (value: string | number, isValid: boolean, errorMessage: string, expectedFormat: string) => React.ReactNode;
}

export const DataTable = ({
  processedData,
  visibleColumns,
  selectedRow,
  setSelectedRow,
  editingRow,
  editedData,
  handleEdit,
  handleSave,
  handleCellEdit,
  handleAuditClick,
  renderCellWithValidation,
}: DataTableProps) => {
  const renderEditableCell = (row: DataRow, field: keyof EditableRow) => {
    if (editingRow === row.id) {
      return (
        <Input
          value={editedData?.[field] || ''}
          onChange={(e) => handleCellEdit(field, e.target.value)}
          className="h-8 w-full"
        />
      );
    }

    if (field === 'value' || field === 'date') {
      return renderCellWithValidation(
        row[field],
        field === 'value' ? row.isValueValid : row.isDateValid,
        field === 'value' 
          ? "The value must be a numerical amount with currency symbol."
          : "The date must follow YYYY-MM-DD format.",
        field === 'value' ? "$1234.56" : "2024-02-20"
      );
    }

    return row[field];
  };

  return (
    <ScrollArea className="h-[600px] overflow-x-auto">
      <div className="min-w-[1400px]">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('name') && (
                <TableHead className="w-[200px]">Name</TableHead>
              )}
              {visibleColumns.includes('department') && (
                <TableHead className="w-[150px]">Department</TableHead>
              )}
              {visibleColumns.includes('subCategory') && (
                <TableHead className="w-[150px]">Region</TableHead>
              )}
              {visibleColumns.includes('value') && (
                <TableHead className="w-[120px]">Value</TableHead>
              )}
              {visibleColumns.includes('date') && (
                <TableHead className="w-[120px]">Date</TableHead>
              )}
              {visibleColumns.includes('status') && (
                <TableHead className="w-[120px]">Status</TableHead>
              )}
              {visibleColumns.includes('priority') && (
                <TableHead className="w-[120px]">Priority</TableHead>
              )}
              {visibleColumns.includes('assignedTo') && (
                <TableHead className="w-[150px]">Assigned To</TableHead>
              )}
              {visibleColumns.includes('lastModified') && (
                <TableHead className="w-[150px]">Last Modified</TableHead>
              )}
              {visibleColumns.includes('actions') && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.map((row) => (
              <TableRow 
                key={row.id}
                onClick={() => setSelectedRow(row.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedRow === row.id ? 'bg-gray-50' : ''
                } ${(!row.isValueValid || !row.isDateValid) ? 'bg-red-50/50' : ''}`}
              >
                {visibleColumns.includes('name') && (
                  <TableCell>{renderEditableCell(row, 'name')}</TableCell>
                )}
                {visibleColumns.includes('department') && (
                  <TableCell>{renderEditableCell(row, 'department')}</TableCell>
                )}
                {visibleColumns.includes('subCategory') && (
                  <TableCell>{renderEditableCell(row, 'subCategory')}</TableCell>
                )}
                {visibleColumns.includes('value') && (
                  <TableCell>{renderEditableCell(row, 'value')}</TableCell>
                )}
                {visibleColumns.includes('date') && (
                  <TableCell>{renderEditableCell(row, 'date')}</TableCell>
                )}
                {visibleColumns.includes('status') && (
                  <TableCell>{row.status}</TableCell>
                )}
                {visibleColumns.includes('priority') && (
                  <TableCell>{row.priority}</TableCell>
                )}
                {visibleColumns.includes('assignedTo') && (
                  <TableCell>{row.assignedTo}</TableCell>
                )}
                {visibleColumns.includes('lastModified') && (
                  <TableCell>{row.lastModified}</TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell>
                    <div className="flex gap-2">
                      {editingRow === row.id ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSave();
                                }}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Save changes</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(row);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit row</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => handleAuditClick(row.id, e)}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View audit trail</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
};
