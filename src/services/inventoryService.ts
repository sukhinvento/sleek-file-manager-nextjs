import apiClient from '@/lib/api-client';
import { InventoryItem } from '@/types/inventory';

function mapInventoryItem(raw: any): InventoryItem {
  return {
    id: raw._id || raw.id || '',
    name: raw.name || '',
    category: raw.category || '',
    sku: raw.sku || '',
    currentStock: raw.current_stock ?? raw.currentStock ?? 0,
    minStock: raw.min_stock_level ?? raw.minStock ?? 0,
    maxStock: raw.max_stock_level ?? raw.maxStock ?? 0,
    unitPrice: raw.unit_price ?? raw.unitPrice ?? 0,
    supplier: raw.supplier || raw.vendor_name || '',
    manufacturer: raw.manufacturer || '',
    expiryDate: raw.expiry_date || raw.expiryDate,
    batchNumber: raw.batch_number || raw.batchNumber || '',
    location: raw.location || '',
    description: raw.description || '',
    saleUnit: raw.sale_unit || raw.saleUnit || raw.unit_of_measure,
    barcode: raw.barcode || '',
    barcodeType: raw.barcode_type || raw.barcodeType,
    qrCode: raw.qr_code || raw.qrCode,
    rfidTag: raw.rfid_tag || raw.rfidTag || '',
    rfidEnabled: raw.rfid_enabled ?? raw.rfidEnabled,
    serialNumbers: raw.serial_numbers || raw.serialNumbers,
    trackingEnabled: raw.tracking_enabled ?? raw.trackingEnabled,
  };
}

function toBackendBody(itemData: Partial<InventoryItem>): Record<string, any> {
  const body: Record<string, any> = {};
  if (itemData.name !== undefined)         body.name           = itemData.name;
  if (itemData.category !== undefined)     body.category       = itemData.category;
  if (itemData.sku !== undefined)          body.sku            = itemData.sku;
  if (itemData.currentStock !== undefined) body.current_stock  = itemData.currentStock;
  if (itemData.minStock !== undefined)     body.min_stock_level = itemData.minStock;
  if (itemData.maxStock !== undefined)     body.max_stock_level = itemData.maxStock;
  if (itemData.unitPrice !== undefined)    body.unit_price     = itemData.unitPrice;
  if (itemData.supplier !== undefined)     body.supplier       = itemData.supplier;
  if (itemData.manufacturer !== undefined) body.manufacturer   = itemData.manufacturer;
  if (itemData.expiryDate !== undefined)   body.expiry_date    = itemData.expiryDate;
  if (itemData.batchNumber !== undefined)  body.batch_number   = itemData.batchNumber;
  if (itemData.location !== undefined)     body.location       = itemData.location;
  if (itemData.description !== undefined)  body.description    = itemData.description;
  if (itemData.saleUnit !== undefined)     body.sale_unit      = itemData.saleUnit;
  if (itemData.barcode !== undefined)      body.barcode        = itemData.barcode;
  if (itemData.rfidTag !== undefined)      body.rfid_tag       = itemData.rfidTag;
  return body;
}

/**
 * Fetch all inventory items
 * GET /inventory?limit=200
 */
export const fetchInventoryItems = async (page = 1, limit = 25): Promise<{ data: InventoryItem[]; total: number; page: number; limit: number }> => {
  const response = await apiClient.get('/inventory', { params: { page, limit } });
  const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return {
    data: raw.map(mapInventoryItem),
    total: response.data?.total ?? raw.length,
    page: response.data?.page ?? page,
    limit: response.data?.limit ?? limit,
  };
};

/**
 * Fetch a single inventory item by ID
 * GET /inventory/:id
 */
export const fetchInventoryItemById = async (id: string): Promise<InventoryItem | null> => {
  try {
    const response = await apiClient.get(`/inventory/${id}`);
    return mapInventoryItem(response.data);
  } catch {
    return null;
  }
};

/**
 * Create a new inventory item
 * POST /inventory
 */
export const createInventoryItem = async (itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  const response = await apiClient.post('/inventory', toBackendBody(itemData));
  return mapInventoryItem(response.data);
};

/**
 * Update an existing inventory item
 * PATCH /inventory/:id
 */
export const updateInventoryItem = async (id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await apiClient.patch(`/inventory/${id}`, toBackendBody(itemData));
  return mapInventoryItem(response.data);
};

/**
 * Delete an inventory item
 * DELETE /inventory/:id
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/inventory/${id}`);
};

/**
 * Fetch inventory statistics
 * GET /inventory/stats
 */
export const fetchInventoryStats = async () => {
  const response = await apiClient.get('/inventory/stats');
  const raw = response.data || {};
  return {
    totalItems:      raw.totalItems      ?? raw.total_items       ?? raw.total        ?? 0,
    lowStockItems:   raw.lowStockItems   ?? raw.low_stock_items   ?? raw.low_stock    ?? 0,
    criticalItems:   raw.criticalItems   ?? raw.critical_items    ?? raw.low_stock    ?? 0,
    outOfStockItems: raw.outOfStockItems ?? raw.out_of_stock_items ?? raw.out_of_stock ?? 0,
    totalValue:      raw.totalValue      ?? raw.total_value       ?? 0,
    totalCategories: raw.totalCategories ?? raw.total_categories  ?? 0,
    averageValue:    raw.averageValue    ?? raw.average_value      ?? 0,
  };
};

/**
 * Update stock level for an item
 * POST /inventory/:id/adjust-stock
 */
export const updateStockLevel = async (id: string, quantity: number, type: 'add' | 'subtract'): Promise<InventoryItem> => {
  const response = await apiClient.post(`/inventory/${id}/adjust-stock`, {
    quantity,
    adjustment_type: type,
    reason: 'manual',
  });
  return mapInventoryItem(response.data);
};

/**
 * Search inventory items
 * GET /inventory?search=X
 */
export const searchInventoryItems = async (query: string): Promise<InventoryItem[]> => {
  const response = await apiClient.get('/inventory', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapInventoryItem);
};

/**
 * Fetch inventory items at a specific location
 * GET /inventory?location=X&limit=200
 */
export const fetchInventoryByLocation = async (location: string): Promise<InventoryItem[]> => {
  try {
    const response = await apiClient.get('/inventory', { params: { location, limit: 200 } });
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return data.map(mapInventoryItem);
  } catch {
    return [];
  }
};

/**
 * Get items by category
 * GET /inventory?category=X
 */
export const getInventoryItemsByCategory = async (category: string): Promise<InventoryItem[]> => {
  const response = await apiClient.get('/inventory', { params: { category, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapInventoryItem);
};

/**
 * Get low stock items
 * GET /inventory?low_stock=true
 */
export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  const response = await apiClient.get('/inventory', { params: { low_stock: true, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapInventoryItem);
};

/**
 * Fetch distinct inventory locations
 * GET /inventory/locations
 */
export const fetchInventoryLocations = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get('/inventory/locations');
    const data = Array.isArray(response.data) ? response.data : [];
    return data.filter((loc: any) => typeof loc === 'string' && loc.length > 0);
  } catch {
    return [];
  }
};

// ── Inventory-Location stock tracking ────────────────────────────────────

export interface InventoryLocationStock {
  id: string;
  locationId: string;
  locationName: string;
  subLocation: string;
  quantity: number;
}

/**
 * Get per-location stock breakdown for an inventory item
 * GET /inventory/:id/locations
 */
export const fetchItemLocations = async (itemId: string): Promise<InventoryLocationStock[]> => {
  try {
    const response = await apiClient.get(`/inventory/${itemId}/locations`);
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((r: any) => ({
      id: r._id || r.id || '',
      locationId: r.location_id || '',
      locationName: r.location_name || '',
      subLocation: r.sub_location || '',
      quantity: r.quantity ?? 0,
    }));
  } catch {
    return [];
  }
};

/**
 * Assign/update item stock at a location (with optional shelf/drawer)
 * POST /inventory/:id/locations
 */
export const assignItemLocation = async (
  itemId: string,
  locationId: string,
  locationName: string,
  quantity: number,
  subLocation?: string,
): Promise<InventoryLocationStock | null> => {
  try {
    const response = await apiClient.post(`/inventory/${itemId}/locations`, {
      location_id: locationId,
      location_name: locationName,
      sub_location: subLocation || undefined,
      quantity,
    });
    const r = response.data;
    return {
      id: r._id || r.id || '',
      locationId: r.location_id || '',
      locationName: r.location_name || '',
      subLocation: r.sub_location || '',
      quantity: r.quantity ?? 0,
    };
  } catch {
    return null;
  }
};

/**
 * Update inventory stock at a specific location
 * Adjusts stock by the given quantity (positive or negative)
 * PATCH /inventory/:id/locations/:locationName
 */
export const updateInventoryStock = async (
  itemId: string,
  locationName: string,
  quantityChange: number,
): Promise<InventoryLocationStock | null> => {
  try {
    const response = await apiClient.patch(
      `/inventory/${itemId}/locations/${encodeURIComponent(locationName)}`,
      { quantity_change: quantityChange },
      { silent: true } as any,
    );
    const r = response.data;
    return {
      id: r._id || r.id || '',
      locationId: r.location_id || '',
      locationName: r.location_name || '',
      subLocation: r.sub_location || '',
      quantity: r.quantity ?? 0,
    };
  } catch (error) {
    console.error(`Failed to update inventory stock at location ${locationName}:`, error);
    return null;
  }
};
