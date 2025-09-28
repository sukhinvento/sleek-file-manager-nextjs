import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollProps<T> {
  data: T[];
  itemsPerPage: number;
  enabled: boolean;
}

export function useInfiniteScroll<T>({ data, itemsPerPage, enabled }: UseInfiniteScrollProps<T>) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadedCountRef = useRef(0);

  // Reset when data changes
  useEffect(() => {
    if (enabled) {
      const initialItems = data.slice(0, itemsPerPage);
      setDisplayedItems(initialItems);
      loadedCountRef.current = initialItems.length;
      setHasMoreItems(data.length > itemsPerPage);
    } else {
      setDisplayedItems(data);
      loadedCountRef.current = data.length;
      setHasMoreItems(false);
    }
  }, [data, itemsPerPage, enabled]);

  const loadMoreItems = useCallback(() => {
    if (!enabled || !hasMoreItems || isLoading) return;

    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextItems = data.slice(loadedCountRef.current, loadedCountRef.current + itemsPerPage);
      setDisplayedItems(prev => [...prev, ...nextItems]);
      loadedCountRef.current += nextItems.length;
      setHasMoreItems(loadedCountRef.current < data.length);
      setIsLoading(false);
    }, 300);
  }, [data, itemsPerPage, enabled, hasMoreItems, isLoading]);

  // Scroll event handler
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) {
        return;
      }
      loadMoreItems();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreItems, enabled]);

  return {
    displayedItems,
    hasMoreItems,
    isLoading,
    loadMoreItems
  };
}