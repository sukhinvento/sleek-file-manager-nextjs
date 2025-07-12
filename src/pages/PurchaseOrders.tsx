import { useState } from 'react';
import { Search, Plus, Filter, MapPin, User, Calendar, Edit, Package, X, Paperclip, Printer, Mail, FileText, Copy, QrCode, Scan, Camera, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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
    vendorContact: 'John Smith',
    vendorPhone: '+1-555-0123',
    vendorEmail: 'john@cuisinesupply.com',
    vendorAddress: '123 Supply Street, Business District',
    shippingAddress: '456 Warehouse Rd, Anytown',
    orderDate: '2024-01-20',
    deliveryDate: '2024-02-15',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Chef Knives', qty: 10, unitPrice: 150.00, discount: 0, subtotal: 1500.00 },
      { name: 'Cutting Boards', qty: 20, unitPrice: 30.00, discount: 5, subtotal: 570.00 }
    ],
    total: 2070.00,
    paidAmount: 0,
    createdBy: 'John Doe',
    approvedBy: 'Jane Smith',
    notes: 'Please ensure knives are high quality.',
    attachments: 2,
    paymentMethod: 'net-30',
    remarks: [
      { date: '2024-01-20', user: 'John Doe', message: 'Order created and sent to vendor' },
      { date: '2024-01-21', user: 'Jane Smith', message: 'Order approved for processing' }
    ]
  },
  {
    id: 2,
    poNumber: 'PO-2024-002',
    vendorName: 'Medical Equipment Co.',
    vendorContact: 'Sarah Johnson',
    vendorPhone: '+1-555-0456',
    vendorEmail: 'sarah@medequip.com',
    vendorAddress: '456 Medical Plaza, Healthcare District',
    shippingAddress: '789 Hospital Ln, Anytown',
    orderDate: '2024-01-22',
    deliveryDate: '2024-02-20',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Surgical Masks', qty: 500, unitPrice: 1.00, discount: 10, subtotal: 450.00 },
      { name: 'Gloves', qty: 1000, unitPrice: 0.50, discount: 0, subtotal: 500.00 }
    ],
    total: 950.00,
    paidAmount: 475.00,
    createdBy: 'Alice Johnson',
    approvedBy: 'Bob Williams',
    notes: 'Gloves must be latex-free.',
    attachments: 0,
    paymentMethod: 'pos',
    remarks: [
      { date: '2024-01-22', user: 'Alice Johnson', message: 'Order created with urgent priority' },
      { date: '2024-01-23', user: 'Bob Williams', message: 'Approved with 50% advance payment' }
    ]
  },
  {
    id: 3,
    poNumber: 'PO-2024-003',
    vendorName: 'Pharma Distributors Ltd.',
    vendorContact: 'Michael Brown',
    vendorPhone: '+1-555-0789',
    vendorEmail: 'michael@pharmadist.com',
    vendorAddress: '789 Pharma Complex, Medical City',
    shippingAddress: '321 Pharmacy St, Anytown',
    orderDate: '2024-01-25',
    deliveryDate: '2024-03-01',
    fulfilmentDate: '2024-02-28',
    status: 'Delivered',
    items: [
      { name: 'Antibiotics', qty: 100, unitPrice: 25.00, discount: 5, subtotal: 2375.00 },
      { name: 'Pain Relievers', qty: 50, unitPrice: 15.00, discount: 0, subtotal: 750.00 }
    ],
    total: 3125.00,
    paidAmount: 3125.00,
    createdBy: 'Carol Davis',
    approvedBy: 'Ted Brown',
    notes: 'Verify expiration dates on delivery.',
    attachments: 1,
    paymentMethod: 'bank-transfer',
    remarks: [
      { date: '2024-01-25', user: 'Carol Davis', message: 'Order placed for Q1 stock replenishment' },
      { date: '2024-01-26', user: 'Ted Brown', message: 'Approved after budget verification' },
      { date: '2024-02-28', user: 'Delivery Team', message: 'Order delivered successfully. All items verified.' }
    ]
  }
];

// Mock available stock data for autosuggest
const availableStock = [
  { id: 1, name: 'Chef Knives', brand: 'Professional', stock: 25, unitPrice: 150.00 },
  { id: 2, name: 'Cutting Boards', brand: 'Premium Wood', stock: 50, unitPrice: 30.00 },
  { id: 3, name: 'Surgical Masks', brand: 'Medical Grade', stock: 1000, unitPrice: 1.00 },
  { id: 4, name: 'Latex Gloves', brand: 'SafeGuard', stock: 500, unitPrice: 0.50 },
  { id: 5, name: 'Antibiotics', brand: 'PharmaCorp', stock: 200, unitPrice: 25.00 },
  { id: 6, name: 'Pain Relievers', brand: 'MediCare', stock: 150, unitPrice: 15.00 }
];

// Tax slabs and offers
const taxSlabs = [
  { id: 1, name: 'GST 5%', rate: 5 },
  { id: 2, name: 'GST 12%', rate: 12 },
  { id: 3, name: 'GST 18%', rate: 18 },
  { id: 4, name: 'GST 28%', rate: 28 }
];

const offers = [
  { id: 1, name: 'Bulk Discount 10%', rate: 10, minQty: 100 },
  { id: 2, name: 'Early Bird 5%', rate: 5, minQty: 1 },
  { id: 3, name: 'Seasonal Offer 15%', rate: 15, minQty: 50 }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Partial': 'bg-orange-100 text-orange-800'
  };
  
  const icons = {
    'Pending': Clock,
    'Approved': CheckCircle,
    'Delivered': CheckCircle,
    'Cancelled': X,
    'Partial': AlertCircle
  };
  
  const Icon = icons[status as keyof typeof icons] || Clock;
  
  return (
    <Badge className={`${variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

const AutosuggestInput = ({ onSelect, placeholder }: { onSelect: (item: any) => void; placeholder: string }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      const filtered = availableStock.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.brand.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (item: any) => {
    setQuery(item.name);
    setShowSuggestions(false);
    onSelect(item);
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelect(item)}
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">{item.brand} - Stock: {item.stock} - ₹{item.unitPrice}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DetailedPOOverlay = ({ order, isOpen, onClose, isEdit = false }: {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
}) => {
  const [items, setItems] = useState(order?.items || []);
  const [selectedTaxSlab, setSelectedTaxSlab] = useState<number>(18);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(order?.paymentMethod || 'net-30');
  const [newRemark, setNewRemark] = useState('');
  
  // Determine if order can be edited based on status
  const isQuotation = order?.status === 'Pending';
  const isPartiallyFulfilled = order?.status === 'Partial';
  const isReadOnly = order?.status === 'Delivered' || order?.status === 'Cancelled';
  
  const addItem = (stockItem?: any) => {
    if (isReadOnly) return;
    
    if (stockItem) {
      setItems([...items, { 
        name: stockItem.name, 
        qty: 1, 
        unitPrice: stockItem.unitPrice, 
        discount: 0, 
        subtotal: stockItem.unitPrice,
        taxSlab: selectedTaxSlab 
      }]);
    } else {
      setItems([...items, { name: '', qty: 0, unitPrice: 0, discount: 0, subtotal: 0, taxSlab: selectedTaxSlab }]);
    }
  };

  const removeItem = (index: number) => {
    if (isReadOnly || isPartiallyFulfilled) return;
    setItems(items.filter((_: any, i: number) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    if (isPartiallyFulfilled && field !== 'qty') return; // Only allow qty changes for partial fulfillment
    
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    
    // Recalculate subtotal when qty or unitPrice changes
    if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
      const qty = updatedItems[index].qty || 0;
      const unitPrice = updatedItems[index].unitPrice || 0;
      const discount = updatedItems[index].discount || 0;
      updatedItems[index].subtotal = (qty * unitPrice) * (1 - discount / 100);
    }
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
    
    // Apply offer discount
    let offerDiscount = 0;
    if (selectedOffer) {
      const offer = offers.find(o => o.id === selectedOffer);
      if (offer) {
        const totalQty = items.reduce((sum: number, item: any) => sum + (item.qty || 0), 0);
        if (totalQty >= offer.minQty) {
          offerDiscount = subTotal * (offer.rate / 100);
        }
      }
    }
    
    const discountedTotal = subTotal - offerDiscount;
    const tax = discountedTotal * (selectedTaxSlab / 100);
    const shipping = 500.0;
    const total = discountedTotal + tax + shipping;
    
    return { subTotal, offerDiscount, tax, shipping, total, discountedTotal };
  };

  const totals = calculateTotals();
  const pendingBalance = (order?.total || totals.total) - (order?.paidAmount || 0);

  const addRemark = () => {
    if (!newRemark.trim()) return;
    
    const newRemarkObj = {
      date: new Date().toISOString().split('T')[0],
      user: 'Current User', // In real app, get from auth context
      message: newRemark
    };
    
    // In real app, this would be saved to backend
    setNewRemark('');
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Purchase Order - ${order?.poNumber || 'PO-2024-XXX'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .totals { text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Purchase Order</h1>
              <h2>${order?.poNumber || 'PO-2024-XXX'}</h2>
            </div>
            <div class="details">
              <p><strong>Vendor:</strong> ${order?.vendorName || ''}</p>
              <p><strong>Order Date:</strong> ${order?.orderDate || ''}</p>
              <p><strong>Delivery Date:</strong> ${order?.deliveryDate || ''}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
            <table>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Subtotal</th>
              </tr>
              ${items.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.unitPrice?.toFixed(2)}</td>
                  <td>${item.discount}%</td>
                  <td>₹${item.subtotal?.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            <div class="totals">
              <p><strong>Subtotal: ₹${totals.subTotal.toFixed(2)}</strong></p>
              <p><strong>Tax (${selectedTaxSlab}%): ₹${totals.tax.toFixed(2)}</strong></p>
              <p><strong>Shipping: ₹${totals.shipping.toFixed(2)}</strong></p>
              <p><strong>Total: ₹${totals.total.toFixed(2)}</strong></p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods = {
      'net-30': 'Net 30 Days',
      'net-15': 'Net 15 Days',
      'net-7': 'Net 7 Days',
      'cod': 'Cash on Delivery',
      'advance': 'Advance Payment',
      'pos': 'POS (Credit/Debit Card)',
      'bank-transfer': 'Bank Transfer'
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[75vw] overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Purchase Order' : 'Purchase Order Details'}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"><Paperclip className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Copy className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={handlePrintInvoice}><Printer className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Mail className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><FileText className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-6">
          {/* Order Summary - Split into two sections */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Section - Order Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">PO Number:</span>
                  <span className="font-medium">{order?.poNumber || 'PO-2024-XXX'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Placed Date:</span>
                  <span className="font-medium">{order?.orderDate || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expected Delivery:</span>
                  <span className="font-medium">{order?.deliveryDate || ''}</span>
                </div>
                {order?.fulfilmentDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fulfilled Date:</span>
                    <span className="font-medium text-green-600">{order.fulfilmentDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Status Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={order?.status || 'Pending'} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="font-bold text-lg">₹{(order?.total || totals.total).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Paid Amount</span>
                    <span className="font-medium text-green-600">₹{(order?.paidAmount || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Balance</span>
                    <span className={`font-bold ${pendingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{pendingBalance.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <span className="font-medium">{getPaymentMethodDisplay(order?.paymentMethod || paymentMethod)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Vendor Name</Label>
                <p className="font-medium">{order?.vendorName || ''}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Contact Person</Label>
                <p className="font-medium">{order?.vendorContact || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Phone</Label>
                <p className="font-medium">{order?.vendorPhone || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Email</Label>
                <p className="font-medium">{order?.vendorEmail || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm text-gray-600">Address</Label>
                <p className="font-medium">{order?.vendorAddress || order?.shippingAddress || ''}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </CardTitle>
                {!isReadOnly && (
                  <div className="flex items-center gap-2">
                    {isQuotation && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setShowScanner(!showScanner)}>
                          <QrCode className="h-4 w-4 mr-2" />
                          Scanner
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addItem()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {isPartiallyFulfilled && (
                <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Order is partially fulfilled. You can only adjust quantities for returns or damaged items.
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {showScanner && isQuotation && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Scan Options:</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                    <Button variant="outline" size="sm">
                      <Scan className="h-4 w-4 mr-2" />
                      Barcode
                    </Button>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      RFID
                    </Button>
                  </div>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      {!isReadOnly && <TableHead>Unit Price</TableHead>}
                      {!isReadOnly && <TableHead>Discount</TableHead>}
                      <TableHead>Subtotal</TableHead>
                      {!isReadOnly && <TableHead></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {isQuotation ? (
                            <AutosuggestInput
                              onSelect={(stockItem) => updateItem(index, 'name', stockItem.name)}
                              placeholder="Search products..."
                            />
                          ) : (
                            <span className="font-medium">{item.name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isReadOnly ? (
                            <span>{item.qty}</span>
                          ) : (
                            <Input 
                              type="number" 
                              value={item.qty} 
                              onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                              className="w-20" 
                            />
                          )}
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.unitPrice} 
                              onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                              className="w-24"
                              disabled={isPartiallyFulfilled}
                            />
                          </TableCell>
                        )}
                        {!isReadOnly && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Input 
                                type="number" 
                                value={item.discount} 
                                onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                                className="w-16"
                                disabled={isPartiallyFulfilled}
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <span className="font-medium">₹{item.subtotal?.toFixed(2)}</span>
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeItem(index)}
                              disabled={isPartiallyFulfilled}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {isQuotation && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => addItem()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                  <Button variant="outline" size="sm">
                    <Scan className="h-4 w-4 mr-2" />
                    Scan Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Terms & Shipping */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Terms & Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Payment Terms</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net-30">Net 30 (Payment due in 30 days)</SelectItem>
                      <SelectItem value="net-15">Net 15 (Payment due in 15 days)</SelectItem>
                      <SelectItem value="net-7">Net 7 (Payment due in 7 days)</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="advance">Advance Payment (100% upfront)</SelectItem>
                      <SelectItem value="pos">POS - Credit/Debit Card</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentMethod === 'pos' && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">POS Payment Details</h5>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>• Accepts Visa, MasterCard, American Express</p>
                      <p>• Processing fee: 2.9% + ₹30 per transaction</p>
                      <p>• Instant payment confirmation</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shipping & Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-shipping" defaultChecked disabled={isReadOnly} />
                  <Label htmlFor="include-shipping">Include shipping costs (₹500)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="express-delivery" disabled={isReadOnly} />
                  <Label htmlFor="express-delivery">Express delivery (+₹200)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="insurance" disabled={isReadOnly} />
                  <Label htmlFor="insurance">Insurance coverage (+₹100)</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Remarks Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Remarks & History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Existing remarks */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-600">Order History</h4>
                  {order?.remarks?.map((remark: any, index: number) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{remark.user}</span>
                          <span className="text-xs text-gray-500">{remark.date}</span>
                        </div>
                        <p className="text-sm">{remark.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new remark */}
                <div className="space-y-2">
                  <Label htmlFor="new-remark">Add Remark</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="new-remark"
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      placeholder="Add a comment about this order..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button onClick={addRemark} disabled={!newRemark.trim()}>
                      Add
                    </Button>
                  </div>
                </div>

                {/* Original notes */}
                {order?.notes && (
                  <div className="pt-3 border-t">
                    <Label className="text-sm text-gray-600">Original Notes</Label>
                    <p className="text-sm mt-1">{order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={isReadOnly}>
              {isQuotation ? 'Save Order' : 'Update Order'}
            </Button>
            <Button onClick={handlePrintInvoice} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
            {order?.status === 'Approved' && (
              <Button variant="outline" className="text-green-600 border-green-600">
                Mark as Delivered
              </Button>
            )}
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
