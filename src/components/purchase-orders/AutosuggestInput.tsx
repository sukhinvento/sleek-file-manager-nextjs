import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { availableStock } from '../../data/purchaseOrderData';
import { StockItem } from '../../types/purchaseOrder';

interface AutosuggestInputProps {
  onSelect: (item: StockItem) => void;
  placeholder: string;
}

export const AutosuggestInput = ({ onSelect, placeholder }: AutosuggestInputProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StockItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      const filtered = availableStock.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.brand.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (item: StockItem) => {
    setQuery(item.name);
    setShowSuggestions(false);
    onSelect(item);
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
              onClick={() => handleSelect(item)}
            >
              <div className="font-medium text-foreground">{item.name}</div>
              <div className="text-sm text-muted-foreground">{item.brand} - Stock: {item.stock} - ₹{item.unitPrice}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};