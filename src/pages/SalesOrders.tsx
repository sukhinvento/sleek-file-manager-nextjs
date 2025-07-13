import { useState } from 'react';
import { Search, Plus, Filter, Calendar, User, Package, TrendingUp, DollarSign, AlertTriangle, Clock, CheckCircle, Eye, Edit, MoreVertical, Truck } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from '../components/inventory/StatusBadge';
import { DetailedSOOverlay } from '../components/sales-orders/DetailedSOOverlay';
import { FilterModal } from "@/components/ui/filter-modal";
import { salesOrdersData } from '../data/inventoryData';
import { SalesOrder } from '../types/inventory';
import { toast } from "@/hooks/use-toast";

export const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(salesOrdersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const statuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const paymentStatuses = ['All', 'Paid', 'Pending', 'Overdue'];
  
  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesPayment = selectedPaymentStatus === 'All' || order.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalOrders = salesOrders.length;
  const totalRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0);
  const processingOrders = salesOrders.filter(o => o.status === 'Processing').length;
  const shippedOrders = salesOrders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = salesOrders.filter(o => o.status === 'Delivered').length;
  const paidOrders = salesOrders.filter(o => o.paymentStatus === 'Paid').length;
  const pendingPayments = salesOrders.filter(o => o.paymentStatus === 'Pending').reduce((sum, order) => sum + order.total, 0);

  const handleEditOrder = (order: SalesOrder) => {
    setEditingOrder(order);
    setIsEditMode(true);
  };

  const handleViewOrder = (order: SalesOrder) => {
    setEditingOrder(order);
    setIsEditMode(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    setSalesOrders(salesOrders.filter(o => o.id !== orderId));
    toast({
      title: "Sales Order Deleted",
      description: "Sales order has been successfully deleted.",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your sales orders and customer deliveries
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          onClick={() => setIsNewOrderOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Sales Order
        </Button>
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
            <p className="text-xs text-muted-foreground mt-1">All sales orders</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{(totalRevenue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime revenue</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Processing</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{processingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting fulfillment</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{shippedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">In transit</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Payment</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{(pendingPayments / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search by order number, customer name..."
                className="pl-10 h-12 text-base border-border/50 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Status Filter */}
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                {statuses.map(status => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3 text-xs ${
                      selectedStatus === status ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>

              {/* More Filters Modal */}
              <FilterModal 
                isOpen={false} 
                onOpenChange={() => {}}
                filters={{
                  categories: ['All', 'Medical', 'Equipment', 'Supplies'],
                  selectedCategory: 'All',
                  onCategoryChange: () => {},
                  toggles: [
                    {
                      id: 'priority-orders',
                      label: 'Priority Orders Only',
                      value: false,
                      onChange: () => {},
                      isNew: true
                    }
                  ]
                }}
              />

              {/* Payment Status Filter */}
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Payment:</span>
                {paymentStatuses.map(paymentStatus => (
                  <Button
                    key={paymentStatus}
                    variant={selectedPaymentStatus === paymentStatus ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3 text-xs ${
                      selectedPaymentStatus === paymentStatus ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => setSelectedPaymentStatus(paymentStatus)}
                  >
                    {paymentStatus}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Showing {filteredOrders.length} of {totalOrders} sales orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('All');
                    setSelectedPaymentStatus('All');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Sales Orders Table */}
      <Card className="border-border/50 shadow-sm">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[25%] font-semibold">Order Details</TableHead>
                <TableHead className="w-[20%] font-semibold">Customer</TableHead>
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
                  className="hover:bg-muted/30 transition-colors border-border/50"
                >
                  {/* Order Details */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-base">
                            {order.orderNumber}
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

                  {/* Customer */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {order.customerName}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Customer Order
                      </div>
                    </div>
                  </TableCell>

                  {/* Status & Items */}
                  <TableCell className="py-4">
                    <div className="space-y-3">
                      <StatusBadge status={order.status} type="order" />
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
                        <span className="font-medium">Due:</span>
                      </div>
                      <div className="text-sm text-muted-foreground ml-5">
                        {order.dueDate}
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
                        Order Total
                      </div>
                      <StatusBadge status={order.paymentStatus} type="payment" />
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

      {/* Enhanced Sales Order Overlays */}
      <DetailedSOOverlay 
        order={null}
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        isEdit={true}
        onSave={(newOrder) => {
          setSalesOrders([...salesOrders, newOrder]);
          toast({
            title: "Sales Order Created",
            description: `Sales order ${newOrder.orderNumber} has been successfully created.`,
          });
        }}
      />
      
      <DetailedSOOverlay 
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => {
          setEditingOrder(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onUpdate={(updatedOrder) => {
          setSalesOrders(salesOrders.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          ));
          setEditingOrder(null);
          toast({
            title: "Sales Order Updated",
            description: `Sales order ${updatedOrder.orderNumber} has been successfully updated.`,
          });
        }}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
};