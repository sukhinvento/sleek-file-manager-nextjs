import { PurchaseOrder, StockItem, TaxSlab, Offer } from '../types/purchaseOrder';

export const purchaseOrdersData: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-2024-001',
    vendorName: 'Cuisine Supply Inc.',
    vendorContact: 'John Smith',
    vendorPhone: '+1-555-0123',
    vendorEmail: 'john@cuisinesupply.com',
    vendorAddress: '123 Supply Street, Business District',
    shippingAddress: '456 Warehouse Rd, Anytown',
    orderDate: '2024-01-20',
    deliveryDate: '2024-02-15',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Chef Knives', qty: 10, unitPrice: 150.00, discount: 0, subtotal: 1500.00 },
      { name: 'Cutting Boards', qty: 20, unitPrice: 30.00, discount: 5, subtotal: 570.00 }
    ],
    total: 2070.00,
    paidAmount: 0,
    createdBy: 'John Doe',
    approvedBy: 'Jane Smith',
    notes: 'Please ensure knives are high quality.',
    attachments: 2,
    paymentMethod: 'net-30',
    remarks: [
      { date: '2024-01-20', user: 'John Doe', message: 'Order created and sent to vendor' },
      { date: '2024-01-21', user: 'Jane Smith', message: 'Order approved for processing' }
    ]
  },
  {
    id: 2,
    poNumber: 'PO-2024-002',
    vendorName: 'Medical Equipment Co.',
    vendorContact: 'Sarah Johnson',
    vendorPhone: '+1-555-0456',
    vendorEmail: 'sarah@medequip.com',
    vendorAddress: '456 Medical Plaza, Healthcare District',
    shippingAddress: '789 Hospital Ln, Anytown',
    orderDate: '2024-01-22',
    deliveryDate: '2024-02-20',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Surgical Masks', qty: 500, unitPrice: 1.00, discount: 10, subtotal: 450.00 },
      { name: 'Gloves', qty: 1000, unitPrice: 0.50, discount: 0, subtotal: 500.00 }
    ],
    total: 950.00,
    paidAmount: 475.00,
    createdBy: 'Alice Johnson',
    approvedBy: 'Bob Williams',
    notes: 'Gloves must be latex-free.',
    attachments: 0,
    paymentMethod: 'pos',
    remarks: [
      { date: '2024-01-22', user: 'Alice Johnson', message: 'Order created with urgent priority' },
      { date: '2024-01-23', user: 'Bob Williams', message: 'Approved with 50% advance payment' }
    ]
  },
  {
    id: 3,
    poNumber: 'PO-2024-003',
    vendorName: 'Pharma Distributors Ltd.',
    vendorContact: 'Michael Brown',
    vendorPhone: '+1-555-0789',
    vendorEmail: 'michael@pharmadist.com',
    vendorAddress: '789 Pharma Complex, Medical City',
    shippingAddress: '321 Pharmacy St, Anytown',
    orderDate: '2024-01-25',
    deliveryDate: '2024-03-01',
    fulfilmentDate: '2024-02-28',
    status: 'Delivered',
    items: [
      { name: 'Antibiotics', qty: 100, unitPrice: 25.00, discount: 5, subtotal: 2375.00 },
      { name: 'Pain Relievers', qty: 50, unitPrice: 15.00, discount: 0, subtotal: 750.00 }
    ],
    total: 3125.00,
    paidAmount: 3125.00,
    createdBy: 'Carol Davis',
    approvedBy: 'Ted Brown',
    notes: 'Verify expiration dates on delivery.',
    attachments: 1,
    paymentMethod: 'bank-transfer',
    remarks: [
      { date: '2024-01-25', user: 'Carol Davis', message: 'Order placed for Q1 stock replenishment' },
      { date: '2024-01-26', user: 'Ted Brown', message: 'Approved after budget verification' },
      { date: '2024-02-28', user: 'Delivery Team', message: 'Order delivered successfully. All items verified.' }
    ]
  }
];

export const availableStock: StockItem[] = [
  { id: 1, name: 'Chef Knives', brand: 'Professional', stock: 25, unitPrice: 150.00 },
  { id: 2, name: 'Cutting Boards', brand: 'Premium Wood', stock: 50, unitPrice: 30.00 },
  { id: 3, name: 'Surgical Masks', brand: 'Medical Grade', stock: 1000, unitPrice: 1.00 },
  { id: 4, name: 'Latex Gloves', brand: 'SafeGuard', stock: 500, unitPrice: 0.50 },
  { id: 5, name: 'Antibiotics', brand: 'PharmaCorp', stock: 200, unitPrice: 25.00 },
  { id: 6, name: 'Pain Relievers', brand: 'MediCare', stock: 150, unitPrice: 15.00 }
];

export const taxSlabs: TaxSlab[] = [
  { id: 1, name: 'GST 5%', rate: 5 },
  { id: 2, name: 'GST 12%', rate: 12 },
  { id: 3, name: 'GST 18%', rate: 18 },
  { id: 4, name: 'GST 28%', rate: 28 }
];

export const offers: Offer[] = [
  { id: 1, name: 'Bulk Discount 10%', rate: 10, minQty: 100 },
  { id: 2, name: 'Early Bird 5%', rate: 5, minQty: 1 },
  { id: 3, name: 'Seasonal Offer 15%', rate: 15, minQty: 50 }
];