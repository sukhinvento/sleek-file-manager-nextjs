
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
    if (!selectedCategory || !selectedSubCategory) {
      console.error("Please select both category and subcategory");
      return;
    }

    if (files && files.length > 0) {
      console.log("Uploading files:", files);
      console.log("Category:", selectedCategory);
      console.log("SubCategory:", selectedSubCategory);
      // Handle file upload logic here
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-enterprise-900">Upload Files</h1>
        <p className="text-enterprise-500 mt-2">Upload your documents and files</p>
      </div>

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

        <div className="border-2 border-dashed border-enterprise-200 rounded-lg p-12 text-center">
          <Upload className="w-12 h-12 mx-auto text-enterprise-400 mb-4" />
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
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={!selectedCategory || !selectedSubCategory}
          >
            Select Files
          </Button>
        </div>
      </div>
    </div>
  );
};
