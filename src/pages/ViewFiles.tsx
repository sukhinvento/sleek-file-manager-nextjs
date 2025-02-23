
import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const ViewFiles = () => {
  const [mockFiles, setMockFiles] = useState([
    { id: 1, name: "Document.pdf", type: "PDF", size: "2.5 MB", date: "2024-02-20" },
    { id: 2, name: "Image.jpg", type: "Image", size: "1.8 MB", date: "2024-02-19" },
    { id: 3, name: "Spreadsheet.xlsx", type: "Excel", size: "3.2 MB", date: "2024-02-18" },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-enterprise-900">View Files</h1>
        <p className="text-enterprise-500 mt-2">Browse and manage your files</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {file.name}
                </TableCell>
                <TableCell>{file.type}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
