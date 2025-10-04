import { InventoryItem } from '@/types/inventory';
import { inventoryItemsData } from '@/data/inventoryData';

// Mock data - clone the initial data
let mockInventoryItems: InventoryItem[] = [...inventoryItemsData];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all inventory items
 * TODO: Replace with actual API call: GET /api/inventory
 */
export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  await delay(500);
  return [...mockInventoryItems];
};

/**
 * Fetch a single inventory item by ID
 * TODO: Replace with actual API call: GET /api/inventory/:id
 */
export const fetchInventoryItemById = async (id: string): Promise<InventoryItem | null> => {
  await delay(300);
  return mockInventoryItems.find(item => item.id === id) || null;
};

/**
 * Create a new inventory item
 * TODO: Replace with actual API call: POST /api/inventory
 */
export const createInventoryItem = async (itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  await delay(800);
  const newItem: InventoryItem = {
    ...itemData,
    id: `inv-${Date.now()}`,
  };
  mockInventoryItems.push(newItem);
  return newItem;
};

/**
 * Update an existing inventory item
 * TODO: Replace with actual API call: PUT /api/inventory/:id
 */
export const updateInventoryItem = async (id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
  await delay(800);
  const index = mockInventoryItems.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error('Inventory item not found');
  }
  mockInventoryItems[index] = { ...mockInventoryItems[index], ...itemData };
  return mockInventoryItems[index];
};

/**
 * Delete an inventory item
 * TODO: Replace with actual API call: DELETE /api/inventory/:id
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  await delay(500);
  const index = mockInventoryItems.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error('Inventory item not found');
  }
  mockInventoryItems.splice(index, 1);
};

/**
 * Fetch inventory statistics
 * TODO: Replace with actual API call: GET /api/inventory/stats
 */
export const fetchInventoryStats = async () => {
  await delay(400);
  
  const getItemStatus = (item: InventoryItem): string => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock < item.minStock) return 'Critical';
    if (item.currentStock < item.minStock * 1.5) return 'Low';
    return 'Normal';
  };
  
  const totalItems = mockInventoryItems.length;
  const totalValue = mockInventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const lowStockItems = mockInventoryItems.filter(item => getItemStatus(item) !== 'Normal').length;
  const criticalItems = mockInventoryItems.filter(item => getItemStatus(item) === 'Critical').length;
  const outOfStockItems = mockInventoryItems.filter(item => item.currentStock === 0).length;
  const totalCategories = [...new Set(mockInventoryItems.map(item => item.category))].length;
  
  return {
    totalItems,
    totalValue,
    lowStockItems,
    criticalItems,
    outOfStockItems,
    totalCategories,
    averageValue: totalItems > 0 ? totalValue / totalItems : 0,
  };
};

/**
 * Update stock level for an item
 * TODO: Replace with actual API call: POST /api/inventory/:id/stock
 */
export const updateStockLevel = async (id: string, quantity: number, type: 'add' | 'subtract'): Promise<InventoryItem> => {
  await delay(600);
  const index = mockInventoryItems.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error('Inventory item not found');
  }
  
  const currentStock = mockInventoryItems[index].currentStock;
  const newStock = type === 'add' ? currentStock + quantity : currentStock - quantity;
  
  if (newStock < 0) {
    throw new Error('Stock cannot be negative');
  }
  
  mockInventoryItems[index] = {
    ...mockInventoryItems[index],
    currentStock: newStock,
  };
  
  return mockInventoryItems[index];
};

/**
 * Search inventory items
 * TODO: Replace with actual API call: GET /api/inventory/search?q=...
 */
export const searchInventoryItems = async (query: string): Promise<InventoryItem[]> => {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return mockInventoryItems.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.sku.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery) ||
    item.supplier.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get items by category
 * TODO: Replace with actual API call: GET /api/inventory/category/:category
 */
export const getInventoryItemsByCategory = async (category: string): Promise<InventoryItem[]> => {
  await delay(300);
  return mockInventoryItems.filter(item => item.category === category);
};

/**
 * Get low stock items
 * TODO: Replace with actual API call: GET /api/inventory/low-stock
 */
export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  await delay(300);
  return mockInventoryItems.filter(item => item.currentStock <= item.minStock);
};
