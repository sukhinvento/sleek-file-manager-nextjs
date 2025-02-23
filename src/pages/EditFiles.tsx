
import { useState } from 'react';
import { History } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";

export const EditFiles = () => {
  const { toast } = useToast();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  
  // Mock data
  const mockAuditTrail = [
    {
      id: 1,
      action: "File Uploaded",
      timestamp: "2024-02-20 14:30",
      details: "Successfully uploaded document.pdf",
      user: "John Doe"
    },
    {
      id: 2,
      action: "Data Error",
      timestamp: "2024-02-20 14:35",
      details: "Invalid data format in row 23",
      user: "Jane Smith"
    },
    {
      id: 3,
      action: "File Modified",
      timestamp: "2024-02-20 14:40",
      details: "Updated metadata for image.png",
      user: "Alice Johnson"
    },
    {
      id: 4,
      action: "Access Granted",
      timestamp: "2024-02-20 14:45",
      details: "Granted access to user Bob Williams",
      user: "System"
    },
    {
      id: 5,
      action: "File Deleted",
      timestamp: "2024-02-20 14:50",
      details: "Permanently deleted old_report.docx",
      user: "Eve Brown"
    },
  ];

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
          <div className="col-span-1 lg:col-span-3">
            <label htmlFor="category" className="block text-sm font-medium text-enterprise-700">Category</label>
            <select id="category" className="mt-1 block w-full rounded-md border-enterprise-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
              <option>All</option>
              <option>Financial</option>
              <option>Operational</option>
              <option>Compliance</option>
            </select>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <label htmlFor="dateRange" className="block text-sm font-medium text-enterprise-700">Date Range</label>
            <input type="date" id="dateRange" className="mt-1 block w-full rounded-md border-enterprise-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
          </div>

          <div className="col-span-2 lg:col-span-6 flex items-end justify-end">
            <button className="bg-primary-600 text-primary-50 rounded-md py-2 px-4 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="border rounded-lg w-full">
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">File ID</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i} onClick={() => setSelectedRow(i)} className={`cursor-pointer ${selectedRow === i ? 'bg-muted hover:bg-muted' : 'hover:bg-accent'}`}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>document_{i + 1}.pdf</TableCell>
                    <TableCell>Financial</TableCell>
                    <TableCell>Processed</TableCell>
                    <TableCell className="text-right">
                      <button onClick={(e) => {
                          e.stopPropagation(); // Prevent row selection when clicking the button
                          setShowAuditTrail(true);
                        }} className="p-2 rounded-md hover:bg-enterprise-100">
                        <History className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <Modal 
          isOpen={showAuditTrail} 
          onClose={() => setShowAuditTrail(false)}
          title="Audit Trail"
        >
          <ScrollArea className="h-[calc(100vh-200px)]">
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
        </Modal>
      </div>
    </div>
  );
};
