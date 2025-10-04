export interface BillingRecord {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  department: string;
  doctor: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: string;
  services: string[];
}

// Mock data
let mockBillingRecords: BillingRecord[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    patientName: 'John Smith',
    patientId: 'P001',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 2500.00,
    paidAmount: 2500.00,
    status: 'Paid',
    services: ['Consultation', 'ECG', 'Blood Test']
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    patientName: 'Emily Davis',
    patientId: 'P002',
    department: 'Orthopedics',
    doctor: 'Dr. Michael Brown',
    date: '2024-01-16',
    dueDate: '2024-02-16',
    amount: 4200.00,
    paidAmount: 1500.00,
    status: 'Partial',
    services: ['Surgery', 'X-Ray', 'Physical Therapy']
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    patientName: 'Robert Wilson',
    patientId: 'P003',
    department: 'Emergency',
    doctor: 'Dr. Lisa Anderson',
    date: '2024-01-17',
    dueDate: '2024-02-17',
    amount: 1800.00,
    paidAmount: 0.00,
    status: 'Pending',
    services: ['Emergency Care', 'CT Scan', 'Medication']
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all billing records
 * TODO: Replace with actual API call: GET /api/billing
 */
export const fetchBillingRecords = async (): Promise<BillingRecord[]> => {
  await delay(500);
  return [...mockBillingRecords];
};

/**
 * Fetch a single billing record by ID
 * TODO: Replace with actual API call: GET /api/billing/:id
 */
export const fetchBillingRecordById = async (id: string): Promise<BillingRecord | null> => {
  await delay(300);
  return mockBillingRecords.find(record => record.id === id) || null;
};

/**
 * Create a new billing record
 * TODO: Replace with actual API call: POST /api/billing
 */
export const createBillingRecord = async (recordData: Omit<BillingRecord, 'id'>): Promise<BillingRecord> => {
  await delay(800);
  const newRecord: BillingRecord = {
    ...recordData,
    id: `bill-${Date.now()}`,
  };
  mockBillingRecords.push(newRecord);
  return newRecord;
};

/**
 * Update an existing billing record
 * TODO: Replace with actual API call: PUT /api/billing/:id
 */
export const updateBillingRecord = async (id: string, recordData: Partial<BillingRecord>): Promise<BillingRecord> => {
  await delay(800);
  const index = mockBillingRecords.findIndex(record => record.id === id);
  if (index === -1) {
    throw new Error('Billing record not found');
  }
  mockBillingRecords[index] = { ...mockBillingRecords[index], ...recordData };
  return mockBillingRecords[index];
};

/**
 * Delete a billing record
 * TODO: Replace with actual API call: DELETE /api/billing/:id
 */
export const deleteBillingRecord = async (id: string): Promise<void> => {
  await delay(500);
  const index = mockBillingRecords.findIndex(record => record.id === id);
  if (index === -1) {
    throw new Error('Billing record not found');
  }
  mockBillingRecords.splice(index, 1);
};

/**
 * Fetch billing statistics
 * TODO: Replace with actual API call: GET /api/billing/stats
 */
export const fetchBillingStats = async () => {
  await delay(400);
  
  const totalInvoices = mockBillingRecords.length;
  const totalRevenue = mockBillingRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = mockBillingRecords.reduce((sum, record) => sum + record.paidAmount, 0);
  const totalOutstanding = totalRevenue - totalPaid;
  const paidInvoices = mockBillingRecords.filter(record => record.status === 'Paid').length;
  const pendingInvoices = mockBillingRecords.filter(record => record.status === 'Pending').length;
  const partialInvoices = mockBillingRecords.filter(record => record.status === 'Partial').length;
  
  return {
    totalInvoices,
    totalRevenue,
    totalPaid,
    totalOutstanding,
    paidInvoices,
    pendingInvoices,
    partialInvoices,
    averageInvoiceAmount: totalInvoices > 0 ? totalRevenue / totalInvoices : 0,
  };
};

/**
 * Search billing records
 * TODO: Replace with actual API call: GET /api/billing/search?q=...
 */
export const searchBillingRecords = async (query: string): Promise<BillingRecord[]> => {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return mockBillingRecords.filter(record =>
    record.invoiceNumber.toLowerCase().includes(lowerQuery) ||
    record.patientName.toLowerCase().includes(lowerQuery) ||
    record.patientId.toLowerCase().includes(lowerQuery) ||
    record.department.toLowerCase().includes(lowerQuery) ||
    record.doctor.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get billing records by status
 * TODO: Replace with actual API call: GET /api/billing/status/:status
 */
export const getBillingRecordsByStatus = async (status: string): Promise<BillingRecord[]> => {
  await delay(400);
  return mockBillingRecords.filter(record => record.status === status);
};
