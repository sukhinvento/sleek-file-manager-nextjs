
import { useState } from 'react';
import { FileText, Download, History } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { ColumnSelector } from "@/components/ui/column-selector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const ViewFiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name',
    'type',
    'size',
    'date',
    'actions'
  ]);

  const [mockFiles] = useState([
    { id: 1, name: "Document.pdf", type: "PDF", size: "2.5 MB", date: "2024-02-20" },
    { id: 2, name: "Image.jpg", type: "Image", size: "1.8 MB", date: "2024-02-19" },
    { id: 3, name: "Spreadsheet.xlsx", type: "Excel", size: "3.2 MB", date: "2024-02-18" },
    { id: 4, name: "Report_Q4.pdf", type: "PDF", size: "4.1 MB", date: "2024-02-17" },
    { id: 5, name: "Presentation.pptx", type: "PowerPoint", size: "5.5 MB", date: "2024-02-16" },
    { id: 6, name: "Data_Analysis.csv", type: "CSV", size: "1.2 MB", date: "2024-02-15" },
    { id: 7, name: "Screenshot.png", type: "Image", size: "0.8 MB", date: "2024-02-14" },
    { id: 8, name: "Contract.docx", type: "Word", size: "1.6 MB", date: "2024-02-13" },
    { id: 9, name: "Budget.xlsx", type: "Excel", size: "2.9 MB", date: "2024-02-12" },
    { id: 10, name: "Meeting_Notes.pdf", type: "PDF", size: "1.4 MB", date: "2024-02-11" },
  ]);

  const allColumns = ['name', 'type', 'size', 'date', 'actions'];

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

  const filteredFiles = mockFiles.filter(file =>
    searchTerm === "" ||
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const handleAuditClick = (fileId: number) => {
    console.log(`View audit trail for file ${fileId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-enterprise-900">View Files</h1>
        <p className="text-enterprise-500 mt-2">Browse and manage your files</p>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="px-4 py-3 border-b flex items-center justify-between gap-4 bg-white sticky top-0 z-20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-10 w-full rounded-md border border-input bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <ColumnSelector
              columns={allColumns}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
            />
          </div>
        </div>

        <div className="relative overflow-auto border-0">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.includes('name') && (
                  <TableHead className="w-[300px] sticky left-0 bg-white">Name</TableHead>
                )}
                {visibleColumns.includes('type') && (
                  <TableHead className="w-[150px]">Type</TableHead>
                )}
                {visibleColumns.includes('size') && (
                  <TableHead className="w-[150px]">Size</TableHead>
                )}
                {visibleColumns.includes('date') && (
                  <TableHead className="w-[200px]">Date</TableHead>
                )}
                {visibleColumns.includes('actions') && (
                  <TableHead className="w-[100px] sticky right-0 bg-white text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFiles.map((file) => (
                <TableRow key={file.id} className="hover:bg-muted/50">
                  {visibleColumns.includes('name') && (
                    <TableCell className="sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {file.name}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('type') && (
                    <TableCell>{file.type}</TableCell>
                  )}
                  {visibleColumns.includes('size') && (
                    <TableCell>{file.size}</TableCell>
                  )}
                  {visibleColumns.includes('date') && (
                    <TableCell>{file.date}</TableCell>
                  )}
                  {visibleColumns.includes('actions') && (
                    <TableCell className="text-right sticky right-0 bg-white">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" className="rounded-md">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download file</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-md"
                                onClick={() => handleAuditClick(file.id)}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View audit trail</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border-t px-4 py-2 bg-white">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};
