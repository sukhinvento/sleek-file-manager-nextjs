import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MapPin, Calendar, Package, TrendingUp, AlertTriangle, Clock, CheckCircle, Eye, Edit, MoreVertical, DollarSign, ArrowUpDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
    <div className="flex flex-col gap-16">
      {/* Summary Cards - Horizontally scrollable */}
      <div>
        <div className="overflow-x-auto w-full pb-4 scrollbar-hide">
          <div className="flex gap-6 pr-6">
            {/* Total Orders Card */}
            <Card className="min-w-[280px] border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover-scale transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalOrders}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">All time</span>
                  <div className="h-1 w-16 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Orders Card */}
            <Card className="min-w-[280px] border-0 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950 dark:to-orange-900 hover-scale transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium">Pending</p>
                    <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{pendingOrders}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">${(pendingValue / 1000).toFixed(0)}K value</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">In Progress</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Orders Card */}
            <Card className="min-w-[280px] border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 hover-scale transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium">Approved</p>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{approvedOrders}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ready to ship</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">Approved</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivered Orders Card */}
            <Card className="min-w-[280px] border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 hover-scale transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium">Delivered</p>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300">{deliveredOrders}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Completed</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 dark:text-green-400">Success</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Value Card */}
            <Card className="min-w-[280px] border-0 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 hover-scale transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium">Total Value</p>
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                      ${(totalValue / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Lifetime revenue</span>
                  <div className="h-1 w-16 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Order Value Card */}
            <Card className="min-w-[280px] border-0 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 hover-scale transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium">Avg Order</p>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      ${totalOrders > 0 ? (totalValue / totalOrders / 1000).toFixed(0) : 0}K
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Per order value</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-purple-600" />
                    <span className="text-xs text-purple-600 dark:text-purple-400">Trending</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statuses.map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                className="rounded-full whitespace-nowrap"
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by PO number, vendor, or address..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
            <Button variant="outline" onClick={() => setIsSortModalOpen(true)}>
              <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
            </Button>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <Card className="border-border/50 shadow-sm">
          <div className="overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Details</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.poNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} items
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created by: {order.createdBy}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.vendorName}</div>
                        <div className="text-sm text-muted-foreground">{order.vendorContact}</div>
                        <div className="text-sm text-muted-foreground">{order.vendorPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <StatusBadge status={order.status} />
                        {order.approvedBy && (
                          <div className="text-xs text-muted-foreground">
                            Approved by: {order.approvedBy}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Ordered:</span> {order.orderDate}
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
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-lg">
                          ${order.total.toLocaleString()}
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
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

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
    </div>
  );
};