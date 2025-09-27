
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const UploadFiles = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleFileUpload = (files: FileList | null) => {
    setUploadError(null);

    if (!selectedCategory || !selectedSubCategory) {
      const error = "Please select both category and subcategory";
      setUploadError(error);
      toast.error(error);
      return;
    }

    if (files && files.length > 0) {
      setSelectedFiles(files);
      console.log("Files selected:", files);
      toast.success(`${files.length} file(s) selected successfully`);
    }
  };

  const handleSubmit = () => {
    setUploadError(null);

    if (!selectedFiles || !selectedCategory || !selectedSubCategory) {
      const error = "Please select files and categories before submitting";
      setUploadError(error);
      toast.error(error);
      return;
    }

    try {
      console.log("Submitting files:", selectedFiles);
      console.log("Category:", selectedCategory);
      console.log("SubCategory:", selectedSubCategory);
      // Handle final upload submission logic here
      toast.success("Files uploaded successfully!");
    } catch (error) {
      const errorMessage = "Failed to upload files. Please try again.";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">

      <div className="max-w-xl space-y-4">
        <div className="flex gap-4">
          <div className="w-48">
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setSelectedSubCategory(""); // Reset subcategory when category changes
              }}
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
              value={selectedSubCategory}
              onValueChange={setSelectedSubCategory}
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

        <div 
          className={`border-2 border-dashed border-enterprise-200 rounded-lg p-12 text-center transition-colors ${
            uploadError ? 'border-red-500 bg-red-50' : 'hover:border-enterprise-400'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${uploadError ? 'text-red-500' : 'text-enterprise-400'}`} />
          <h3 className="text-lg font-semibold text-enterprise-900 mb-2">
            Drag and drop your files here
          </h3>
          <p className="text-enterprise-500 mb-4">
            or click the button below to select files
          </p>
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <div className="space-y-4">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={!selectedCategory || !selectedSubCategory}
            >
              Select Files
            </Button>
            
            {selectedFiles && (
              <div className="space-y-4">
                <p className="text-enterprise-600">
                  {selectedFiles.length} file(s) selected
                </p>
                <Button 
                  variant="default" 
                  onClick={handleSubmit}
                  className="w-full"
                >
                  Submit Upload
                </Button>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="mt-4 text-red-600 text-sm">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
