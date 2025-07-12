import { SalesOrder, StockTransfer, Vendor, InventoryItem, Location } from '../types/inventory';

// Sales Orders Data
export const salesOrdersData: SalesOrder[] = [
  {
    id: "so-1",
    orderNumber: 'SO-100001',
    customerName: 'City General Hospital',
    customerEmail: 'procurement@citygeneral.com',
    customerPhone: '+91-9876543210',
    customerAddress: '123 Medical Street, Mumbai, Maharashtra 400001',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-20',
    status: 'Shipped',
    items: [
      { name: 'Surgical Masks', qty: 1000, unitPrice: 5.50, discount: 10, subtotal: 4950.00 },
      { name: 'Hand Sanitizer', qty: 50, unitPrice: 75.00, discount: 5, subtotal: 3562.50 }
    ],
    total: 8750.00,
    dueDate: '2024-01-20',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    shippingAddress: '123 Medical Street, Mumbai, Maharashtra 400001',
    billingAddress: '123 Medical Street, Mumbai, Maharashtra 400001',
    notes: 'Priority delivery required for surgical department'
  },
  {
    id: "so-2",
    orderNumber: 'SO-100002',
    customerName: 'Metro Clinic',
    customerEmail: 'orders@metroclinic.com',
    customerPhone: '+91-9876543211',
    customerAddress: '456 Health Avenue, Delhi, Delhi 110001',
    orderDate: '2024-01-16',
    deliveryDate: '2024-01-21',
    status: 'Processing',
    items: [
      { name: 'Disposable Gloves', qty: 500, unitPrice: 8.50, discount: 0, subtotal: 4250.50 }
    ],
    total: 4250.50,
    dueDate: '2024-01-21',
    paymentStatus: 'Pending',
    paymentMethod: 'Credit Card',
    shippingAddress: '456 Health Avenue, Delhi, Delhi 110001',
    billingAddress: '456 Health Avenue, Delhi, Delhi 110001',
    notes: 'Regular monthly order'
  },
  {
    id: "so-3",
    orderNumber: 'SO-100003',
    customerName: 'Regional Medical Center',
    customerEmail: 'supply@regionalmed.com',
    customerPhone: '+91-9876543212',
    customerAddress: '789 Care Boulevard, Bangalore, Karnataka 560001',
    orderDate: '2024-01-17',
    deliveryDate: '2024-01-22',
    status: 'Delivered',
    items: [
      { name: 'Medical Equipment', qty: 2, unitPrice: 5000.00, discount: 5, subtotal: 9500.00 },
      { name: 'Pharmaceuticals', qty: 100, unitPrice: 28.00, discount: 0, subtotal: 2800.75 }
    ],
    total: 12300.75,
    dueDate: '2024-01-22',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    shippingAddress: '789 Care Boulevard, Bangalore, Karnataka 560001',
    billingAddress: '789 Care Boulevard, Bangalore, Karnataka 560001',
    notes: 'Bulk order for new wing opening'
  }
];

// Stock Transfers Data
export const stockTransfersData: StockTransfer[] = [
  {
    id: "st-1",
    transferId: 'ST-100001',
    fromLocation: 'Main Warehouse',
    toLocation: 'Emergency Room',
    items: [
      { name: 'Bandages', quantity: 50 },
      { name: 'Syringes', quantity: 100 }
    ],
    status: 'Completed',
    requestDate: '2024-01-15',
    completedDate: '2024-01-16',
    requestedBy: 'Dr. Sarah Johnson',
    reason: 'Emergency stock replenishment',
    priority: 'High'
  },
  {
    id: "st-2",
    transferId: 'ST-100002',
    fromLocation: 'Eastern Warehouse',
    toLocation: 'ICU',
    items: [
      { name: 'IV Fluids', quantity: 25 },
      { name: 'Oxygen Masks', quantity: 15 }
    ],
    status: 'In Transit',
    requestDate: '2024-01-17',
    requestedBy: 'Nurse Manager',
    priority: 'Medium',
    expectedDate: '2024-01-19'
  },
  {
    id: "st-3",
    transferId: 'ST-100003',
    fromLocation: 'Main Warehouse',
    toLocation: 'Pharmacy',
    items: [
      { name: 'Antibiotics', quantity: 200 },
      { name: 'Pain Relievers', quantity: 150 }
    ],
    status: 'Pending',
    requestDate: '2024-01-18',
    requestedBy: 'Pharmacy Manager',
    priority: 'Low'
  }
];

// Vendors Data
export const vendorsData: Vendor[] = [
  {
    id: "v-1",
    vendorId: 'V001',
    name: 'Cuisine Supply Inc.',
    contactPerson: 'John Anderson',
    phone: '+1-555-0123',
    email: 'john@cuisinesupply.com',
    address: '123 Industrial Blvd, City, State 12345',
    category: 'Food & Beverages',
    status: 'Active',
    totalOrders: 45,
    lastOrderDate: '2024-01-15',
    totalValue: 125000.50,
    paymentTerms: 'Net 30',
    taxId: 'TAX123456789',
    website: 'www.cuisinesupply.com',
    bankDetails: 'HDFC Bank - 123456789',
    creditLimit: 50000.00,
    outstandingBalance: 12500.00,
    registrationDate: '2023-01-15',
    notes: 'Reliable supplier for food and beverage items'
  },
  {
    id: "v-2",
    vendorId: 'V002',
    name: 'Medical Equipment Co.',
    contactPerson: 'Sarah Wilson',
    phone: '+1-555-0124',
    email: 'sarah@medequip.com',
    address: '456 Medical Drive, City, State 12345',
    category: 'Medical Equipment',
    status: 'Active',
    totalOrders: 23,
    lastOrderDate: '2024-01-16',
    totalValue: 89000.75,
    paymentTerms: 'Net 15',
    taxId: 'TAX987654321',
    website: 'www.medequip.com',
    bankDetails: 'ICICI Bank - 987654321',
    creditLimit: 75000.00,
    outstandingBalance: 8900.00,
    registrationDate: '2023-03-20',
    notes: 'Specialized in medical equipment and supplies'
  },
  {
    id: "v-3",
    vendorId: 'V003',
    name: 'Pharma Distributors Ltd.',
    contactPerson: 'Michael Brown',
    phone: '+1-555-0125',
    email: 'michael@pharmadist.com',
    address: '789 Pharma Street, City, State 12345',
    category: 'Pharmaceuticals',
    status: 'Inactive',
    totalOrders: 67,
    lastOrderDate: '2024-01-10',
    totalValue: 235000.25,
    paymentTerms: 'Net 45',
    taxId: 'TAX456789123',
    website: 'www.pharmadist.com',
    bankDetails: 'SBI Bank - 456789123',
    creditLimit: 100000.00,
    outstandingBalance: 0.00,
    registrationDate: '2022-08-10',
    notes: 'Large pharmaceutical distributor with wide product range'
  }
];

// Inventory Items Data
export const inventoryItemsData: InventoryItem[] = [
  {
    id: "inv-1",
    name: 'Paracetamol 500mg',
    category: 'Medication',
    sku: 'MED001',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitPrice: 2.50,
    supplier: 'PharmaCorp Ltd',
    expiryDate: '2025-08-15',
    batchNumber: 'PC2024001',
    location: 'Pharmacy - Shelf A1',
    manufacturer: 'PharmaCorp'
  },
  {
    id: "inv-2",
    name: 'Surgical Gloves (Box)',
    category: 'Medical Supplies',
    sku: 'SUP001',
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    unitPrice: 15.00,
    supplier: 'MedSupply Co',
    expiryDate: '2026-12-31',
    batchNumber: 'MS2024015',
    location: 'Supply Room - Bin 15'
  },
  {
    id: "inv-3",
    name: 'Digital Thermometer',
    category: 'Equipment',
    sku: 'EQP001',
    currentStock: 8,
    minStock: 5,
    maxStock: 25,
    unitPrice: 45.00,
    supplier: 'MedTech Solutions',
    batchNumber: 'MT2024008',
    location: 'Equipment Store - Rack C'
  }
];

// Locations Data
export const locationsData: Location[] = [
  { id: "loc-1", name: 'Main Warehouse', type: 'Warehouse', capacity: 10000, manager: 'John Smith' },
  { id: "loc-2", name: 'Eastern Warehouse', type: 'Warehouse', capacity: 5000, manager: 'Jane Doe' },
  { id: "loc-3", name: 'Emergency Room', type: 'Department', manager: 'Dr. Sarah Johnson' },
  { id: "loc-4", name: 'ICU', type: 'Department', manager: 'Nurse Manager' },
  { id: "loc-5", name: 'Pharmacy', type: 'Department', manager: 'Pharmacy Manager' },
  { id: "loc-6", name: 'Surgery Department', type: 'Department', manager: 'Dr. Michael Brown' }
];