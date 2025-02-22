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
import { History, AlertTriangle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataRow {
  id: number;
  name: string;
  department: string;
  value: string | number;
  date: string;
  isValueValid: boolean;
  isDateValid: boolean;
}

export const EditFiles = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const mockTableData: DataRow[] = [
    { 
      id: 1, 
      name: "John Doe", 
      department: "Sales", 
      value: "$5000", // Valid
      date: "2024-02-20",
      isValueValid: true,
      isDateValid: true 
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      department: "Marketing", 
      value: "Invalid data", // Invalid: should be a number
      date: "2024-02-19",
      isValueValid: false,
      isDateValid: true
    },
    { 
      id: 3, 
      name: "Mike Johnson", 
      department: "IT", 
      value: "$4200", // Valid
      date: "Invalid data", // Invalid: wrong date format
      isValueValid: true,
      isDateValid: false
    },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-enterprise-900">Consolidated Data View</h1>
          <p className="text-enterprise-500 mt-2">View and analyze combined data from uploaded files</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger>
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

        <div className="w-48">
          <Select
            onValueChange={(value) => setSelectedSubCategory(value)}
            disabled={!selectedCategory}
          >
            <SelectTrigger>
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

      <div className="flex gap-6">
        <div className={`border rounded-lg ${isAdmin ? 'w-2/3' : 'w-full'}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTableData.map((row) => (
                <TableRow 
                  key={row.id}
                  onClick={() => setSelectedRow(row.id)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedRow === row.id ? 'bg-gray-50' : ''
                  } ${(!row.isValueValid || !row.isDateValid) ? 'bg-red-50/50' : ''}`}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>
                    {renderCellWithValidation(
                      row.value, 
                      row.isValueValid, 
                      "The value must be a numerical amount with currency symbol.",
                      "$1234.56"
                    )}
                  </TableCell>
                  <TableCell>
                    {renderCellWithValidation(
                      row.date, 
                      row.isDateValid, 
                      "The date must follow YYYY-MM-DD format.",
                      "2024-02-20"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {isAdmin && selectedRow && (
          <div className="w-1/3 border rounded-lg bg-gray-50">
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
