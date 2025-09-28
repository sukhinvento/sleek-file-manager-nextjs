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
  DollarSign
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { ModernPOOverlay } from '@/components/purchase-orders/ModernPOOverlay';
import { FilterModal } from '@/components/purchase-orders/FilterModal';
import { SortModal } from '@/components/purchase-orders/SortModal';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { purchaseOrdersData } from '@/data/purchaseOrderData';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

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
    <Badge className={`${getStatusColor(status)} border`}>
      {status}
    </Badge>
  );
};

export const PurchaseOrders = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(purchaseOrdersData);
  
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
    dateRange: { from: '', to: '' },
    amountRange: { min: '', max: '' }
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ field: 'orderDate', direction: 'desc' });

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(purchaseOrders.map(order => order.status)))];
  const vendors = Array.from(new Set(purchaseOrders.map(order => order.vendorName)));

  // Filter and sort logic
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      
      const matchesVendor = !selectedFilters.vendor || order.vendorName === selectedFilters.vendor;
      
      const matchesDateRange = !selectedFilters.dateRange.from || !selectedFilters.dateRange.to ||
        (new Date(order.orderDate) >= new Date(selectedFilters.dateRange.from) &&
         new Date(order.orderDate) <= new Date(selectedFilters.dateRange.to));
      
      const matchesAmountRange = (!selectedFilters.amountRange.min || order.total >= Number(selectedFilters.amountRange.min)) &&
        (!selectedFilters.amountRange.max || order.total <= Number(selectedFilters.amountRange.max));
      
      return matchesSearch && matchesStatus && matchesVendor && matchesDateRange && matchesAmountRange;
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

  // Calculate summary metrics
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(order => order.status === 'Pending').length;
  const approvedOrders = purchaseOrders.filter(order => order.status === 'Approved').length;
  const deliveredOrders = purchaseOrders.filter(order => order.status === 'Delivered').length;
  const totalValue = purchaseOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingValue = purchaseOrders
    .filter(order => order.status === 'Pending')
    .reduce((sum, order) => sum + order.total, 0);

  // Event handlers
  const handleViewOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsEditMode(false);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsEditMode(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setPurchaseOrders(purchaseOrders.filter(order => order.id !== orderId));
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
    <div className="space-y-6">
      {/* Summary Cards Section */}
      <section className="bg-card rounded-xl border shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Overview</h2>
        <div className="h-scroll scrollbar-hide scroll-mask">
          <div className="flex flex-nowrap gap-3 sm:gap-4 w-max">
            <Card className="flex-shrink-0 w-32 sm:w-36 md:w-40 animate-fade-in hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 w-32 sm:w-36 md:w-40 animate-fade-in hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(pendingValue / 1000).toFixed(0)}K pending value
                </p>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 w-32 sm:w-36 md:w-40 animate-fade-in hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{approvedOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready for delivery</p>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 w-32 sm:w-36 md:w-40 animate-fade-in hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Delivered</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{deliveredOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 w-32 sm:w-36 md:w-40 animate-fade-in hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  ${(totalValue / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime orders</p>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 w-32 sm:w-36 md:w-40 animate-fade-in hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Avg Order</CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  ${totalOrders > 0 ? (totalValue / totalOrders / 1000).toFixed(0) : 0}K
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average order value</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters Section - Sticky */}
      <section className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3 lg:space-y-0 overflow-hidden mx-4 sm:mx-0">
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
              <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)}>
                <Filter className="mr-1 h-4 w-4" /> 
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsSortModalOpen(true)}>
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
                <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)}>
                  <Filter className="mr-1 h-4 w-4" /> 
                  <span className="hidden sm:inline">Filters</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsSortModalOpen(true)}>
                  <ArrowUpDown className="mr-1 h-4 w-4" /> 
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Orders Table Section */}
      <section className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-foreground">Purchase Orders</h2>
        </div>
        <MobileTableView
          data={currentPageData}
          columns={[
            {
              key: 'poNumber',
              label: 'PO Number',
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
              render: (value, order) => (
                <div className="space-y-2">
                  <StatusBadge status={value} />
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
              render: (value, order) => (
                <div>
                  <div className="font-semibold text-lg">
                    ${value.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.paymentMethod}
                  </div>
                  {order.paidAmount > 0 && (
                    <div className="text-xs text-green-600">
                      Paid: ${order.paidAmount.toLocaleString()}
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
            { label: 'View', onClick: () => handleViewOrder(order) },
            { label: 'Edit', onClick: () => handleEditOrder(order) },
            { label: 'Delete', onClick: () => handleDeleteOrder(order.id), variant: 'destructive' as const }
          ]}
          onRowClick={(order) => handleViewOrder(order)}
        />

        {/* Desktop Pagination */}
        {!isMobile && totalPages > 1 && (
          <div className="p-4 border-t">
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
          <div className="p-4 border-t text-center">
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
      </section>

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
        onSave={(newOrder) => {
          setPurchaseOrders([...purchaseOrders, newOrder]);
          setIsNewOrderOpen(false);
        }}
        onUpdate={(updatedOrder) => {
          setPurchaseOrders(purchaseOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          setEditingOrder(null);
          setIsEditMode(false);
        }}
        onDelete={(orderId) => {
          setPurchaseOrders(purchaseOrders.filter(o => o.id !== orderId));
          setEditingOrder(null);
        }}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        vendors={vendors}
        statuses={statuses}
      />

      {/* Sort Modal */}
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />
    </div>
  );
};