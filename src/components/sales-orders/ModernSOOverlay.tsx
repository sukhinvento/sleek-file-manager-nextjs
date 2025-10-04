import { useState, useEffect, useRef } from 'react';
import { Save, Edit3, CheckCircle, Trash2, Plus, FileText, Mail, Copy, Printer, Truck, Package, User, CreditCard, MessageSquare, Calendar, DollarSign, Building2, Phone as PhoneIcon, Mail as MailIcon, MapPin, AlertCircle, Tag, Hash, UserCheck, Smartphone } from 'lucide-react';
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
import { ItemScanner } from '../scanner/ItemScanner';
import { SalesOrder, SalesOrderItem, InventoryItem } from '../../types/inventory';
import { StockItem } from '../../types/purchaseOrder';
import { DatePicker } from "@/components/ui/date-picker";
import { formatIndianCurrency, formatIndianCurrencyFull } from '@/lib/utils';
import { InvoiceOptionsDialog, InvoiceGenerationOptions } from '../invoice/InvoiceOptionsDialog';
import { InvoiceTemplate, InvoiceData } from '../invoice/InvoiceTemplate';
import { generatePDF } from '@/lib/pdfUtils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { OrderStatusDialog, StatusUpdateData, OrderItem } from '../orders/OrderStatusDialog';

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

// Mock inventory database for scanner
const mockInventory: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Paracetamol 500mg',
    category: 'Medicines',
    sku: 'MED-PAR-500',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitPrice: 5.99,
    supplier: 'PharmaCorp',
    location: 'Shelf A-12',
    description: 'Pain relief medication',
    batchNumber: 'BATCH-2025-001',
    saleUnit: 'Strip',
    barcode: '1234567890128',
    barcodeType: 'EAN-13',
    qrCode: 'QR-INV-001',
    rfidTag: 'A1B2C3D4E5F67890ABCDEF12',
    trackingEnabled: true
  },
  {
    id: 'INV-002',
    name: 'Amoxicillin 250mg',
    category: 'Antibiotics',
    sku: 'MED-AMX-250',
    currentStock: 200,
    minStock: 75,
    maxStock: 600,
    unitPrice: 12.50,
    supplier: 'MediSupply Co',
    location: 'Shelf B-05',
    description: 'Antibiotic medication',
    batchNumber: 'BATCH-2025-002',
    saleUnit: 'Strip',
    barcode: '9876543210987',
    barcodeType: 'EAN-13',
    qrCode: 'QR-INV-002',
    rfidTag: 'B2C3D4E5F6G78901BCDEF123',
    trackingEnabled: true
  },
  {
    id: 'INV-003',
    name: 'Ibuprofen 400mg',
    category: 'Medicines',
    sku: 'MED-IBU-400',
    currentStock: 300,
    minStock: 100,
    maxStock: 800,
    unitPrice: 8.75,
    supplier: 'PharmaCorp',
    location: 'Shelf A-15',
    description: 'Anti-inflammatory medication',
    batchNumber: 'BATCH-2025-003',
    saleUnit: 'Strip',
    barcode: '5555666677778',
    barcodeType: 'EAN-13',
    qrCode: 'QR-INV-003',
    rfidTag: 'C3D4E5F6G7H89012CDEF1234',
    trackingEnabled: true
  }
];

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

  // Invoice generation states
  const [showInvoiceOptions, setShowInvoiceOptions] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<'print' | 'pdf' | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [invoiceOptions, setInvoiceOptions] = useState<InvoiceGenerationOptions>({
    includeQRCode: true,
    qrCodeContent: 'basic',
    showItemQRCodes: false,
  });

  // Order status management
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  const handleItemScanned = (item: InventoryItem, quantity?: number) => {
    if (isReadOnly) return;

    const newItem: SalesOrderItem = {
      name: item.name,
      qty: quantity || 1,
      unitPrice: item.unitPrice || 0,
      discount: 0,
      subtotal: (quantity || 1) * (item.unitPrice || 0)
    };
    
    setItems([newItem, ...items]);
    
    toast({
      title: "Item Added via Scanner",
      description: `${item.name} - Qty: ${quantity || 1}`,
    });
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

  const handleMarkComplete = () => {
    if (order) {
      // Update order status to Delivered
      toast({
        title: "Order Completed",
        description: `Sales order ${order.orderNumber} marked as delivered.`,
      });
      // Would call onUpdate if we had it, for now just show toast
      onClose();
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {order && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowStatusDialog(true)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Update Status
        </Button>
      )}
      
      {(isEditMode || !order) && (
        <Button onClick={handleSaveOrder} disabled={isSaving} size="sm" className="bg-slate-600 hover:bg-slate-700 text-white">
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              {order ? 'Update' : 'Create'}
            </>
          )}
        </Button>
      )}

      {!isEditMode && order && !isReadOnly && (
        <>
          {onDelete && order.status !== 'Delivered' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeleteOrder}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </>
      )}

      {order && order.status === 'Processing' && !isEditMode && (
        <Button size="sm" onClick={handleMarkComplete} className="bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="h-4 w-4 mr-1" />
          Mark Complete
        </Button>
      )}
    </div>
  );

  const handleExportPDF = () => {
    if (!order) {
      toast({
        title: "No Order Data",
        description: "Please save the order before exporting to PDF.",
        variant: "destructive",
      });
      return;
    }
    setInvoiceMode('pdf');
    setShowInvoiceOptions(true);
  };

  const handleEmail = () => {
    if (!order) return;
    const subject = `Sales Order ${order.orderNumber}`;
    const body = `Sales Order Details:\n\nSO Number: ${order.orderNumber}\nCustomer: ${order.customerName}\nStatus: ${order.status}\nTotal: ₹${order.total.toFixed(2)}`;
    window.open(`mailto:${order.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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

  const handleStatusUpdate = (statusData: StatusUpdateData) => {
    if (!order || !onSave) return;

    // Validate and map status to allowed values
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Partially Shipped'] as const;
    const mappedStatus = validStatuses.includes(statusData.status as any) 
      ? statusData.status as typeof validStatuses[number]
      : 'Pending';

    // Update the order with new status and item fulfillment data
    const updatedOrder: SalesOrder = {
      ...order,
      status: mappedStatus,
    };

    // Update items with fulfillment data if provided
    if (statusData.items) {
      updatedOrder.items = items.map((item, index) => {
        const statusItem = statusData.items?.find(si => 
          (item.id && si.id === item.id) || si.name === item.name
        ) || statusData.items?.[index];
        
        if (statusItem) {
          return {
            ...item,
            id: item.id || `item-${index}`,
            fulfilledQty: statusItem.fulfilledQty,
            returnedQty: statusItem.returnedQty,
            damagedQty: statusItem.damagedQty,
          };
        }
        return item;
      });
      setItems(updatedOrder.items);
    }

    // Save the order (dialog already closed by this point)
    try {
      onSave(updatedOrder);
      
      toast({
        title: "Status Updated",
        description: `Order ${order.orderNumber} status changed to ${statusData.status}`,
      });

      // If there are damaged or returned items, show additional info
      if (statusData.items) {
        const damagedTotal = statusData.items.reduce((sum, item) => sum + (item.damagedQty || 0), 0);
        const returnedTotal = statusData.items.reduce((sum, item) => sum + (item.returnedQty || 0), 0);
        
        if (damagedTotal > 0 || returnedTotal > 0) {
          setTimeout(() => {
            toast({
              title: "Fulfillment Summary",
              description: `${returnedTotal > 0 ? `Returned: ${returnedTotal} items. ` : ''}${damagedTotal > 0 ? `Damaged: ${damagedTotal} items.` : ''}`,
              variant: damagedTotal > 0 ? "destructive" : "default",
            });
          }, 1000);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (!order) {
      toast({
        title: "No Order Data",
        description: "Please save the order before printing.",
        variant: "destructive",
      });
      return;
    }
    setInvoiceMode('print');
    setShowInvoiceOptions(true);
  };

  const generateInvoiceData = (): InvoiceData => {
    const qrCodeData = invoiceOptions.qrCodeContent === 'basic' 
      ? JSON.stringify({
          type: 'sales',
          number: order?.orderNumber || '',
          date: order?.orderDate || '',
          total: totals.total,
          customer: customerName,
        })
      : JSON.stringify({
          type: 'sales',
          orderNumber: order?.orderNumber || '',
          orderDate: order?.orderDate || '',
          deliveryDate: order?.deliveryDate || '',
          customerName,
          customerPhone,
          customerEmail,
          items: items.map(item => ({
            name: item.name,
            qty: item.qty,
            rate: item.unitPrice,
            amount: item.subtotal,
          })),
          subtotal: totals.subTotal,
          tax: totals.tax,
          total: totals.total,
          paymentMethod,
        });

    return {
      type: 'sales',
      invoiceNumber: order?.orderNumber || `INV-DRAFT-${Date.now()}`,
      invoiceDate: order?.orderDate || new Date().toISOString().split('T')[0],
      dueDate: order?.dueDate,
      
      // Company Info (You can customize this)
      companyName: 'Your Company Name',
      companyAddress: '123 Business Street, City, State 12345',
      companyPhone: '+91 1234567890',
      companyEmail: 'info@yourcompany.com',
      companyGST: 'GSTIN1234567890',
      
      // Customer Info
      partyName: customerName,
      partyAddress: customerAddress,
      partyPhone: customerPhone,
      partyEmail: customerEmail,
      
      // Shipping Info
      shippingAddress: shippingAddress || customerAddress,
      
      // Items
      items: items.map((item, index) => ({
        ...item,
        saleUnit: item.saleUnit || 'Unit',
        qrCode: invoiceOptions.showItemQRCodes 
          ? JSON.stringify({
              name: item.name,
              qty: item.qty,
              price: item.unitPrice,
              total: item.subtotal,
              index: index + 1
            })
          : undefined,
      })),
      
      // Financial
      subtotal: totals.subTotal,
      taxAmount: totals.tax,
      discount: 0,
      total: totals.total,
      paidAmount: 0,
      
      // Additional
      notes: remarks,
      paymentMethod,
      terms: 'Payment terms as per agreement. Goods once sold will not be taken back.',
      
      // QR Code
      includeQRCode: invoiceOptions.includeQRCode,
      qrCodeData: invoiceOptions.includeQRCode ? qrCodeData : undefined,
      showItemQRCodes: invoiceOptions.showItemQRCodes,
    };
  };

  const handleInvoiceOptionsGenerate = async (options: InvoiceGenerationOptions) => {
    setInvoiceOptions(options);
    setShowInvoiceOptions(false);
    
    // Small delay to ensure state is updated
    setTimeout(async () => {
      if (invoiceMode === 'print') {
        // Create a hidden container for rendering the invoice
        const hiddenContainer = document.createElement('div');
        hiddenContainer.style.position = 'absolute';
        hiddenContainer.style.left = '-9999px';
        hiddenContainer.style.top = '0';
        document.body.appendChild(hiddenContainer);
        
        // Render invoice to hidden container
        const { createRoot } = await import('react-dom/client');
        const root = createRoot(hiddenContainer);
        
        const invoiceData = generateInvoiceData();
        root.render(<InvoiceTemplate data={invoiceData} />);
        
        // Wait for render, then print
        setTimeout(() => {
          const printContent = hiddenContainer.querySelector('div');
          if (printContent) {
            // Create a hidden iframe for printing
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
            
            const iframeDoc = iframe.contentWindow?.document;
            if (iframeDoc) {
              iframeDoc.open();
              iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Print Invoice - ${order?.orderNumber}</title>
                    <meta charset="utf-8">
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      body { 
                        font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: white;
                        padding: 20px;
                      }
                      @media print {
                        body { padding: 0; }
                        @page { 
                          margin: 1cm;
                          size: A4 portrait;
                        }
                      }
                      /* Tailwind-like utilities */
                      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                      .text-xs { font-size: 0.75rem; line-height: 1rem; }
                      .text-base { font-size: 1rem; line-height: 1.5rem; }
                      .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
                      .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
                      .text-2xl { font-size: 1.5rem; line-height: 2rem; }
                      .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
                      .text-\\[10px\\] { font-size: 10px; line-height: 14px; }
                      .font-bold { font-weight: 700; }
                      .font-semibold { font-weight: 600; }
                      .font-medium { font-weight: 500; }
                      .font-normal { font-weight: 400; }
                      .text-gray-500 { color: #6b7280; }
                      .text-gray-600 { color: #4b5563; }
                      .text-gray-700 { color: #374151; }
                      .text-gray-800 { color: #1f2937; }
                      .text-gray-900 { color: #111827; }
                      .text-black { color: #000; }
                      .text-white { color: #fff; }
                      .text-blue-600 { color: #2563eb; }
                      .text-red-600 { color: #dc2626; }
                      .text-green-600 { color: #16a34a; }
                      .bg-black { background-color: #000; }
                      .bg-white { background-color: #fff; }
                      .bg-gray-50 { background-color: #f9fafb; }
                      .bg-gray-800 { background-color: #1f2937; }
                      .bg-gray-900 { background-color: #111827; }
                      .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
                      .border-2 { border-width: 2px; }
                      .border-4 { border-width: 4px; }
                      .border-t { border-top-width: 1px; border-top-style: solid; }
                      .border-t-2 { border-top-width: 2px; border-top-style: solid; }
                      .border-b-4 { border-bottom-width: 4px; border-bottom-style: solid; }
                      .border-black { border-color: #000; }
                      .border-gray-300 { border-color: #d1d5db; }
                      .border-gray-800 { border-color: #1f2937; }
                      .border-gray-900 { border-color: #111827; }
                      .p-2 { padding: 0.5rem; }
                      .p-3 { padding: 0.75rem; }
                      .p-4 { padding: 1rem; }
                      .p-6 { padding: 1.5rem; }
                      .p-8 { padding: 2rem; }
                      .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
                      .px-4 { padding-left: 1rem; padding-right: 1rem; }
                      .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
                      .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                      .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
                      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                      .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
                      .pb-4 { padding-bottom: 1rem; }
                      .pb-6 { padding-bottom: 1.5rem; }
                      .pt-2 { padding-top: 0.5rem; }
                      .pt-3 { padding-top: 0.75rem; }
                      .pt-4 { padding-top: 1rem; }
                      .pt-6 { padding-top: 1.5rem; }
                      .p-2\\.5 { padding: 0.625rem; }
                      .px-2\\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
                      .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
                      .mb-1 { margin-bottom: 0.25rem; }
                      .mb-1\\.5 { margin-bottom: 0.375rem; }
                      .mb-2 { margin-bottom: 0.5rem; }
                      .mb-3 { margin-bottom: 0.75rem; }
                      .mb-4 { margin-bottom: 1rem; }
                      .mb-6 { margin-bottom: 1.5rem; }
                      .mt-0\\.5 { margin-top: 0.125rem; }
                      .mt-1 { margin-top: 0.25rem; }
                      .mt-1\\.5 { margin-top: 0.375rem; }
                      .mt-2 { margin-top: 0.5rem; }
                      .mt-4 { margin-top: 1rem; }
                      .mt-6 { margin-top: 1.5rem; }
                      .mt-8 { margin-top: 2rem; }
                      .ml-4 { margin-left: 1rem; }
                      .ml-6 { margin-left: 1.5rem; }
                      .gap-1\\.5 { gap: 0.375rem; }
                      .gap-2 { gap: 0.5rem; }
                      .gap-4 { gap: 1rem; }
                      .gap-6 { gap: 1.5rem; }
                      .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
                      .space-y-1 > * + * { margin-top: 0.25rem; }
                      .space-y-1\\.5 > * + * { margin-top: 0.375rem; }
                      .space-y-2 > * + * { margin-top: 0.5rem; }
                      .w-72 { width: 18rem; }
                      .w-80 { width: 20rem; }
                      .h-2\\.5 { height: 0.625rem; }
                      .h-3 { height: 0.75rem; }
                      .h-4 { height: 1rem; }
                      .h-6 { height: 1.5rem; }
                      .h-8 { height: 2rem; }
                      .h-12 { height: 3rem; }
                      .h-16 { height: 4rem; }
                      .w-2\\.5 { width: 0.625rem; }
                      .w-3 { width: 0.75rem; }
                      .w-4 { width: 1rem; }
                      .w-6 { width: 1.5rem; }
                      .w-8 { width: 2rem; }
                      .print\\:p-3:is([data-print]) { padding: 0.75rem; }
                      .flex { display: flex; }
                      .inline-block { display: inline-block; }
                      .flex-shrink-0 { flex-shrink: 0; }
                      .items-center { align-items: center; }
                      .items-start { align-items: flex-start; }
                      .items-end { align-items: flex-end; }
                      .justify-between { justify-content: space-between; }
                      .justify-center { justify-content: center; }
                      .justify-end { justify-content: flex-end; }
                      .text-left { text-align: left; }
                      .text-right { text-align: right; }
                      .text-center { text-align: center; }
                      .uppercase { text-transform: uppercase; }
                      .tracking-wide { letter-spacing: 0.025em; }
                      .whitespace-pre-line { white-space: pre-line; }
                      .space-y-1 > * + * { margin-top: 0.25rem; }
                      .space-y-2 > * + * { margin-top: 0.5rem; }
                      table { width: 100%; border-collapse: collapse; }
                      .w-full { width: 100%; }
                      .w-80 { width: 20rem; }
                      .flex-1 { flex: 1 1 0%; }
                      .max-w-4xl { max-width: 56rem; margin: 0 auto; }
                      .mx-auto { margin-left: auto; margin-right: auto; }
                      .grid { display: grid; }
                      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                      svg { display: inline-block; vertical-align: middle; }
                      .h-3 { height: 0.75rem; }
                      .h-4 { height: 1rem; }
                      .h-8 { height: 2rem; }
                      .h-16 { height: 4rem; }
                      .w-3 { width: 0.75rem; }
                      .w-4 { width: 1rem; }
                      .w-8 { width: 2rem; }
                      .ml-6 { margin-left: 1.5rem; }
                    </style>
                  </head>
                  <body>
                    ${printContent.innerHTML}
                  </body>
                </html>
              `);
              iframeDoc.close();
              
              // Wait for content to load, then trigger print
              iframe.onload = () => {
                setTimeout(() => {
                  iframe.contentWindow?.focus();
                  iframe.contentWindow?.print();
                  
                  // Clean up after printing
                  setTimeout(() => {
                    document.body.removeChild(iframe);
                    root.unmount();
                    document.body.removeChild(hiddenContainer);
                  }, 100);
                }, 100);
              };
            }
          }
        }, 300);
      } else if (invoiceMode === 'pdf') {
        setShowInvoicePreview(true);
        // Small delay to ensure DOM is rendered
        setTimeout(async () => {
          if (invoiceRef.current && order) {
            try {
              const filename = `INV-${order.orderNumber}.pdf`;
              await generatePDF(invoiceRef.current, {
                filename,
                orientation: 'portrait',
                format: 'a4',
                quality: 2,
              });
              toast({
                title: 'PDF Generated',
                description: `Invoice has been exported as ${filename}`,
              });
              setShowInvoicePreview(false);
            } catch (error) {
              toast({
                title: 'Export Failed',
                description: 'Failed to generate PDF. Please try again.',
                variant: 'destructive',
              });
            }
          }
        }, 500);
      }
    }, 150);
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
    <>
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Sales Order ${order.orderNumber}` : 'New Sales Order'}
      subtitle={order ? `Created on ${order.orderDate} • Total: ${formatIndianCurrencyFull(totals.total)}` : 'Create a new sales order'}
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
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatIndianCurrencyFull(totals.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18%)</span>
                    <span className="font-medium">{formatIndianCurrencyFull(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{formatIndianCurrencyFull(totals.shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">{formatIndianCurrencyFull(totals.total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerSelect" className="text-xs font-medium flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      Select Customer
                    </Label>
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
                        <div className="flex items-center gap-1.5">
                          <MailIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Email:</span> {customerEmail || 'Not provided'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Phone:</span> {customerPhone || 'Not provided'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Address:</span> {customerAddress || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingLocation" className="text-xs font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      Delivery Location
                    </Label>
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
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="orderDate" className="text-xs font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      Order Date
                    </Label>
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
                    <Label htmlFor="deliveryDate" className="text-xs font-medium flex items-center gap-1">
                      <Truck className="h-3 w-3 text-green-600" />
                      Expected Delivery
                    </Label>
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
                    <Label htmlFor="paymentMethod" className="text-xs font-medium flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      Payment Method
                    </Label>
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
              <Card className="flex flex-col border-border/50 shadow-sm" style={{ height: '75vh' }}>
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Order Items ({items.length})
                    </CardTitle>
                    {(isEditMode || !order) && (
                      <div className="flex gap-2">
                        <ItemScanner 
                          onItemScanned={handleItemScanned}
                          existingItems={[]}
                          disabled={isReadOnly}
                        />
                        <Button onClick={() => addItem()} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      No items added yet. Click "Add Item" to get started.
                    </div>
                  ) : (
                    <div className="h-full overflow-auto" style={{ height: '60vh' }}>
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="w-[36%]">Product</TableHead>
                            <TableHead className="w-[14%]">Qty</TableHead>
                            <TableHead className="w-[15%]">Price</TableHead>
                            <TableHead className="w-[10%]">Disc%</TableHead>
                            <TableHead className="w-[15%]">Subtotal</TableHead>
                            {(isEditMode || !order) && <TableHead className="w-[10%]"></TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="relative overflow-visible py-2 break-words">
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
                                  <span className="font-medium whitespace-normal break-words leading-tight">{item.name}</span>
                                )}
                              </TableCell>
                              <TableCell className="p-2">
                                {(isEditMode || !order) ? (
                                  <Input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                                    className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    min="1"
                                  />
                                ) : (
                                  <span className="whitespace-nowrap">{item.qty}</span>
                                )}
                              </TableCell>
                              <TableCell className="p-2">
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
                                  <span className="whitespace-nowrap">{formatIndianCurrencyFull(item.unitPrice || 0)}</span>
                                )}
                              </TableCell>
                              <TableCell className="p-2">
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
                                  <span className="whitespace-nowrap">{item.discount}%</span>
                                )}
                              </TableCell>
                              <TableCell className="p-2">
                                <span className="font-medium whitespace-nowrap">{formatIndianCurrencyFull(item.subtotal || 0)}</span>
                              </TableCell>
                              {(isEditMode || !order) && (
                                <TableCell className="p-2">
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
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes - Bottom Section (25% of remaining space) */}
              <Card className="flex-shrink-0 border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
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
                  <span className="font-medium">{formatIndianCurrencyFull(totals.subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-medium">{formatIndianCurrencyFull(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{formatIndianCurrencyFull(totals.shipping)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">{formatIndianCurrencyFull(totals.total)}</span>
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
                    <div className="flex gap-2">
                      <ItemScanner 
                        onItemScanned={handleItemScanned}
                        existingItems={[]}
                        disabled={isReadOnly}
                      />
                      <Button onClick={() => addItem()} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
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
                                  <div className="mt-1 font-medium">{formatIndianCurrencyFull(item.unitPrice || 0)}</div>
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
                                <div className="mt-1 font-bold text-lg">{formatIndianCurrencyFull(item.subtotal || 0)}</div>
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

    {/* Invoice Options Dialog */}
    <InvoiceOptionsDialog
      isOpen={showInvoiceOptions}
      onClose={() => {
        setShowInvoiceOptions(false);
        setInvoiceMode(null);
      }}
      onGenerate={handleInvoiceOptionsGenerate}
      type={invoiceMode || 'print'}
    />

    {/* Invoice Preview Dialog */}
    <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="print:p-0">
          <InvoiceTemplate ref={invoiceRef} data={generateInvoiceData()} />
        </div>
      </DialogContent>
    </Dialog>

    {/* Order Status Dialog */}
    {order && (
      <OrderStatusDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        orderType="sales"
        orderNumber={order.orderNumber}
        currentStatus={order.status}
        items={items.map((item, index) => ({
          id: item.id || `item-${index}`,
          name: item.name,
          qty: item.qty,
          fulfilledQty: item.fulfilledQty,
          returnedQty: item.returnedQty,
          damagedQty: item.damagedQty,
        }))}
        onStatusUpdate={handleStatusUpdate}
      />
    )}
    </>
  );
};
