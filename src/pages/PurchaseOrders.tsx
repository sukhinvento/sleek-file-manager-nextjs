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
  DollarSign,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { ModernPOOverlay } from '@/components/purchase-orders/ModernPOOverlay';
import { PurchaseOrderFilterModal } from '@/components/purchase-orders/PurchaseOrderFilterModal';
import { PurchaseOrderSortModal } from '@/components/purchase-orders/PurchaseOrderSortModal';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { countActiveFilters } from '@/lib/filterUtils';
import { toast } from '@/hooks/use-toast';
import * as purchaseOrderService from '@/services/purchaseOrderService';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
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

export const PurchaseOrders = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    deliveredOrders: 0,
    totalValue: 0,
    pendingValue: 0,
    averageOrderValue: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal states
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    vendor: '',
    poNumber: '',
    vendorContact: '',
    status: '',
    paymentMethod: '',
    createdBy: '',
    approvedBy: '',
    orderDateRange: undefined,
    deliveryDateRange: undefined,
    amountRange: { min: '', max: '' },
    paidAmountRange: { min: '', max: '' }
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ field: 'orderDate', direction: 'desc' });

  // Load purchase orders from service
  const loadPurchaseOrders = async () => {
    try {
      setIsLoadingData(true);
      const data = await purchaseOrderService.fetchPurchaseOrders();
      setPurchaseOrders(data);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load stats from service
  const loadStats = async () => {
    try {
      const statsData = await purchaseOrderService.fetchPurchaseOrderStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPurchaseOrders();
    loadStats();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'purchase-order') {
        setIsNewOrderOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(purchaseOrders.map(order => order.status)))];
  const vendors = Array.from(new Set(purchaseOrders.map(order => order.vendorName)));

  // Count active filters
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'orderDate' || sortConfig.direction !== 'desc';

  // Filter and sort logic
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      
      const matchesVendor = !selectedFilters.vendor || order.vendorName === selectedFilters.vendor;
      const matchesPONumber = !selectedFilters.poNumber || order.poNumber.toLowerCase().includes(selectedFilters.poNumber.toLowerCase());
      const matchesVendorContact = !selectedFilters.vendorContact || 
        order.vendorContact?.toLowerCase().includes(selectedFilters.vendorContact.toLowerCase()) ||
        order.vendorPhone?.toLowerCase().includes(selectedFilters.vendorContact.toLowerCase()) ||
        order.vendorEmail?.toLowerCase().includes(selectedFilters.vendorContact.toLowerCase());
      const matchesFilterStatus = !selectedFilters.status || order.status === selectedFilters.status;
      const matchesPaymentMethod = !selectedFilters.paymentMethod || order.paymentMethod === selectedFilters.paymentMethod;
      const matchesCreatedBy = !selectedFilters.createdBy || order.createdBy?.toLowerCase().includes(selectedFilters.createdBy.toLowerCase());
      const matchesApprovedBy = !selectedFilters.approvedBy || order.approvedBy?.toLowerCase().includes(selectedFilters.approvedBy.toLowerCase());
      
      const matchesOrderDateRange = !selectedFilters.orderDateRange?.from || !selectedFilters.orderDateRange?.to ||
        (new Date(order.orderDate) >= new Date(selectedFilters.orderDateRange.from) &&
         new Date(order.orderDate) <= new Date(selectedFilters.orderDateRange.to));
         
      const matchesDeliveryDateRange = !selectedFilters.deliveryDateRange?.from || !selectedFilters.deliveryDateRange?.to ||
        (new Date(order.deliveryDate) >= new Date(selectedFilters.deliveryDateRange.from) &&
         new Date(order.deliveryDate) <= new Date(selectedFilters.deliveryDateRange.to));
      
      const matchesAmountRange = (!selectedFilters.amountRange?.min || order.total >= Number(selectedFilters.amountRange.min)) &&
        (!selectedFilters.amountRange?.max || order.total <= Number(selectedFilters.amountRange.max));
        
      const matchesPaidAmountRange = (!selectedFilters.paidAmountRange?.min || order.paidAmount >= Number(selectedFilters.paidAmountRange.min)) &&
        (!selectedFilters.paidAmountRange?.max || order.paidAmount <= Number(selectedFilters.paidAmountRange.max));
      
      return matchesSearch && matchesStatus && matchesVendor && matchesPONumber && matchesVendorContact &&
        matchesFilterStatus && matchesPaymentMethod && matchesCreatedBy && matchesApprovedBy &&
        matchesOrderDateRange && matchesDeliveryDateRange && matchesAmountRange && matchesPaidAmountRange;
    });
  }, [purchaseOrders, searchTerm, selectedStatus, selectedFilters]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const field = sortConfig.field as keyof PurchaseOrder;
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortConfig]);

  // Infinite scroll for mobile
  const { displayedItems: mobileDisplayedItems, hasMoreItems, isLoading, loadMoreItems } = useInfiniteScroll({
    data: sortedOrders,
    itemsPerPage: 10,
    enabled: isMobile
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentPageData = isMobile 
    ? mobileDisplayedItems
    : sortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedFilters, sortConfig]);

  // Event handlers
  const handleViewOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsEditMode(false);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsEditMode(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await purchaseOrderService.deletePurchaseOrder(orderId);
      await loadPurchaseOrders();
      await loadStats();
      toast({
        title: "Success",
        description: "Purchase order deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to delete purchase order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveOrder = async (orderData: PurchaseOrder) => {
    try {
      if (orderData.id && orderData.id.startsWith('po-')) {
        // Update existing order
        await purchaseOrderService.updatePurchaseOrder(orderData.id, orderData);
        toast({
          title: "Success",
          description: "Purchase order updated successfully.",
        });
      } else {
        // Create new order
        await purchaseOrderService.createPurchaseOrder(orderData);
        toast({
          title: "Success",
          description: "Purchase order created successfully.",
        });
      }
      await loadPurchaseOrders();
      await loadStats();
      setIsNewOrderOpen(false);
      setEditingOrder(null);
    } catch (error) {
      console.error('Error saving purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to save purchase order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <section className="bg-card space-y-3 lg:space-y-0 overflow-hidden sm:mx-0">
        <div className="h-scroll py-4">
          <div className="flex flex-nowrap gap-3 sm:gap-4 w-max">
            {/* Total Orders Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total</p>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalOrders}</div>
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
                    +12%
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Package className="absolute bottom-0 right-0 h-12 w-12 text-blue-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Pending Orders Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.pendingOrders}</div>
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
                        strokeDasharray={`${(stats.pendingOrders / stats.totalOrders) * 75.4} 75.4`}
                        className="text-amber-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-amber-700 leading-none">
                        {Math.round((stats.pendingOrders / stats.totalOrders) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-amber-800">{formatIndianCurrency(stats.pendingValue)}</p>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Clock className="absolute bottom-0 right-0 h-12 w-12 text-amber-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Approved Orders Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved</p>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.approvedOrders}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center z-10">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-emerald-200 rounded-full h-1.5">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: '85%' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-emerald-700">85%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <CheckCircle className="absolute bottom-0 right-0 h-12 w-12 text-emerald-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Delivered Orders Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950/20 dark:to-lime-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Delivered</p>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.deliveredOrders}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center z-10">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">On-time</span>
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
              <TrendingUp className="absolute bottom-0 right-0 h-12 w-12 text-green-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Total Value Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Value</p>
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
                    <span className="text-emerald-600">Paid: {formatIndianCurrency(stats.totalValue - stats.pendingValue)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <DollarSign className="absolute bottom-0 right-0 h-12 w-12 text-emerald-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Average Order Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Avg Order</p>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {stats.totalOrders > 0 ? formatIndianCurrency(stats.averageOrderValue) : formatIndianCurrency(0)}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center z-10">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </div>
                
                {/* Trend Analysis */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1 bg-orange-200 rounded">
                      <div className="w-3/4 h-1 bg-orange-500 rounded"></div>
                    </div>
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +5%
                    </span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Package className="absolute bottom-0 right-0 h-12 w-12 text-orange-500/5 transform translate-x-3 translate-y-3" />
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
                placeholder="Search PO, vendor, or address..."
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
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFilterModalOpen(true)}
                className={hasFilters ? "bg-primary/10 border-primary/20 hover:bg-primary/20" : ""}
              >
                <Filter className="mr-1 h-4 w-4" /> 
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
                onClick={() => setIsSortModalOpen(true)}
                className={hasSort ? "bg-primary/10 border-primary/20 hover:bg-primary/20" : ""}
              >
                <ArrowUpDown className="mr-1 h-4 w-4" /> 
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table Section */}
      {isLoadingData ? (
        <Card className="border-border/50 shadow-sm">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading purchase orders...</p>
            </div>
          </div>
        </Card>
      ) : currentPageData.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No purchase orders found</p>
            </div>
          </div>
        </Card>
      ) : (
      <MobileTableView
        data={currentPageData}
        columns={[
          {
            key: 'poNumber',
            label: 'PO Number',
            width: 'w-[20%]',
            render: (value, order) => (
              <div>
                <div className="font-medium">{value}</div>
                <div className="text-sm text-muted-foreground">
                  {order.items.length} items
                </div>
                <div className="text-sm text-muted-foreground">
                  Created by: {order.createdBy}
                </div>
              </div>
            )
          },
          {
            key: 'vendorName',
            label: 'Vendor',
            width: 'w-[20%]',
            render: (value, order) => (
              <div>
                <div className="font-medium">{value}</div>
                <div className="text-sm text-muted-foreground">{order.vendorContact}</div>
                <div className="text-sm text-muted-foreground">{order.vendorPhone}</div>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            width: 'w-[15%]',
             render: (value, order) => (
               <div className="space-y-1">
                 <div><StatusBadge status={value} /></div>
                 {order.approvedBy && (
                   <div className="text-xs text-muted-foreground">
                     Approved by: {order.approvedBy}
                   </div>
                 )}
               </div>
             )
          },
          {
            key: 'orderDate',
            label: 'Timeline',
            width: 'w-[20%]',
            render: (value, order) => (
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Ordered:</span> {value}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Due:</span> {order.deliveryDate}
                </div>
                {order.fulfilmentDate && (
                  <div className="text-sm text-green-600">
                    <span className="font-medium">Delivered:</span> {order.fulfilmentDate}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'total',
            label: 'Amount',
            width: 'w-[20%]',
            render: (value, order) => (
              <div>
                <div className="font-semibold text-lg">
                  {formatIndianCurrency(value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {order.paymentMethod}
                </div>
                {order.paidAmount > 0 && (
                  <div className="text-xs text-green-600">
                    Paid: {formatIndianCurrency(order.paidAmount)}
                  </div>
                )}
              </div>
            )
          }
        ]}
        getTitle={(order) => order.poNumber}
        getSubtitle={(order) => `${order.vendorName} • ${order.items.length} items`}
        getStatus={(order) => order.status}
        getStatusColor={(order) => {
          switch (order.status.toLowerCase()) {
            case 'pending': return 'yellow';
            case 'approved': return 'blue';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
          }
        }}
        getActions={(order) => [
          { label: 'View', onClick: () => handleViewOrder(order), icon: Eye },
          { label: 'Edit', onClick: () => handleEditOrder(order), icon: Edit },
          { label: 'Delete', onClick: () => handleDeleteOrder(order.id), variant: 'destructive' as const, icon: Trash2 }
        ]}
        onRowClick={(order) => handleViewOrder(order)}
      />
      )}

      {/* Desktop Pagination */}
      {!isMobile && !isLoadingData && totalPages > 1 && (
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Mobile: Show loading indicator and load more button */}
      {isMobile && (
        <div className="text-center">
          {hasMoreItems ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Showing {mobileDisplayedItems.length} of {sortedOrders.length} orders
              </div>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={loadMoreItems}
                  className="w-full"
                >
                  Load More
                </Button>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              All {sortedOrders.length} orders loaded
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ModernPOOverlay
        order={editingOrder}
        isOpen={isNewOrderOpen || !!editingOrder}
        onClose={() => {
          setIsNewOrderOpen(false);
          setEditingOrder(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onSave={handleSaveOrder}
        onUpdate={handleSaveOrder}
        onDelete={handleDeleteOrder}
      />

      {/* Filter Modal */}
      <PurchaseOrderFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        vendors={vendors}
      />

      {/* Sort Modal */}
      <PurchaseOrderSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />
    </div>
  );
};