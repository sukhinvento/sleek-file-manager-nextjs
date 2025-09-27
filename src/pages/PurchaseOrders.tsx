import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MapPin, Calendar, Package, TrendingUp, AlertTriangle, Clock, CheckCircle, Eye, Edit, MoreVertical, DollarSign } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { purchaseOrdersData } from '../data/purchaseOrderData';
import { PurchaseOrder } from '../types/purchaseOrder';
import { toast } from "@/hooks/use-toast";

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
    return matchesSearch && matchesStatus && matchesVendor;
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Summary Cards - Horizontally scrollable */}
      <div className="flex-shrink-0 mb-6">
        <div className="overflow-x-auto max-w-full pb-2">
          <div className="inline-flex w-max gap-4 pr-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(pendingValue / 1000).toFixed(0)}K pending value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{approvedOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready for delivery</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${(totalValue / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${totalOrders > 0 ? (totalValue / totalOrders / 1000).toFixed(0) : 0}K
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average order value</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
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
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filters
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

        {/* New Order Modal Placeholder */}
        {isNewOrderOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-lg font-semibold mb-4">New Purchase Order</h2>
              <p className="text-muted-foreground mb-4">Purchase order form would go here...</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsNewOrderOpen(false);
                  toast({
                    title: "Purchase Order Created",
                    description: "New purchase order has been successfully created.",
                  });
                }}>
                  Create Order
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal Placeholder */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-lg font-semibold mb-4">
                {isEditMode ? 'Edit' : 'View'} Purchase Order
              </h2>
              <div className="space-y-2 mb-4">
                <p><strong>PO Number:</strong> {editingOrder.poNumber}</p>
                <p><strong>Vendor:</strong> {editingOrder.vendorName}</p>
                <p><strong>Status:</strong> {editingOrder.status}</p>
                <p><strong>Total:</strong> ${editingOrder.total.toLocaleString()}</p>
                <p><strong>Items:</strong> {editingOrder.items.length}</p>
                {editingOrder.notes && (
                  <p><strong>Notes:</strong> {editingOrder.notes}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setEditingOrder(null);
                  setIsEditMode(false);
                }}>
                  Close
                </Button>
                {isEditMode && (
                  <Button onClick={() => {
                    setEditingOrder(null);
                    setIsEditMode(false);
                    toast({
                      title: "Purchase Order Updated",
                      description: `Purchase order ${editingOrder.poNumber} has been successfully updated.`,
                    });
                  }}>
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};