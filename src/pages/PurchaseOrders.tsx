import { useState } from 'react';
import { Search, Plus, Filter, MapPin, User, Calendar, Edit, Package, X, Attachment, Copy, Print, Mail, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Define order status tag component
const StatusTag = ({ status }: { status: 'FulFilled' | 'Quote' }) => {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${
      status === 'FulFilled' 
        ? 'bg-yellow-100 text-yellow-800' 
        : 'bg-blue-100 text-blue-800'
    }`}>
      {status}
    </span>
  );
};

// Sample data - expanded with filtering capabilities
const allPurchaseOrders = Array(50).fill(null).map((_, index) => ({
  id: index + 1,
  orderNumber: index % 3 === 1 ? `PO-10000${index + 2}` : `PO-10000${index + 1}`,
  status: index % 3 === 1 ? 'Quote' as const : 'FulFilled' as const,
  vendor: index % 4 === 0 ? 'Cuisine Supply Inc.' : index % 4 === 1 ? 'Medical Equipment Co.' : index % 4 === 2 ? 'Pharma Distributors Ltd.' : 'Healthcare Solutions',
  orderDate: `${Math.floor(Math.random() * 28) + 1} Nov 2024`,
  location: index % 3 === 0 ? 'Eastern Warehouse' : index % 3 === 1 ? 'Main Warehouse' : 'Emergency Storage',
  total: 14001.20 + (index * 123.45),
  balance: 14001.20 + (index * 123.45),
  contact: 'Coila Chemi PVT LTD',
  phone: '+91-9876543210',
  email: 'contact@coilachemi.com',
  address: '123 Industrial Area, Mumbai, Maharashtra 400001',
  currency: 'INR',
  dueDate: '15-Jan-2025',
  requestedDate: '10-Jan-2025',
  inspectedDate: '12-Jan-2025',
  inspectedBy: 'Sukhvindar Singh',
  items: [
    { name: 'Medical Gloves', vendorProduct: 'GLV-001', qty: 100, unitPrice: 25.00, discount: 10, subtotal: 2250.00 },
    { name: 'Surgical Mask', vendorProduct: 'MSK-002', qty: 200, unitPrice: 15.00, discount: 5, subtotal: 2850.00 }
  ]
}));

const DetailedPOOverlay = ({ order, isOpen, onClose, isEdit = false }: {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
}) => {
  const [items, setItems] = useState(order?.items || []);
  
  const addItem = () => {
    setItems([...items, { name: '', vendorProduct: '', qty: 0, unitPrice: 0, discount: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: any, i: number) => i !== index));
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
    const sgst = subTotal * 0.09; // 9% SGST
    const cgst = subTotal * 0.09; // 9% CGST
    const freight = 89.0;
    const total = subTotal + sgst + cgst + freight;
    return { subTotal, sgst, cgst, freight, total };
  };

  const totals = calculateTotals();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-4xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {isEdit ? 'Edit Purchase Order' : 'Purchase Order Details'}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"><Attachment className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Copy className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Print className="h-4 w-4" /></Button>
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
              <h3 className="text-lg font-semibold mb-4">{order?.orderNumber || 'PO-100001'}</h3>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm">Purchase</Button>
                <Button variant="outline" size="sm">Receive</Button>
                <Button variant="outline" size="sm">Return</Button>
                <Button variant="outline" size="sm">Restock</Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Card className="w-64">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Due:</span>
                      <span className="font-semibold">₹{totals.total.toFixed(2)}</span>
                    </div>
                    <div>
                      <Label htmlFor="reference">Reference Tags</Label>
                      <Input id="reference" placeholder="Enter tags" />
                    </div>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input id="vendor" defaultValue={order?.vendor || 'Coila Chemi PVT LTD'} />
              </div>
              <div>
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" defaultValue={order?.contact || 'Coila Chemi PVT LTD'} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue={order?.phone || 'Coila Chemi PVT LTD'} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={order?.email || 'Coila Chemi PVT LTD'} />
              </div>
              <div>
                <Label htmlFor="address">Vendor address</Label>
                <Input id="address" defaultValue={order?.address || 'Coila Chemi PVT LTD'} />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select defaultValue={order?.location || 'Paracetamol test'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Warehouse</SelectItem>
                    <SelectItem value="eastern">Eastern Warehouse</SelectItem>
                    <SelectItem value="emergency">Emergency Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <Label>Include Shipping</Label>
                  </div>
                  <div>
                    <Label htmlFor="ship-address">Ship-to address</Label>
                    <div className="text-sm text-gray-600">Coila Chemi PVT LTD</div>
                  </div>
                  <div>
                    <Label htmlFor="payment-terms">Payment terms</Label>
                    <Select defaultValue="Paracetamol test">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net15">Net 15</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Items</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Scan Product
                </Button>
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Keep Item in Basket
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select defaultValue={item.name}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medical-gloves">Medical Gloves</SelectItem>
                            <SelectItem value="surgical-mask">Surgical Mask</SelectItem>
                            <SelectItem value="paracetamol">Paracetamol</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input defaultValue={item.vendorProduct} className="w-24" />
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

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="carrier">Carrier</Label>
                <Select defaultValue="Paracetamol test">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fedex">FedEx</SelectItem>
                    <SelectItem value="ups">UPS</SelectItem>
                    <SelectItem value="dhl">DHL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vendor-costs">Non-vendor costs</Label>
                <Input id="vendor-costs" defaultValue="Coila Chemi PVT LTD" />
              </div>
              <div>
                <Label htmlFor="due-date">Due date</Label>
                <Input id="due-date" defaultValue="Coila Chemi PVT LTD" />
              </div>
              <div>
                <Label htmlFor="trading-scheme">Trading scheme</Label>
                <Input id="trading-scheme" defaultValue="Coila Chemi PVT LTD" />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" defaultValue="Coila Chemi PVT LTD" />
              </div>
              <div>
                <Label htmlFor="req-ship-date">Req ship date</Label>
                <Select defaultValue="Paracetamol test">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="next-week">Next Week</SelectItem>
                    <SelectItem value="end-month">End of Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sub Total</span>
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
                    <span>Freight (Shipping cost)</span>
                    <span>₹{totals.freight.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid</span>
                    <span>₹0.00</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Balance</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Custom Fields</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project Name</Label>
                <div className="text-sm">Coila Chemi PVT LTD</div>
              </div>
              <div>
                <Label>Requested Date</Label>
                <div className="text-sm">10-Jan-2025</div>
              </div>
              <div>
                <Label>Inspected Date</Label>
                <div className="text-sm">12-Jan-2025</div>
              </div>
              <div>
                <Label>Inspected By</Label>
                <div className="text-sm">Sukhvindar Singh</div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" placeholder="Paracetamol test" rows={3} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-enterprise-700 hover:bg-enterprise-800">
              {isEdit ? 'Save Changes' : 'Create Order'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const PurchaseOrders = () => {
  const [activeFilter, setActiveFilter] = useState<'Open' | 'Unpaid' | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  
  const itemsPerPage = 15;
  
  const filteredOrders = allPurchaseOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = selectedVendor === 'All' || order.vendor === selectedVendor;
    const matchesStatus = activeFilter === 'All' || 
                         (activeFilter === 'Open' && order.status === 'Quote') ||
                         (activeFilter === 'Unpaid' && order.balance > 0);
    return matchesSearch && matchesVendor && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (filter: 'Open' | 'Unpaid' | 'All') => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const vendors = ['All', ...Array.from(new Set(allPurchaseOrders.map(order => order.vendor)))];

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Purchase orders</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2">
          <Button 
            variant={activeFilter === 'Open' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'Open' ? 'bg-enterprise-700' : ''}`}
            onClick={() => handleFilterChange('Open')}
          >
            Open
          </Button>
          <Button 
            variant={activeFilter === 'Unpaid' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'Unpaid' ? 'bg-enterprise-700' : ''}`}
            onClick={() => handleFilterChange('Unpaid')}
          >
            Unpaid
          </Button>
          <Button 
            variant={activeFilter === 'All' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'All' ? 'bg-enterprise-700' : ''}`}
            onClick={() => handleFilterChange('All')}
          >
            All
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order number or vendor"
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Button 
            className="bg-enterprise-700 hover:bg-enterprise-800"
            onClick={() => setIsNewOrderOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New purchase order
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button variant="outline" className="whitespace-nowrap">
          <Filter className="mr-2 h-4 w-4" /> All filters
        </Button>
        <select 
          className="px-3 py-2 border rounded-md text-sm"
          value={selectedVendor}
          onChange={(e) => {
            setSelectedVendor(e.target.value);
            setCurrentPage(1);
          }}
        >
          {vendors.map(vendor => (
            <option key={vendor} value={vendor}>{vendor}</option>
          ))}
        </select>
        <Button variant="outline" className="whitespace-nowrap">
          <MapPin className="mr-2 h-4 w-4" /> Location
        </Button>
        <Button variant="outline" className="whitespace-nowrap">
          <Calendar className="mr-2 h-4 w-4" /> Order date
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Showing {paginatedOrders.length} of {filteredOrders.length} orders
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Order number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Order date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order, index) => (
              <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{order.orderNumber}</span>
                    <StatusTag status={order.status} />
                  </div>
                </TableCell>
                <TableCell>{order.vendor}</TableCell>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>{order.location}</TableCell>
                <TableCell>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell>₹{order.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditingOrder(order)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={i}>
                  <PaginationLink 
                    isActive={currentPage === pageNum} 
                    onClick={() => setCurrentPage(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationLink>...</PaginationLink>
              </PaginationItem>
            )}
            
            {totalPages > 5 && (
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setCurrentPage(totalPages)}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

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
