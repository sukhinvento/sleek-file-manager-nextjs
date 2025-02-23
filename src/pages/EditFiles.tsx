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
import { History, AlertTriangle, ArrowUpDown, Search, SortAsc, Save } from 'lucide-react';
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

interface DataRow {
  id: number;
  name: string;
  department: string;
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

export const EditFiles = () => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<EditableRow | null>(null);
  const [tableData, setTableData] = useState<DataRow[]>([
    { 
      id: 1, 
      name: "John Doe", 
      department: "Sales", 
      value: "$5000",
      date: "2024-02-20",
      isValueValid: true,
      isDateValid: true 
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      department: "Marketing", 
      value: "Invalid data",
      date: "2024-02-19",
      isValueValid: false,
      isDateValid: true
    },
    { 
      id: 3, 
      name: "Mike Johnson", 
      department: "IT", 
      value: "$4200",
      date: "Invalid data",
      isValueValid: true,
      isDateValid: false
    },
  ]);

  const categories = [
    { id: 1, name: "Finance" },
    { id: 2, name: "Operations" },
    { id: 3, name: "HR" }
  ];

  const subCategories = {
    "Finance": ["Budget", "Revenue", "Expenses"],
    "Operations": ["Logistics", "Supply Chain", "Production"],
    "HR": ["Recruitment", "Training", "Performance"]
  };

  const mockAuditTrail = [
    { id: 1, action: "Modified", user: "Admin", timestamp: "2024-02-20 14:30", details: "Changed value from $4800 to $5000" },
    { id: 2, action: "Data Error", user: "System", timestamp: "2024-02-20 13:15", details: "Invalid value format detected" },
    { id: 3, action: "Created", user: "Admin", timestamp: "2024-02-20 10:00", details: "Initial entry" },
  ];

  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    setIsAdmin(userType === 'admin');
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
            <TooltipContent className="max-w-xs p-3">
              <div className="space-y-2">
                <p className="font-medium">Invalid Data Format</p>
                <div className="text-sm space-y-1">
                  <p>Current value: <span className="text-red-500">{value}</span></p>
                  <p>Expected format: <span className="text-green-500">{expectedFormat}</span></p>
                  <p className="text-red-400">{errorMessage}</p>
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
      const searchLower = searchTerm.toLowerCase();
      return (
        row.name.toLowerCase().includes(searchLower) ||
        row.department.toLowerCase().includes(searchLower) ||
        String(row.value).toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.date.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const getSortLabel = () => {
    return `${sortField.charAt(0).toUpperCase() + sortField.slice(1)} ${sortOrder === 'asc' ? '↑' : '↓'}`;
  };

  const processedData = sortData(filterData(tableData));

  const getVisibleColumns = () => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      return ['name', 'value', 'actions'];
    }
    return ['name', 'department', 'value', 'date', 'actions'];
  };

  const [visibleColumns, setVisibleColumns] = useState(getVisibleColumns());

  useEffect(() => {
    const handleResize = () => {
      setVisibleColumns(getVisibleColumns());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            <Select onValueChange={(value) => setSelectedCategory(value)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
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
              disabled={!selectedCategory}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Sub-Category" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory && 
                  subCategories[selectedCategory as keyof typeof subCategories].map((subCategory) => (
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
        <div className={`border rounded-lg ${isAdmin ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-10"
              />
            </div>
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
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.includes('name') && (
                  <TableHead className="w-1/3">Name</TableHead>
                )}
                {visibleColumns.includes('department') && (
                  <TableHead className="w-1/4">Department</TableHead>
                )}
                {visibleColumns.includes('value') && (
                  <TableHead className="w-1/3">Value</TableHead>
                )}
                {visibleColumns.includes('date') && (
                  <TableHead>Date</TableHead>
                )}
                {visibleColumns.includes('actions') && (
                  <TableHead className="w-1/3">Actions</TableHead>
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
                  {visibleColumns.includes('value') && (
                    <TableCell>{renderEditableCell(row, 'value')}</TableCell>
                  )}
                  {visibleColumns.includes('date') && (
                    <TableCell>{renderEditableCell(row, 'date')}</TableCell>
                  )}
                  {visibleColumns.includes('actions') && (
                    <TableCell>
                      {editingRow === row.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave();
                          }}
                          className="h-8 w-full"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                          }}
                          className="h-8 w-full"
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {isAdmin && selectedRow && (
          <div className="w-full lg:w-1/3 border rounded-lg bg-gray-50">
            <div className="p-4 border-b bg-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-enterprise-500" />
                <h3 className="font-semibold text-enterprise-900">Audit Trail</h3>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-300px)] p-4">
              <div className="space-y-4">
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
                    <p className="text-sm text-enterprise-700 mb-1">
                      {audit.details}
                    </p>
                    <p className="text-xs text-enterprise-500">
                      By: {audit.user}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};
