
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TableFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (value: string) => void;
  categories: { id: number; name: string; }[];
  subCategories: { [key: string]: string[]; };
}

export const TableFilters = ({
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  categories,
  subCategories,
}: TableFiltersProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
      <div className="col-span-1 lg:col-span-2">
        <Select 
          onValueChange={(value) => {
            setSelectedCategory(value);
            setSelectedSubCategory("all");
          }}
          value={selectedCategory}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1 lg:col-span-2">
        <Select
          onValueChange={(value) => setSelectedSubCategory(value)}
          disabled={!selectedCategory || selectedCategory === "all"}
          value={selectedSubCategory}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {selectedCategory && selectedCategory !== "all" && 
              subCategories[selectedCategory as keyof typeof subCategories]?.map((subCategory) => (
                <SelectItem key={subCategory} value={subCategory}>
                  {subCategory}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
