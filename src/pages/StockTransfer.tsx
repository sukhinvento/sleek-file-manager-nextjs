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
  CheckCircle, 
  TrendingUp, 
  Truck,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  AlertTriangle,
  User
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { StockTransferFilterModal } from '@/components/stock-transfer/StockTransferFilterModal';
import { StockTransferSortModal } from '@/components/stock-transfer/StockTransferSortModal';
import { ModernStockTransferOverlay } from '@/components/stock-transfer/ModernStockTransferOverlay';
import { StockTransfer as StockTransferType } from '@/types/inventory';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import * as stockTransferService from '@/services/stockTransferService';
import { countActiveFilters } from '@/lib/filterUtils';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border pointer-events-none`}>
      {status}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const getStatusColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor(priority)} text-xs pointer-events-none`}>
      {priority}
    </Badge>
  );
};

export const StockTransfer = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [stockTransfers, setStockTransfers] = useState<StockTransferType[]>([]);
  const [stats, setStats] = useState({
    totalTransfers: 0,
    pendingTransfers: 0,
    inTransitTransfers: 0,
    completedTransfers: 0,
    highPriorityTransfers: 0,
    totalItems: 0,
    averageItems: 0,
    averageCompletionTime: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortConfig, setSortConfig] = useState({ field: 'requestDate', direction: 'desc' as 'asc' | 'desc' });
  
  // Modal states
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<StockTransferType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  
  // Calculate active filter count
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'requestDate' || sortConfig.direction !== 'desc';

  // Load stock transfers from service
  const loadStockTransfers = async () => {
    try {
      setIsLoadingData(true);
      const data = await stockTransferService.fetchStockTransfers();
      setStockTransfers(data);
    } catch (error) {
      console.error('Error loading stock transfers:', error);
      toast({
        title: "Error",
        description: "Failed to load stock transfers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load stats from service
  const loadStats = async () => {
    try {
      const statsData = await stockTransferService.fetchStockTransferStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadStockTransfers();
    loadStats();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'stock-transfer') {
        setIsNewTransferOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(stockTransfers.map(transfer => transfer.status)))];
  const priorities = ['All', ...Array.from(new Set(stockTransfers.map(transfer => transfer.priority)))];
  const allLocations = Array.from(new Set([
    ...stockTransfers.map(transfer => transfer.fromLocation),
    ...stockTransfers.map(transfer => transfer.toLocation)
  ])).sort();

  // Filter logic
  const filteredTransfers = useMemo(() => {
    return stockTransfers.filter(transfer => {
      const matchesSearch = !searchTerm || 
        transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || transfer.status === selectedStatus;
      const matchesPriority = selectedPriority === 'All' || transfer.priority === selectedPriority;
      
      // Comprehensive filter matching
      const matchesTransferId = !selectedFilters.transferId || 
        transfer.transferId.toLowerCase().includes(selectedFilters.transferId.toLowerCase());
      
      const matchesFromLocation = !selectedFilters.fromLocation || 
        transfer.fromLocation.toLowerCase().includes(selectedFilters.fromLocation.toLowerCase());
      
      const matchesToLocation = !selectedFilters.toLocation || 
        transfer.toLocation.toLowerCase().includes(selectedFilters.toLocation.toLowerCase());
      
      const matchesRequestedBy = !selectedFilters.requestedBy || 
        transfer.requestedBy.toLowerCase().includes(selectedFilters.requestedBy.toLowerCase());
      
      const matchesFilterStatus = !selectedFilters.status || 
        selectedFilters.status === 'All' || 
        transfer.status === selectedFilters.status;
      
      const matchesFilterPriority = !selectedFilters.priority || 
        selectedFilters.priority === 'All' || 
        transfer.priority === selectedFilters.priority;
      
      const matchesRequestDateRange = !selectedFilters.requestDateRange?.from || 
        (new Date(transfer.requestDate) >= new Date(selectedFilters.requestDateRange.from) &&
         (!selectedFilters.requestDateRange.to || new Date(transfer.requestDate) <= new Date(selectedFilters.requestDateRange.to)));
      
      const matchesExpectedDateRange = !selectedFilters.expectedDateRange?.from || 
        (new Date(transfer.expectedDate) >= new Date(selectedFilters.expectedDateRange.from) &&
         (!selectedFilters.expectedDateRange.to || new Date(transfer.expectedDate) <= new Date(selectedFilters.expectedDateRange.to)));
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTransferId &&
             matchesFromLocation && matchesToLocation && matchesRequestedBy &&
             matchesFilterStatus && matchesFilterPriority && 
             matchesRequestDateRange && matchesExpectedDateRange;
    });
  }, [stockTransfers, searchTerm, selectedStatus, selectedPriority, selectedFilters]);

  // Sort logic
  const sortedTransfers = useMemo(() => {
    return [...filteredTransfers].sort((a, b) => {
      const field = sortConfig.field as keyof StockTransferType;
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransfers, sortConfig]);

  // Infinite scroll for mobile
  const { displayedItems: mobileDisplayedItems, hasMoreItems, isLoading, loadMoreItems } = useInfiniteScroll({
    data: sortedTransfers,
    itemsPerPage: 10,
    enabled: isMobile
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedTransfers.length / itemsPerPage);
  const currentPageData = isMobile 
    ? mobileDisplayedItems
    : sortedTransfers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, selectedFilters, sortConfig]);

  // Event handlers
  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  const handleViewTransfer = (transfer: StockTransferType) => {
    setEditingTransfer(transfer);
    setIsEditMode(false);
  };

  const handleEditTransfer = (transfer: StockTransferType) => {
    setEditingTransfer(transfer);
    setIsEditMode(true);
  };

  const handleDeleteTransfer = async (transferId: string) => {
    try {
      await stockTransferService.deleteStockTransfer(transferId);
      await loadStockTransfers();
      await loadStats();
      toast({
        title: "Success",
        description: "Stock transfer deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting stock transfer:', error);
      toast({
        title: "Error",
        description: "Failed to delete stock transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTransfer = async (transferData: StockTransferType) => {
    try {
      if (transferData.id && (transferData.id.startsWith('st-') || transferData.id.match(/^\d+$/))) {
        // Update existing transfer
        await stockTransferService.updateStockTransfer(transferData.id, transferData);
        toast({
          title: "Success",
          description: "Stock transfer updated successfully.",
        });
      } else {
        // Create new transfer
        await stockTransferService.createStockTransfer(transferData);
        toast({
          title: "Success",
          description: "Stock transfer created successfully.",
        });
      }
      await loadStockTransfers();
      await loadStats();
      setIsNewTransferOpen(false);
      setEditingTransfer(null);
    } catch (error) {
      console.error('Error saving stock transfer:', error);
      toast({
        title: "Error",
        description: "Failed to save stock transfer. Please try again.",
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
            {/* Total Transfers Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total</p>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalTransfers}</div>
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
                    +7%
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Package className="absolute bottom-0 right-0 h-12 w-12 text-blue-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Pending Transfers Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.pendingTransfers}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center z-10">
                      <Clock className="h-5 w-5 text-amber-600" />
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
                        className="text-amber-200"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        strokeDasharray={`${(stats.pendingTransfers / stats.totalTransfers) * 75.4} 75.4`}
                        className="text-amber-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-amber-700 leading-none">
                        {Math.round((stats.pendingTransfers / stats.totalTransfers) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-amber-800">Waiting</p>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Clock className="absolute bottom-0 right-0 h-12 w-12 text-amber-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* In Transit Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">In Transit</p>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.inTransitTransfers}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center z-10">
                      <Truck className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-purple-200 rounded-full h-1.5">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.inTransitTransfers / stats.totalTransfers) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-purple-700">{Math.round((stats.inTransitTransfers / stats.totalTransfers) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Truck className="absolute bottom-0 right-0 h-12 w-12 text-purple-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Completed Transfers Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950/20 dark:to-lime-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Completed</p>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completedTransfers}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center z-10">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">Success Rate</span>
                    <span className="text-xs font-bold text-green-700">95%</span>
                  </div>
                  <div className="grid grid-cols-6 gap-px">
                    {[8, 6, 9, 7, 8, 9].map((height, i) => (
                      <div 
                        key={i} 
                        className="bg-green-400 rounded-sm h-1"
                        style={{ opacity: height / 10 }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <CheckCircle className="absolute bottom-0 right-0 h-12 w-12 text-green-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Total Items Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Items</p>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {formatIndianQuantity(stats.totalItems)}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center z-10">
                      <Package className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                {/* Value Breakdown */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-600">Transfers: {stats.totalTransfers}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>+14%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <TrendingUp className="absolute bottom-0 right-0 h-12 w-12 text-emerald-500/5 transform translate-x-3 translate-y-3" />
            </Card>
          </div>
        </div>
      </section>

      {/* Filters Section - Sticky */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-4 space-y-3 lg:space-y-0 overflow-hidden sm:mx-0 mt-4 lg:mt-6">
        {/* Desktop Layout - All in one line */}
        <div className="hidden lg:flex lg:items-center lg:gap-4 lg:justify-between">
          {/* Status Filter Pills */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-2 pb-2 w-max min-w-0">
              {statuses.map(status => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap text-sm px-3 py-1 animate-fade-in"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
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
                placeholder="Search transfers, locations..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFilterModalOpen(true)}
              className={hasFilters ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}
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
              className={hasSort ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}
            >
              <ArrowUpDown className="mr-1 h-4 w-4" /> 
              Sort
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-3">
          {/* Status Filter Pills */}
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="flex gap-2 pb-2 w-max min-w-full">
              {statuses.map(status => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap text-xs sm:text-sm px-3 py-1 animate-fade-in"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
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
                placeholder="Search transfers..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className={`px-2 sm:px-3 ${hasFilters ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}`}
              onClick={() => setIsFilterModalOpen(true)}
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
              className={`px-2 sm:px-3 ${hasSort ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}`}
              onClick={() => setIsSortModalOpen(true)}
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
                  <p className="text-sm text-muted-foreground">Loading stock transfers...</p>
                </div>
              </div>
            ) : currentPageData.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-2">
                  <Truck className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No stock transfers found</p>
                </div>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[20%]">Transfer Details</TableHead>
                    <TableHead className="font-semibold w-[18%]">Route</TableHead>
                    <TableHead className="font-semibold w-[20%]">Status & Priority</TableHead>
                    <TableHead className="font-semibold w-[17%]">Request Info</TableHead>
                    <TableHead className="font-semibold w-[20%]">Est. Value</TableHead>
                    <TableHead className="font-semibold w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.map((transfer) => (
                    <TableRow key={transfer.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{transfer.transferId}</div>
                          <div className="text-sm text-muted-foreground">
                            {transfer.items.length} items
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transfer.requestDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            <div className="font-medium">{transfer.fromLocation}</div>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <ArrowRight className="h-3 w-3 mx-1" />
                              <span>{transfer.toLocation}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell>
                         <div className="space-y-1">
                           <div><StatusBadge status={transfer.status} /></div>
                           <div><PriorityBadge priority={transfer.priority} /></div>
                         </div>
                       </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">Requested by:</div>
                          <div className="text-sm">{transfer.requestedBy}</div>
                          {transfer.approvedBy && (
                            <>
                              <div className="text-sm font-medium mt-1">Approved by:</div>
                              <div className="text-sm">{transfer.approvedBy}</div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatIndianCurrency(transfer.items.reduce((sum, item) => sum + (item.quantity * 10), 0))}
                        </div>
                        {transfer.completedDate && (
                          <div className="text-xs text-muted-foreground">
                            Completed: {transfer.completedDate}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewTransfer(transfer)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditTransfer(transfer)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteTransfer(transfer.transferId)}
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
          {mobileDisplayedItems.map((transfer: StockTransferType) => (
              <Card key={transfer.id} className="mb-3 animate-fade-in hover-scale cursor-pointer transition-all duration-200 shadow-lg" onClick={() => handleViewTransfer(transfer)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{transfer.transferId}</h3>
                      <p className="text-sm text-muted-foreground">{transfer.requestDate}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTransfer(transfer);
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
                          handleEditTransfer(transfer);
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
                          handleDeleteTransfer(transfer.transferId);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">From Location</p>
                      <p className="font-medium">{transfer.fromLocation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">To Location</p>
                      <p className="font-medium">{transfer.toLocation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <StatusBadge status={transfer.status} />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <PriorityBadge priority={transfer.priority} />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Requested By</p>
                      <p className="font-medium">{transfer.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Est. Value</p>
                      <p className="font-bold text-green-600">
                        {formatIndianCurrency(transfer.items.reduce((sum, item) => sum + (item.quantity * 10), 0))}
                      </p>
                    </div>
                  </div>
                 </CardContent>
               </Card>
             ))}
         </div>
      </div>

      {/* Filter and Sort Modals */}
      <StockTransferFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        locations={allLocations}
        statuses={statuses}
      />
      
      <StockTransferSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />

      {/* Stock Transfer Modal */}
      <ModernStockTransferOverlay
        transfer={editingTransfer as any}
        isOpen={isNewTransferOpen || !!editingTransfer}
        onClose={() => {
          setIsNewTransferOpen(false);
          setEditingTransfer(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onSave={handleSaveTransfer as any}
        onUpdate={handleSaveTransfer as any}
        onDelete={handleDeleteTransfer as any}
      />
    </div>
  );
};