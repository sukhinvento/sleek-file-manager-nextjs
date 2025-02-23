import { useState, useEffect } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, AlertTriangle, X, Search, Save, Edit } from 'lucide-react';
import { ColumnSelector } from "@/components/ui/column-selector";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

interface DataRow {
  id: number;
  name: string;
  department: string;
  subCategory: string;
  value: string | number;
  date: string;
  isValueValid: boolean;
  isDateValid: boolean;
}

type EditableRow = {
  [K in keyof Omit<DataRow, 'id' | 'isValueValid' | 'isDateValid'>]: string;
};

type SortField = 'name' | 'department' | 'value' | 'date';
type SortOrder = 'asc' | 'desc';

interface AuditEntry {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export const EditFiles = () => {
  const { toast } = useToast();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<EditableRow | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'department', 'subCategory', 'value', 'date', 'actions']);
  const [tableData, setTableData] = useState<DataRow[]>([
    { id: 1, name: "John Doe", department: "Sales", subCategory: "North", value: "$5000", date: "2024-02-20", isValueValid: true, isDateValid: true },
    { id: 2, name: "Jane Smith", department: "Marketing", subCategory: "Digital", value: "Invalid data", date: "2024-02-19", isValueValid: false, isDateValid: true },
    { id: 3, name: "Mike Johnson", department: "IT", subCategory: "Development", value: "$4200", date: "Invalid date", isValueValid: true, isDateValid: false },
    { id: 4, name: "Sarah Wilson", department: "Sales", subCategory: "South", value: "$6300", date: "2024-02-18", isValueValid: true, isDateValid: true },
    { id: 5, name: "Tom Brown", department: "Marketing", subCategory: "Traditional", value: "$3800", date: "2024-02-17", isValueValid: true, isDateValid: true },
    { id: 6, name: "Emily Davis", department: "IT", subCategory: "Infrastructure", value: "$5500", date: "2024-02-16", isValueValid: true, isDateValid: true },
    { id: 7, name: "Michael Lee", department: "Sales", subCategory: "East", value: "$4700", date: "2024-02-15", isValueValid: true, isDateValid: true },
    { id: 8, name: "Jessica Taylor", department: "Marketing", subCategory: "Social", value: "Invalid data", date: "2024-02-14", isValueValid: false, isDateValid: true },
    { id: 9, name: "David Wilson", department: "IT", subCategory: "Support", value: "$5100", date: "2024-02-13", isValueValid: true, isDateValid: true },
    { id: 10, name: "Lisa Anderson", department: "Sales", subCategory: "West", value: "$4900", date: "2024-02-12", isValueValid: true, isDateValid: true },
    { id: 11, name: "Robert Martin", department: "Marketing", subCategory: "Digital", value: "$5200", date: "2024-02-11", isValueValid: true, isDateValid: true },
    { id: 12, name: "Emma Thompson", department: "IT", subCategory: "Development", value: "$4600", date: "Invalid date", isValueValid: true, isDateValid: false },
    { id: 13, name: "James Wilson", department: "Sales", subCategory: "North", value: "$5800", date: "2024-02-09", isValueValid: true, isDateValid: true },
    { id: 14, name: "Sophie Clark", department: "Marketing", subCategory: "Traditional", value: "$4300", date: "2024-02-08", isValueValid: true, isDateValid: true },
    { id: 15, name: "William Turner", department: "IT", subCategory: "Infrastructure", value: "Invalid data", date: "2024-02-07", isValueValid: false, isDateValid: true },
    { id: 16, name: "Oliver White", department: "Sales", subCategory: "South", value: "$5400", date: "2024-02-06", isValueValid: true, isDateValid: true },
    { id: 17, name: "Grace Harris", department: "Marketing", subCategory: "Social", value: "$4800", date: "2024-02-05", isValueValid: true, isDateValid: true },
    { id: 18, name: "Daniel King", department: "IT", subCategory: "Support", value: "$5600", date: "2024-02-04", isValueValid: true, isDateValid: true },
    { id: 19, name: "Ava Martinez", department: "Sales", subCategory: "East", value: "$4400", date: "Invalid date", isValueValid: true, isDateValid: false },
    { id: 20, name: "Lucas Baker", department: "Marketing", subCategory: "Digital", value: "$5300", date: "2024-02-02", isValueValid: true, isDateValid: true },
    { id: 21, name: "Mia Nelson", department: "IT", subCategory: "Development", value: "$4700", date: "2024-02-01", isValueValid: true, isDateValid: true },
    { id: 22, name: "Ethan Carter", department: "Sales", subCategory: "West", value: "Invalid data", date: "2024-01-31", isValueValid: false, isDateValid: true },
    { id: 23, name: "Isabella Hill", department: "Marketing", subCategory: "Traditional", value: "$5100", date: "2024-01-30", isValueValid: true, isDateValid: true },
    { id: 24, name: "Alexander Ross", department: "IT", subCategory: "Infrastructure", value: "$4900", date: "2024-01-29", isValueValid: true, isDateValid: true },
    { id: 25, name: "Charlotte Wood", department: "Sales", subCategory: "North", value: "$5500", date: "2024-01-28", isValueValid: true, isDateValid: true },
    { id: 26, name: "Benjamin Cox", department: "Marketing", subCategory: "Social", value: "$4600", date: "Invalid date", isValueValid: true, isDateValid: false },
    { id: 27, name: "Sophia Ward", department: "IT", subCategory: "Support", value: "$5200", date: "2024-01-26", isValueValid: true, isDateValid: true },
    { id: 28, name: "Henry Foster", department: "Sales", subCategory: "South", value: "$4800", date: "2024-01-25", isValueValid: true, isDateValid: true },
    { id: 29, name: "Amelia Butler", department: "Marketing", subCategory: "Digital", value: "Invalid data", date: "2024-01-24", isValueValid: false, isDateValid: true },
    { id: 30, name: "Sebastian Gray", department: "IT", subCategory: "Development", value: "$5300", date: "2024-01-23", isValueValid: true, isDateValid: true },
    { id: 31, name: "Victoria Price", department: "Sales", subCategory: "East", value: "$4700", date: "2024-01-22", isValueValid: true, isDateValid: true },
    { id: 32, name: "Jack Morgan", department: "Marketing", subCategory: "Traditional", value: "$5100", date: "2024-01-21", isValueValid: true, isDateValid: true },
    { id: 33, name: "Scarlett Cole", department: "IT", subCategory: "Infrastructure", value: "$4900", date: "Invalid date", isValueValid: true, isDateValid: false },
    { id: 34, name: "Theodore Barnes", department: "Sales", subCategory: "West", value: "$5400", date: "2024-01-19", isValueValid: true, isDateValid: true },
    { id: 35, name: "Chloe Russell", department: "Marketing", subCategory: "Social", value: "Invalid data", date: "2024-01-18", isValueValid: false, isDateValid: true },
    { id: 36, name: "Owen Griffin", department: "IT", subCategory: "Support", value: "$5000", date: "2024-01-17", isValueValid: true, isDateValid: true },
    { id: 37, name: "Zoe Fisher", department: "Sales", subCategory: "North", value: "$4800", date: "2024-01-16", isValueValid: true, isDateValid: true },
    { id: 38, name: "Gabriel Kelly", department: "Marketing", subCategory: "Digital", value: "$5200", date: "2024-01-15", isValueValid: true, isDateValid: true },
    { id: 39, name: "Audrey Hayes", department: "IT", subCategory: "Development", value: "$4600", date: "2024-01-14", isValueValid: true, isDateValid: true },
    { id: 40, name: "Leo Marshall", department: "Sales", subCategory: "South", value: "$5300", date: "Invalid date", isValueValid: true, isDateValid: false },
    { id: 41, name: "Luna Perry", department: "Marketing", subCategory: "Traditional", value: "$4700", date: "2024-01-12", isValueValid: true, isDateValid: true },
    { id: 42, name: "Elijah Long", department: "IT", subCategory: "Infrastructure", value: "Invalid data", date: "2024-01-11", isValueValid: false, isDateValid: true }
  ]);

  const categories = [
    { id: 1, name: "Sales" },
    { id: 2, name: "Marketing" },
    { id: 3, name: "IT" }
  ];

  const subCategories = {
    "Sales": ["North", "South", "East", "West"],
    "Marketing": ["Digital", "Traditional", "Social"],
    "IT": ["Development", "Infrastructure", "Support"]
  };

  const mockAuditTrail = [
    { id: 1, action: "Modified", user: "Admin", timestamp: "2024-02-20 14:30", details: "Changed value from $4800 to $5000" },
    { id: 2, action: "Data Error", user: "System", timestamp: "2024-02-20 13:15", details: "Invalid value format detected" },
    { id: 3, action: "Created", user: "Admin", timestamp: "2024-02-20 10:00", details: "Initial entry" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [selectedAuditRow, setSelectedAuditRow] = useState<number | null>(null);

  useEffect(() => {
  }, []);

  const validateValue = (value: string): boolean => {
    return /^\$\d+(\.\d{2})?$/.test(value);
  };

  const validateDate = (date: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  };

  const handleEdit = (row: DataRow) => {
    setEditingRow(row.id);
    setEditedData({
      name: row.name,
      department: row.department,
      value: String(row.value),
      date: row.date,
      subCategory: row.subCategory,
    });
  };

  const handleSave = () => {
    if (!editedData || editingRow === null) return;

    const isValueValid = validateValue(editedData.value);
    const isDateValid = validateDate(editedData.date);

    if (!isValueValid || !isDateValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: !isValueValid 
          ? "Please enter a valid value (e.g., $1234.56)" 
          : "Please enter a valid date (YYYY-MM-DD)",
      });
      return;
    }

    setTableData(prevData => prevData.map(row => {
      if (row.id === editingRow) {
        return {
          ...row,
          ...editedData,
          isValueValid: validateValue(editedData.value),
          isDateValid: validateDate(editedData.date)
        };
      }
      return row;
    }));

    toast({
      title: "Changes saved successfully",
      description: "The row has been updated with the new values.",
    });
    
    setEditingRow(null);
    setEditedData(null);
  };

  const handleCellEdit = (field: keyof EditableRow, value: string) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  const renderCellWithValidation = (value: string | number, isValid: boolean, errorMessage: string, expectedFormat: string) => {
    if (!isValid) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 text-red-500">
              {value} <AlertTriangle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="right" align="start" className="max-w-[400px]">
              <div className="space-y-2">
                <p className="font-medium">Invalid Data Format</p>
                <div className="text-sm space-y-2">
                  <p className="text-red-500">Current value: {value}</p>
                  <p>Expected format: <span className="text-green-500">{expectedFormat}</span></p>
                  <p className="text-red-400 whitespace-normal break-words">{errorMessage}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return value;
  };

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortData = (data: DataRow[]) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'value') {
        aValue = a.isValueValid ? parseFloat(String(a.value).replace('$', '')) : -1;
        bValue = b.isValueValid ? parseFloat(String(b.value).replace('$', '')) : -1;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterData = (data: DataRow[]) => {
    return data.filter(row => {
      const matchesSearch = searchTerm.toLowerCase() === "" || 
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(row.value).toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.date.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || 
        row.department === selectedCategory;

      const matchesSubCategory = selectedSubCategory === "all" || 
        row.subCategory === selectedSubCategory;

      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  };

  const getSortLabel = () => {
    return `${sortField.charAt(0).toUpperCase() + sortField.slice(1)} ${sortOrder === 'asc' ? '↑' : '↓'}`;
  };

  const paginateData = (data: DataRow[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const processedData = paginateData(sortData(filterData(tableData)));
  const totalPages = Math.ceil(sortData(filterData(tableData)).length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVisibleColumns = () => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      return ['name', 'value', 'actions'];
    }
    return ['name', 'department', 'subCategory', 'value', 'date', 'actions'];
  };

  useEffect(() => {
    const handleResize = () => {
      setVisibleColumns(getVisibleColumns());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAuditClick = (rowId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAuditRow(rowId);
    setShowAuditTrail(true);
  };

  const allColumns = ['name', 'department', 'subCategory', 'value', 'date', 'actions'];

  const handleColumnToggle = (column: string) => {
    if (column === 'name' || column === 'actions') {
      return;
    }
    
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-enterprise-900">Consolidated Data View</h1>
          <p className="text-enterprise-500 mt-2 hidden lg:block">View and analyze combined data from uploaded files</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
          <div className="col-span-1 lg:col-span-2">
            <Select 
              onValueChange={(value) => {
                setSelectedCategory(value);
                setSelectedSubCategory("all");
              }}
              value={selectedCategory}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <Select
              onValueChange={(value) => setSelectedSubCategory(value)}
              disabled={!selectedCategory || selectedCategory === "all"}
              value={selectedSubCategory}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {selectedCategory && selectedCategory !== "all" && 
                  subCategories[selectedCategory as keyof typeof subCategories]?.map((subCategory) => (
                    <SelectItem key={subCategory} value={subCategory}>
                      {subCategory}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="border rounded-lg w-full">
          <div className="px-4 py-3 border-b flex items-center justify-between gap-4">
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
                columns={allColumns}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
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
                        <DropdownMenuItem onClick={() => handleSort('name')}>
                          {sortField === 'name' ? (sortOrder === 'asc' ? '↑ ' : '↓ ') : '  '}Name
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('department')}>
                          {sortField === 'department' ? (sortOrder === 'asc' ? '↑ ' : '↓ ') : '  '}Department
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('value')}>
                          {sortField === 'value' ? (sortOrder === 'asc' ? '↑ ' : '↓ ') : '  '}Value
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('date')}>
                          {sortField === 'date' ? (sortOrder === 'asc' ? '↑ ' : '↓ ') : '  '}Date
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
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

          <ScrollArea className="h-[600px]">
            <div className="min-w-[800px]">
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
          <div className="border-t p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      <Sheet open={showAuditTrail} onOpenChange={setShowAuditTrail}>
        <SheetContent side="right" className="w-full sm:w-[400px]">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                Audit Trail
              </SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-100px)] mt-6">
            <div className="space-y-4 pr-4">
              {mockAuditTrail.map((audit) => (
                <div 
                  key={audit.id}
                  className={`p-4 rounded-lg border shadow-sm ${
                    audit.action === "Data Error" 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-medium ${
                      audit.action === "Data Error" 
                        ? 'text-red-600' 
                        : 'text-enterprise-900'
                    }`}>
                      {audit.action}
                    </span>
                    <span className="text-sm text-enterprise-500">
                      {audit.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-enterprise-600">{audit.details}</p>
                  <p className="text-xs text-enterprise-400 mt-1">By {audit.user}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};
