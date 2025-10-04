import { PurchaseOrder } from '@/types/purchaseOrder';
import { purchaseOrdersData } from '@/data/purchaseOrderData';

// Mock data - clone the initial data
let mockPurchaseOrders: PurchaseOrder[] = [...purchaseOrdersData];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all purchase orders
 * TODO: Replace with actual API call: GET /api/purchase-orders
 */
export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  await delay(500);
  return [...mockPurchaseOrders];
};

/**
 * Fetch a single purchase order by ID
 * TODO: Replace with actual API call: GET /api/purchase-orders/:id
 */
export const fetchPurchaseOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  await delay(300);
  return mockPurchaseOrders.find(order => order.id === id) || null;
};

/**
 * Create a new purchase order
 * TODO: Replace with actual API call: POST /api/purchase-orders
 */
export const createPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
  await delay(800);
  const newOrder: PurchaseOrder = {
    ...orderData,
    id: `po-${Date.now()}`,
  };
  mockPurchaseOrders.push(newOrder);
  return newOrder;
};

/**
 * Update an existing purchase order
 * TODO: Replace with actual API call: PUT /api/purchase-orders/:id
 */
export const updatePurchaseOrder = async (id: string, orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
  await delay(800);
  const index = mockPurchaseOrders.findIndex(order => order.id === id);
  if (index === -1) {
    throw new Error('Purchase order not found');
  }
  mockPurchaseOrders[index] = { ...mockPurchaseOrders[index], ...orderData };
  return mockPurchaseOrders[index];
};

/**
 * Delete a purchase order
 * TODO: Replace with actual API call: DELETE /api/purchase-orders/:id
 */
export const deletePurchaseOrder = async (id: string): Promise<void> => {
  await delay(500);
  const index = mockPurchaseOrders.findIndex(order => order.id === id);
  if (index === -1) {
    throw new Error('Purchase order not found');
  }
  mockPurchaseOrders.splice(index, 1);
};

/**
 * Fetch purchase orders statistics
 * TODO: Replace with actual API call: GET /api/purchase-orders/stats
 */
export const fetchPurchaseOrderStats = async () => {
  await delay(400);
  
  const totalOrders = mockPurchaseOrders.length;
  const totalValue = mockPurchaseOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = mockPurchaseOrders.filter(order => order.status === 'Pending');
  const approvedOrders = mockPurchaseOrders.filter(order => order.status === 'Approved').length;
  const pendingValue = pendingOrders.reduce((sum, order) => sum + order.total, 0);
  const deliveredOrders = mockPurchaseOrders.filter(order => order.status === 'Delivered').length;
  const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;
  
  return {
    totalOrders,
    totalValue,
    pendingOrders: pendingOrders.length,
    approvedOrders,
    pendingValue,
    deliveredOrders,
    averageOrderValue,
  };
};

/**
 * Approve a purchase order
 * TODO: Replace with actual API call: POST /api/purchase-orders/:id/approve
 */
export const approvePurchaseOrder = async (id: string, approvedBy: string): Promise<PurchaseOrder> => {
  await delay(600);
  const index = mockPurchaseOrders.findIndex(order => order.id === id);
  if (index === -1) {
    throw new Error('Purchase order not found');
  }
  mockPurchaseOrders[index] = {
    ...mockPurchaseOrders[index],
    status: 'Approved',
    approvedBy,
  };
  return mockPurchaseOrders[index];
};

/**
 * Mark purchase order as delivered
 * TODO: Replace with actual API call: POST /api/purchase-orders/:id/deliver
 */
export const markPurchaseOrderDelivered = async (id: string, fulfilmentDate: string): Promise<PurchaseOrder> => {
  await delay(600);
  const index = mockPurchaseOrders.findIndex(order => order.id === id);
  if (index === -1) {
    throw new Error('Purchase order not found');
  }
  mockPurchaseOrders[index] = {
    ...mockPurchaseOrders[index],
    status: 'Delivered',
    fulfilmentDate,
  };
  return mockPurchaseOrders[index];
};

/**
 * Search purchase orders
 * TODO: Replace with actual API call: GET /api/purchase-orders/search?q=...
 */
export const searchPurchaseOrders = async (query: string): Promise<PurchaseOrder[]> => {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return mockPurchaseOrders.filter(order =>
    order.poNumber.toLowerCase().includes(lowerQuery) ||
    order.vendorName.toLowerCase().includes(lowerQuery) ||
    order.vendorAddress.toLowerCase().includes(lowerQuery)
  );
};
