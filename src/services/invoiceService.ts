import apiClient from '@/lib/api-client';

export interface InvoiceLineItem {
  name: string;
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxSlab: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  saleUnit: string;
}

export interface TaxSlabBreakdown {
  rate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalTax: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  sourceType: string;    // 'purchase_order' | 'sales_order' | 'diagnostic_booking' | 'admission'
  sourceNumber: string;
  sourceId: string;
  // Vendor details (PO invoices)
  vendorName: string;
  vendorId: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorAddress: string;
  // Customer details (SO / diagnostic / admission invoices)
  customerName: string;
  customerId: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  // Financials
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  amount: number;
  paidAmount: number;
  grandTotal: number;
  // GST breakdown
  taxBreakdown: TaxSlabBreakdown[];
  // Order metadata
  orderDate: string;
  deliveryDate: string;
  paymentMethod: string;
  shippingAddress: string;
  // Invoice metadata
  status: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  // Line items
  lineItems: InvoiceLineItem[];
  createdAt: string;
}

const STATUS_MAP: Record<string, string> = {
  draft: 'Draft',
  issued: 'Issued',
  paid: 'Paid',
  partially_paid: 'Partial',
  cancelled: 'Cancelled',
  overdue: 'Overdue',
};

function mapLineItem(raw: any): InvoiceLineItem {
  return {
    name: raw.name || '',
    description: raw.description || raw.name || '',
    sku: raw.sku || '',
    quantity: raw.quantity ?? raw.qty ?? 1,
    unitPrice: raw.unit_price ?? raw.unitPrice ?? 0,
    discountPercent: raw.discount_percent ?? raw.discount ?? 0,
    taxSlab: raw.tax_slab ?? raw.taxSlab ?? 0,
    taxAmount: raw.tax_amount ?? raw.taxAmount ?? 0,
    subtotal: raw.subtotal ?? 0,
    total: raw.total ?? raw.amount ?? 0,
    saleUnit: raw.sale_unit ?? raw.saleUnit ?? '',
  };
}

function mapTaxBreakdown(raw: any): TaxSlabBreakdown {
  return {
    rate: raw.rate ?? 0,
    taxableAmount: raw.taxable_amount ?? raw.taxableAmount ?? 0,
    cgst: raw.cgst ?? 0,
    sgst: raw.sgst ?? 0,
    totalTax: raw.total_tax ?? raw.totalTax ?? 0,
  };
}

function mapInvoice(raw: any): Invoice {
  const customFields = raw.custom_fields || {};
  const rawItems: any[] = Array.isArray(raw.items) ? raw.items : [];
  const rawTaxBreakdown: any[] = Array.isArray(raw.tax_breakdown) ? raw.tax_breakdown : [];

  const subtotal = raw.subtotal ?? 0;
  const totalTax = raw.total_tax ?? 0;
  const totalDiscount = raw.total_discount ?? 0;
  const amount = raw.amount ?? 0;

  return {
    id: raw._id || raw.id || '',
    invoiceNumber: raw.invoice_number || raw.invoiceNumber || '',
    sourceType: raw.source_type || customFields.source_type || '',
    sourceNumber: raw.source_number || customFields.source_number || '',
    sourceId: raw.order_id || customFields.source_id || '',
    // Vendor
    vendorName: raw.vendor_name || customFields.vendor_name || '',
    vendorId: raw.vendor_id || customFields.vendor_id || '',
    vendorPhone: raw.vendor_phone || '',
    vendorEmail: raw.vendor_email || '',
    vendorAddress: raw.vendor_address || '',
    // Customer
    customerName: raw.customer_name || customFields.customer_name || '',
    customerId: raw.customer_id || customFields.customer_id || '',
    customerPhone: raw.customer_phone || '',
    customerEmail: raw.customer_email || '',
    customerAddress: raw.customer_address || '',
    // Financials
    subtotal,
    totalTax,
    totalDiscount,
    amount,
    paidAmount: raw.paid_amount ?? 0,
    grandTotal: amount || (subtotal - totalDiscount + totalTax),
    // GST breakdown
    taxBreakdown: rawTaxBreakdown.map(mapTaxBreakdown),
    // Order metadata
    orderDate: raw.order_date || '',
    deliveryDate: raw.delivery_date || '',
    paymentMethod: raw.payment_method || '',
    shippingAddress: raw.shipping_address || '',
    // Invoice metadata
    status: STATUS_MAP[String(raw.status || '').toLowerCase()] || raw.status || 'Draft',
    issueDate: raw.issue_date || raw.createdAt?.split('T')[0] || '',
    dueDate: raw.due_date || '',
    notes: raw.notes || '',
    // Line items
    lineItems: rawItems.map(mapLineItem),
    createdAt: raw.createdAt || '',
  };
}

/**
 * Fetch all invoices
 * GET /invoices?limit=200
 */
export const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await apiClient.get('/invoices', { params: { limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapInvoice);
};

/**
 * Fetch a single invoice by ID
 * GET /invoices/:id
 */
export const fetchInvoiceById = async (id: string): Promise<Invoice | null> => {
  try {
    const response = await apiClient.get(`/invoices/${id}`);
    return mapInvoice(response.data);
  } catch {
    return null;
  }
};

/**
 * Update an invoice (e.g. record payment)
 * PATCH /invoices/:id
 */
export const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
  const body: any = {};
  if (data.paidAmount !== undefined) body.paid_amount = data.paidAmount;
  if (data.status !== undefined) body.status = data.status.toLowerCase();
  if (data.notes !== undefined) body.notes = data.notes;
  const response = await apiClient.patch(`/invoices/${id}`, body);
  return mapInvoice(response.data);
};

/**
 * Fetch invoice statistics
 * GET /invoices/stats
 */
export const fetchInvoiceStats = async () => {
  try {
    const response = await apiClient.get('/invoices/stats');
    return response.data || {};
  } catch {
    return {};
  }
};

/**
 * Search invoices
 * GET /invoices?search=X
 */
export const searchInvoices = async (query: string): Promise<Invoice[]> => {
  const response = await apiClient.get('/invoices', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapInvoice);
};
