import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Package, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Tag
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { InventoryFilterModal } from '@/components/inventory/InventoryFilterModal';
import { InventorySortModal } from '@/components/inventory/InventorySortModal';
import { InventoryFormOverlay } from '@/components/inventory/InventoryFormOverlay';
import { InventoryItem } from '@/types/inventory';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { countActiveFilters } from '@/lib/filterUtils';
import * as inventoryService from '@/services/inventoryService';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'out of stock': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border pointer-events-none`}>
      {status}
    </Badge>
  );
};

export const Inventory = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    criticalItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    totalCategories: 0,
    averageValue: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal states
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    sku: '',
    supplier: '',
    manufacturer: '',
    location: '',
    batchNumber: '',
    category: '',
    status: '',
    expiryDateRange: undefined,
    quantityRange: { min: '', max: '' },
    priceRange: { min: '', max: '' }
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });

  // Load inventory items from service
  const loadInventoryItems = async () => {
    try {
      setIsLoadingData(true);
      const data = await inventoryService.fetchInventoryItems();
      setInventoryItems(data);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load stats from service
  const loadStats = async () => {
    try {
      const statsData = await inventoryService.fetchInventoryStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadInventoryItems();
    loadStats();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'inventory') {
        setIsNewItemOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const categories = ['All', ...Array.from(new Set(inventoryItems.map(item => item.category)))];

  const getItemStatus = (item: InventoryItem): string => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock < item.minStock) return 'Critical';
    if (item.currentStock < item.minStock * 1.5) return 'Low';
    return 'Normal';
  };

  const statuses = ['All', 'Normal', 'Low', 'Critical', 'Out of Stock'];

  // Count active filters
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'name' || sortConfig.direction !== 'asc';

  // Filter logic
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const itemStatus = getItemStatus(item);
      const matchesStatus = selectedStatus === 'All' || itemStatus === selectedStatus;
      
      const matchesSKU = !selectedFilters.sku || item.sku.toLowerCase().includes(selectedFilters.sku.toLowerCase());
      const matchesSupplier = !selectedFilters.supplier || item.supplier.toLowerCase().includes(selectedFilters.supplier.toLowerCase());
      const matchesManufacturer = !selectedFilters.manufacturer || item.manufacturer?.toLowerCase().includes(selectedFilters.manufacturer.toLowerCase());
      const matchesLocation = !selectedFilters.location || item.location?.toLowerCase().includes(selectedFilters.location.toLowerCase());
      const matchesBatchNumber = !selectedFilters.batchNumber || item.batchNumber.toLowerCase().includes(selectedFilters.batchNumber.toLowerCase());
      const matchesFilterCategory = !selectedFilters.category || item.category === selectedFilters.category;
      const matchesFilterStatus = !selectedFilters.status || getItemStatus(item) === selectedFilters.status;
      
      const matchesExpiryDateRange = !selectedFilters.expiryDateRange?.from || !selectedFilters.expiryDateRange?.to || !item.expiryDate ||
        (new Date(item.expiryDate) >= new Date(selectedFilters.expiryDateRange.from) &&
         new Date(item.expiryDate) <= new Date(selectedFilters.expiryDateRange.to));
      
      const matchesQuantityRange = (!selectedFilters.quantityRange?.min || item.currentStock >= Number(selectedFilters.quantityRange.min)) &&
        (!selectedFilters.quantityRange?.max || item.currentStock <= Number(selectedFilters.quantityRange.max));
      
      const matchesPriceRange = (!selectedFilters.priceRange?.min || item.unitPrice >= Number(selectedFilters.priceRange.min)) &&
        (!selectedFilters.priceRange?.max || item.unitPrice <= Number(selectedFilters.priceRange.max));
      
      return matchesSearch && matchesCategory && matchesStatus && matchesSKU && matchesSupplier && 
        matchesManufacturer && matchesLocation && matchesBatchNumber && matchesFilterCategory && 
        matchesFilterStatus && matchesExpiryDateRange && matchesQuantityRange && matchesPriceRange;
    });
  }, [inventoryItems, searchTerm, selectedCategory, selectedStatus, selectedFilters]);

  // Infinite scroll for mobile
  const { displayedItems: mobileDisplayedItems, hasMoreItems, isLoading, loadMoreItems } = useInfiniteScroll({
    data: filteredItems,
    itemsPerPage: 10,
    enabled: isMobile
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentPageData = isMobile 
    ? mobileDisplayedItems
    : filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, selectedFilters]);

  // Event handlers
  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  const handleViewItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditMode(false);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditMode(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await inventoryService.deleteInventoryItem(itemId);
      await loadInventoryItems();
      await loadStats();
      toast({
        title: "Success",
        description: "Inventory item deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveItem = async (itemData: InventoryItem) => {
    try {
      if (itemData.id && (itemData.id.startsWith('inv-') || itemData.id.match(/^\d+$/))) {
        // Update existing item
        await inventoryService.updateInventoryItem(itemData.id, itemData);
        toast({
          title: "Success",
          description: "Inventory item updated successfully.",
        });
      } else {
        // Create new item
        await inventoryService.createInventoryItem(itemData);
        toast({
          title: "Success",
          description: "Inventory item created successfully.",
        });
      }
      await loadInventoryItems();
      await loadStats();
      setIsNewItemOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to save inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <section className="bg-card space-y-3 lg:space-y-0 overflow-hidden sm:mx-0">
        <div className="h-scroll py-4">
          <div className="flex flex-nowrap gap-3 sm:gap-4 w-max">
            {/* Total Items Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Items</p>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalItems}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center z-10">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1">
                    <div className="flex items-end gap-px h-4">
                      {[3, 5, 4, 6, 8, 7, 9, 8].map((height, i) => (
                        <div 
                          key={i} 
                          className="bg-blue-400 rounded-sm flex-1 opacity-70"
                          style={{ height: `${height * 2}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +8%
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Package className="absolute bottom-0 right-0 h-12 w-12 text-blue-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Critical Items Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical</p>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.criticalItems}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center z-10">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </div>
                
                {/* Progress Circle */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-8 h-8 transform -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        className="text-red-200"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        strokeDasharray={`${(stats.criticalItems / stats.totalItems) * 75.4} 75.4`}
                        className="text-red-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-red-700 leading-none">
                        {Math.round((stats.criticalItems / stats.totalItems) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-800">Urgent</p>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <AlertTriangle className="absolute bottom-0 right-0 h-12 w-12 text-red-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Low Stock Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Low Stock</p>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.lowStockItems}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center z-10">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-amber-200 rounded-full h-1.5">
                      <div 
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.lowStockItems / stats.totalItems) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-amber-700">{Math.round((stats.lowStockItems / stats.totalItems) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Clock className="absolute bottom-0 right-0 h-12 w-12 text-amber-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Total Value Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Value</p>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {formatIndianCurrency(stats.totalValue)}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center z-10">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                {/* Value Breakdown */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-600">Items: {stats.totalItems}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <DollarSign className="absolute bottom-0 right-0 h-12 w-12 text-emerald-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Out of Stock Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Out of Stock</p>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.outOfStockItems}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-slate-500/10 rounded-full flex items-center justify-center z-10">
                      <Tag className="h-5 w-5 text-slate-600" />
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Critical</span>
                    <span className="text-xs font-bold text-slate-700">{stats.outOfStockItems}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-px">
                    {[2, 1, 3, 0, 1, 2].map((height, i) => (
                      <div 
                        key={i} 
                        className="bg-slate-400 rounded-sm h-1"
                        style={{ opacity: height > 0 ? 0.7 : 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Tag className="absolute bottom-0 right-0 h-12 w-12 text-slate-500/5 transform translate-x-3 translate-y-3" />
            </Card>
          </div>
        </div>
      </section>

      {/* Filters Section - Sticky */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-4 space-y-3 lg:space-y-0 overflow-hidden sm:mx-0 mt-4 lg:mt-6">
        {/* Desktop Layout - All in one line */}
        <div className="hidden lg:flex lg:items-center lg:gap-4 lg:justify-between">
          {/* Category Filter Pills */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-2 pb-2 w-max min-w-0">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap text-sm px-3 py-1 animate-fade-in"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Search and Action Buttons */}
          <div className="flex gap-3 flex-shrink-0 min-w-0">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items, SKU, or supplier..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFilterModalOpen(true)}
              className={hasFilters ? "bg-primary/10 border-primary/20 hover:bg-primary/20" : ""}
            >
              <Filter className="mr-1 h-4 w-4" /> 
              Filters
              {hasFilters && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSortModalOpen(true)}
              className={hasSort ? "bg-primary/10 border-primary/20 hover:bg-primary/20" : ""}
            >
              <ArrowUpDown className="mr-1 h-4 w-4" /> 
              Sort
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-3">
          {/* Category Filter Pills */}
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="flex gap-2 pb-2 w-max min-w-full">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap text-xs sm:text-sm px-3 py-1 animate-fade-in"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Search and Action Buttons */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 sm:px-3"
              onClick={() => setIsFilterModalOpen(true)}
              {...(hasFilters && { className: "px-2 sm:px-3 bg-primary/10 border-primary/20 hover:bg-primary/20" })}
            >
              <Filter className="h-4 w-4 sm:mr-1" /> 
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 sm:px-3"
              onClick={() => setIsSortModalOpen(true)}
              {...(hasSort && { className: "px-2 sm:px-3 bg-primary/10 border-primary/20 hover:bg-primary/20" })}
            >
              <ArrowUpDown className="h-4 w-4 sm:mr-1" /> 
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card className="border-border/50 shadow-sm">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading inventory items...</p>
                </div>
              </div>
            ) : currentPageData.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No inventory items found</p>
                </div>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[22%]">Item Details</TableHead>
                    <TableHead className="font-semibold w-[15%]">Category</TableHead>
                    <TableHead className="font-semibold w-[20%]">Stock Status</TableHead>
                    <TableHead className="font-semibold w-[18%]">Pricing</TableHead>
                    <TableHead className="font-semibold w-[20%]">Location</TableHead>
                    <TableHead className="font-semibold w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={getItemStatus(item)} />
                          <div className="text-sm text-muted-foreground">
                            {item.currentStock} / {item.minStock} min
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatIndianCurrency(item.unitPrice)}</div>
                        <div className="text-sm text-muted-foreground">
                          Total: {formatIndianCurrency(item.currentStock * item.unitPrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.location}</div>
                          <div className="text-sm text-muted-foreground">{item.supplier}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewItem(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditItem(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </Card>

          {/* Desktop Pagination */}
          {!isMobile && !isLoadingData && totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden">
          {mobileDisplayedItems.map((item: InventoryItem) => (
              <Card key={item.id} className="mb-3 animate-fade-in hover-scale cursor-pointer transition-all duration-200 shadow-lg" onClick={() => handleViewItem(item)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewItem(item);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <StatusBadge status={getItemStatus(item)} />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stock Level</p>
                      <p className="font-medium">{item.currentStock} / {item.minStock} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit Price</p>
                      <p className="font-medium">{formatIndianCurrency(item.unitPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{item.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Supplier</p>
                      <p className="font-medium">{item.supplier}</p>
                    </div>
                  </div>
                 </CardContent>
               </Card>
             ))}
         </div>
      </div>

      {/* Filter and Sort Modals */}
      <InventoryFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={(filters) => {
          setSelectedFilters(filters);
          setIsFilterModalOpen(false);
        }}
        categories={categories}
      />
      
      <InventorySortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />

      {/* Inventory Item Modal */}
      <InventoryFormOverlay
        item={editingItem}
        isOpen={isNewItemOpen || !!editingItem}
        onClose={() => {
          setIsNewItemOpen(false);
          setEditingItem(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onSave={handleSaveItem}
        onUpdate={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};