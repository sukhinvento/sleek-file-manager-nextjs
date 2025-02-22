
import { Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const EditFiles = () => {
  const mockFiles = [
    { id: 1, name: "Document.pdf", lastEdited: "2024-02-20" },
    { id: 2, name: "Report.docx", lastEdited: "2024-02-19" },
    { id: 3, name: "Presentation.pptx", lastEdited: "2024-02-18" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-enterprise-900">Edit Files</h1>
        <p className="text-enterprise-500 mt-2">Select a file to edit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockFiles.map((file) => (
          <Card key={file.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {file.name}
              </CardTitle>
              <CardDescription>Last edited: {file.lastEdited}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Edit File
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
