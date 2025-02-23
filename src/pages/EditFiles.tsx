import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableFilters } from './edit/components/TableFilters';
import { TableControls } from './edit/components/TableControls';
import { DataTable } from './edit/components/DataTable';
import { AuditTrail } from './edit/components/AuditTrail';
import { DataRow, EditableRow, SortField, SortOrder } from './edit/types';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [selectedAuditRow, setSelectedAuditRow] = useState<number | null>(null);

  const tableData = [
    { 
      id: 1, 
      name: "John Doe", 
      department: "Sales", 
      subCategory: "North", 
      value: "$5000", 
      date: "2024-02-20",
      status: "Active",
      priority: "High",
      assignedTo: "Team A",
      lastModified: "2024-02-21",
      isValueValid: true, 
      isDateValid: true 
    },
    { id: 2, name: "Jane Smith", department: "Marketing", subCategory: "Digital", value: "Invalid data", date: "2024-02-19", status: "Inactive", priority: "Medium", assignedTo: "Team B", lastModified: "2024-02-20", isValueValid: false, isDateValid: true },
    { id: 3, name: "Mike Johnson", department: "IT", subCategory: "Development", value: "$4200", date: "Invalid date", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-02-19", isValueValid: true, isDateValid: false },
    { id: 4, name: "Sarah Wilson", department: "Sales", subCategory: "South", value: "$6300", date: "2024-02-18", status: "Active", priority: "High", assignedTo: "Team A", lastModified: "2024-02-18", isValueValid: true, isDateValid: true },
    { id: 5, name: "Tom Brown", department: "Marketing", subCategory: "Traditional", value: "$3800", date: "2024-02-17", status: "Inactive", priority: "Medium", assignedTo: "Team B", lastModified: "2024-02-17", isValueValid: true, isDateValid: true },
    { id: 6, name: "Emily Davis", department: "IT", subCategory: "Infrastructure", value: "$5500", date: "2024-02-16", status: "Active", priority: "High", assignedTo: "Team C", lastModified: "2024-02-16", isValueValid: true, isDateValid: true },
    { id: 7, name: "Michael Lee", department: "Sales", subCategory: "East", value: "$4700", date: "2024-02-15", status: "Active", priority: "Low", assignedTo: "Team A", lastModified: "2024-02-15", isValueValid: true, isDateValid: true },
    { id: 8, name: "Jessica Taylor", department: "Marketing", subCategory: "Social", value: "Invalid data", date: "2024-02-14", status: "Inactive", priority: "Medium", assignedTo: "Team B", lastModified: "2024-02-14", isValueValid: false, isDateValid: true },
    { id: 9, name: "David Wilson", department: "IT", subCategory: "Support", value: "$5100", date: "2024-02-13", status: "Active", priority: "High", assignedTo: "Team C", lastModified: "2024-02-13", isValueValid: true, isDateValid: true },
    { id: 10, name: "Lisa Anderson", department: "Sales", subCategory: "West", value: "$4900", date: "2024-02-12", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-02-12", isValueValid: true, isDateValid: true },
    { id: 11, name: "Robert Martin", department: "Marketing", subCategory: "Digital", value: "$5200", date: "2024-02-11", status: "Inactive", priority: "Low", assignedTo: "Team B", lastModified: "2024-02-11", isValueValid: true, isDateValid: true },
    { id: 12, name: "Emma Thompson", department: "IT", subCategory: "Development", value: "$4600", date: "Invalid date", status: "Active", priority: "High", assignedTo: "Team C", lastModified: "2024-02-10", isValueValid: true, isDateValid: false },
    { id: 13, name: "James Wilson", department: "Sales", subCategory: "North", value: "$5800", date: "2024-02-09", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-02-09", isValueValid: true, isDateValid: true },
    { id: 14, name: "Sophie Clark", department: "Marketing", subCategory: "Traditional", value: "$4300", date: "2024-02-08", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-02-08", isValueValid: true, isDateValid: true },
    { id: 15, name: "William Turner", department: "IT", subCategory: "Infrastructure", value: "Invalid data", date: "2024-02-07", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-02-07", isValueValid: false, isDateValid: true },
    { id: 16, name: "Oliver White", department: "Sales", subCategory: "South", value: "$5400", date: "2024-02-06", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-02-06", isValueValid: true, isDateValid: true },
    { id: 17, name: "Grace Harris", department: "Marketing", subCategory: "Social", value: "$4800", date: "2024-02-05", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-02-05", isValueValid: true, isDateValid: true },
    { id: 18, name: "Daniel King", department: "IT", subCategory: "Support", value: "$5600", date: "2024-02-04", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-02-04", isValueValid: true, isDateValid: true },
    { id: 19, name: "Ava Martinez", department: "Sales", subCategory: "East", value: "$4400", date: "Invalid date", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-02-03", isValueValid: true, isDateValid: false },
    { id: 20, name: "Lucas Baker", department: "Marketing", subCategory: "Digital", value: "$5300", date: "2024-02-02", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-02-02", isValueValid: true, isDateValid: true },
    { id: 21, name: "Mia Nelson", department: "IT", subCategory: "Development", value: "$4700", date: "2024-02-01", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-02-01", isValueValid: true, isDateValid: true },
    { id: 22, name: "Ethan Carter", department: "Sales", subCategory: "West", value: "Invalid data", date: "2024-01-31", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-01-31", isValueValid: false, isDateValid: true },
    { id: 23, name: "Isabella Hill", department: "Marketing", subCategory: "Traditional", value: "$5100", date: "2024-01-30", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-01-30", isValueValid: true, isDateValid: true },
    { id: 24, name: "Alexander Ross", department: "IT", subCategory: "Infrastructure", value: "$4900", date: "2024-01-29", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-01-29", isValueValid: true, isDateValid: true },
    { id: 25, name: "Charlotte Wood", department: "Sales", subCategory: "North", value: "$5500", date: "2024-01-28", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-01-28", isValueValid: true, isDateValid: true },
    { id: 26, name: "Benjamin Cox", department: "Marketing", subCategory: "Social", value: "$4600", date: "Invalid date", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-01-27", isValueValid: true, isDateValid: false },
    { id: 27, name: "Sophia Ward", department: "IT", subCategory: "Support", value: "$5200", date: "2024-01-26", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-01-26", isValueValid: true, isDateValid: true },
    { id: 28, name: "Henry Foster", department: "Sales", subCategory: "South", value: "$4800", date: "2024-01-25", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-01-25", isValueValid: true, isDateValid: true },
    { id: 29, name: "Amelia Butler", department: "Marketing", subCategory: "Digital", value: "Invalid data", date: "2024-01-24", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-01-24", isValueValid: false, isDateValid: true },
    { id: 30, name: "Sebastian Gray", department: "IT", subCategory: "Development", value: "$5300", date: "2024-01-23", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-01-23", isValueValid: true, isDateValid: true },
    { id: 31, name: "Victoria Price", department: "Sales", subCategory: "East", value: "$4700", date: "2024-01-22", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-01-22", isValueValid: true, isDateValid: true },
    { id: 32, name: "Jack Morgan", department: "Marketing", subCategory: "Traditional", value: "$5100", date: "2024-01-21", status: "Inactive", priority: "Low", assignedTo: "Team B", lastModified: "2024-01-21", isValueValid: true, isDateValid: true },
    { id: 33, name: "Scarlett Cole", department: "IT", subCategory: "Infrastructure", value: "Invalid date", date: "2024-01-20", status: "Active", priority: "Medium", assignedTo: "Team C", lastModified: "2024-01-20", isValueValid: true, isDateValid: false },
    { id: 34, name: "Theodore Barnes", department: "Sales", subCategory: "West", value: "$5400", date: "2024-01-19", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-01-19", isValueValid: true, isDateValid: true },
    { id: 35, name: "Chloe Russell", department: "Marketing", subCategory: "Social", value: "Invalid data", date: "2024-01-18", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-01-18", isValueValid: false, isDateValid: true },
    { id: 36, name: "Owen Griffin", department: "IT", subCategory: "Support", value: "$5000", date: "2024-01-17", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-01-17", isValueValid: true, isDateValid: true },
    { id: 37, name: "Zoe Fisher", department: "Sales", subCategory: "North", value: "$4800", date: "2024-01-16", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-01-16", isValueValid: true, isDateValid: true },
    { id: 38, name: "Gabriel Kelly", department: "Marketing", subCategory: "Digital", value: "$5200", date: "2024-01-15", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-01-15", isValueValid: true, isDateValid: true },
    { id: 39, name: "Audrey Hayes", department: "IT", subCategory: "Development", value: "$4600", date: "2024-01-14", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-01-14", isValueValid: true, isDateValid: true },
    { id: 40, name: "Leo Marshall", department: "Sales", subCategory: "South", value: "$5300", date: "Invalid date", status: "Active", priority: "Medium", assignedTo: "Team A", lastModified: "2024-01-13", isValueValid: true, isDateValid: false },
    { id: 41, name: "Luna Perry", department: "Marketing", subCategory: "Traditional", value: "$4700", date: "2024-01-12", status: "Inactive", priority: "High", assignedTo: "Team B", lastModified: "2024-01-12", isValueValid: true, isDateValid: true },
    { id: 42, name: "Elijah Long", department: "IT", subCategory: "Infrastructure", value: "Invalid data", date: "2024-01-11", status: "Active", priority: "Low", assignedTo: "Team C", lastModified: "2024-01-11", isValueValid: false, isDateValid: true }
  ];

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

  const itemsPerPage = 20;
  const allColumns = [
    'name',
    'department',
    'subCategory',
    'value',
    'date',
    'status',
    'priority',
    'assignedTo',
    'lastModified',
    'actions'
  ];

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
      status: row.status,
      priority: row.priority,
      assignedTo: row.assignedTo,
      lastModified: row.lastModified,
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

  const paginateData = (data: DataRow[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAuditClick = (rowId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAuditRow(rowId);
    setShowAuditTrail(true);
  };

  const processedData = paginateData(sortData(filterData(tableData)));
  const totalPages = Math.ceil(sortData(filterData(tableData)).length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-enterprise-900">Consolidated Data View</h1>
          <p className="text-enterprise-500 mt-2 hidden lg:block">View and analyze combined data from uploaded files</p>
        </div>
      </div>

      <TableFilters
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        categories={categories}
        subCategories={subCategories}
      />

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="border rounded-lg w-full">
          <TableControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          />

          <DataTable
            processedData={processedData}
            visibleColumns={visibleColumns}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
            editingRow={editingRow}
            editedData={editedData}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCellEdit={handleCellEdit}
            handleAuditClick={handleAuditClick}
            renderCellWithValidation={renderCellWithValidation}
          />

          <div className="border-t p-4 bg-white sticky bottom-0 z-10">
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

      <AuditTrail
        showAuditTrail={showAuditTrail}
        setShowAuditTrail={setShowAuditTrail}
        auditTrail={mockAuditTrail}
      />
    </div>
  );
};
