
import { useState } from 'react';
import { Search, Plus, Filter, Calendar, User, Package } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Sample sales order data
const salesOrdersData = [
  {
    id: 1,
    orderNumber: 'SO-100001',
    customerName: 'City General Hospital',
    orderDate: '2024-01-15',
    status: 'Shipped',
    items: 5,
    total: 8750.00,
    dueDate: '2024-01-20',
    paymentStatus: 'Paid'
  },
  {
    id: 2,
    orderNumber: 'SO-100002',
    customerName: 'Metro Clinic',
    orderDate: '2024-01-16',
    status: 'Processing',
    items: 3,
    total: 4250.50,
    dueDate: '2024-01-21',
    paymentStatus: 'Pending'
  },
  {
    id: 3,
    orderNumber: 'SO-100003',
    customerName: 'Regional Medical Center',
    orderDate: '2024-01-17',
    status: 'Delivered',
    items: 8,
    total: 12300.75,
    dueDate: '2024-01-22',
    paymentStatus: 'Paid'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Processing': 'bg-yellow-100 text-yellow-800',
    'Shipped': 'bg-blue-100 text-blue-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };
  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge className={status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
      {status}
    </Badge>
  );
};

export const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState(salesOrdersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

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
        <Button className="bg-enterprise-700 hover:bg-enterprise-800">
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
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  <Badge variant="outline">{order.items} items</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
