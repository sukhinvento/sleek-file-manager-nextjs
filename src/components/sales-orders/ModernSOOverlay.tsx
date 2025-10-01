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
import { AutosuggestInput } from '../purchase-orders/AutosuggestInput';
import { SalesOrder, SalesOrderItem } from '../../types/inventory';
import { StockItem } from '../../types/purchaseOrder';
import { DatePicker } from "@/components/ui/date-picker";

// Mock customer data for autocomplete
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Downtown, DC 12345'
  },
  {
    id: 'c2',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Avenue, Suburbs, SB 67890'
  },
  {
    id: 'c3',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    phone: '+1 (555) 555-0123',
    address: '789 Pine Road, Uptown, UT 54321'
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

// Custom Customer Autosuggest Component
interface CustomerAutosuggestProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (customer: Customer) => void;
  customers: Customer[];
  disabled?: boolean;
  className?: string;
}

const CustomerAutosuggest = ({ value, onChange, onSelect, customers, disabled, className }: CustomerAutosuggestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  useEffect(() => {
    if (value.trim() === '') {
      setFilteredCustomers([]);
      setIsOpen(false);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(value.toLowerCase()) ||
      customer.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCustomers(filtered);
    // Only auto-open if user has interacted
    if (userHasInteracted) {
      setIsOpen(filtered.length > 0);
    }
  }, [value, customers, userHasInteracted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserHasInteracted(true);
    onChange(e.target.value);
  };

  const handleCustomerSelect = (customer: Customer) => {
    onSelect(customer);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setUserHasInteracted(true);
    if (value.trim() && filteredCustomers.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Search or enter customer name"
        disabled={disabled}
        className="w-full"
      />
      {isOpen && filteredCustomers.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0 transition-all duration-200"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCustomerSelect(customer);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{customer.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{customer.phone}</span>
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
  const [userHasInteracted, setUserHasInteracted] = useState(false);

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
    // Only auto-open if user has interacted
    if (userHasInteracted) {
      setIsOpen(filtered.length > 0);
    }
  }, [value, locations, userHasInteracted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserHasInteracted(true);
    onChange(e.target.value);
  };

  const handleLocationSelect = (location: Location) => {
    onSelect(location);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setUserHasInteracted(true);
    if (value.trim() && filteredLocations.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
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
              onMouseDown={(e) => {
                e.preventDefault();
                handleLocationSelect(location);
              }}
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

interface ModernSOOverlayProps {
  order: SalesOrder | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (order: SalesOrder) => void;
  onUpdate?: (order: SalesOrder) => void;
  onDelete?: (orderId: string) => void;
}

export const ModernSOOverlay = ({
  order,
  isOpen,
  onClose,
  isEdit = false,
  onSave,
  onUpdate,
  onDelete
}: ModernSOOverlayProps) => {
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [orderDate, setOrderDate] = useState<Date | undefined>(undefined);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
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
      setCustomerName(order.customerName || '');
      setCustomerEmail(order.customerEmail || '');
      setCustomerPhone(order.customerPhone || '');
      setCustomerAddress(order.customerAddress || '');
      setShippingAddress(order.shippingAddress || '');
      setOrderDate(order.orderDate ? new Date(order.orderDate) : undefined);
      setDeliveryDate(order.deliveryDate ? new Date(order.deliveryDate) : undefined);
      setPaymentMethod(order.paymentMethod || 'Credit Card');
      setRemarks(order.notes || '');
    } else {
      // Reset for new order
      setItems([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setShippingAddress('');
      setOrderDate(new Date());
      setDeliveryDate(undefined);
      setPaymentMethod('Credit Card');
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

    const newItem = stockItem ? {
      name: stockItem.name,
      qty: 1,
      unitPrice: stockItem.unitPrice,
      discount: 0,
      subtotal: stockItem.unitPrice
    } : {
      name: '',
      qty: 1,
      unitPrice: 0,
      discount: 0,
      subtotal: 0
    };
    
    // Add new item at the beginning of the array to push existing items down
    setItems([newItem, ...items]);
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

    if (!customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter customer name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const orderData: SalesOrder = {
        id: order?.id || `so-${Date.now()}`,
        orderNumber: order?.orderNumber || `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        orderDate: orderDate ? orderDate.toISOString().split('T')[0] : '',
        deliveryDate: deliveryDate ? deliveryDate.toISOString().split('T')[0] : '',
        dueDate: deliveryDate ? deliveryDate.toISOString().split('T')[0] : '',
        status: order?.status || 'Processing',
        items,
        total: totals.total,
        paymentStatus: order?.paymentStatus || 'Pending',
        paymentMethod,
        shippingAddress,
        billingAddress: order?.billingAddress || customerAddress,
        notes: remarks,
      };

      if (order && onUpdate) {
        await onUpdate(orderData);
        toast({
          title: "Order Updated",
          description: `Sales order ${orderData.orderNumber} has been updated successfully.`,
        });
      } else if (onSave) {
        await onSave(orderData);
        toast({
          title: "Order Created",
          description: `Sales order ${orderData.orderNumber} has been created successfully.`,
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

    if (window.confirm('Are you sure you want to delete this sales order? This action cannot be undone.')) {
      try {
        await onDelete(order.id);
        toast({
          title: "Order Deleted",
          description: "Sales order has been deleted successfully.",
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

      {order && order.status === 'Processing' && !isEditMode && (
        <Button variant="destructive" onClick={handleDeleteOrder}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      )}
    </>
  );

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: "Exporting sales order to PDF...",
    });
    // PDF export implementation would go here
  };

  const handleEmail = () => {
    if (!order) return;
    const subject = `Sales Order ${order.orderNumber}`;
    const body = `Sales Order Details:\n\nSO Number: ${order.orderNumber}\nCustomer: ${order.customerName}\nStatus: ${order.status}\nTotal: $${order.total.toFixed(2)}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleDuplicate = () => {
    if (!order || !onSave) return;
    const duplicatedOrder: SalesOrder = {
      ...order,
      id: `SO-${Date.now()}`,
      orderNumber: `SO-${Date.now()}`,
      status: 'Processing',
      orderDate: new Date().toISOString().split('T')[0],
    };
    onSave(duplicatedOrder);
    toast({
      title: "Order Duplicated",
      description: `Created duplicate order ${duplicatedOrder.orderNumber}`,
    });
    onClose();
  };

  const handlePrint = () => {
    // Small delay to ensure the print styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
    toast({
      title: "Print",
      description: "Opening print dialog...",
    });
  };

  const quickActions = (
    <>
      <Button variant="ghost" size="sm" onClick={handleExportPDF}>
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button variant="ghost" size="sm" onClick={handleEmail}>
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDuplicate} disabled={!order}>
        <Copy className="h-4 w-4 mr-2" />
        Duplicate
      </Button>
      <Button variant="ghost" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
    </>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Processing': return 'pending';
      case 'Shipped': return 'approved';
      case 'Delivered': return 'delivered';
      case 'Cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Sales Order ${order.orderNumber}` : 'New Sales Order'}
      subtitle={order ? `Created on ${order.orderDate} • Total: ₹${totals.total.toFixed(2)}` : 'Create a new sales order'}
      status={order?.status}
      statusColor={getStatusColor(order?.status)}
      headerActions={headerActions}
      quickActions={quickActions}
      size="wide"
    >
      {/* Container for width monitoring */}
      <div ref={containerRef} className="h-full" data-so-overlay-version="v2025-09-29-2">

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

              {/* Customer Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerSelect" className="text-xs font-medium text-muted-foreground">Select Customer</Label>
                    <CustomerAutosuggest
                      value={customerName}
                      onChange={(value) => setCustomerName(value)}
                      onSelect={(customer) => {
                        setCustomerName(customer.name);
                        setCustomerEmail(customer.email);
                        setCustomerPhone(customer.phone);
                        setCustomerAddress(customer.address);
                      }}
                      customers={mockCustomers}
                      disabled={!isEditMode && !!order}
                      className="mt-1"
                    />
                  </div>

                  {customerName && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Customer Details</div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Email:</span> {customerEmail || 'Not provided'}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {customerPhone || 'Not provided'}</div>
                        <div><span className="text-muted-foreground">Address:</span> {customerAddress || 'Not provided'}</div>
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
                    <div className="mt-1">
                      <DatePicker
                        date={orderDate}
                        onDateChange={setOrderDate}
                        placeholder="Select order date"
                        disabled={!isEditMode && !!order}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate" className="text-xs font-medium text-muted-foreground">Expected Delivery</Label>
                    <div className="mt-1">
                      <DatePicker
                        date={deliveryDate}
                        onDateChange={setDeliveryDate}
                        placeholder="Select delivery date"
                        disabled={!isEditMode && !!order}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod" className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!isEditMode && !!order}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
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
                            <TableHead className="min-w-72">Product</TableHead>
                            <TableHead className="min-w-20">Qty</TableHead>
                            <TableHead className="min-w-24">Price</TableHead>
                            <TableHead className="min-w-20">Disc%</TableHead>
                            <TableHead className="min-w-24">Subtotal</TableHead>
                            {(isEditMode || !order) && <TableHead className="w-12"></TableHead>}
                          </TableRow>
                        </TableHeader>
                      </Table>
                      <div style={{ height: '60vh', overflow: 'auto' }}>
                        <Table>
                          <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index} className='max-h-16'>
                              <TableCell className="relative overflow-visible min-w-72">
                                {(isEditMode || !order) ? (
                                   <AutosuggestInput
                                     value={item.name}
                                     onChange={(value) => updateItem(index, 'name', value)}
                                     onSelect={(stockItem) => {
                                       updateItem(index, 'name', stockItem.name);
                                       updateItem(index, 'unitPrice', stockItem.unitPrice);
                                       updateItem(index, 'qty', 1);
                                       updateItem(index, 'discount', 0);
                                       // Auto-add new empty row after selection
                                       if (index === items.length - 1) {
                                         addItem();
                                       }
                                     }}
                                     placeholder="Search products..."
                                   />
                                ) : (
                                  <span className="font-medium">{item.name}</span>
                                )}
                              </TableCell>
                              <TableCell className="min-w-20">
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
                              <TableCell className="min-w-24">
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
                              <TableCell className="min-w-20">
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

            {/* Customer Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerSelect" className="text-xs font-medium text-muted-foreground">Select Customer</Label>
                  <CustomerAutosuggest
                    value={customerName}
                    onChange={(value) => setCustomerName(value)}
                    onSelect={(customer) => {
                      setCustomerName(customer.name);
                      setCustomerEmail(customer.email);
                      setCustomerPhone(customer.phone);
                      setCustomerAddress(customer.address);
                    }}
                    customers={mockCustomers}
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>

                {customerName && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Customer Details</div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Email:</span> {customerEmail || 'Not provided'}</div>
                      <div><span className="text-muted-foreground">Phone:</span> {customerPhone || 'Not provided'}</div>
                      <div><span className="text-muted-foreground">Address:</span> {customerAddress || 'Not provided'}</div>
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
                  <div className="mt-1">
                    <DatePicker
                      date={orderDate}
                      onDateChange={setOrderDate}
                      placeholder="Select order date"
                      disabled={!isEditMode && !!order}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryDate" className="text-xs font-medium text-muted-foreground">Expected Delivery</Label>
                  <div className="mt-1">
                    <DatePicker
                      date={deliveryDate}
                      onDateChange={setDeliveryDate}
                      placeholder="Select delivery date"
                      disabled={!isEditMode && !!order}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="paymentMethod" className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!isEditMode && !!order}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
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
                        <div className="flex items-start gap-3">
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
                                    // Auto-add new empty row after selection
                                    if (index === items.length - 1) {
                                      addItem();
                                    }
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
                                    className="mt-1 min-w-[60px]"
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
                            <div className="bg-muted/30 rounded-lg p-2 flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                  placeholder="Add any additional notes, special instructions, or comments for this sales order..."
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
