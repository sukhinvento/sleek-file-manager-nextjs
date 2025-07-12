import { useState } from 'react';
import { Search, Plus, Filter, MapPin, Calendar, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from '../components/purchase-orders/StatusBadge';
import { DetailedPOOverlay } from '../components/purchase-orders/DetailedPOOverlay';
import { SummaryCard } from '../components/inventory/SummaryCard';
import { purchaseOrdersData } from '../data/purchaseOrderData';
import { PurchaseOrder } from '../types/purchaseOrder';

export const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(purchaseOrdersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

  const statuses = ['All', 'Pending', 'Approved', 'Delivered', 'Cancelled'];

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(o => o.status === 'Pending').length;
  const deliveredOrders = purchaseOrders.filter(o => o.status === 'Delivered').length;

  const totalValue = purchaseOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Purchase Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your purchase orders
          </p>
        </div>
        <Button
          className="action-button-primary"
          onClick={() => setIsNewOrderOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Purchase Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Orders"
          value={totalOrders}
          icon={Package}
          gradient={true}
        />
        <SummaryCard
          title="Pending Orders"
          value={pendingOrders}
          icon={AlertTriangle}
          badge={{
            text: pendingOrders > 10 ? 'High' : 'Normal',
            variant: pendingOrders > 10 ? 'destructive' : 'outline'
          }}
        />
        <SummaryCard
          title="Delivered Orders"
          value={deliveredOrders}
          icon={Package}
          subtitle="This month"
        />
        <SummaryCard
          title="Total Value"
          value={`₹${totalValue.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          gradient={true}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statuses.map(status => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              className={`rounded-full whitespace-nowrap transition-all duration-300 ${
                selectedStatus === status 
                  ? 'action-button-primary scale-105' 
                  : 'action-button-secondary hover:scale-105'
              }`}
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
          <Button variant="outline" className="action-button-secondary">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden shadow-card bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Order Details</TableHead>
              <TableHead className="font-semibold">Vendor</TableHead>
              <TableHead className="font-semibold">Shipping Address</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order, index) => (
              <TableRow 
                key={order.id} 
                className="interactive-card border-b border-border/30 hover:bg-muted/20 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">{order.poNumber}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {order.orderDate}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Delivery: {order.deliveryDate}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{order.vendorName}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate max-w-[200px]">
                      {order.shippingAddress}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-muted/50">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-foreground">
                    ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                      onClick={() => setEditingOrder(order)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-info/10 hover:text-info transition-colors duration-300"
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
      <DetailedPOOverlay
        order={null}
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        isEdit={false}
      />

      <DetailedPOOverlay
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        isEdit={true}
      />
    </div>
  );
};