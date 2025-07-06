import { useState } from 'react';
import { Search, Plus, Filter, MapPin, User, Calendar, Edit, Package, X, Paperclip, Printer, Mail, FileText, Copy } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample purchase order data
const purchaseOrdersData = [
  {
    id: 1,
    poNumber: 'PO-2024-001',
    vendorName: 'Cuisine Supply Inc.',
    shippingAddress: '456 Warehouse Rd, Anytown',
    orderDate: '2024-01-20',
    deliveryDate: '2024-02-15',
    status: 'Pending',
    items: [
      { name: 'Chef Knives', qty: 10, unitPrice: 150.00, discount: 0, subtotal: 1500.00 },
      { name: 'Cutting Boards', qty: 20, unitPrice: 30.00, discount: 5, subtotal: 570.00 }
    ],
    total: 2070.00,
    createdBy: 'John Doe',
    approvedBy: 'Jane Smith',
    notes: 'Please ensure knives are high quality.',
    attachments: 2
  },
  {
    id: 2,
    poNumber: 'PO-2024-002',
    vendorName: 'Medical Equipment Co.',
    shippingAddress: '789 Hospital Ln, Anytown',
    orderDate: '2024-01-22',
    deliveryDate: '2024-02-20',
    status: 'Approved',
    items: [
      { name: 'Surgical Masks', qty: 500, unitPrice: 1.00, discount: 10, subtotal: 450.00 },
      { name: 'Gloves', qty: 1000, unitPrice: 0.50, discount: 0, subtotal: 500.00 }
    ],
    total: 950.00,
    createdBy: 'Alice Johnson',
    approvedBy: 'Bob Williams',
    notes: 'Gloves must be latex-free.',
    attachments: 0
  },
  {
    id: 3,
    poNumber: 'PO-2024-003',
    vendorName: 'Pharma Distributors Ltd.',
    shippingAddress: '321 Pharmacy St, Anytown',
    orderDate: '2024-01-25',
    deliveryDate: '2024-03-01',
    status: 'Delivered',
    items: [
      { name: 'Antibiotics', qty: 100, unitPrice: 25.00, discount: 5, subtotal: 2375.00 },
      { name: 'Pain Relievers', qty: 50, unitPrice: 15.00, discount: 0, subtotal: 750.00 }
    ],
    total: 3125.00,
    createdBy: 'Carol Davis',
    approvedBy: 'Ted Brown',
    notes: 'Verify expiration dates on delivery.',
    attachments: 1
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };
  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

const DetailedPOOverlay = ({ order, isOpen, onClose, isEdit = false }: {
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
    const shipping = 500.0;
    const total = subTotal + sgst + cgst + shipping;
    return { subTotal, sgst, cgst, shipping, total };
  };

  const totals = calculateTotals();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[75vw] max-w-none overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Purchase Order' : 'Purchase Order Details'}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"><Paperclip className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Copy className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Printer className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Mail className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><FileText className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-6">
          {/* Header Section */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{order?.poNumber || 'PO-2024-XXX'}</h3>
              <div className="flex gap-2 mb-4">
                <StatusBadge status={order?.status || 'Pending'} />
              </div>
            </div>
            <div className="flex justify-end">
              <Card className="w-64">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Amount:</span>
                      <span className="font-semibold">₹{totals.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <StatusBadge status={order?.status || 'Pending'} />
                    </div>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Vendor Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Vendor Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor-name">Vendor Name</Label>
                <Input id="vendor-name" defaultValue={order?.vendorName || ''} />
              </div>
              <div>
                <Label htmlFor="shipping-address">Shipping Address</Label>
                <Input id="shipping-address" defaultValue={order?.shippingAddress || ''} />
              </div>
              <div>
                <Label htmlFor="order-date">Order Date</Label>
                <Input id="order-date" type="date" defaultValue={order?.orderDate || ''} />
              </div>
              <div>
                <Label htmlFor="delivery-date">Delivery Date</Label>
                <Input id="delivery-date" type="date" defaultValue={order?.deliveryDate || ''} />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items
              </h4>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input defaultValue={item.name} placeholder="Product name" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={item.qty} className="w-20" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={item.unitPrice} className="w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input type="number" defaultValue={item.discount} className="w-16" />
                          <span className="text-sm">%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">₹{item.subtotal?.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Order Summary</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totals.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%)</span>
                  <span>₹{totals.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%)</span>
                  <span>₹{totals.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{totals.shipping.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Created By & Approved By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="created-by">Created By</Label>
              <Input id="created-by" defaultValue={order?.createdBy || ''} disabled />
            </div>
            <div>
              <Label htmlFor="approved-by">Approved By</Label>
              <Input id="approved-by" defaultValue={order?.approvedBy || ''} disabled />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Order Notes</Label>
            <Textarea
              id="notes"
              defaultValue={order?.notes || ''}
              placeholder="Additional notes about the order..."
              rows={3}
            />
          </div>

          {/* Attachments */}
          <div>
            <Label>Attachments ({order?.attachments || 0})</Label>
            <div className="flex items-center mt-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Add Attachment
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-enterprise-700 hover:bg-enterprise-800">
              {isEdit ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState(purchaseOrdersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

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

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button
          className="bg-enterprise-700 hover:bg-enterprise-800"
          onClick={() => setIsNewOrderOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Purchase Order
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
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
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

      {/* Purchase Orders Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Details</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Shipping Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium">{order.poNumber}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {order.orderDate}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Delivery: {order.deliveryDate}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {order.vendorName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {order.shippingAddress}
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
