export interface PurchaseOrderItem {
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

export interface PurchaseOrderRemark {
  date: string;
  user: string;
  message: string;
}

export interface PurchaseOrder {
  id: string;
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
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled' | 'Partial' | 'Received' | 'Partially Received';
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
  saleUnit?: 'Single Unit' | 'Strip' | 'Box' | 'Bottle' | 'Vial' | 'Pack' | 'Sachet';
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