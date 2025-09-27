import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MapPin, Calendar, Package, TrendingUp, AlertTriangle, Clock, CheckCircle, Eye, Edit, MoreVertical } from 'lucide-react';
import { FilterLayout } from "@/components/ui/filter-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FilterModal } from "@/components/ui/filter-modal";
import { StatusBadge } from '../components/purchase-orders/StatusBadge';
import { DetailedPOOverlay } from '../components/purchase-orders/DetailedPOOverlay';
import { purchaseOrdersData } from '../data/purchaseOrderData';
import { PurchaseOrder } from '../types/purchaseOrder';
import { toast } from "@/hooks/use-toast";

export const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(purchaseOrdersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
    const matchesPriority = selectedPriority === 'All' || (order as any).priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesVendor && matchesPriority;
  });

  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(o => o.status === 'Pending').length;
  const approvedOrders = purchaseOrders.filter(o => o.status === 'Approved').length;
  const deliveredOrders = purchaseOrders.filter(o => o.status === 'Delivered').length;
  const totalValue = purchaseOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingValue = purchaseOrders.filter(o => o.status === 'Pending').reduce((sum, order) => sum + order.total, 0);

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsEditMode(true);
  };

  const handleViewOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsEditMode(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    setPurchaseOrders(purchaseOrders.filter(o => o.id !== orderId));
    toast({
      title: "Purchase Order Deleted",
      description: "Purchase order has been successfully deleted.",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">All purchase orders</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{(pendingValue / 1000).toFixed(0)}K pending value
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{approvedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for delivery</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delivered</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">
              ₹{(totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime orders</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Order</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{totalOrders > 0 ? (totalValue / totalOrders / 1000).toFixed(0) : 0}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average order value</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters Layout */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <FilterLayout
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by PO number, vendor, or address..."
            filterGroups={[
              {
                id: 'status',
                label: 'Status',
                items: statuses.map(status => ({
                  id: status,
                  label: status,
                  isActive: selectedStatus === status,
                  onClick: () => setSelectedStatus(status)
                }))
              }
            ]}
            filterModalConfig={{
              isOpen: isFilterModalOpen,
              onOpenChange: setIsFilterModalOpen,
              filters: {
                vendors,
                selectedVendor,
                onVendorChange: setSelectedVendor,
                priorities,
                selectedPriority,
                onPriorityChange: setSelectedPriority,
                priceRange: { min: 0, max: 100000 },
                toggles: [
                  {
                    id: 'urgent-only',
                    label: 'Urgent Orders Only',
                    value: false,
                    onChange: () => {},
                    isNew: true
                  }
                ]
              },
              onClear: () => {
                setSelectedVendor('All');
                setSelectedPriority('All');
              }
            }}
            resultsCount={filteredOrders.length}
            totalCount={totalOrders}
            itemLabel="purchase orders"
            onClearAll={() => {
              setSearchTerm('');
              setSelectedStatus('All');
              setSelectedVendor('All');
              setSelectedPriority('All');
            }}
          />
        </CardContent>
      </Card>

      {/* Enhanced Purchase Orders Table */}
      <Card className="border-border/50 shadow-sm">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[25%] font-semibold">Order Details</TableHead>
                <TableHead className="w-[20%] font-semibold">Vendor & Shipping</TableHead>
                <TableHead className="w-[15%] font-semibold">Status & Items</TableHead>
                <TableHead className="w-[15%] font-semibold">Timeline</TableHead>
                <TableHead className="w-[15%] font-semibold">Financial</TableHead>
                <TableHead className="w-[10%] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <TableRow 
                  key={order.id} 
                  className={`hover:bg-muted/30 transition-colors border-border/50 cursor-pointer ${
                    selectedOrderId === order.id ? 'bg-slate-50 border-slate-300' : ''
                  }`}
                  onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                >
                  {/* Order Details */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-base">
                            {order.poNumber}
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block">
                            ID: {order.id}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} ordered
                      </div>
                    </div>
                  </TableCell>

                  {/* Vendor & Shipping */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">
                        {order.vendorName}
                      </div>
                      <div className="flex items-start gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {order.shippingAddress}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status & Items */}
                  <TableCell className="py-4">
                    <div className="space-y-3">
                      <StatusBadge status={order.status} />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Timeline */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Ordered:</span>
                      </div>
                      <div className="text-sm text-muted-foreground ml-5">
                        {order.orderDate}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Delivery:</span>
                      </div>
                      <div className="text-sm text-muted-foreground ml-5">
                        {order.deliveryDate}
                      </div>
                    </div>
                  </TableCell>

                  {/* Financial */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-foreground">
                        ₹{order.total.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Order Value
                      </div>
                      <div className="text-xs bg-muted px-2 py-1 rounded text-center">
                        Net 30
                      </div>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
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

      {/* Enhanced Purchase Order Overlays */}
      <DetailedPOOverlay
        order={null}
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        isEdit={true}
        onSave={(newOrder) => {
          setPurchaseOrders([...purchaseOrders, newOrder]);
          toast({
            title: "Purchase Order Created",
            description: `Purchase order ${newOrder.poNumber} has been successfully created.`,
          });
        }}
      />

      <DetailedPOOverlay
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => {
          setEditingOrder(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onUpdate={(updatedOrder) => {
          setPurchaseOrders(purchaseOrders.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          ));
          setEditingOrder(null);
          toast({
            title: "Purchase Order Updated",
            description: `Purchase order ${updatedOrder.poNumber} has been successfully updated.`,
          });
        }}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
};