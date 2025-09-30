import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownRect({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    });
  }, []);

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
      // Defer position update until after DOM paints input change
      requestAnimationFrame(updatePosition);
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
    updatePosition();
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

  // Reposition on window resize & scroll while open
  useEffect(() => {
    if (!showSuggestions) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('scroll', onScroll, true); // capture to catch inner scroll containers
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [showSuggestions, updatePosition]);

  // Portal dropdown (avoids clipping by overflow ancestors)
  const dropdown = showSuggestions && suggestions.length > 0 && typeof document !== 'undefined'
    ? createPortal(
        <div
          style={{ position: 'absolute', top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
          className="z-[10000] bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto mt-1"
          data-autosuggest-dropdown
        >
          {suggestions.map(item => (
            <div
              key={item.id}
              className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 transition-colors"
              onClick={() => handleSelect(item)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="font-medium text-foreground">{item.name}</div>
              <div className="text-sm text-muted-foreground">{item.brand} • Stock: {item.stock} • ₹{item.unitPrice.toFixed(2)}</div>
            </div>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative" data-autosuggest-root>
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full"
      />
      {/* Portal-rendered dropdown */}
      {dropdown}
    </div>
  );
};
