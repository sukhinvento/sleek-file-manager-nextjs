import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { vendorsData } from '@/data/inventoryData';
import { Vendor } from '@/types/inventory';

interface VendorAutosuggestInputProps {
  onSelect: (vendor: Vendor) => void;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const VendorAutosuggestInput = ({ onSelect, placeholder, value = '', onChange }: VendorAutosuggestInputProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Vendor[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Update dropdown position when shown
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const updatePosition = () => {
        const rect = inputRef.current!.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };
      
      updatePosition();
      
      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showSuggestions]);

  const handleInputChange = (inputValue: string) => {
    setQuery(inputValue);
    onChange?.(inputValue);
    setSelectedIndex(-1);
    
    if (inputValue.length > 0) {
      const filtered = vendorsData.filter(vendor =>
        vendor.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        vendor.category.toLowerCase().includes(inputValue.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (vendor: Vendor) => {
    setQuery(vendor.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelect(vendor);
    onChange?.(vendor.name);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.length > 0) {
      const filtered = vendorsData.filter(vendor =>
        vendor.name.toLowerCase().includes(query.toLowerCase()) ||
        vendor.category.toLowerCase().includes(query.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    }
    setSelectedIndex(-1);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Simple delay to allow clicks to complete
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full z-50"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="fixed z-[9999] bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto mt-1"
             style={{
               top: `${dropdownPosition.top}px`,
               left: `${dropdownPosition.left}px`,
               width: `${dropdownPosition.width}px`
             }}>
          {suggestions.map((vendor, index) => (
            <div
              key={vendor.id}
              className={`p-3 cursor-pointer border-b border-border last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(vendor);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="font-medium text-foreground">{vendor.name}</div>
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{vendor.category}</span>
                <span>•</span>
                <span>{vendor.contactPerson}</span>
                <span>•</span>
                <span>{vendor.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
