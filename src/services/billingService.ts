import apiClient from '@/lib/api-client';

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
  actor?: string;
}

const STATUS_MAP: Record<string, string> = {
  draft: 'Draft',
  issued: 'Pending',
  partially_paid: 'Partial',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

function mapBillingRecord(raw: any): BillingRecord {
  const status = STATUS_MAP[String(raw.status || '').toLowerCase()] || raw.status || 'Pending';
  const lineItems: any[] = Array.isArray(raw.line_items) ? raw.line_items : [];
  const services = lineItems.map((item: any) => item.description || item.name || '').filter(Boolean);
  const department = lineItems.length > 0 ? (lineItems[0].department || '') : '';

  return {
    id: raw._id || raw.id || '',
    invoiceNumber: raw.invoice_number || raw.invoiceNumber || '',
    patientName: raw.patient_name || raw.invoice_number || '',
    patientId: raw.patient_id || raw.patientId || '',
    department: department || raw.department || '',
    doctor: raw.doctor_name || raw.doctor || '',
    date: raw.createdAt ? raw.createdAt.split('T')[0] : '',
    dueDate: raw.due_date || raw.dueDate || '',
    amount: raw.grand_total ?? raw.amount ?? 0,
    paidAmount: raw.paid_amount ?? raw.paidAmount ?? 0,
    status,
    services,
    actor: raw.actor || raw.created_by_username || raw.created_by_user || '',
  };
}

/**
 * Fetch all billing records
 * GET /hospital-billing?limit=200
 */
export const fetchBillingRecords = async (): Promise<BillingRecord[]> => {
  const response = await apiClient.get('/hospital-billing', { params: { limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapBillingRecord);
};

/**
 * Fetch a single billing record by ID
 * GET /hospital-billing/:id
 */
export const fetchBillingRecordById = async (id: string): Promise<BillingRecord | null> => {
  try {
    const response = await apiClient.get(`/hospital-billing/${id}`);
    return mapBillingRecord(response.data);
  } catch {
    return null;
  }
};

/**
 * Create a new billing record
 * POST /hospital-billing
 */
export const createBillingRecord = async (recordData: Omit<BillingRecord, 'id'>): Promise<BillingRecord> => {
  const body = {
    invoice_number: recordData.invoiceNumber,
    patient_id: recordData.patientId,
    patient_name: recordData.patientName,
    grand_total: recordData.amount,
    paid_amount: recordData.paidAmount,
    status: recordData.status.toLowerCase(),
    due_date: recordData.dueDate,
    line_items: recordData.services.map(s => ({ description: s, department: recordData.department })),
    department: recordData.department,
    doctor_name: recordData.doctor,
    ...(recordData.actor ? { actor: recordData.actor } : {}),
  };
  const response = await apiClient.post('/hospital-billing', body);
  return mapBillingRecord(response.data);
};

/**
 * Update an existing billing record
 * PATCH /hospital-billing/:id
 */
export const updateBillingRecord = async (id: string, recordData: Partial<BillingRecord>): Promise<BillingRecord> => {
  const body: any = {};
  if (recordData.invoiceNumber !== undefined) body.invoice_number = recordData.invoiceNumber;
  if (recordData.patientId !== undefined) body.patient_id = recordData.patientId;
  if (recordData.patientName !== undefined) body.patient_name = recordData.patientName;
  if (recordData.amount !== undefined) body.grand_total = recordData.amount;
  if (recordData.paidAmount !== undefined) body.paid_amount = recordData.paidAmount;
  if (recordData.status !== undefined) body.status = recordData.status.toLowerCase();
  if (recordData.dueDate !== undefined) body.due_date = recordData.dueDate;
  if (recordData.department !== undefined) body.department = recordData.department;
  if (recordData.doctor !== undefined) body.doctor_name = recordData.doctor;
  if (recordData.services !== undefined) {
    body.line_items = recordData.services.map(s => ({ description: s }));
  }
  const response = await apiClient.patch(`/hospital-billing/${id}`, body);
  return mapBillingRecord(response.data);
};

/**
 * Delete a billing record
 * DELETE /hospital-billing/:id
 */
export const deleteBillingRecord = async (id: string): Promise<void> => {
  await apiClient.delete(`/hospital-billing/${id}`);
};

/**
 * Fetch billing statistics
 * GET /hospital-billing/stats
 */
export const fetchBillingStats = async () => {
  const response = await apiClient.get('/hospital-billing/stats');
  const raw = response.data || {};
  return {
    totalInvoices:       raw.totalInvoices       ?? raw.total_invoices       ?? raw.total        ?? 0,
    totalRevenue:        raw.totalRevenue         ?? raw.total_revenue        ?? raw.total_amount ?? 0,
    totalPaid:           raw.totalPaid            ?? raw.total_paid           ?? 0,
    totalOutstanding:    raw.totalOutstanding     ?? raw.total_outstanding    ?? 0,
    paidInvoices:        raw.paidInvoices         ?? raw.paid_invoices        ?? raw.paid         ?? 0,
    pendingInvoices:     raw.pendingInvoices      ?? raw.pending_invoices     ?? raw.pending      ?? 0,
    partialInvoices:     raw.partialInvoices      ?? raw.partial_invoices     ?? 0,
    averageInvoiceAmount:raw.averageInvoiceAmount ?? raw.average_invoice_amount ?? 0,
  };
};

/**
 * Search billing records
 * GET /hospital-billing?search=X
 */
export const searchBillingRecords = async (query: string): Promise<BillingRecord[]> => {
  const response = await apiClient.get('/hospital-billing', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapBillingRecord);
};

/**
 * Get billing records by status
 * GET /hospital-billing?status=X
 */
export const getBillingRecordsByStatus = async (status: string): Promise<BillingRecord[]> => {
  const reverseStatus: Record<string, string> = {
    Draft: 'draft', Pending: 'issued', Partial: 'partially_paid', Paid: 'paid', Cancelled: 'cancelled',
  };
  const backendStatus = reverseStatus[status] || status.toLowerCase();
  const response = await apiClient.get('/hospital-billing', { params: { status: backendStatus, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapBillingRecord);
};
