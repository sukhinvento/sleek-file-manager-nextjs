import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { availableStock } from '../../data/purchaseOrderData';
import { StockItem } from '../../types/purchaseOrder';

interface AutosuggestInputProps {
  onSelect: (item: StockItem) => void;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const AutosuggestInput = ({ onSelect, placeholder, value = '', onChange }: AutosuggestInputProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<StockItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = (inputValue: string) => {
    setQuery(inputValue);
    onChange?.(inputValue);
    
    if (inputValue.length > 0) {
      const filtered = availableStock.filter(item =>
        item.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        item.brand.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (item: StockItem) => {
    setQuery(item.name);
    setShowSuggestions(false);
    onSelect(item);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.length > 0) {
      const filtered = availableStock.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.brand.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!isFocused) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 transition-colors"
              onClick={() => handleSelect(item)}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
            >
              <div className="font-medium text-foreground">{item.name}</div>
              <div className="text-sm text-muted-foreground">
                {item.brand} • Stock: {item.stock} • ₹{item.unitPrice.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};