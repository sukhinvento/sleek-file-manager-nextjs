import apiClient from '@/lib/api-client';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchaseOrder';

function mapOrderItem(raw: any): PurchaseOrderItem {
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

function toBackendItem(item: PurchaseOrderItem): Record<string, any> {
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

const STATUS_MAP: Record<string, PurchaseOrder['status']> = {
  draft: 'Pending',
  pending: 'Pending',
  approved: 'Approved',
  fulfilled: 'Delivered',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  partial: 'Partial',
  received: 'Received',
  partially_received: 'Partially Received',
};

const STATUS_TO_BACKEND: Record<string, string> = {
  Pending: 'pending',
  Approved: 'approved',
  Delivered: 'fulfilled',
  Cancelled: 'cancelled',
  Partial: 'partial',
  Received: 'received',
  'Partially Received': 'partially_received',
};

const extractName = (v: any): string => {
  if (!v) return '';
  if (typeof v === 'object') return String(v.name || v.full_name || v.username || v.email || '');
  if (typeof v === 'string' && /^[0-9a-f]{24}$/i.test(v)) return '';
  return String(v);
};

function mapPurchaseOrder(raw: any): PurchaseOrder {
  const status = STATUS_MAP[String(raw.status || '').toLowerCase()] || 'Pending';
  const rawVendorId = raw.vendor_id;
  const vendorIdStr = rawVendorId && typeof rawVendorId === 'string' && /^[0-9a-f]{24}$/i.test(rawVendorId)
    ? rawVendorId
    : (rawVendorId && typeof rawVendorId === 'object' ? String(rawVendorId._id || rawVendorId.id || '') : undefined);
  return {
    id: raw._id || raw.id || '',
    poNumber: raw.po_number || raw.poNumber || '',
    vendorId: vendorIdStr || undefined,
    vendorName: raw.vendor_name || raw.vendorName || '',
    vendorContact: raw.vendor_contact || raw.vendorContact || '',
    vendorPhone: raw.vendor_phone || raw.vendorPhone || '',
    vendorEmail: raw.vendor_email || raw.vendorEmail || '',
    vendorAddress: raw.vendor_address || raw.vendorAddress || '',
    shippingAddress: raw.shipping_address || raw.shippingAddress || '',
    orderDate: raw.order_date || raw.orderDate || (raw.createdAt ? raw.createdAt.split('T')[0] : ''),
    deliveryDate: raw.delivery_date || raw.deliveryDate || '',
    fulfilmentDate: raw.fulfilment_date || raw.fulfilmentDate || null,
    status,
    items: Array.isArray(raw.items) ? raw.items.map(mapOrderItem) : [],
    total: raw.grand_total ?? raw.total ?? 0,
    paidAmount: raw.paid_amount ?? raw.paidAmount ?? 0,
    createdBy: extractName(raw.created_by) || extractName(raw.createdBy) || '',
    approvedBy: extractName(raw.approved_by) || extractName(raw.approvedBy) || '',
    actor: raw.actor || raw.created_by_username || raw.created_by_user || '',
    notes: raw.notes || '',
    attachments: raw.attachments ?? 0,
    paymentMethod: raw.payment_method || raw.paymentMethod || '',
    remarks: Array.isArray(raw.remarks) ? raw.remarks : [],
  };
}

/**
 * Fetch all purchase orders
 * GET /purchase-orders?limit=200
 */
export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const response = await apiClient.get('/purchase-orders', { params: { limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapPurchaseOrder);
};

/**
 * Fetch a single purchase order by ID
 * GET /purchase-orders/:id
 */
export const fetchPurchaseOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  try {
    const response = await apiClient.get(`/purchase-orders/${id}`);
    return mapPurchaseOrder(response.data);
  } catch {
    return null;
  }
};

function toBackendPayload(orderData: Partial<PurchaseOrder>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (orderData.poNumber !== undefined)   payload.po_number   = orderData.poNumber;
  if (orderData.vendorId !== undefined)   payload.vendor_id   = orderData.vendorId;
  if (orderData.vendorName !== undefined) payload.vendor_name = orderData.vendorName;
  if (orderData.vendorPhone !== undefined)  payload.vendor_phone    = orderData.vendorPhone;
  if (orderData.vendorEmail !== undefined)  payload.vendor_email    = orderData.vendorEmail;
  if (orderData.vendorAddress !== undefined) payload.vendor_address = orderData.vendorAddress;
  if (orderData.shippingAddress !== undefined) payload.shipping_address = orderData.shippingAddress;
  if (orderData.orderDate !== undefined)    payload.order_date      = orderData.orderDate;
  if (orderData.deliveryDate !== undefined) payload.delivery_date   = orderData.deliveryDate;
  if (orderData.fulfilmentDate !== undefined) payload.fulfilment_date = orderData.fulfilmentDate;
  if (orderData.items !== undefined)        payload.items           = orderData.items.map(toBackendItem);
  if (orderData.total !== undefined)        payload.grand_total     = orderData.total;
  if (orderData.paidAmount !== undefined)   payload.paid_amount     = orderData.paidAmount;
  if (orderData.paymentMethod !== undefined) payload.payment_method = orderData.paymentMethod;
  if (orderData.notes !== undefined)        payload.notes           = orderData.notes;
  if (orderData.approvedBy !== undefined)   payload.approved_by     = orderData.approvedBy;
  if (orderData.remarks !== undefined)      payload.remarks         = orderData.remarks;
  if (orderData.status !== undefined)       payload.status          = STATUS_TO_BACKEND[orderData.status] ?? orderData.status.toLowerCase();
  if (orderData.actor !== undefined)        payload.actor           = orderData.actor;
  if (orderData.createdBy !== undefined)   payload.created_by      = orderData.createdBy;
  return payload;
}

/**
 * Create a new purchase order
 * POST /purchase-orders
 */
export const createPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
  const payload = toBackendPayload(orderData);
  console.log('[PO CREATE] payload →', JSON.stringify(payload, null, 2));
  const response = await apiClient.post('/purchase-orders', payload);
  console.log('[PO CREATE] response ←', JSON.stringify(response.data, null, 2));
  return mapPurchaseOrder(response.data);
};

/**
 * Update an existing purchase order
 * PATCH /purchase-orders/:id
 */
export const updatePurchaseOrder = async (id: string, orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
  const response = await apiClient.patch(`/purchase-orders/${id}`, toBackendPayload(orderData));
  return mapPurchaseOrder(response.data);
};

/**
 * Delete a purchase order
 * DELETE /purchase-orders/:id
 */
export const deletePurchaseOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`/purchase-orders/${id}`);
};

/**
 * Fetch purchase orders statistics
 * GET /purchase-orders/stats
 */
export const fetchPurchaseOrderStats = async () => {
  const response = await apiClient.get('/purchase-orders/stats');
  const raw = response.data || {};
  return {
    totalOrders:    raw.totalOrders    ?? raw.total_orders    ?? 0,
    pendingOrders:  raw.pendingOrders  ?? raw.pending_orders  ?? 0,
    approvedOrders: raw.approvedOrders ?? raw.approved_orders ?? 0,
    deliveredOrders:raw.deliveredOrders?? raw.delivered_orders?? 0,
    cancelledOrders:raw.cancelledOrders?? raw.cancelled_orders?? 0,
    totalValue:     raw.totalValue     ?? raw.total_value     ?? 0,
    pendingValue:   raw.pendingValue   ?? raw.pending_value   ?? 0,
    paidAmount:       raw.paidAmount       ?? raw.paid_amount        ?? 0,
    averageOrderValue:raw.averageOrderValue ?? raw.average_order_value ?? 0,
    // pass through any extra fields the backend may return
    ...raw,
  };
};

/**
 * Approve a purchase order
 * PATCH /purchase-orders/:id with status=approved
 */
export const approvePurchaseOrder = async (id: string, approvedBy: string): Promise<PurchaseOrder> => {
  const response = await apiClient.patch(`/purchase-orders/${id}`, { status: 'approved', approved_by: approvedBy });
  return mapPurchaseOrder(response.data);
};

/**
 * Mark purchase order as delivered
 * PATCH /purchase-orders/:id with status=fulfilled
 */
export const markPurchaseOrderDelivered = async (id: string, fulfilmentDate: string): Promise<PurchaseOrder> => {
  const response = await apiClient.patch(`/purchase-orders/${id}`, { status: 'fulfilled', fulfilment_date: fulfilmentDate });
  return mapPurchaseOrder(response.data);
};

/**
 * Search purchase orders
 * GET /purchase-orders?search=X
 */
export const searchPurchaseOrders = async (query: string): Promise<PurchaseOrder[]> => {
  const response = await apiClient.get('/purchase-orders', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapPurchaseOrder);
};
