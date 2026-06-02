import apiClient from '@/lib/api-client';
import { SalesOrder, SalesOrderItem } from '@/types/inventory';
import * as billingService from '@/services/billingService';

function mapOrderItem(raw: any): SalesOrderItem {
  return {
    id:           raw._id      || raw.id           || undefined,
    item_id:      raw.item_id  || undefined,
    name:         raw.name     || '',
    qty:          raw.qty      ?? raw.quantity      ?? 0,
    unitPrice:    raw.unit_price ?? raw.unitPrice   ?? 0,
    discount:     raw.discount ?? 0,
    subtotal:     raw.subtotal ?? 0,
    taxSlab:      raw.tax_slab  ?? raw.taxSlab      ?? undefined,
    saleUnit:     raw.sale_unit || raw.saleUnit     || undefined,
    fulfilledQty: raw.fulfilled_qty ?? raw.fulfilledQty ?? undefined,
    returnedQty:  raw.returned_qty  ?? raw.returnedQty  ?? undefined,
    damagedQty:   raw.damaged_qty   ?? raw.damagedQty   ?? undefined,
  };
}

function toBackendItem(item: SalesOrderItem): Record<string, any> {
  const out: Record<string, any> = {
    name:       item.name,
    qty:        item.qty,
    unit_price: item.unitPrice,
    discount:   item.discount,
    subtotal:   item.subtotal,
  };
  if (item.id)                         out.id           = item.id;
  if (item.item_id)                    out.item_id      = item.item_id;
  if (item.taxSlab  !== undefined)     out.tax_slab     = item.taxSlab;
  if (item.saleUnit !== undefined)     out.sale_unit    = item.saleUnit;
  if (item.fulfilledQty !== undefined) out.fulfilled_qty = item.fulfilledQty;
  if (item.returnedQty  !== undefined) out.returned_qty  = item.returnedQty;
  if (item.damagedQty   !== undefined) out.damaged_qty   = item.damagedQty;
  return out;
}

const STATUS_MAP: Record<string, SalesOrder['status']> = {
  draft: 'Pending',
  pending: 'Pending',
  processing: 'Processing',
  Processing: 'Processing',
  shipped: 'Shipped',
  Shipped: 'Shipped',
  delivered: 'Delivered',
  Delivered: 'Delivered',
  invoiced: 'Delivered',
  Invoiced: 'Delivered',
  cancelled: 'Cancelled',
  Cancelled: 'Cancelled',
  partial: 'Partially Shipped',
  partially_shipped: 'Partially Shipped',
};

const PAYMENT_STATUS_MAP: Record<string, SalesOrder['paymentStatus']> = {
  paid: 'Paid',
  Paid: 'Paid',
  pending: 'Pending',
  Pending: 'Pending',
  partial: 'Partial',
  overdue: 'Overdue',
};

const extractName = (v: any): string => {
  if (!v) return '';
  if (typeof v === 'object') return String(v.name || v.full_name || v.username || v.email || '');
  if (typeof v === 'string' && /^[0-9a-f]{24}$/i.test(v)) return '';
  return String(v);
};

function mapSalesOrder(raw: any): SalesOrder {
  const status = STATUS_MAP[String(raw.status || '').trim()] || 'Pending';
  const paymentStatus = PAYMENT_STATUS_MAP[String(raw.payment_status || raw.paymentStatus || '').trim()] || 'Pending';
  const rawCustomerId = raw.customer_id;
  const customerIdStr = rawCustomerId && typeof rawCustomerId === 'string' && /^[0-9a-f]{24}$/i.test(rawCustomerId)
    ? rawCustomerId
    : (rawCustomerId && typeof rawCustomerId === 'object' ? String(rawCustomerId._id || rawCustomerId.id || '') : undefined);
  return {
    id: raw._id || raw.id || '',
    orderNumber: raw.so_number || raw.orderNumber || '',
    customerId: customerIdStr || undefined,
    customerName: raw.customer_name || raw.customerName || '',
    customerEmail: raw.customer_email || raw.customerEmail || '',
    customerPhone: raw.customer_phone || raw.customerPhone || '',
    customerAddress: raw.customer_address || raw.customerAddress || '',
    orderDate: raw.order_date || raw.orderDate || (raw.createdAt ? raw.createdAt.split('T')[0] : ''),
    deliveryDate: raw.delivery_date || raw.deliveryDate || '',
    dueDate: raw.due_date || raw.dueDate || '',
    status,
    paymentStatus,
    items: Array.isArray(raw.items) ? raw.items.map(mapOrderItem) : [],
    total: raw.grand_total ?? raw.total ?? 0,
    paymentMethod: raw.payment_method || raw.paymentMethod || '',
    shippingAddress: raw.shipping_address || raw.shippingAddress || '',
    billingAddress: raw.billing_address || raw.billingAddress || '',
    notes: raw.notes || '',
    paidAmount: raw.paid_amount ?? raw.paidAmount ?? 0,
    createdBy: extractName(raw.created_by) || extractName(raw.createdBy) || '',
    actor: raw.actor || raw.created_by_username || raw.created_by_user || '',
  };
}

function toBackendPayload(orderData: Partial<SalesOrder>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (orderData.orderNumber !== undefined)  payload.so_number    = orderData.orderNumber;
  if (orderData.customerId !== undefined)   payload.customer_id  = orderData.customerId;
  if (orderData.customerName !== undefined) payload.customer_name = orderData.customerName;
  if (orderData.customerEmail !== undefined)   payload.customer_email    = orderData.customerEmail;
  if (orderData.customerPhone !== undefined)   payload.customer_phone    = orderData.customerPhone;
  if (orderData.customerAddress !== undefined) payload.customer_address  = orderData.customerAddress;
  if (orderData.shippingAddress !== undefined) payload.shipping_address  = orderData.shippingAddress;
  if (orderData.billingAddress !== undefined)  payload.billing_address   = orderData.billingAddress;
  if (orderData.orderDate !== undefined)       payload.order_date        = orderData.orderDate;
  if (orderData.deliveryDate !== undefined)    payload.delivery_date     = orderData.deliveryDate;
  if (orderData.dueDate !== undefined)         payload.due_date          = orderData.dueDate;
  if (orderData.items !== undefined)           payload.items             = orderData.items.map(toBackendItem);
  if (orderData.total !== undefined)           payload.grand_total       = orderData.total;
  if (orderData.paidAmount !== undefined)       payload.paid_amount       = orderData.paidAmount;
  if (orderData.paymentMethod !== undefined)   payload.payment_method    = orderData.paymentMethod;
  if (orderData.paymentStatus !== undefined)   payload.payment_status    = orderData.paymentStatus;
  if (orderData.notes !== undefined)           payload.notes             = orderData.notes;
  if (orderData.status !== undefined)          payload.status            = orderData.status;
  if (orderData.actor !== undefined)           payload.actor             = orderData.actor;
  return payload;
}

/**
 * Fetch all sales orders
 * GET /sales-orders?limit=200
 */
export const fetchSalesOrders = async (): Promise<SalesOrder[]> => {
  const response = await apiClient.get('/sales-orders', { params: { limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapSalesOrder);
};

/**
 * Fetch a single sales order by ID
 * GET /sales-orders/:id
 */
export const fetchSalesOrderById = async (id: string): Promise<SalesOrder | null> => {
  try {
    const response = await apiClient.get(`/sales-orders/${id}`);
    return mapSalesOrder(response.data);
  } catch {
    return null;
  }
};

/**
 * Create a new sales order
 * POST /sales-orders
 */
export const createSalesOrder = async (orderData: Omit<SalesOrder, 'id'>): Promise<SalesOrder> => {
  const payload = toBackendPayload(orderData);
  console.log('[SO CREATE] payload →', JSON.stringify(payload, null, 2));
  const response = await apiClient.post('/sales-orders', payload);
  console.log('[SO CREATE] response ←', JSON.stringify(response.data, null, 2));
  return mapSalesOrder(response.data);
};

/**
 * Update an existing sales order
 * PATCH /sales-orders/:id
 */
export const updateSalesOrder = async (id: string, orderData: Partial<SalesOrder>): Promise<SalesOrder> => {
  const response = await apiClient.patch(`/sales-orders/${id}`, toBackendPayload(orderData));
  return mapSalesOrder(response.data);
};

/**
 * Delete a sales order
 * DELETE /sales-orders/:id
 */
export const deleteSalesOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`/sales-orders/${id}`);
};

/**
 * Fetch sales orders statistics
 * GET /sales-orders/stats
 */
export const fetchSalesOrderStats = async () => {
  const response = await apiClient.get('/sales-orders/stats');
  const raw = response.data || {};
  return {
    totalOrders:     raw.totalOrders     ?? raw.total_orders     ?? 0,
    pendingOrders:   raw.pendingOrders   ?? raw.pending_orders   ?? 0,
    processingOrders:raw.processingOrders?? raw.processing_orders?? 0,
    shippedOrders:   raw.shippedOrders   ?? raw.shipped_orders   ?? 0,
    deliveredOrders: raw.deliveredOrders ?? raw.delivered_orders ?? 0,
    cancelledOrders: raw.cancelledOrders ?? raw.cancelled_orders ?? 0,
    totalRevenue:    raw.totalRevenue    ?? raw.total_revenue    ?? 0,
    pendingRevenue:  raw.pendingRevenue  ?? raw.pending_revenue  ?? 0,
    pendingPayments: raw.pendingPayments ?? raw.pending_payments ?? 0,
    // pass through any extra fields the backend may return
    ...raw,
  };
};

/**
 * Ship a sales order
 * POST /sales-orders/:id/ship
 */
export const shipSalesOrder = async (id: string): Promise<SalesOrder> => {
  const response = await apiClient.post(`/sales-orders/${id}/ship`);
  return mapSalesOrder(response.data);
};

/**
 * Invoice a sales order — POST /sales-orders/:id/invoice
 * Also creates a billing record so it appears in the Billing section.
 */
export const invoiceSalesOrder = async (id: string): Promise<SalesOrder> => {
  const response = await apiClient.post(`/sales-orders/${id}/invoice`);
  const so = mapSalesOrder(response.data);
  try {
    const invoiceNum = `INV-SO-${so.orderNumber || id.slice(-6).toUpperCase()}`;
    await billingService.createBillingRecord({
      invoiceNumber: invoiceNum,
      patientName: so.customerName,
      patientId: so.customerId || '',
      department: 'Sales',
      doctor: so.createdBy || '',
      date: so.orderDate,
      dueDate: so.dueDate || '',
      amount: so.total,
      paidAmount: so.paidAmount || (so.paymentStatus === 'Paid' ? so.total : 0),
      status: so.paymentStatus === 'Paid' ? 'Paid' : so.paymentStatus === 'Partial' ? 'Partial' : 'Pending',
      services: so.items.map(i => i.name),
    });
  } catch { /* billing creation is best-effort */ }
  return so;
};

/**
 * Search sales orders
 * GET /sales-orders?search=X
 */
export const searchSalesOrders = async (query: string): Promise<SalesOrder[]> => {
  const response = await apiClient.get('/sales-orders', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapSalesOrder);
};
