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
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const container = portalEl ?? document.body;
    const containerRect = container.getBoundingClientRect();
    const top = container === document.body
      ? rect.bottom + window.scrollY
      : rect.bottom - containerRect.top + (container as HTMLElement).scrollTop;
    const left = container === document.body
      ? rect.left + window.scrollX
      : rect.left - containerRect.left + (container as HTMLElement).scrollLeft;
    setDropdownRect({
      top,
      left,
      width: rect.width
    });
  }, [portalEl]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const dialogContent = el.closest('[data-radix-dialog-content]') as HTMLElement | null;
    setPortalEl(dialogContent ?? document.body);
  }, [showSuggestions]);

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
    // Ensure portal container stays within dialog to avoid outside-click interception
    const el = inputRef.current;
    const dialogContent = el?.closest('[data-radix-dialog-content]') as HTMLElement | null;
    setPortalEl(dialogContent ?? document.body);
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
    const container = portalEl;
    if (container) {
      container.addEventListener('scroll', onScroll, true);
    }
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      if (container) {
        container.removeEventListener('scroll', onScroll, true);
      }
    };
  }, [showSuggestions, updatePosition, portalEl]);

  // Portal dropdown (avoids clipping by overflow ancestors)
  const dropdown = showSuggestions && suggestions.length > 0 && typeof document !== 'undefined'
    ? createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: 'absolute', top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
          className="z-[10000] bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto mt-1"
          data-autosuggest-dropdown
        >
          {suggestions.map(item => (
            <div
              key={item.id}
              className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
            >
              <div className="font-medium text-foreground">{item.name}</div>
              <div className="text-sm text-muted-foreground">{item.brand} • Stock: {item.stock} • ₹{item.unitPrice.toFixed(2)}</div>
            </div>
          ))}
        </div>,
        portalEl ?? document.body
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
