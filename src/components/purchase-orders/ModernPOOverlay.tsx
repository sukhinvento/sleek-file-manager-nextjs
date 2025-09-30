import { useState, useEffect, useRef } from 'react';
import { Save, Edit3, CheckCircle, Trash2, Plus, FileText, Mail, Copy, Printer, Truck, Package, User, CreditCard, MessageSquare, Calendar, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ModernInventoryOverlay } from '../inventory/ModernInventoryOverlay';
import { AutosuggestInput } from './AutosuggestInput';
import { PurchaseOrder, PurchaseOrderItem, StockItem } from '../../types/purchaseOrder';

// Mock vendor data for autocomplete
interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const mockVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'MedSupply Inc.',
    email: 'orders@medsupply.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Ave, Healthcare City, HC 12345'
  },
  {
    id: 'v2',
    name: 'PharmaCorp',
    email: 'procurement@pharmacorp.com',
    phone: '+1 (555) 987-6543',
    address: '456 Pharmacy St, Wellness Town, WT 67890'
  },
  {
    id: 'v3',
    name: 'HealthTech Solutions',
    email: 'sales@healthtech.com',
    phone: '+1 (555) 555-0123',
    address: '789 Innovation Blvd, Tech Valley, TV 54321'
  }
];

// Mock location data for shipping destinations
interface Location {
  id: string;
  name: string;
  address: string;
  type: 'warehouse' | 'clinic' | 'hospital';
}

const mockLocations: Location[] = [
  {
    id: 'l1',
    name: 'Main Warehouse',
    address: '123 Storage Street, Industrial Area, IN 12345',
    type: 'warehouse'
  },
  {
    id: 'l2',
    name: 'Central Hospital',
    address: '456 Health Avenue, Medical District, MD 67890',
    type: 'hospital'
  },
  {
    id: 'l3',
    name: 'Downtown Clinic',
    address: '789 Care Lane, Downtown, DT 54321',
    type: 'clinic'
  },
  {
    id: 'l4',
    name: 'Regional Distribution Center',
    address: '321 Logistics Blvd, Distribution Hub, DH 98765',
    type: 'warehouse'
  }
];

// Custom Vendor Autosuggest Component
interface VendorAutosuggestProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (vendor: Vendor) => void;
  vendors: Vendor[];
  disabled?: boolean;
  className?: string;
}

const VendorAutosuggest = ({ value, onChange, onSelect, vendors, disabled, className }: VendorAutosuggestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    if (value.trim() === '') {
      setFilteredVendors([]);
      setIsOpen(false);
      return;
    }

    const filtered = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(value.toLowerCase()) ||
      vendor.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredVendors(filtered);
    setIsOpen(filtered.length > 0);
  }, [value, vendors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleVendorSelect = (vendor: Vendor) => {
    onSelect(vendor);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (value.trim() && filteredVendors.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Search or enter vendor name"
        disabled={disabled}
        className="w-full"
      />
      {isOpen && filteredVendors.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0 transition-all duration-200"
              onClick={() => handleVendorSelect(vendor)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{vendor.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{vendor.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-2 shrink-0">
                  <Badge variant="outline" className="text-xs">Select</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Location Autosuggest Component
interface LocationAutosuggestProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
  locations: Location[];
  disabled?: boolean;
  className?: string;
}

const LocationAutosuggest = ({ value, onChange, onSelect, locations, disabled, className }: LocationAutosuggestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (value.trim() === '') {
      setFilteredLocations([]);
      setIsOpen(false);
      return;
    }

    const filtered = locations.filter(location =>
      location.name.toLowerCase().includes(value.toLowerCase()) ||
      location.address.toLowerCase().includes(value.toLowerCase()) ||
      location.type.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLocations(filtered);
    setIsOpen(filtered.length > 0);
  }, [value, locations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleLocationSelect = (location: Location) => {
    onSelect(location);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (value.trim() && filteredLocations.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warehouse': return 'bg-blue-100 text-blue-800';
      case 'hospital': return 'bg-green-100 text-green-800';
      case 'clinic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Textarea
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Search locations or enter custom address"
        disabled={disabled}
        className="w-full min-h-[60px]"
      />
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0 transition-all duration-200"
              onClick={() => handleLocationSelect(location)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-foreground text-sm truncate">{location.name}</div>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(location.type)}`}>
                      {location.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span className="truncate">{location.address}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-2 shrink-0">
                  <Badge variant="outline" className="text-xs">Select</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ModernPOOverlayProps {
  order: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (order: PurchaseOrder) => void;
  onUpdate?: (order: PurchaseOrder) => void;
  onDelete?: (orderId: string) => void;
}

export const ModernPOOverlay = ({
  order,
  isOpen,
  onClose,
  isEdit = false,
  onSave,
  onUpdate,
  onDelete
}: ModernPOOverlayProps) => {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [vendorName, setVendorName] = useState<string>('');
  const [vendorEmail, setVendorEmail] = useState<string>('');
  const [vendorPhone, setVendorPhone] = useState<string>('');
  const [vendorAddress, setVendorAddress] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('net-30');
  const [remarks, setRemarks] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(isEdit);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isNarrowLayout, setIsNarrowLayout] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize form data
  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setVendorName(order.vendorName || '');
      setVendorEmail(order.vendorEmail || '');
      setVendorPhone(order.vendorPhone || '');
      setVendorAddress(order.vendorAddress || '');
      setShippingAddress(order.shippingAddress || '');
      setOrderDate(order.orderDate || '');
      setDeliveryDate(order.deliveryDate || '');
      setPaymentMethod(order.paymentMethod || 'net-30');
      setRemarks(Array.isArray(order.remarks) ? order.remarks.map(r => r.message).join('\n') : order.remarks || '');
    } else {
      // Reset for new order
      setItems([]);
      setVendorName('');
      setVendorEmail('');
      setVendorPhone('');
      setVendorAddress('');
      setShippingAddress('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryDate('');
      setPaymentMethod('net-30');
      setRemarks('');
    }
    setIsEditMode(isEdit);
  }, [order, isEdit]);

  // Responsive layout: prefer viewport media query (more stable) with container fallback.
  useEffect(() => {
    if (!isOpen) return;

    // 1. Viewport-based media query (maps to Tailwind sm ~640px but we keep 1300px custom threshold)
    const mq = window.matchMedia('(max-width: 1300px)');
    const handleMQ = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsNarrowLayout(e.matches);
      if (process.env.NODE_ENV === 'development') {
        console.log('POOverlay media query', { viewportNarrow: e.matches, vw: window.innerWidth });
      }
    };
    handleMQ(mq); // initial
    mq.addEventListener('change', handleMQ as any);

    // 2. Optional container refinement: if container is artificially constrained wider/narrower than viewport.
    const el = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (el) {
      const measureContainer = () => {
        const cw = el.getBoundingClientRect().width;
        // Only force narrow if container itself shrinks below threshold while viewport is still wide.
        if (cw < 600 && !mq.matches) {
          setIsNarrowLayout(true);
          if (process.env.NODE_ENV === 'development') {
            console.log('POOverlay container override', { containerWidth: cw, vw: window.innerWidth });
          }
        }
      };
      measureContainer();
      ro = new ResizeObserver(measureContainer);
      ro.observe(el);
    }

    return () => {
      mq.removeEventListener('change', handleMQ as any);
      if (ro) ro.disconnect();
    };
  }, [isOpen]);

  const isReadOnly = order?.status === 'Delivered' || order?.status === 'Cancelled';

  const addItem = (stockItem?: StockItem) => {
    if (isReadOnly) return;

    if (stockItem) {
      setItems([...items, {
        name: stockItem.name,
        qty: 1,
        unitPrice: stockItem.unitPrice,
        discount: 0,
        subtotal: stockItem.unitPrice,
        taxSlab: 18
      }]);
    } else {
      setItems([...items, {
        name: '',
        qty: 1,
        unitPrice: 0,
        discount: 0,
        subtotal: 0,
        taxSlab: 18
      }]);
    }
  };

  const removeItem = (index: number) => {
    if (isReadOnly) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isReadOnly) return;

    const updatedItems = [...items];
    (updatedItems[index] as any)[field] = value;

    if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
      const qty = updatedItems[index].qty || 0;
      const unitPrice = updatedItems[index].unitPrice || 0;
      const discount = updatedItems[index].discount || 0;
      updatedItems[index].subtotal = (qty * unitPrice) * (1 - discount / 100);
    }

    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const tax = subTotal * 0.18; // 18% tax
    const shipping = 500.0;
    const total = subTotal + tax + shipping;
    return { subTotal, tax, shipping, total };
  };

  const totals = calculateTotals();

  const handleSaveOrder = async () => {
    if (!items.length) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the order.",
        variant: "destructive",
      });
      return;
    }

    if (!vendorName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter vendor name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const orderData: PurchaseOrder = {
        id: order?.id || `po-${Date.now()}`,
        poNumber: order?.poNumber || `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        vendorName,
        vendorContact: order?.vendorContact || '',
        vendorPhone,
        vendorEmail,
        vendorAddress,
        orderDate,
        deliveryDate,
        fulfilmentDate: order?.fulfilmentDate || null,
        status: order?.status || 'Pending',
        items,
        total: totals.total,
        paidAmount: order?.paidAmount || 0,
        createdBy: order?.createdBy || 'System',
        approvedBy: order?.approvedBy || '',
        notes: order?.notes || '',
        attachments: order?.attachments || 0,
        paymentMethod,
        shippingAddress,
        remarks: typeof remarks === 'string' ? [{ date: new Date().toISOString().split('T')[0], user: 'System', message: remarks }] : order?.remarks || [],
      };

      if (order && onUpdate) {
        await onUpdate(orderData);
        toast({
          title: "Order Updated",
          description: `Purchase order ${orderData.poNumber} has been updated successfully.`,
        });
      } else if (onSave) {
        await onSave(orderData);
        toast({
          title: "Order Created",
          description: `Purchase order ${orderData.poNumber} has been created successfully.`,
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order?.id || !onDelete) return;

    if (window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      try {
        await onDelete(order.id);
        toast({
          title: "Order Deleted",
          description: "Purchase order has been deleted successfully.",
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete order.",
          variant: "destructive",
        });
      }
    }
  };

  const headerActions = (
    <>
      {(isEditMode || !order) && (
        <Button onClick={handleSaveOrder} disabled={isSaving} className="bg-slate-600 hover:bg-slate-700 text-white">
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {order ? 'Update Order' : 'Save Order'}
            </>
          )}
        </Button>
      )}

      {!isEditMode && order && !isReadOnly && (
        <Button variant="outline" onClick={() => setIsEditMode(true)}>
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Order
        </Button>
      )}

      {order && order.status === 'Pending' && !isEditMode && (
        <Button variant="destructive" onClick={handleDeleteOrder}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      )}
    </>
  );

  const quickActions = (
    <>
      <Button variant="ghost" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button variant="ghost" size="sm">
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>
      <Button variant="ghost" size="sm">
        <Copy className="h-4 w-4 mr-2" />
        Duplicate
      </Button>
      <Button variant="ghost" size="sm">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
    </>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Approved': return 'approved';
      case 'Delivered': return 'delivered';
      case 'Cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Purchase Order ${order.poNumber}` : 'New Purchase Order'}
      subtitle={order ? `Created on ${order.orderDate} • Total: ₹${totals.total.toFixed(2)}` : 'Create a new purchase order'}
      status={order?.status}
      statusColor={getStatusColor(order?.status)}
      headerActions={headerActions}
      quickActions={quickActions}
      size="wide"
    >
      {/* Container for width monitoring */}
      <div ref={containerRef} className="h-full" data-po-overlay-version="v2025-09-29-2">

        {/* Wide Layout: Two Columns (Left & Right) */}
        {!isNarrowLayout ? (
          <div className="grid h-full" style={{ gridTemplateColumns: '30% 70%' }}>

            {/* Left Column - Summary, Vendor Info, Shipping, Order Details */}
            <div className="flex flex-col gap-4 p-6 overflow-y-auto">

              {/* Order Summary - Top */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{totals.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18%)</span>
                    <span className="font-medium">₹{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">₹{totals.shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">₹{totals.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Vendor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vendorSelect" className="text-xs font-medium text-muted-foreground">Select Vendor</Label>
                    <VendorAutosuggest
                      value={vendorName}
                      onChange={(value) => setVendorName(value)}
                      onSelect={(vendor) => {
                        setVendorName(vendor.name);
                        setVendorEmail(vendor.email);
                        setVendorPhone(vendor.phone);
                        setVendorAddress(vendor.address);
                      }}
                      vendors={mockVendors}
                      disabled={!isEditMode && !!order}
                      className="mt-1"
                    />
                  </div>

                  {vendorName && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Vendor Details</div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Email:</span> {vendorEmail || 'Not provided'}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {vendorPhone || 'Not provided'}</div>
                        <div><span className="text-muted-foreground">Address:</span> {vendorAddress || 'Not provided'}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingLocation" className="text-xs font-medium text-muted-foreground">Delivery Location</Label>
                    <LocationAutosuggest
                      value={shippingAddress}
                      onChange={(value) => setShippingAddress(value)}
                      onSelect={(location) => setShippingAddress(location.address)}
                      locations={mockLocations}
                      disabled={!isEditMode && !!order}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="orderDate" className="text-xs font-medium text-muted-foreground">Order Date</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      disabled={!isEditMode && !!order}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate" className="text-xs font-medium text-muted-foreground">Expected Delivery</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      disabled={!isEditMode && !!order}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod" className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!isEditMode && !!order}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net-30">Net 30 Days</SelectItem>
                        <SelectItem value="net-15">Net 15 Days</SelectItem>
                        <SelectItem value="net-7">Net 7 Days</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="advance">Advance Payment</SelectItem>
                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Products Table (Top) & Notes (Bottom) */}
            <div className="flex flex-col gap-4 p-6 h-full">

              {/* Products Table - Top Section (75% of screen) */}
              <Card className="flex flex-col" style={{ height: '75vh' }}>
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Order Items ({items.length})
                    </CardTitle>
                    {(isEditMode || !order) && (
                      <Button onClick={() => addItem()} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      No items added yet. Click "Add Item" to get started.
                    </div>
                  ) : (
                    <div className="h-full">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="w-20">Qty</TableHead>
                            <TableHead className="w-24">Price</TableHead>
                            <TableHead className="w-20">Disc%</TableHead>
                            <TableHead className="w-24">Subtotal</TableHead>
                            {(isEditMode || !order) && <TableHead className="w-12"></TableHead>}
                          </TableRow>
                        </TableHeader>
                      </Table>
                      <div style={{ height: '60vh', overflow: 'auto' }}>
                        <Table>
                          <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index} className='max-h-16'>
                              <TableCell className="relative overflow-visible">
                                {(isEditMode || !order) ? (
                                  <AutosuggestInput
                                    value={item.name}
                                    onChange={(value) => updateItem(index, 'name', value)}
                                    onSelect={(stockItem) => {
                                      updateItem(index, 'name', stockItem.name);
                                      updateItem(index, 'unitPrice', stockItem.unitPrice);
                                      updateItem(index, 'qty', 1);
                                      updateItem(index, 'discount', 0);
                                    }}
                                    placeholder="Search products..."
                                  />
                                ) : (
                                  <span className="font-medium">{item.name}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {(isEditMode || !order) ? (
                                  <Input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                                    className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    min="1"
                                  />
                                ) : (
                                  <span>{item.qty}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {(isEditMode || !order) ? (
                                  <Input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                    className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    min="0"
                                    step="0.01"
                                  />
                                ) : (
                                  <span>₹{item.unitPrice?.toFixed(2)}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {(isEditMode || !order) ? (
                                  <Input
                                    type="number"
                                    value={item.discount}
                                    onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                                    className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    min="0"
                                    max="100"
                                  />
                                ) : (
                                  <span>{item.discount}%</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">₹{item.subtotal?.toFixed(2)}</span>
                              </TableCell>
                              {(isEditMode || !order) && (
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes - Bottom Section (25% of remaining space) */}
              <Card className="flex-shrink-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any additional notes, special instructions, or comments for this purchase order..."
                    disabled={!isEditMode && !!order}
                    className="w-full min-h-[60px]"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Narrow Layout: Single Column (Rows) */
          <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">

            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totals.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-medium">₹{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">₹{totals.shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">₹{totals.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vendorSelect" className="text-xs font-medium text-muted-foreground">Select Vendor</Label>
                  <VendorAutosuggest
                    value={vendorName}
                    onChange={(value) => setVendorName(value)}
                    onSelect={(vendor) => {
                      setVendorName(vendor.name);
                      setVendorEmail(vendor.email);
                      setVendorPhone(vendor.phone);
                      setVendorAddress(vendor.address);
                    }}
                    vendors={mockVendors}
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>

                {vendorName && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Vendor Details</div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Email:</span> {vendorEmail || 'Not provided'}</div>
                      <div><span className="text-muted-foreground">Phone:</span> {vendorPhone || 'Not provided'}</div>
                      <div><span className="text-muted-foreground">Address:</span> {vendorAddress || 'Not provided'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shippingLocation" className="text-xs font-medium text-muted-foreground">Delivery Location</Label>
                  <LocationAutosuggest
                    value={shippingAddress}
                    onChange={(value) => setShippingAddress(value)}
                    onSelect={(location) => setShippingAddress(location.address)}
                    locations={mockLocations}
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="orderDate" className="text-xs font-medium text-muted-foreground">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate" className="text-xs font-medium text-muted-foreground">Expected Delivery</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod" className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!isEditMode && !!order}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net-30">Net 30 Days</SelectItem>
                      <SelectItem value="net-15">Net 15 Days</SelectItem>
                      <SelectItem value="net-7">Net 7 Days</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="advance">Advance Payment</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Order Items ({items.length})
                  </CardTitle>
                  {(isEditMode || !order) && (
                    <Button onClick={() => addItem()} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Product</Label>
                              {(isEditMode || !order) ? (
                                <AutosuggestInput
                                  value={item.name}
                                  onChange={(value) => updateItem(index, 'name', value)}
                                  onSelect={(stockItem) => {
                                    updateItem(index, 'name', stockItem.name);
                                    updateItem(index, 'unitPrice', stockItem.unitPrice);
                                    updateItem(index, 'qty', 1);
                                    updateItem(index, 'discount', 0);
                                  }}
                                  placeholder="Search products..."
                                />
                              ) : (
                                <div className="font-medium mt-1">{item.name}</div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
                                {(isEditMode || !order) ? (
                                  <Input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                                    className="mt-1 max-w-[60px]"
                                    min="1"
                                  />
                                ) : (
                                  <div className="mt-1 font-medium">{item.qty}</div>
                                )}
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Unit Price</Label>
                                {(isEditMode || !order) ? (
                                  <Input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                    className="mt-1"
                                    min="0"
                                    step="0.01"
                                  />
                                ) : (
                                  <div className="mt-1 font-medium">₹{item.unitPrice?.toFixed(2)}</div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Discount (%)</Label>
                                {(isEditMode || !order) ? (
                                  <Input
                                    type="number"
                                    value={item.discount}
                                    onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                                    className="mt-1"
                                    min="0"
                                    max="100"
                                  />
                                ) : (
                                  <div className="mt-1 font-medium">{item.discount}%</div>
                                )}
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Subtotal</Label>
                                <div className="mt-1 font-bold text-lg">₹{item.subtotal?.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>

                          {(isEditMode || !order) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      No items added yet. Click "Add Item" to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any additional notes, special instructions, or comments for this purchase order..."
                  disabled={!isEditMode && !!order}
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ModernInventoryOverlay>
  );
};
