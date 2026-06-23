import apiClient from '@/lib/api-client';
import * as salesOrderService from './salesOrderService';
import * as purchaseOrderService from './purchaseOrderService';

export interface InvoiceLineItem {
  name: string;
  description: string;
  sku: string;
  /** HSN code for goods / SAC code for services */
  hsnCode: string;
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
  cgst: number;   // intra-state
  sgst: number;   // intra-state
  igst: number;   // inter-state
  totalTax: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  sourceType: string;   // 'purchase_order' | 'sales_order' | 'diagnostic_booking' | 'admission'
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
  // GST identity
  sellerGstin: string;
  buyerGstin: string;
  placeOfSupply: string;
  isInterState: boolean;
  invoiceType: string;   // 'tax_invoice' | 'bill_of_supply'
  // GST breakdown (CGST+SGST for intra-state, IGST for inter-state)
  taxBreakdown: TaxSlabBreakdown[];
  // Order metadata
  orderDate: string;
  deliveryDate: string;
  dueDate: string;
  paymentMethod: string;
  shippingAddress: string;
  // Invoice metadata
  status: string;
  issueDate: string;
  notes: string;
  // Line items
  lineItems: InvoiceLineItem[];
  createdAt: string;
}

const STATUS_MAP: Record<string, string> = {
  pending: 'Pending',
  draft: 'Draft',
  issued: 'Issued',
  paid: 'Paid',
  partially_paid: 'Partial',
  cancelled: 'Cancelled',
  overdue: 'Overdue',
};

function mapLineItem(raw: any): InvoiceLineItem {
  return {
    name:           raw.name        || '',
    description:    raw.description || raw.name || '',
    sku:            raw.sku         || '',
    hsnCode:        raw.hsn_code    || raw.hsnCode || raw.sac_code || '',
    quantity:       raw.quantity    ?? raw.qty ?? 1,
    unitPrice:      raw.unit_price  ?? raw.unitPrice ?? 0,
    discountPercent: raw.discount_percent ?? raw.discount ?? 0,
    taxSlab:        raw.tax_slab    ?? raw.taxSlab  ?? 0,
    taxAmount:      raw.tax_amount  ?? raw.taxAmount ?? 0,
    subtotal:       raw.subtotal    ?? 0,
    total:          raw.total       ?? raw.amount   ?? 0,
    saleUnit:       raw.sale_unit   ?? raw.saleUnit ?? '',
  };
}

function mapTaxBreakdown(raw: any): TaxSlabBreakdown {
  return {
    rate:         raw.rate          ?? 0,
    taxableAmount: raw.taxable_amount ?? raw.taxableAmount ?? 0,
    cgst:         raw.cgst          ?? 0,
    sgst:         raw.sgst          ?? 0,
    igst:         raw.igst          ?? 0,
    totalTax:     raw.total_tax     ?? raw.totalTax ?? 0,
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
  const grandTotal = amount || (subtotal - totalDiscount + totalTax);
  const paidAmount = raw.paid_amount ?? 0;

  // Determine status based on payment and backend status
  let status = STATUS_MAP[String(raw.status || '').toLowerCase()] || raw.status || 'Draft';

  // If paidAmount >= grandTotal, status should be 'Paid' regardless of backend status
  if (paidAmount >= grandTotal && status !== 'Cancelled') {
    status = 'Paid';
  } else if (paidAmount > 0 && paidAmount < grandTotal && status === 'Draft') {
    // If partially paid, set to Partial
    status = 'Partial';
  }

  return {
    id: raw._id || raw.id || '',
    invoiceNumber: raw.invoice_number || raw.invoiceNumber || '',
    sourceType: raw.source_type || customFields.source_type || '',
    sourceNumber: raw.source_number || customFields.source_number || '',
    sourceId: raw.order_id || customFields.source_id || '',
    // Vendor
    vendorName:    raw.vendor_name    || customFields.vendor_name    || '',
    vendorId:      raw.vendor_id      || customFields.vendor_id      || '',
    vendorPhone:   raw.vendor_phone   || '',
    vendorEmail:   raw.vendor_email   || '',
    vendorAddress: raw.vendor_address || '',
    // Customer
    customerName:    raw.customer_name    || customFields.customer_name    || '',
    customerId:      raw.customer_id      || customFields.customer_id      || '',
    customerPhone:   raw.customer_phone   || '',
    customerEmail:   raw.customer_email   || '',
    customerAddress: raw.customer_address || '',
    // Financials
    subtotal,
    totalTax,
    totalDiscount,
    amount,
    paidAmount,
    grandTotal,
    // GST identity
    sellerGstin:   raw.seller_gstin    || '',
    buyerGstin:    raw.buyer_gstin     || '',
    placeOfSupply: raw.place_of_supply || '',
    isInterState:  raw.is_inter_state  ?? false,
    invoiceType:   raw.invoice_type    || 'tax_invoice',
    // GST breakdown
    taxBreakdown: rawTaxBreakdown.map(mapTaxBreakdown),
    // Order metadata
    orderDate:       raw.order_date       || '',
    deliveryDate:    raw.delivery_date    || '',
    dueDate:         raw.due_date         || '',
    paymentMethod:   raw.payment_method   || '',
    shippingAddress: raw.shipping_address || '',
    // Invoice metadata
    status,
    issueDate: raw.issue_date || raw.createdAt?.split('T')[0] || '',
    notes:     raw.notes || '',
    // Line items
    lineItems: rawItems.map(mapLineItem),
    createdAt: raw.createdAt || '',
  };
}

/**
 * Fetch all invoices
 * GET /invoices?limit=200
 *
 * Invoices sourced from Sales Orders or Purchase Orders will have their payment
 * status synced from the current SO/PO payment status to ensure data accuracy.
 */
export const fetchInvoices = async (page = 1, limit = 25): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> => {
  const response = await apiClient.get("/invoices", { params: { page, limit, sort: "createdAt_desc" } });
  const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];

  // For SO/PO-sourced invoices, sync payment data from the source order
  const invoices = await Promise.all(
    raw.map(async (invoice) => {
      try {
        // Only sync if this is a SO/PO-sourced invoice
        if (invoice.source_type === "sales_order" && invoice.order_id) {
          const so = await salesOrderService.fetchSalesOrderById(invoice.order_id);
          if (so) {
            // Update the paidAmount from the SO's current value
            invoice.paid_amount = so.paidAmount;
            // Don't override status here - let mapInvoice calculate it
          }
        } else if (invoice.source_type === "purchase_order" && invoice.order_id) {
          const po = await purchaseOrderService.fetchPurchaseOrderById(invoice.order_id);
          if (po) {
            // Update the paidAmount from the PO's current value
            invoice.paid_amount = po.paidAmount;
            // Don't override status here - let mapInvoice calculate it
          }
        }
      } catch (error) {
        console.warn(`Failed to sync payment data for invoice ${invoice.invoice_number}:`, error);
        // Continue with the invoice data as-is if sync fails
      }
      return mapInvoice(invoice);
    })
  );

  return {
    data: invoices,
    total: response.data?.total ?? raw.length,
    page: response.data?.page ?? page,
    limit: response.data?.limit ?? limit,
  };
};

/**
 * Fetch a single invoice by ID
 * GET /invoices/:id
 *
 * If the invoice is sourced from a Sales Order or Purchase Order, the payment
 * status will be synced from the source order's payment status to ensure accuracy.
 */
export const fetchInvoiceById = async (id: string): Promise<Invoice | null> => {
  try {
    const response = await apiClient.get(`/invoices/${id}`);
    const invoice = response.data;

    // If invoice is from a SO or PO, fetch the source order to get latest payment data
    try {
      if (invoice.source_type === "sales_order" && invoice.order_id) {
        const so = await salesOrderService.fetchSalesOrderById(invoice.order_id);
        if (so) {
          invoice.paid_amount = so.paidAmount;
        }
      } else if (invoice.source_type === "purchase_order" && invoice.order_id) {
        const po = await purchaseOrderService.fetchPurchaseOrderById(invoice.order_id);
        if (po) {
          invoice.paid_amount = po.paidAmount;
        }
      }
    } catch (error) {
      console.warn(`Failed to sync payment data for invoice ${invoice.invoice_number}:`, error);
    }

    return mapInvoice(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
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
  } catch (error) { console.warn(`Failed to sync payment data for invoice ${invoice.invoice_number}:`, error);
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
