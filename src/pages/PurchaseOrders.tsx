import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MapPin, Calendar, Package, TrendingUp, AlertTriangle, Clock, CheckCircle, Eye, Edit, MoreVertical, DollarSign, ArrowUpDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MobileTableView } from "@/components/ui/mobile-table-view";
import { purchaseOrdersData } from '../data/purchaseOrderData';
import { PurchaseOrder } from '../types/purchaseOrder';
import { toast } from "@/hooks/use-toast";
import { ModernPOOverlay } from '../components/purchase-orders/ModernPOOverlay';
import { FilterModal } from '../components/purchase-orders/FilterModal';
import { SortModal } from '../components/purchase-orders/SortModal';

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Partial': 'bg-orange-100 text-orange-800'
  };

  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

export const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(purchaseOrdersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

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

  const statuses = ['All', 'Pending', 'Approved', 'Delivered', 'Cancelled'];
  const vendors = ['All', ...Array.from(new Set(purchaseOrders.map(o => o.vendorName)))];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesVendor = selectedVendor === 'All' || order.vendorName === selectedVendor;
    
    // Apply advanced filters
    const matchesAdvancedFilters = (
      (!appliedFilters.poNumber || order.poNumber.toLowerCase().includes(appliedFilters.poNumber.toLowerCase())) &&
      (!appliedFilters.vendorName || appliedFilters.vendorName === 'all-vendors' || order.vendorName === appliedFilters.vendorName) &&
      (!appliedFilters.vendorContact || order.vendorContact.toLowerCase().includes(appliedFilters.vendorContact.toLowerCase())) &&
      (!appliedFilters.status || appliedFilters.status === 'all-statuses' || order.status === appliedFilters.status) &&
      (!appliedFilters.createdBy || order.createdBy.toLowerCase().includes(appliedFilters.createdBy.toLowerCase())) &&
      (!appliedFilters.paymentMethod || appliedFilters.paymentMethod === 'all-methods' || order.paymentMethod === appliedFilters.paymentMethod) &&
      (!appliedFilters.minAmount || order.total >= parseInt(appliedFilters.minAmount)) &&
      (!appliedFilters.maxAmount || order.total <= parseInt(appliedFilters.maxAmount))
    );
    
    return matchesSearch && matchesStatus && matchesVendor && matchesAdvancedFilters;
  }).sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { field, direction } = sortConfig;
    let aValue = a[field as keyof PurchaseOrder];
    let bValue = b[field as keyof PurchaseOrder];
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate metrics
  const totalOrders = purchaseOrders.length;
  const totalValue = purchaseOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = purchaseOrders.filter(order => order.status === 'Pending').length;
  const pendingValue = purchaseOrders.filter(order => order.status === 'Pending').reduce((sum, order) => sum + order.total, 0);
  const approvedOrders = purchaseOrders.filter(order => order.status === 'Approved').length;
  const deliveredOrders = purchaseOrders.filter(order => order.status === 'Delivered').length;

  const handleViewOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsEditMode(false);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsEditMode(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setPurchaseOrders(purchaseOrders.filter(o => o.id !== orderId));
    toast({
      title: "Purchase Order Deleted",
      description: "Purchase order has been successfully deleted.",
    });
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    toast({
      title: "Filters Applied",
      description: "Purchase orders have been filtered based on your criteria.",
    });
  };

  const handleApplySort = (config: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(config);
    toast({
      title: "Sort Applied",
      description: `Orders sorted by ${config.field} (${config.direction === 'asc' ? 'ascending' : 'descending'}).`,
    });
  };

  return (
    <>
      {/* Summary Cards - Full Width with Horizontal Scroll */}
        <div className="w-full">
          <div 
            className="w-full overflow-x-auto overflow-y-hidden pb-2 scrollbar-show" 
            onScroll={() => {}}
          >
            <div className="flex gap-4 pb-2 w-max min-w-full">
              <Card className="flex-shrink-0 w-36 sm:w-40 animate-fade-in hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
                </CardContent>
              </Card>
              <Card className="flex-shrink-0 w-36 sm:w-40 animate-fade-in hover-scale">
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
              <Card className="flex-shrink-0 w-36 sm:w-40 animate-fade-in hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{approvedOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for delivery</p>
                </CardContent>
              </Card>
              <Card className="flex-shrink-0 w-36 sm:w-40 animate-fade-in hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Delivered</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{deliveredOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
                </CardContent>
              </Card>
              <Card className="flex-shrink-0 w-36 sm:w-40 animate-fade-in hover-scale">
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
              <Card className="flex-shrink-0 w-36 sm:w-40 animate-fade-in hover-scale">
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
        </div>

        {/* Filters and Search - Full Width */}
        <div className="w-full bg-card rounded-lg border p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-hidden">
          {/* Status Filter Pills */}
          <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-muted">
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
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search PO, vendor, or address..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
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

        {/* Purchase Orders Responsive Table/Cards */}
        <div className="w-full overflow-hidden">
          <MobileTableView
            data={filteredOrders}
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
                    {order.paidAmount > 0 && (
                      <div className="text-sm text-green-600">
                        Paid: ${order.paidAmount.toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {order.paymentMethod}
                    </div>
                  </div>
                )
              }
            ]}
            getTitle={(order) => order.poNumber}
            getSubtitle={(order) => `${order.vendorName} • ${order.items.length} items`}
            getStatus={(order) => order.status}
            getStatusColor={(order) => {
              const colors = {
                'Pending': 'yellow',
                'Approved': 'blue',
                'Delivered': 'green',
                'Cancelled': 'red',
                'Partial': 'orange'
              };
              return colors[order.status as keyof typeof colors] || 'gray';
            }}
            getActions={(order) => [
              {
                label: 'Edit',
                onClick: () => handleEditOrder(order),
                variant: 'outline' as const
              },
              {
                label: 'Delete',
                onClick: () => handleDeleteOrder(order.id),
                variant: 'destructive' as const
              }
            ]}
            onRowClick={handleViewOrder}
          />
        </div>

        {/* Purchase Order Modal */}
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
    </>
  );
};