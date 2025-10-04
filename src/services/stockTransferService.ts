import { StockTransfer } from '@/types/inventory';

// Mock data
let mockStockTransfers: StockTransfer[] = [
  {
    id: '1',
    transferId: 'ST-2024-001',
    fromLocation: 'Main Warehouse',
    toLocation: 'City Hospital',
    items: [
      { name: 'Surgical Masks', quantity: 500, availableStock: 2000, saleUnit: 'Box' },
      { name: 'Hand Sanitizer', quantity: 100, availableStock: 500, saleUnit: 'Bottle' }
    ],
    status: 'Completed',
    requestDate: '2024-01-15',
    completedDate: '2024-01-17',
    requestedBy: 'John Doe',
    priority: 'High',
    reason: 'Stock replenishment',
    expectedDate: '2024-01-17'
  },
  {
    id: '2',
    transferId: 'ST-2024-002',
    fromLocation: 'Main Warehouse',
    toLocation: 'Metro Clinic',
    items: [
      { name: 'Disposable Gloves', quantity: 300, availableStock: 1000, saleUnit: 'Pack' }
    ],
    status: 'In Transit',
    requestDate: '2024-01-18',
    requestedBy: 'Jane Smith',
    priority: 'Medium',
    reason: 'Regular transfer',
    expectedDate: '2024-01-20'
  },
  {
    id: '3',
    transferId: 'ST-2024-003',
    fromLocation: 'City Hospital',
    toLocation: 'Main Warehouse',
    items: [
      { name: 'IV Fluid Bags', quantity: 50, availableStock: 200, saleUnit: 'Pack' }
    ],
    status: 'Pending',
    requestDate: '2024-01-19',
    requestedBy: 'Mike Johnson',
    priority: 'Low',
    reason: 'Excess inventory return',
    expectedDate: '2024-01-22'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all stock transfers
 * TODO: Replace with actual API call: GET /api/stock-transfers
 */
export const fetchStockTransfers = async (): Promise<StockTransfer[]> => {
  await delay(500);
  return [...mockStockTransfers];
};

/**
 * Fetch a single stock transfer by ID
 * TODO: Replace with actual API call: GET /api/stock-transfers/:id
 */
export const fetchStockTransferById = async (id: string): Promise<StockTransfer | null> => {
  await delay(300);
  return mockStockTransfers.find(transfer => transfer.id === id) || null;
};

/**
 * Create a new stock transfer
 * TODO: Replace with actual API call: POST /api/stock-transfers
 */
export const createStockTransfer = async (transferData: Omit<StockTransfer, 'id'>): Promise<StockTransfer> => {
  await delay(800);
  const newTransfer: StockTransfer = {
    ...transferData,
    id: `st-${Date.now()}`,
  };
  mockStockTransfers.push(newTransfer);
  return newTransfer;
};

/**
 * Update an existing stock transfer
 * TODO: Replace with actual API call: PUT /api/stock-transfers/:id
 */
export const updateStockTransfer = async (id: string, transferData: Partial<StockTransfer>): Promise<StockTransfer> => {
  await delay(800);
  const index = mockStockTransfers.findIndex(transfer => transfer.id === id);
  if (index === -1) {
    throw new Error('Stock transfer not found');
  }
  mockStockTransfers[index] = { ...mockStockTransfers[index], ...transferData };
  return mockStockTransfers[index];
};

/**
 * Delete a stock transfer
 * TODO: Replace with actual API call: DELETE /api/stock-transfers/:id
 */
export const deleteStockTransfer = async (id: string): Promise<void> => {
  await delay(500);
  const index = mockStockTransfers.findIndex(transfer => transfer.id === id);
  if (index === -1) {
    throw new Error('Stock transfer not found');
  }
  mockStockTransfers.splice(index, 1);
};

/**
 * Fetch stock transfer statistics
 * TODO: Replace with actual API call: GET /api/stock-transfers/stats
 */
export const fetchStockTransferStats = async () => {
  await delay(400);
  
  const totalTransfers = mockStockTransfers.length;
  const pendingTransfers = mockStockTransfers.filter(t => t.status === 'Pending').length;
  const inTransitTransfers = mockStockTransfers.filter(t => t.status === 'In Transit').length;
  const completedTransfers = mockStockTransfers.filter(t => t.status === 'Completed').length;
  const highPriorityTransfers = mockStockTransfers.filter(t => t.priority === 'High').length;
  const totalItems = mockStockTransfers.reduce((sum, t) => sum + t.items.length, 0);
  
  return {
    totalTransfers,
    pendingTransfers,
    inTransitTransfers,
    completedTransfers,
    highPriorityTransfers,
    totalItems,
    averageItems: totalTransfers > 0 ? totalItems / totalTransfers : 0,
    averageCompletionTime: 0, // Placeholder - would need date calculations
  };
};

/**
 * Approve a stock transfer
 * TODO: Replace with actual API call: POST /api/stock-transfers/:id/approve
 */
export const approveStockTransfer = async (id: string, approvedBy: string): Promise<StockTransfer> => {
  await delay(600);
  const index = mockStockTransfers.findIndex(transfer => transfer.id === id);
  if (index === -1) {
    throw new Error('Stock transfer not found');
  }
  mockStockTransfers[index] = {
    ...mockStockTransfers[index],
    status: 'In Transit',
    approvedBy,
  };
  return mockStockTransfers[index];
};

/**
 * Mark stock transfer as completed
 * TODO: Replace with actual API call: POST /api/stock-transfers/:id/complete
 */
export const completeStockTransfer = async (id: string, completedDate: string): Promise<StockTransfer> => {
  await delay(600);
  const index = mockStockTransfers.findIndex(transfer => transfer.id === id);
  if (index === -1) {
    throw new Error('Stock transfer not found');
  }
  mockStockTransfers[index] = {
    ...mockStockTransfers[index],
    status: 'Completed',
    completedDate,
  };
  return mockStockTransfers[index];
};

/**
 * Search stock transfers
 * TODO: Replace with actual API call: GET /api/stock-transfers/search?q=...
 */
export const searchStockTransfers = async (query: string): Promise<StockTransfer[]> => {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return mockStockTransfers.filter(transfer =>
    transfer.transferId.toLowerCase().includes(lowerQuery) ||
    transfer.fromLocation.toLowerCase().includes(lowerQuery) ||
    transfer.toLocation.toLowerCase().includes(lowerQuery) ||
    transfer.requestedBy.toLowerCase().includes(lowerQuery)
  );
};
