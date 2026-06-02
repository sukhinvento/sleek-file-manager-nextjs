import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, User } from 'lucide-react';
import { EntityOption } from '@/types/shared';

interface EntityAutosuggestProps {
  entities: EntityOption[];
  value: EntityOption | null;
  onSelect: (entity: EntityOption | null) => void;
  placeholder?: string;
  searchFields?: (keyof EntityOption)[];
  disabled?: boolean;
  error?: string;
  label?: string;
}

export default function EntityAutosuggest({
  entities,
  value,
  onSelect,
  placeholder = 'Search...',
  searchFields = ['name', 'phone', 'email'],
  disabled = false,
  error,
  label,
}: EntityAutosuggestProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return entities.slice(0, 50);
    const q = query.toLowerCase();
    return entities.filter((e) =>
      searchFields.some((field) => {
        const val = e[field];
        return val && String(val).toLowerCase().includes(q);
      })
    ).slice(0, 50);
  }, [entities, query, searchFields]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-entity-item]');
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightIndex >= 0 && filtered[highlightIndex]) {
            onSelect(filtered[highlightIndex]);
            setQuery('');
            setIsOpen(false);
            setHighlightIndex(-1);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightIndex(-1);
          break;
      }
    },
    [isOpen, filtered, highlightIndex, onSelect]
  );

  const handleSelect = (entity: EntityOption) => {
    onSelect(entity);
    setQuery('');
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    inputRef.current?.focus();
  };

  if (value) {
    return (
      <div ref={containerRef}>
        {label && <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(215,28%,14%)' }}>{label}</label>}
        <div className={`flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30 ${error ? 'border-red-500' : ''}`}>
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{value.name}</p>
            {(value.phone || value.email) && (
              <p className="text-xs text-muted-foreground truncate">
                {[value.phone, value.email].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 rounded-full p-1 hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(215,28%,14%)' }}>{label}</label>}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-9 ${error ? 'border-red-500' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-[9999] w-full mt-1 bg-white rounded-lg border shadow-lg max-h-[240px] overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            filtered.map((entity, index) => (
              <div
                key={entity.id}
                data-entity-item
                onClick={() => handleSelect(entity)}
                onMouseEnter={() => setHighlightIndex(index)}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                  index === highlightIndex ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entity.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[entity.phone, entity.email, entity.category].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
