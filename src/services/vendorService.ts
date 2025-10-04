import { Vendor } from '@/types/inventory';

// Extended vendor interface with risk level
export interface VendorWithRisk extends Vendor {
  riskLevel: string;
}

// Mock data
let mockVendors: VendorWithRisk[] = [
  {
    id: '1',
    vendorId: 'V001',
    name: 'PharmaCorp Ltd',
    contactPerson: 'John Anderson',
    phone: '+1-555-0123',
    email: 'john@pharmacorp.com',
    address: '123 Industrial Blvd',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    category: 'Pharmaceuticals',
    status: 'Active',
    totalOrders: 45,
    totalValue: 125000.50,
    creditLimit: 50000.00,
    outstandingBalance: 12500.00,
    paymentTerms: 'Net 30',
    registrationDate: '2023-01-15',
    riskLevel: 'Low',
    taxId: 'TAX123456789',
    gstNumber: 'GST123456789',
    website: 'www.pharmacorp.com',
    bankName: 'Chase Bank',
    accountNumber: '1234567890',
    ifscCode: 'CHAS0001234'
  },
  {
    id: '2',
    vendorId: 'V002',
    name: 'MedSupply Co',
    contactPerson: 'Sarah Wilson',
    phone: '+1-555-0124',
    email: 'sarah@medsupply.com',
    address: '456 Healthcare Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'USA',
    category: 'Medical Supplies',
    status: 'Active',
    totalOrders: 32,
    totalValue: 89000.25,
    creditLimit: 30000.00,
    outstandingBalance: 8500.00,
    paymentTerms: 'Net 15',
    registrationDate: '2023-03-20',
    riskLevel: 'Medium',
    taxId: 'TAX987654321',
    gstNumber: 'GST987654321',
    website: 'www.medsupply.com',
    bankName: 'Bank of America',
    accountNumber: '9876543210',
    ifscCode: 'BOFA0009876'
  },
  {
    id: '3',
    vendorId: 'V003',
    name: 'HealthEquip Inc',
    contactPerson: 'Michael Brown',
    phone: '+1-555-0125',
    email: 'michael@healthequip.com',
    address: '789 Medical Plaza',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    country: 'USA',
    category: 'Equipment',
    status: 'Active',
    totalOrders: 28,
    totalValue: 156000.75,
    creditLimit: 75000.00,
    outstandingBalance: 25000.00,
    paymentTerms: 'Net 45',
    registrationDate: '2022-11-10',
    riskLevel: 'High',
    taxId: 'TAX456789123',
    gstNumber: 'GST456789123',
    website: 'www.healthequip.com',
    bankName: 'Wells Fargo',
    accountNumber: '4567891230',
    ifscCode: 'WELL0004567'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all vendors
 * TODO: Replace with actual API call: GET /api/vendors
 */
export const fetchVendors = async (): Promise<VendorWithRisk[]> => {
  await delay(500);
  return [...mockVendors];
};

/**
 * Fetch a single vendor by ID
 * TODO: Replace with actual API call: GET /api/vendors/:id
 */
export const fetchVendorById = async (id: string): Promise<VendorWithRisk | null> => {
  await delay(300);
  return mockVendors.find(vendor => vendor.id === id) || null;
};

/**
 * Create a new vendor
 * TODO: Replace with actual API call: POST /api/vendors
 */
export const createVendor = async (vendorData: Omit<VendorWithRisk, 'id' | 'totalOrders' | 'totalValue' | 'outstandingBalance'>): Promise<VendorWithRisk> => {
  await delay(800);
  const newVendor: VendorWithRisk = {
    ...vendorData,
    id: `v-${Date.now()}`,
    totalOrders: 0,
    totalValue: 0,
    outstandingBalance: 0,
  };
  mockVendors.push(newVendor);
  return newVendor;
};

/**
 * Update an existing vendor
 * TODO: Replace with actual API call: PUT /api/vendors/:id
 */
export const updateVendor = async (id: string, vendorData: Partial<VendorWithRisk>): Promise<VendorWithRisk> => {
  await delay(800);
  const index = mockVendors.findIndex(vendor => vendor.id === id);
  if (index === -1) {
    throw new Error('Vendor not found');
  }
  mockVendors[index] = { ...mockVendors[index], ...vendorData };
  return mockVendors[index];
};

/**
 * Delete a vendor
 * TODO: Replace with actual API call: DELETE /api/vendors/:id
 */
export const deleteVendor = async (id: string): Promise<void> => {
  await delay(500);
  const index = mockVendors.findIndex(vendor => vendor.id === id);
  if (index === -1) {
    throw new Error('Vendor not found');
  }
  mockVendors.splice(index, 1);
};

/**
 * Fetch vendor statistics
 * TODO: Replace with actual API call: GET /api/vendors/stats
 */
export const fetchVendorStats = async () => {
  await delay(400);
  
  const totalVendors = mockVendors.length;
  const activeVendors = mockVendors.filter(v => v.status === 'Active').length;
  const totalValue = mockVendors.reduce((sum, v) => sum + v.totalValue, 0);
  const outstandingBalance = mockVendors.reduce((sum, v) => sum + v.outstandingBalance, 0);
  const highRiskVendors = mockVendors.filter(v => v.riskLevel === 'High').length;
  
  return {
    totalVendors,
    activeVendors,
    totalValue,
    outstandingBalance,
    highRiskVendors,
    averageOrderValue: totalVendors > 0 ? totalValue / totalVendors : 0,
  };
};

/**
 * Search vendors
 * TODO: Replace with actual API call: GET /api/vendors/search?q=...
 */
export const searchVendors = async (query: string): Promise<VendorWithRisk[]> => {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return mockVendors.filter(vendor =>
    vendor.name.toLowerCase().includes(lowerQuery) ||
    vendor.vendorId.toLowerCase().includes(lowerQuery) ||
    vendor.contactPerson.toLowerCase().includes(lowerQuery) ||
    vendor.email.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get vendors by category
 * TODO: Replace with actual API call: GET /api/vendors/category/:category
 */
export const getVendorsByCategory = async (category: string): Promise<VendorWithRisk[]> => {
  await delay(300);
  return mockVendors.filter(vendor => vendor.category === category);
};

/**
 * Get vendors by status
 * TODO: Replace with actual API call: GET /api/vendors/status/:status
 */
export const getVendorsByStatus = async (status: string): Promise<VendorWithRisk[]> => {
  await delay(300);
  return mockVendors.filter(vendor => vendor.status === status);
};
