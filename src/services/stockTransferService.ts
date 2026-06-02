import apiClient from '@/lib/api-client';
import { StockTransfer, StockTransferItem } from '@/types/inventory';

const STATUS_MAP: Record<string, StockTransfer['status']> = {
  draft: 'Pending',
  pending: 'Pending',
  in_transit: 'In Transit',
  'in transit': 'In Transit',
  completed: 'Completed',
  cancelled: 'Cancelled',
  partially_received: 'Partially Received',
};

function mapTransferItem(raw: any): StockTransferItem {
  return {
    id: raw._id || raw.item_id || raw.id,
    name: raw.name || '',
    quantity: raw.quantity ?? raw.qty ?? 0,
    availableStock: raw.available_stock ?? raw.availableStock,
    saleUnit: raw.sale_unit || raw.saleUnit,
  };
}

function toBackendItem(item: StockTransferItem): Record<string, any> {
  const out: Record<string, any> = {
    name: item.name,
    quantity: item.quantity,
  };
  if (item.id && /^[0-9a-f]{24}$/i.test(item.id)) out.item_id = item.id;
  if (item.saleUnit) out.sale_unit = item.saleUnit;
  return out;
}

const extractName = (v: any): string => {
  if (!v) return '';
  if (typeof v === 'object') return String(v.name || v.full_name || v.username || v.email || '');
  if (typeof v === 'string' && /^[0-9a-f]{24}$/i.test(v)) return '';
  return String(v);
};

function mapStockTransfer(raw: any): StockTransfer {
  const status = STATUS_MAP[String(raw.status || '').toLowerCase()] || 'Pending';
  return {
    id: raw._id || raw.id || '',
    transferId: raw.transfer_number || raw.transferId || '',
    fromLocation: raw.from_location || raw.from_location_id || raw.fromLocation || '',
    toLocation: raw.to_location || raw.to_location_id || raw.toLocation || '',
    items: Array.isArray(raw.items) ? raw.items.map(mapTransferItem) : [],
    status,
    requestDate: raw.createdAt ? raw.createdAt.split('T')[0] : (raw.requestDate || ''),
    completedDate: raw.completed_date || raw.completedDate,
    requestedBy: extractName(raw.requested_by) || extractName(raw.createdBy) || extractName(raw.requestedBy) || '',
    reason: raw.notes || raw.reason,
    priority: raw.priority ? (raw.priority.charAt(0).toUpperCase() + raw.priority.slice(1).toLowerCase()) : 'Low',
    expectedDate: raw.expected_date || raw.expectedDate,
    approvedBy: extractName(raw.approved_by) || extractName(raw.approvedBy) || undefined,
  };
}

/**
 * Fetch all stock transfers
 * GET /stock/transfers?limit=200
 */
export const fetchStockTransfers = async (): Promise<StockTransfer[]> => {
  const response = await apiClient.get('/stock/transfers', { params: { limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapStockTransfer);
};

/**
 * Fetch a single stock transfer by ID
 * GET /stock/transfers/:id
 */
export const fetchStockTransferById = async (id: string): Promise<StockTransfer | null> => {
  try {
    const response = await apiClient.get(`/stock/transfers/${id}`);
    return mapStockTransfer(response.data);
  } catch {
    return null;
  }
};

/**
 * Create a new stock transfer
 * POST /stock/transfers
 */
export const createStockTransfer = async (transferData: Omit<StockTransfer, 'id'>): Promise<StockTransfer> => {
  const body: any = {
    from_location: transferData.fromLocation,
    to_location: transferData.toLocation,
    items: transferData.items.map(toBackendItem),
    notes: transferData.reason,
  };
  if (transferData.priority) body.priority = transferData.priority.toLowerCase();
  if (transferData.expectedDate) body.expected_date = transferData.expectedDate;
  const response = await apiClient.post('/stock/transfers', body);
  return mapStockTransfer(response.data);
};

/**
 * Update an existing stock transfer
 * PATCH /stock/transfers/:id
 */
export const updateStockTransfer = async (id: string, transferData: Partial<StockTransfer>): Promise<StockTransfer> => {
  const body: any = {};
  if (transferData.fromLocation !== undefined) body.from_location = transferData.fromLocation;
  if (transferData.toLocation !== undefined) body.to_location = transferData.toLocation;
  if (transferData.items !== undefined) body.items = transferData.items.map(toBackendItem);
  if (transferData.status !== undefined) body.status = transferData.status.toLowerCase().replace(/ /g, '_');
  if (transferData.reason !== undefined) body.notes = transferData.reason;
  if (transferData.priority !== undefined) body.priority = transferData.priority.toLowerCase();
  if (transferData.expectedDate !== undefined) body.expected_date = transferData.expectedDate;
  if (transferData.completedDate !== undefined) body.completed_date = transferData.completedDate;
  if (transferData.requestedBy !== undefined) body.requested_by = transferData.requestedBy;
  if (transferData.approvedBy !== undefined) body.approved_by = transferData.approvedBy;
  const response = await apiClient.patch(`/stock/transfers/${id}`, body);
  return mapStockTransfer(response.data);
};

/**
 * Delete a stock transfer
 * DELETE /stock/transfers/:id
 */
export const deleteStockTransfer = async (id: string): Promise<void> => {
  await apiClient.delete(`/stock/transfers/${id}`);
};

/**
 * Fetch stock transfer statistics
 * GET /stock/transfers/stats
 */
export const fetchStockTransferStats = async () => {
  const response = await apiClient.get('/stock/transfers/stats');
  return response.data;
};

/**
 * Approve a stock transfer
 * PATCH /stock/transfers/:id with status=in_transit
 */
export const approveStockTransfer = async (id: string, approvedBy: string): Promise<StockTransfer> => {
  const body: Record<string, any> = { status: 'in_transit' };
  if (approvedBy) body.approved_by = approvedBy;
  const response = await apiClient.patch(`/stock/transfers/${id}`, body);
  return mapStockTransfer(response.data);
};

/**
 * Mark stock transfer as completed
 * PUT /stock/transfers/:id/complete
 */
export const completeStockTransfer = async (id: string, completedDate: string): Promise<StockTransfer> => {
  const response = await apiClient.put(`/stock/transfers/${id}/complete`);
  return mapStockTransfer(response.data);
};

/**
 * Search stock transfers
 * GET /stock/transfers?search=X
 */
export const searchStockTransfers = async (query: string): Promise<StockTransfer[]> => {
  const response = await apiClient.get('/stock/transfers', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapStockTransfer);
};
