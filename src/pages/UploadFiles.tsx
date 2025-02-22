
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const UploadFiles = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-enterprise-900">Upload Files</h1>
        <p className="text-enterprise-500 mt-2">Upload your documents and files</p>
      </div>

      <div className="max-w-xl">
        <div className="border-2 border-dashed border-enterprise-200 rounded-lg p-12 text-center">
          <Upload className="w-12 h-12 mx-auto text-enterprise-400 mb-4" />
          <h3 className="text-lg font-semibold text-enterprise-900 mb-2">
            Drag and drop your files here
          </h3>
          <p className="text-enterprise-500 mb-4">
            or click the button below to select files
          </p>
          <Button>
            Select Files
          </Button>
        </div>
      </div>
    </div>
  );
};
