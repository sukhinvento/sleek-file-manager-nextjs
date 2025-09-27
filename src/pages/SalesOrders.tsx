import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, User, Package, TrendingUp, DollarSign, AlertTriangle, Clock, CheckCircle, Eye, Edit, MoreVertical, Truck } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { ModernSOOverlay } from '../components/sales-orders/ModernSOOverlay';
import { SalesOrder } from '../types/inventory';

// Sample sales orders data
const salesOrdersData: SalesOrder[] = [
  {
    id: '1',
    orderNumber: 'SO-2024-001',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '+1-555-0123',
    customerAddress: '123 Main St',
    orderDate: '2024-01-15',
    dueDate: '2024-01-22',
    status: 'Processing',
    paymentStatus: 'Paid',
    total: 2500.00,
    items: [],
    deliveryDate: '2024-01-22',
    paymentMethod: 'Credit Card',
    shippingAddress: '123 Main St, City, State',
    billingAddress: '123 Main St, City, State',
    notes: ''
  },
  {
    id: '2',
    orderNumber: 'SO-2024-002',
    customerName: 'Emily Davis',
    customerEmail: 'emily@example.com',
    customerPhone: '+1-555-0124',
    customerAddress: '456 Oak Ave',
    orderDate: '2024-01-16',
    dueDate: '2024-01-23',
    status: 'Shipped',
    paymentStatus: 'Paid',
    total: 4200.00,
    items: [],
    deliveryDate: '2024-01-23',
    paymentMethod: 'Bank Transfer',
    shippingAddress: '456 Oak Ave, City, State',
    billingAddress: '456 Oak Ave, City, State',
    notes: ''
  },
  {
    id: '3',
    orderNumber: 'SO-2024-003',
    customerName: 'Robert Wilson',
    customerEmail: 'robert@example.com',
    customerPhone: '+1-555-0125',
    customerAddress: '789 Pine Rd',
    orderDate: '2024-01-17',
    dueDate: '2024-01-24',
    status: 'Delivered',
    paymentStatus: 'Pending',
    total: 1800.00,
    items: [],
    deliveryDate: '2024-01-24',
    paymentMethod: 'Cash',
    shippingAddress: '789 Pine Rd, City, State',
    billingAddress: '789 Pine Rd, City, State',
    notes: ''
  }
];

const StatusBadge = ({ status, type = 'order' }: { status: string; type?: 'order' | 'payment' }) => {
  const orderVariants = {
    'Processing': 'bg-yellow-100 text-yellow-800',
    'Shipped': 'bg-blue-100 text-blue-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  const paymentVariants = {
    'Paid': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Overdue': 'bg-red-100 text-red-800'
  };

  const variants = type === 'payment' ? paymentVariants : orderVariants;

  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

export const SalesOrders = () => {
  const [orders, setOrders] = useState<SalesOrder[]>(salesOrdersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'sales-order') {
        setIsNewOrderOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  const statuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const paymentStatuses = ['All', 'Paid', 'Pending', 'Overdue'];
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesPayment = selectedPaymentStatus === 'All' || order.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const processingOrders = orders.filter(order => order.status === 'Processing').length;
  const pendingPayments = orders.filter(order => order.paymentStatus === 'Pending').reduce((sum, order) => sum + order.total, 0);

  const handleDeleteOrder = (orderId: number) => {
    setOrders(orders.filter(o => parseInt(o.id) !== orderId));
    toast({
      title: "Sales Order Deleted",
      description: "Sales order has been successfully deleted.",
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
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${totalRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{processingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${pendingPayments.toLocaleString()}
                </div>
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
                placeholder="Search orders..."
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

        {/* Sales Orders Table */}
        <Card className="border-border/50 shadow-sm">
          <div className="overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Customer</TableHead>
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
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} items
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <StatusBadge status={order.status} />
                        <StatusBadge status={order.paymentStatus} type="payment" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Ordered:</span> {order.orderDate}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Due:</span> {order.dueDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-lg">
                        ${order.total.toLocaleString()}
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
                          <DropdownMenuItem onClick={() => {
                            setEditingOrder(order);
                            setIsEditMode(false);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingOrder(order);
                            setIsEditMode(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteOrder(parseInt(order.id))}
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

      {/* Sales Order Modal */}
      <ModernSOOverlay
        order={editingOrder}
        isOpen={isNewOrderOpen || !!editingOrder}
        onClose={() => {
          setIsNewOrderOpen(false);
          setEditingOrder(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onSave={(newOrder) => {
          setOrders([...orders, newOrder]);
          setIsNewOrderOpen(false);
        }}
        onUpdate={(updatedOrder) => {
          setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          setEditingOrder(null);
          setIsEditMode(false);
        }}
        onDelete={(orderId) => {
          setOrders(orders.filter(o => o.id !== orderId));
          setEditingOrder(null);
        }}
      />
    </div>
  );
};