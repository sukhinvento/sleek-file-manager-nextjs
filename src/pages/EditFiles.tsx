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
import { History } from 'lucide-react';

export const EditFiles = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Mock data - Replace with actual data from your backend
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

  const mockTableData = [
    { id: 1, name: "John Doe", department: "Sales", value: "$5000", date: "2024-02-20" },
    { id: 2, name: "Jane Smith", department: "Marketing", value: "$3500", date: "2024-02-19" },
    { id: 3, name: "Mike Johnson", department: "IT", value: "$4200", date: "2024-02-18" },
  ];

  const mockAuditTrail = [
    { id: 1, action: "Modified", user: "Admin", timestamp: "2024-02-20 14:30", details: "Changed value from $4800 to $5000" },
    { id: 2, action: "Viewed", user: "User123", timestamp: "2024-02-20 13:15", details: "Accessed record" },
    { id: 3, action: "Created", user: "Admin", timestamp: "2024-02-20 10:00", details: "Initial entry" },
  ];

  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    setIsAdmin(userType === 'admin');
  }, []);

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
        {/* Main Table Section */}
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
                  }`}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Audit Trail Section for Admin */}
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
                    className="bg-white p-4 rounded-lg border shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-enterprise-900">
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
