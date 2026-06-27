// Shared types used across PO, SO, Invoices, Billing, and Diagnostics

export interface PaymentRecord {
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Insurance' | 'Cheque';
  referenceNumber?: string;
  date: string;
  notes?: string;
}

export interface EntityOption {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  contactPerson?: string;
  [key: string]: any;
}

export interface OrderItem {
  id?: string;
  item_id?: string;
  name: string;
  sku?: string;
  qty: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxSlab?: number;
  saleUnit?: 'Single Unit' | 'Strip' | 'Box' | 'Bottle' | 'Vial' | 'Pack' | 'Sachet';
}

export interface OrderSummary {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
}

export const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Card', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Cheque', label: 'Cheque' },
] as const;

export type PaymentMethodType = typeof PAYMENT_METHODS[number]['value'];
