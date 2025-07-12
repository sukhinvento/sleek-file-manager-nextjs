import { useState } from 'react';
import { Search, Plus, Filter, Calendar, User, Package, X, Truck, FileText, Mail, CreditCard, MapPin, TrendingUp, DollarSign } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge as UnifiedStatusBadge } from '../components/inventory/StatusBadge';
import { SummaryCard } from '../components/inventory/SummaryCard';
import { InventoryOverlay } from '../components/inventory/InventoryOverlay';

// Sample sales order data
const salesOrdersData = [
  {
    id: 1,
    orderNumber: 'SO-100001',
    customerName: 'City General Hospital',
    customerEmail: 'procurement@citygeneral.com',
    customerPhone: '+91-9876543210',
    customerAddress: '123 Medical Street, Mumbai, Maharashtra 400001',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-20',
    status: 'Shipped',
    items: [
      { name: 'Surgical Masks', qty: 1000, unitPrice: 5.50, discount: 10, subtotal: 4950.00 },
      { name: 'Hand Sanitizer', qty: 50, unitPrice: 75.00, discount: 5, subtotal: 3562.50 }
    ],
    total: 8750.00,
    dueDate: '2024-01-20',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    shippingAddress: '123 Medical Street, Mumbai, Maharashtra 400001',
    billingAddress: '123 Medical Street, Mumbai, Maharashtra 400001',
    notes: 'Priority delivery required for surgical department'
  },
  {
    id: 2,
    orderNumber: 'SO-100002',
    customerName: 'Metro Clinic',
    customerEmail: 'orders@metroclinic.com',
    customerPhone: '+91-9876543211',
    customerAddress: '456 Health Avenue, Delhi, Delhi 110001',
    orderDate: '2024-01-16',
    deliveryDate: '2024-01-21',
    status: 'Processing',
    items: [
      { name: 'Disposable Gloves', qty: 500, unitPrice: 8.50, discount: 0, subtotal: 4250.50 }
    ],
    total: 4250.50,
    dueDate: '2024-01-21',
    paymentStatus: 'Pending',
    paymentMethod: 'Credit Card',
    shippingAddress: '456 Health Avenue, Delhi, Delhi 110001',
    billingAddress: '456 Health Avenue, Delhi, Delhi 110001',
    notes: 'Regular monthly order'
  },
  {
    id: 3,
    orderNumber: 'SO-100003',
    customerName: 'Regional Medical Center',
    customerEmail: 'supply@regionalmed.com',
    customerPhone: '+91-9876543212',
    customerAddress: '789 Care Boulevard, Bangalore, Karnataka 560001',
    orderDate: '2024-01-17',
    deliveryDate: '2024-01-22',
    status: 'Delivered',
    items: [
      { name: 'Medical Equipment', qty: 2, unitPrice: 5000.00, discount: 5, subtotal: 9500.00 },
      { name: 'Pharmaceuticals', qty: 100, unitPrice: 28.00, discount: 0, subtotal: 2800.75 }
    ],
    total: 12300.75,
    dueDate: '2024-01-22',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    shippingAddress: '789 Care Boulevard, Bangalore, Karnataka 560001',
    billingAddress: '789 Care Boulevard, Bangalore, Karnataka 560001',
    notes: 'Bulk order for new wing opening'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  return <UnifiedStatusBadge status={status as any} type="order" />;
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  return <UnifiedStatusBadge status={status as any} type="payment" />;
};

const DetailedSOOverlay = ({ order, isOpen, onClose, isEdit = false }: {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
}) => {
  const [items, setItems] = useState(order?.items || []);
  
  const addItem = () => {
    setItems([...items, { name: '', qty: 0, unitPrice: 0, discount: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: any, i: number) => i !== index));
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
    const sgst = subTotal * 0.09; // 9% SGST
    const cgst = subTotal * 0.09; // 9% CGST
    const shipping = 200.0;
    const total = subTotal + sgst + cgst + shipping;
    return { subTotal, sgst, cgst, shipping, total };
  };

  const totals = calculateTotals();

  return (
    <InventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Sales Order' : 'Sales Order Details'}
      size="xl"
      footerActions={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="action-button-primary">
            {isEdit ? 'Update Order' : 'Create Order'}
          </Button>
        </>
      }
    >
      {/* Content simplified for demo - full content would go here */}
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">{order?.orderNumber || 'SO-100001'}</h3>
        <StatusBadge status={order?.status || 'Processing'} />
      </div>
    </InventoryOverlay>
  );
};

export const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState(salesOrdersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const statuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = salesOrders.length;
  const totalRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = salesOrders.filter(o => o.status === 'Processing').length;

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <Button 
          className="bg-enterprise-700 hover:bg-enterprise-800"
          onClick={() => setIsNewOrderOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Sales Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statuses.map(status => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              className={`rounded-full whitespace-nowrap ${selectedStatus === status ? 'bg-enterprise-700' : ''}`}
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
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Details</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {order.orderDate}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Due: {order.dueDate}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {order.customerName}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{order.items.length} items</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingOrder(order)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingOrder(order)}
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detailed Overlays */}
      <DetailedSOOverlay 
        order={null}
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        isEdit={false}
      />
      
      <DetailedSOOverlay 
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        isEdit={true}
      />
    </div>
  );
};
