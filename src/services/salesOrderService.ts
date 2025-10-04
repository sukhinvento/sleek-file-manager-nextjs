import { SalesOrder } from '@/types/inventory';

// Mock data - will be replaced with actual API calls
const mockSalesOrders: SalesOrder[] = [
  {
    id: '1',
    orderNumber: 'SO-2024-001',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '+1-555-0123',
    customerAddress: '123 Main St, Springfield, IL 62701',
    orderDate: '2024-01-15',
    dueDate: '2024-01-22',
    status: 'Processing',
    paymentStatus: 'Paid',
    total: 2500.00,
    items: [
      {
        name: 'Paracetamol 500mg',
        qty: 100,
        unitPrice: 10,
        discount: 10,
        subtotal: 900,
        taxSlab: 12,
        saleUnit: 'Strip'
      },
      {
        name: 'Amoxicillin 250mg',
        qty: 50,
        unitPrice: 25,
        discount: 5,
        subtotal: 1187.50,
        taxSlab: 12,
        saleUnit: 'Strip'
      },
      {
        name: 'Hand Sanitizer 500ml',
        qty: 20,
        unitPrice: 85,
        discount: 0,
        subtotal: 1700,
        taxSlab: 18,
        saleUnit: 'Bottle'
      }
    ],
    deliveryDate: '2024-01-22',
    paymentMethod: 'Credit Card',
    shippingAddress: '123 Main St, Springfield, IL 62701',
    billingAddress: '123 Main St, Springfield, IL 62701',
    notes: 'Please ensure temperature-controlled delivery.'
  },
  {
    id: '2',
    orderNumber: 'SO-2024-002',
    customerName: 'Emily Davis',
    customerEmail: 'emily@example.com',
    customerPhone: '+1-555-0124',
    customerAddress: '456 Oak Ave, Portland, OR 97201',
    orderDate: '2024-01-16',
    dueDate: '2024-01-23',
    status: 'Shipped',
    paymentStatus: 'Paid',
    total: 4200.00,
    items: [
      {
        name: 'Surgical Gloves (Box of 100)',
        qty: 30,
        unitPrice: 250,
        discount: 15,
        subtotal: 6375,
        taxSlab: 18,
        saleUnit: 'Box'
      },
      {
        name: 'Face Masks (Pack of 50)',
        qty: 60,
        unitPrice: 150,
        discount: 10,
        subtotal: 8100,
        taxSlab: 12,
        saleUnit: 'Pack'
      }
    ],
    deliveryDate: '2024-01-23',
    paymentMethod: 'Bank Transfer',
    shippingAddress: '456 Oak Ave, Portland, OR 97201',
    billingAddress: '456 Oak Ave, Portland, OR 97201',
    notes: 'Rush order - deliver before noon'
  },
  {
    id: '3',
    orderNumber: 'SO-2024-003',
    customerName: 'Robert Wilson',
    customerEmail: 'robert@example.com',
    customerPhone: '+1-555-0125',
    customerAddress: '789 Pine Rd, Seattle, WA 98101',
    orderDate: '2024-01-17',
    dueDate: '2024-01-24',
    status: 'Delivered',
    paymentStatus: 'Pending',
    total: 1800.00,
    items: [
      {
        name: 'Digital Thermometer',
        qty: 25,
        unitPrice: 450,
        discount: 20,
        subtotal: 9000,
        taxSlab: 18,
        saleUnit: 'Single Unit'
      },
      {
        name: 'Blood Pressure Monitor',
        qty: 10,
        unitPrice: 1200,
        discount: 15,
        subtotal: 10200,
        taxSlab: 18,
        saleUnit: 'Single Unit'
      }
    ],
    deliveryDate: '2024-01-24',
    paymentMethod: 'Cash',
    shippingAddress: '789 Pine Rd, Seattle, WA 98101',
    billingAddress: '789 Pine Rd, Seattle, WA 98101',
    notes: 'Call before delivery'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all sales orders
 * TODO: Replace with actual API call: GET /api/sales-orders
 */
export const fetchSalesOrders = async (): Promise<SalesOrder[]> => {
  await delay(500); // Simulate network delay
  return [...mockSalesOrders];
};

/**
 * Fetch a single sales order by ID
 * TODO: Replace with actual API call: GET /api/sales-orders/:id
 */
export const fetchSalesOrderById = async (id: string): Promise<SalesOrder | null> => {
  await delay(300);
  return mockSalesOrders.find(order => order.id === id) || null;
};

/**
 * Create a new sales order
 * TODO: Replace with actual API call: POST /api/sales-orders
 */
export const createSalesOrder = async (orderData: Omit<SalesOrder, 'id'>): Promise<SalesOrder> => {
  await delay(800);
  const newOrder: SalesOrder = {
    ...orderData,
    id: `so-${Date.now()}`,
  };
  mockSalesOrders.push(newOrder);
  return newOrder;
};

/**
 * Update an existing sales order
 * TODO: Replace with actual API call: PUT /api/sales-orders/:id
 */
export const updateSalesOrder = async (id: string, orderData: Partial<SalesOrder>): Promise<SalesOrder> => {
  await delay(800);
  const index = mockSalesOrders.findIndex(order => order.id === id);
  if (index === -1) {
    throw new Error('Sales order not found');
  }
  mockSalesOrders[index] = { ...mockSalesOrders[index], ...orderData };
  return mockSalesOrders[index];
};

/**
 * Delete a sales order
 * TODO: Replace with actual API call: DELETE /api/sales-orders/:id
 */
export const deleteSalesOrder = async (id: string): Promise<void> => {
  await delay(500);
  const index = mockSalesOrders.findIndex(order => order.id === id);
  if (index === -1) {
    throw new Error('Sales order not found');
  }
  mockSalesOrders.splice(index, 1);
};

/**
 * Fetch sales orders statistics
 * TODO: Replace with actual API call: GET /api/sales-orders/stats
 */
export const fetchSalesOrderStats = async () => {
  await delay(400);
  
  const totalOrders = mockSalesOrders.length;
  const totalRevenue = mockSalesOrders.reduce((sum, order) => sum + order.total, 0);
  const processingOrders = mockSalesOrders.filter(order => order.status === 'Processing').length;
  const deliveredOrders = mockSalesOrders.filter(order => order.status === 'Delivered').length;
  const pendingPayments = mockSalesOrders
    .filter(order => order.paymentStatus === 'Pending')
    .reduce((sum, order) => sum + order.total, 0);
  
  return {
    totalOrders,
    totalRevenue,
    processingOrders,
    deliveredOrders,
    pendingPayments,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
};

/**
 * Search sales orders
 * TODO: Replace with actual API call: GET /api/sales-orders/search?q=...
 */
export const searchSalesOrders = async (query: string): Promise<SalesOrder[]> => {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return mockSalesOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(lowerQuery) ||
    order.customerName.toLowerCase().includes(lowerQuery) ||
    order.customerEmail.toLowerCase().includes(lowerQuery)
  );
};
