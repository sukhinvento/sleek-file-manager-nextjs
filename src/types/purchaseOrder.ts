export interface PurchaseOrderItem {
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxSlab?: number;
}

export interface PurchaseOrderRemark {
  date: string;
  user: string;
  message: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendorName: string;
  vendorContact: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorAddress: string;
  shippingAddress: string;
  orderDate: string;
  deliveryDate: string;
  fulfilmentDate: string | null;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled' | 'Partial';
  items: PurchaseOrderItem[];
  total: number;
  paidAmount: number;
  createdBy: string;
  approvedBy: string;
  notes: string;
  attachments: number;
  paymentMethod: string;
  remarks: PurchaseOrderRemark[];
}

export interface StockItem {
  id: number;
  name: string;
  brand: string;
  stock: number;
  unitPrice: number;
}

export interface TaxSlab {
  id: number;
  name: string;
  rate: number;
}

export interface Offer {
  id: number;
  name: string;
  rate: number;
  minQty: number;
}