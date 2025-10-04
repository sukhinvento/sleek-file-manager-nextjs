// Sales Order Types
export interface SalesOrderItem {
  id?: string;
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxSlab?: number;
  saleUnit?: 'Single Unit' | 'Strip' | 'Box' | 'Bottle' | 'Vial' | 'Pack' | 'Sachet';
  fulfilledQty?: number;
  returnedQty?: number;
  damagedQty?: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  orderDate: string;
  deliveryDate: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Partially Shipped';
  items: SalesOrderItem[];
  total: number;
  dueDate: string;
  paymentStatus: 'Pending' | 'Paid' | 'Partial' | 'Overdue';
  paymentMethod: string;
  shippingAddress: string;
  billingAddress: string;
  notes: string;
}

// Stock Transfer Types
export interface StockTransferItem {
  id?: string;
  name: string;
  quantity: number;
  availableStock?: number;
  saleUnit?: 'Single Unit' | 'Strip' | 'Box' | 'Bottle' | 'Vial' | 'Pack' | 'Sachet';
  fulfilledQty?: number;
  returnedQty?: number;
  damagedQty?: number;
}

export interface StockTransfer {
  id: string;
  transferId: string;
  fromLocation: string;
  toLocation: string;
  items: StockTransferItem[];
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled' | 'Partially Received';
  requestDate: string;
  completedDate?: string;
  requestedBy: string;
  reason?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  expectedDate?: string;
  approvedBy?: string;
}

// Vendor Types
export interface Vendor {
  id: string;
  vendorId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending';
  totalOrders: number;
  lastOrderDate?: string;
  totalValue: number;
  paymentTerms: string;
  taxId?: string;
  gstNumber?: string;
  website?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  creditLimit: number;
  outstandingBalance: number;
  registrationDate: string;
  notes?: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier: string;
  expiryDate?: string;
  batchNumber: string;
  location?: string;
  description?: string;
  manufacturer?: string;
  saleUnit?: 'Single Unit' | 'Strip' | 'Box' | 'Bottle' | 'Vial' | 'Pack' | 'Sachet';
  // Barcode & Tracking
  barcode?: string;
  barcodeType?: 'EAN-13' | 'UPC-A' | 'CODE-128' | 'CODE-39' | 'QR';
  qrCode?: string;
  rfidTag?: string;
  rfidEnabled?: boolean;
  serialNumbers?: string[];
  trackingEnabled?: boolean;
}

// Common Types
export type StockStatus = 'critical' | 'low' | 'normal';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

// Location Types
export interface Location {
  id: string;
  name: string;
  type: 'Warehouse' | 'Department' | 'Room';
  capacity?: number;
  manager?: string;
}