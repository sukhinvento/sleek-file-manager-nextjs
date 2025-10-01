import { PurchaseOrder, StockItem, TaxSlab, Offer } from '../types/purchaseOrder';

export const purchaseOrdersData: PurchaseOrder[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
  },
  {
    id: "4",
    poNumber: 'PO-2024-004',
    vendorName: 'Tech Solutions Corp.',
    vendorContact: 'Emily Rodriguez',
    vendorPhone: '+1-555-1111',
    vendorEmail: 'emily@techsolutions.com',
    vendorAddress: '100 Tech Park, Innovation District',
    shippingAddress: '200 Office Blvd, Anytown',
    orderDate: '2024-02-01',
    deliveryDate: '2024-02-25',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Laptops', qty: 5, unitPrice: 1200.00, discount: 0, subtotal: 6000.00 },
      { name: 'Monitors', qty: 10, unitPrice: 300.00, discount: 5, subtotal: 2850.00 }
    ],
    total: 8850.00,
    paidAmount: 0,
    createdBy: 'David Wilson',
    approvedBy: null,
    notes: 'Latest model laptops required.',
    attachments: 3,
    paymentMethod: 'net-30',
    remarks: [
      { date: '2024-02-01', user: 'David Wilson', message: 'Order created for new employee setup' }
    ]
  },
  {
    id: "5",
    poNumber: 'PO-2024-005',
    vendorName: 'Office Supplies Plus',
    vendorContact: 'Robert Chen',
    vendorPhone: '+1-555-2222',
    vendorEmail: 'robert@officesupplies.com',
    vendorAddress: '300 Commerce Way, Business Park',
    shippingAddress: '400 Corporate Center, Anytown',
    orderDate: '2024-02-03',
    deliveryDate: '2024-02-18',
    fulfilmentDate: '2024-02-16',
    status: 'Delivered',
    items: [
      { name: 'Paper Reams', qty: 100, unitPrice: 8.50, discount: 10, subtotal: 765.00 },
      { name: 'Pens', qty: 200, unitPrice: 1.25, discount: 0, subtotal: 250.00 },
      { name: 'Folders', qty: 50, unitPrice: 2.75, discount: 5, subtotal: 130.63 }
    ],
    total: 1145.63,
    paidAmount: 1145.63,
    createdBy: 'Lisa Martinez',
    approvedBy: 'Tom Anderson',
    notes: 'Standard office supplies replenishment.',
    attachments: 1,
    paymentMethod: 'credit-card',
    remarks: [
      { date: '2024-02-03', user: 'Lisa Martinez', message: 'Monthly supplies order' },
      { date: '2024-02-04', user: 'Tom Anderson', message: 'Approved - standard order' },
      { date: '2024-02-16', user: 'Reception', message: 'Delivered early, all items accounted for' }
    ]
  },
  {
    id: "6",
    poNumber: 'PO-2024-006',
    vendorName: 'Industrial Equipment Ltd.',
    vendorContact: 'Jennifer Walsh',
    vendorPhone: '+1-555-3333',
    vendorEmail: 'jennifer@industrial-eq.com',
    vendorAddress: '500 Industrial Ave, Manufacturing Zone',
    shippingAddress: '600 Factory Rd, Anytown',
    orderDate: '2024-02-05',
    deliveryDate: '2024-03-10',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Conveyor Belt', qty: 1, unitPrice: 5000.00, discount: 0, subtotal: 5000.00 },
      { name: 'Motors', qty: 3, unitPrice: 800.00, discount: 8, subtotal: 2208.00 }
    ],
    total: 7208.00,
    paidAmount: 3604.00,
    createdBy: 'Mark Thompson',
    approvedBy: 'Sandra Lee',
    notes: 'Industrial grade equipment for production line.',
    attachments: 5,
    paymentMethod: 'bank-transfer',
    remarks: [
      { date: '2024-02-05', user: 'Mark Thompson', message: 'Equipment order for production expansion' },
      { date: '2024-02-06', user: 'Sandra Lee', message: 'Approved with 50% advance payment' }
    ]
  },
  {
    id: "7",
    poNumber: 'PO-2024-007',
    vendorName: 'Food Service Distributors',
    vendorContact: 'Carlos Ruiz',
    vendorPhone: '+1-555-4444',
    vendorEmail: 'carlos@foodservice.com',
    vendorAddress: '700 Culinary Center, Food District',
    shippingAddress: '800 Kitchen Way, Anytown',
    orderDate: '2024-02-08',
    deliveryDate: '2024-02-22',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Commercial Refrigerator', qty: 2, unitPrice: 2500.00, discount: 5, subtotal: 4750.00 },
      { name: 'Prep Tables', qty: 4, unitPrice: 450.00, discount: 0, subtotal: 1800.00 }
    ],
    total: 6550.00,
    paidAmount: 0,
    createdBy: 'Anna Garcia',
    approvedBy: null,
    notes: 'Equipment for new kitchen facility.',
    attachments: 2,
    paymentMethod: 'net-60',
    remarks: [
      { date: '2024-02-08', user: 'Anna Garcia', message: 'Kitchen equipment order for restaurant expansion' }
    ]
  },
  {
    id: "8",
    poNumber: 'PO-2024-008',
    vendorName: 'Chemical Supplies Inc.',
    vendorContact: 'Dr. Patricia Kim',
    vendorPhone: '+1-555-5555',
    vendorEmail: 'patricia@chemsupplies.com',
    vendorAddress: '900 Lab Complex, Research Park',
    shippingAddress: '1000 Science Blvd, Anytown',
    orderDate: '2024-02-10',
    deliveryDate: '2024-03-05',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Laboratory Reagents', qty: 20, unitPrice: 125.00, discount: 0, subtotal: 2500.00 },
      { name: 'Test Tubes', qty: 500, unitPrice: 2.50, discount: 15, subtotal: 1062.50 },
      { name: 'Beakers', qty: 100, unitPrice: 15.00, discount: 10, subtotal: 1350.00 }
    ],
    total: 4912.50,
    paidAmount: 0,
    createdBy: 'Dr. Richard Park',
    approvedBy: 'Dr. Helen Davis',
    notes: 'Laboratory supplies for research project.',
    attachments: 4,
    paymentMethod: 'net-30',
    remarks: [
      { date: '2024-02-10', user: 'Dr. Richard Park', message: 'Research supplies order for Q1 projects' },
      { date: '2024-02-11', user: 'Dr. Helen Davis', message: 'Approved by research committee' }
    ]
  },
  {
    id: "9",
    poNumber: 'PO-2024-009',
    vendorName: 'Construction Materials Co.',
    vendorContact: 'Miguel Santos',
    vendorPhone: '+1-555-6666',
    vendorEmail: 'miguel@constructmat.com',
    vendorAddress: '1100 Builder Ave, Construction Zone',
    shippingAddress: '1200 Project Site, Anytown',
    orderDate: '2024-02-12',
    deliveryDate: '2024-03-01',
    fulfilmentDate: '2024-02-28',
    status: 'Delivered',
    items: [
      { name: 'Cement Bags', qty: 200, unitPrice: 12.50, discount: 5, subtotal: 2375.00 },
      { name: 'Steel Rods', qty: 50, unitPrice: 45.00, discount: 0, subtotal: 2250.00 },
      { name: 'Bricks', qty: 1000, unitPrice: 0.75, discount: 10, subtotal: 675.00 }
    ],
    total: 5300.00,
    paidAmount: 5300.00,
    createdBy: 'James Wilson',
    approvedBy: 'Maria Rodriguez',
    notes: 'Materials for building renovation project.',
    attachments: 2,
    paymentMethod: 'check',
    remarks: [
      { date: '2024-02-12', user: 'James Wilson', message: 'Construction materials order for renovation' },
      { date: '2024-02-13', user: 'Maria Rodriguez', message: 'Approved for immediate delivery' },
      { date: '2024-02-28', user: 'Construction Team', message: 'All materials delivered to site' }
    ]
  },
  {
    id: "10",
    poNumber: 'PO-2024-010',
    vendorName: 'Textile Manufacturing',
    vendorContact: 'Susan Taylor',
    vendorPhone: '+1-555-7777',
    vendorEmail: 'susan@textilemanuf.com',
    vendorAddress: '1300 Fabric Row, Textile District',
    shippingAddress: '1400 Garment St, Anytown',
    orderDate: '2024-02-15',
    deliveryDate: '2024-03-15',
    fulfilmentDate: null,
    status: 'Cancelled',
    items: [
      { name: 'Cotton Fabric', qty: 100, unitPrice: 25.00, discount: 0, subtotal: 2500.00 },
      { name: 'Buttons', qty: 1000, unitPrice: 0.50, discount: 20, subtotal: 400.00 }
    ],
    total: 2900.00,
    paidAmount: 0,
    createdBy: 'Rachel Green',
    approvedBy: null,
    notes: 'Order cancelled due to design changes.',
    attachments: 1,
    paymentMethod: 'net-30',
    remarks: [
      { date: '2024-02-15', user: 'Rachel Green', message: 'Fabric order for new clothing line' },
      { date: '2024-02-20', user: 'Rachel Green', message: 'Order cancelled - design specifications changed' }
    ]
  },
  {
    id: "11",
    poNumber: 'PO-2024-011',
    vendorName: 'Electronics Wholesale',
    vendorContact: 'Kevin Wu',
    vendorPhone: '+1-555-8888',
    vendorEmail: 'kevin@electronicsw.com',
    vendorAddress: '1500 Circuit Way, Tech Valley',
    shippingAddress: '1600 Digital Ave, Anytown',
    orderDate: '2024-02-18',
    deliveryDate: '2024-03-08',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Smartphones', qty: 15, unitPrice: 800.00, discount: 5, subtotal: 11400.00 },
      { name: 'Tablets', qty: 8, unitPrice: 400.00, discount: 0, subtotal: 3200.00 },
      { name: 'Chargers', qty: 25, unitPrice: 25.00, discount: 10, subtotal: 562.50 }
    ],
    total: 15162.50,
    paidAmount: 7581.25,
    createdBy: 'Alex Johnson',
    approvedBy: 'Nancy Brown',
    notes: 'Electronics for employee mobile program.',
    attachments: 3,
    paymentMethod: 'wire-transfer',
    remarks: [
      { date: '2024-02-18', user: 'Alex Johnson', message: 'Mobile device order for remote workers' },
      { date: '2024-02-19', user: 'Nancy Brown', message: 'Approved with 50% advance payment' }
    ]
  },
  {
    id: "12",
    poNumber: 'PO-2024-012',
    vendorName: 'Furniture Solutions',
    vendorContact: 'Diana Prince',
    vendorPhone: '+1-555-9999',
    vendorEmail: 'diana@furnituresol.com',
    vendorAddress: '1700 Design Plaza, Furniture District',
    shippingAddress: '1800 Office Complex, Anytown',
    orderDate: '2024-02-20',
    deliveryDate: '2024-03-20',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Office Desks', qty: 12, unitPrice: 350.00, discount: 8, subtotal: 3864.00 },
      { name: 'Ergonomic Chairs', qty: 12, unitPrice: 250.00, discount: 10, subtotal: 2700.00 },
      { name: 'Filing Cabinets', qty: 6, unitPrice: 180.00, discount: 0, subtotal: 1080.00 }
    ],
    total: 7644.00,
    paidAmount: 0,
    createdBy: 'Peter Parker',
    approvedBy: null,
    notes: 'Furniture for new office space.',
    attachments: 2,
    paymentMethod: 'net-45',
    remarks: [
      { date: '2024-02-20', user: 'Peter Parker', message: 'Office furniture order for expansion' }
    ]
  },
  {
    id: "13",
    poNumber: 'PO-2024-013',
    vendorName: 'Automotive Parts Direct',
    vendorContact: 'Tony Stark',
    vendorPhone: '+1-555-1010',
    vendorEmail: 'tony@autoparts.com',
    vendorAddress: '1900 Motor Way, Auto District',
    shippingAddress: '2000 Fleet St, Anytown',
    orderDate: '2024-02-22',
    deliveryDate: '2024-03-12',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Brake Pads', qty: 24, unitPrice: 65.00, discount: 12, subtotal: 1372.80 },
      { name: 'Oil Filters', qty: 48, unitPrice: 18.00, discount: 0, subtotal: 864.00 },
      { name: 'Spark Plugs', qty: 96, unitPrice: 8.50, discount: 15, subtotal: 692.40 }
    ],
    total: 2929.20,
    paidAmount: 0,
    createdBy: 'Bruce Wayne',
    approvedBy: 'Clark Kent',
    notes: 'Fleet maintenance supplies.',
    attachments: 1,
    paymentMethod: 'net-30',
    remarks: [
      { date: '2024-02-22', user: 'Bruce Wayne', message: 'Fleet maintenance parts order' },
      { date: '2024-02-23', user: 'Clark Kent', message: 'Approved for fleet operations' }
    ]
  },
  {
    id: "14",
    poNumber: 'PO-2024-014',
    vendorName: 'Beauty Supply Wholesale',
    vendorContact: 'Natasha Romanoff',
    vendorPhone: '+1-555-1212',
    vendorEmail: 'natasha@beautysupply.com',
    vendorAddress: '2100 Beauty Blvd, Cosmetic Center',
    shippingAddress: '2200 Salon Ave, Anytown',
    orderDate: '2024-02-25',
    deliveryDate: '2024-03-18',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Hair Products', qty: 50, unitPrice: 35.00, discount: 10, subtotal: 1575.00 },
      { name: 'Nail Polish', qty: 100, unitPrice: 12.00, discount: 5, subtotal: 1140.00 },
      { name: 'Makeup Brushes', qty: 75, unitPrice: 22.00, discount: 0, subtotal: 1650.00 }
    ],
    total: 4365.00,
    paidAmount: 0,
    createdBy: 'Wanda Maximoff',
    approvedBy: null,
    notes: 'Beauty supplies for salon chain.',
    attachments: 4,
    paymentMethod: 'net-30',
    remarks: [
      { date: '2024-02-25', user: 'Wanda Maximoff', message: 'Beauty supplies order for Q1 inventory' }
    ]
  },
  {
    id: "15",
    poNumber: 'PO-2024-015',
    vendorName: 'Sports Equipment Pro',
    vendorContact: 'Steve Rogers',
    vendorPhone: '+1-555-1313',
    vendorEmail: 'steve@sportsequip.com',
    vendorAddress: '2300 Athletic Way, Sports Complex',
    shippingAddress: '2400 Fitness Blvd, Anytown',
    orderDate: '2024-02-28',
    deliveryDate: '2024-03-25',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Treadmills', qty: 5, unitPrice: 1800.00, discount: 0, subtotal: 9000.00 },
      { name: 'Weight Sets', qty: 10, unitPrice: 450.00, discount: 8, subtotal: 4140.00 },
      { name: 'Exercise Mats', qty: 30, unitPrice: 25.00, discount: 20, subtotal: 600.00 }
    ],
    total: 13740.00,
    paidAmount: 4122.00,
    createdBy: 'Sam Wilson',
    approvedBy: 'Bucky Barnes',
    notes: 'Gym equipment for fitness center.',
    attachments: 3,
    paymentMethod: 'bank-transfer',
    remarks: [
      { date: '2024-02-28', user: 'Sam Wilson', message: 'Fitness equipment order for new gym' },
      { date: '2024-03-01', user: 'Bucky Barnes', message: 'Approved with 30% advance payment' }
    ]
  },
  {
    id: "16",
    poNumber: 'PO-2024-016',
    vendorName: 'Garden Supply Center',
    vendorContact: 'Pepper Potts',
    vendorPhone: '+1-555-1414',
    vendorEmail: 'pepper@gardensupply.com',
    vendorAddress: '2500 Green Thumb Lane, Garden District',
    shippingAddress: '2600 Landscape Ave, Anytown',
    orderDate: '2024-03-02',
    deliveryDate: '2024-03-22',
    fulfilmentDate: '2024-03-20',
    status: 'Delivered',
    items: [
      { name: 'Lawn Mowers', qty: 3, unitPrice: 650.00, discount: 5, subtotal: 1852.50 },
      { name: 'Garden Tools', qty: 25, unitPrice: 35.00, discount: 10, subtotal: 787.50 },
      { name: 'Fertilizer', qty: 50, unitPrice: 28.00, discount: 0, subtotal: 1400.00 }
    ],
    total: 4040.00,
    paidAmount: 4040.00,
    createdBy: 'Happy Hogan',
    approvedBy: 'Rhodey Rhodes',
    notes: 'Landscaping equipment and supplies.',
    attachments: 2,
    paymentMethod: 'credit-card',
    remarks: [
      { date: '2024-03-02', user: 'Happy Hogan', message: 'Landscaping supplies order' },
      { date: '2024-03-03', user: 'Rhodey Rhodes', message: 'Approved for grounds maintenance' },
      { date: '2024-03-20', user: 'Grounds Team', message: 'All equipment delivered and operational' }
    ]
  },
  {
    id: "17",
    poNumber: 'PO-2024-017',
    vendorName: 'Cleaning Services Supply',
    vendorContact: 'May Parker',
    vendorPhone: '+1-555-1515',
    vendorEmail: 'may@cleaningsupply.com',
    vendorAddress: '2700 Hygiene Way, Sanitation District',
    shippingAddress: '2800 Clean Street, Anytown',
    orderDate: '2024-03-05',
    deliveryDate: '2024-03-28',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Industrial Vacuums', qty: 4, unitPrice: 850.00, discount: 0, subtotal: 3400.00 },
      { name: 'Cleaning Chemicals', qty: 100, unitPrice: 15.50, discount: 12, subtotal: 1364.00 },
      { name: 'Microfiber Cloths', qty: 200, unitPrice: 3.25, discount: 15, subtotal: 552.50 }
    ],
    total: 5316.50,
    paidAmount: 0,
    createdBy: 'Ben Parker',
    approvedBy: null,
    notes: 'Commercial cleaning equipment order.',
    attachments: 1,
    paymentMethod: 'net-60',
    remarks: [
      { date: '2024-03-05', user: 'Ben Parker', message: 'Cleaning equipment order for facility maintenance' }
    ]
  },
  {
    id: "18",
    poNumber: 'PO-2024-018',
    vendorName: 'Security Systems Ltd.',
    vendorContact: 'Nick Fury',
    vendorPhone: '+1-555-1616',
    vendorEmail: 'nick@securitysys.com',
    vendorAddress: '2900 Secure Blvd, Safety Zone',
    shippingAddress: '3000 Protection Ave, Anytown',
    orderDate: '2024-03-08',
    deliveryDate: '2024-04-05',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Security Cameras', qty: 20, unitPrice: 200.00, discount: 8, subtotal: 3680.00 },
      { name: 'Access Control Panels', qty: 5, unitPrice: 500.00, discount: 0, subtotal: 2500.00 },
      { name: 'Motion Sensors', qty: 15, unitPrice: 75.00, discount: 10, subtotal: 1012.50 }
    ],
    total: 7192.50,
    paidAmount: 2157.75,
    createdBy: 'Maria Hill',
    approvedBy: 'Phil Coulson',
    notes: 'Security system upgrade for facility.',
    attachments: 5,
    paymentMethod: 'wire-transfer',
    remarks: [
      { date: '2024-03-08', user: 'Maria Hill', message: 'Security equipment order for facility upgrade' },
      { date: '2024-03-09', user: 'Phil Coulson', message: 'Approved with 30% advance payment' }
    ]
  },
  {
    id: "19",
    poNumber: 'PO-2024-019',
    vendorName: 'Catering Equipment Co.',
    vendorContact: 'Thor Odinson',
    vendorPhone: '+1-555-1717',
    vendorEmail: 'thor@cateringequip.com',
    vendorAddress: '3100 Culinary Court, Food Service District',
    shippingAddress: '3200 Banquet Blvd, Anytown',
    orderDate: '2024-03-10',
    deliveryDate: '2024-04-10',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Commercial Ovens', qty: 2, unitPrice: 3500.00, discount: 5, subtotal: 6650.00 },
      { name: 'Food Warmers', qty: 6, unitPrice: 450.00, discount: 0, subtotal: 2700.00 },
      { name: 'Serving Trays', qty: 50, unitPrice: 28.00, discount: 15, subtotal: 1190.00 }
    ],
    total: 10540.00,
    paidAmount: 0,
    createdBy: 'Loki Laufeyson',
    approvedBy: null,
    notes: 'Catering equipment for events center.',
    attachments: 3,
    paymentMethod: 'net-45',
    remarks: [
      { date: '2024-03-10', user: 'Loki Laufeyson', message: 'Catering equipment order for events facility' }
    ]
  },
  {
    id: "20",
    poNumber: 'PO-2024-020',
    vendorName: 'Print Solutions Inc.',
    vendorContact: 'Vision Synthezoid',
    vendorPhone: '+1-555-1818',
    vendorEmail: 'vision@printsolutions.com',
    vendorAddress: '3300 Print Way, Publishing District',
    shippingAddress: '3400 Media Ave, Anytown',
    orderDate: '2024-03-12',
    deliveryDate: '2024-04-02',
    fulfilmentDate: '2024-03-30',
    status: 'Delivered',
    items: [
      { name: 'Industrial Printers', qty: 3, unitPrice: 2200.00, discount: 0, subtotal: 6600.00 },
      { name: 'Ink Cartridges', qty: 24, unitPrice: 85.00, discount: 10, subtotal: 1836.00 },
      { name: 'Paper Stock', qty: 100, unitPrice: 45.00, discount: 8, subtotal: 4140.00 }
    ],
    total: 12576.00,
    paidAmount: 12576.00,
    createdBy: 'Scarlett Witch',
    approvedBy: 'Doctor Strange',
    notes: 'Printing equipment for marketing department.',
    attachments: 2,
    paymentMethod: 'check',
    remarks: [
      { date: '2024-03-12', user: 'Scarlett Witch', message: 'Printing equipment order for marketing campaigns' },
      { date: '2024-03-13', user: 'Doctor Strange', message: 'Approved for immediate processing' },
      { date: '2024-03-30', user: 'IT Team', message: 'All equipment installed and configured' }
    ]
  },
  {
    id: "21",
    poNumber: 'PO-2024-021',
    vendorName: 'Pharmaceutical Supplies Co.',
    vendorContact: 'Bruce Banner',
    vendorPhone: '+1-555-1919',
    vendorEmail: 'bruce@pharmasupplies.com',
    vendorAddress: '3500 Medicine Lane, Healthcare Complex',
    shippingAddress: '3600 Healing St, Anytown',
    orderDate: '2024-03-15',
    deliveryDate: '2024-04-12',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Blood Pressure Monitors', qty: 10, unitPrice: 120.00, discount: 5, subtotal: 1140.00 },
      { name: 'Thermometers', qty: 25, unitPrice: 35.00, discount: 0, subtotal: 875.00 },
      { name: 'Stethoscopes', qty: 8, unitPrice: 180.00, discount: 10, subtotal: 1296.00 }
    ],
    total: 3311.00,
    paidAmount: 1655.50,
    createdBy: 'Hulk Smash',
    approvedBy: 'Betty Ross',
    notes: 'Medical equipment for clinic expansion.',
    attachments: 2,
    paymentMethod: 'bank-transfer',
    remarks: [
      { date: '2024-03-15', user: 'Hulk Smash', message: 'Medical equipment order for new clinic' },
      { date: '2024-03-16', user: 'Betty Ross', message: 'Approved with 50% advance payment' }
    ]
  },
  {
    id: "22",
    poNumber: 'PO-2024-022',
    vendorName: 'Event Management Supplies',
    vendorContact: 'Carol Danvers',
    vendorPhone: '+1-555-2020',
    vendorEmail: 'carol@eventsupplies.com',
    vendorAddress: '3700 Celebration Way, Entertainment District',
    shippingAddress: '3800 Party Plaza, Anytown',
    orderDate: '2024-03-18',
    deliveryDate: '2024-04-15',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Sound Systems', qty: 4, unitPrice: 1500.00, discount: 8, subtotal: 5520.00 },
      { name: 'Lighting Equipment', qty: 12, unitPrice: 250.00, discount: 0, subtotal: 3000.00 },
      { name: 'Staging Materials', qty: 20, unitPrice: 150.00, discount: 12, subtotal: 2640.00 }
    ],
    total: 11160.00,
    paidAmount: 0,
    createdBy: 'Monica Rambeau',
    approvedBy: null,
    notes: 'AV equipment for corporate events.',
    attachments: 4,
    paymentMethod: 'net-30',
    remarks: [
      { date: '2024-03-18', user: 'Monica Rambeau', message: 'Event equipment order for conference season' }
    ]
  },
  {
    id: "23",
    poNumber: 'PO-2024-023',
    vendorName: 'Laboratory Equipment Direct',
    vendorContact: 'Stephen Strange',
    vendorPhone: '+1-555-2121',
    vendorEmail: 'stephen@labequip.com',
    vendorAddress: '3900 Research Rd, Science Park',
    shippingAddress: '4000 Discovery Dr, Anytown',
    orderDate: '2024-03-20',
    deliveryDate: '2024-04-20',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Microscopes', qty: 5, unitPrice: 2800.00, discount: 0, subtotal: 14000.00 },
      { name: 'Centrifuges', qty: 3, unitPrice: 1200.00, discount: 5, subtotal: 3420.00 },
      { name: 'Lab Benches', qty: 8, unitPrice: 800.00, discount: 10, subtotal: 5760.00 }
    ],
    total: 23180.00,
    paidAmount: 6954.00,
    createdBy: 'Wong Keeper',
    approvedBy: 'Ancient One',
    notes: 'Advanced laboratory equipment for research.',
    attachments: 6,
    paymentMethod: 'wire-transfer',
    remarks: [
      { date: '2024-03-20', user: 'Wong Keeper', message: 'Laboratory equipment order for research expansion' },
      { date: '2024-03-21', user: 'Ancient One', message: 'Approved with 30% advance payment' }
    ]
  },
  {
    id: "24",
    poNumber: 'PO-2024-024',
    vendorName: 'Hospitality Supplies Co.',
    vendorContact: 'Peter Quill',
    vendorPhone: '+1-555-2222',
    vendorEmail: 'peter@hospitalitysupplies.com',
    vendorAddress: '4100 Service Ave, Hospitality District',
    shippingAddress: '4200 Guest Blvd, Anytown',
    orderDate: '2024-03-22',
    deliveryDate: '2024-04-18',
    fulfilmentDate: null,
    status: 'Pending',
    items: [
      { name: 'Hotel Linens', qty: 100, unitPrice: 45.00, discount: 15, subtotal: 3825.00 },
      { name: 'Towel Sets', qty: 80, unitPrice: 25.00, discount: 10, subtotal: 1800.00 },
      { name: 'Room Amenities', qty: 200, unitPrice: 12.50, discount: 0, subtotal: 2500.00 }
    ],
    total: 8125.00,
    paidAmount: 0,
    createdBy: 'Gamora Green',
    approvedBy: null,
    notes: 'Hotel supplies for guest room renovation.',
    attachments: 2,
    paymentMethod: 'net-45',
    remarks: [
      { date: '2024-03-22', user: 'Gamora Green', message: 'Hotel supplies order for room upgrades' }
    ]
  },
  {
    id: "25",
    poNumber: 'PO-2024-025',
    vendorName: 'Transportation Fleet Parts',
    vendorContact: 'Rocket Raccoon',
    vendorPhone: '+1-555-2323',
    vendorEmail: 'rocket@fleetparts.com',
    vendorAddress: '4300 Motor Court, Transportation Hub',
    shippingAddress: '4400 Fleet St, Anytown',
    orderDate: '2024-03-25',
    deliveryDate: '2024-04-22',
    fulfilmentDate: null,
    status: 'Approved',
    items: [
      { name: 'Truck Tires', qty: 16, unitPrice: 200.00, discount: 8, subtotal: 2944.00 },
      { name: 'Engine Parts', qty: 24, unitPrice: 150.00, discount: 0, subtotal: 3600.00 },
      { name: 'Brake Components', qty: 32, unitPrice: 85.00, discount: 12, subtotal: 2396.80 }
    ],
    total: 8940.80,
    paidAmount: 2682.24,
    createdBy: 'Groot Tree',
    approvedBy: 'Drax Destroyer',
    notes: 'Fleet maintenance parts for delivery vehicles.',
    attachments: 3,
    paymentMethod: 'bank-transfer',
    remarks: [
      { date: '2024-03-25', user: 'Groot Tree', message: 'Fleet parts order for maintenance schedule' },
      { date: '2024-03-26', user: 'Drax Destroyer', message: 'Approved with 30% advance payment' }
    ]
  }
];

export const availableStock: StockItem[] = [
  { id: 1, name: 'Chef Knives', brand: 'Professional', stock: 25, unitPrice: 150.00, saleUnit: 'Single Unit' },
  { id: 2, name: 'Cutting Boards', brand: 'Premium Wood', stock: 50, unitPrice: 30.00, saleUnit: 'Single Unit' },
  { id: 3, name: 'Commercial Blender', brand: 'KitchenPro', stock: 15, unitPrice: 450.00, saleUnit: 'Single Unit' },
  { id: 4, name: 'Coffee Machine', brand: 'BrewMaster', stock: 8, unitPrice: 1200.00, saleUnit: 'Single Unit' },
  { id: 5, name: 'Surgical Masks', brand: 'Medical Grade', stock: 1000, unitPrice: 1.00, saleUnit: 'Box' },
  { id: 6, name: 'Latex Gloves', brand: 'SafeGuard', stock: 500, unitPrice: 0.50, saleUnit: 'Pack' },
  { id: 7, name: 'Antibiotics', brand: 'PharmaCorp', stock: 200, unitPrice: 25.00, saleUnit: 'Strip' },
  { id: 8, name: 'Pain Relievers', brand: 'MediCare', stock: 150, unitPrice: 15.00, saleUnit: 'Strip' },
  { id: 9, name: 'Calcium Tablets', brand: 'HealthPlus', stock: 300, unitPrice: 12.00, saleUnit: 'Bottle' },
  { id: 10, name: 'Ceramic Plates', brand: 'DiningWare', stock: 100, unitPrice: 8.50, saleUnit: 'Single Unit' },
  { id: 11, name: 'Stainless Steel Pots', brand: 'CookWell', stock: 35, unitPrice: 85.00, saleUnit: 'Single Unit' },
  { id: 12, name: 'Cleaning Supplies', brand: 'CleanPro', stock: 80, unitPrice: 15.50, saleUnit: 'Bottle' }
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