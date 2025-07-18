// Sales Order Types
export interface SalesOrderItem {
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxSlab?: number;
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
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
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
  name: string;
  quantity: number;
  availableStock?: number;
}

export interface StockTransfer {
  id: string;
  transferId: string;
  fromLocation: string;
  toLocation: string;
  items: StockTransferItem[];
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
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
  category: string;
  status: 'Active' | 'Inactive' | 'Pending';
  totalOrders: number;
  lastOrderDate?: string;
  totalValue: number;
  paymentTerms: string;
  taxId?: string;
  website?: string;
  bankDetails?: string;
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