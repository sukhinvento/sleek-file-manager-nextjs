import apiClient from '@/lib/api-client';
import { JournalEntry, JournalEntryStatus, JournalLine, JournalListParams } from '@/types/finance';

// ── Mock data (fallback) ─────────────────────────────────────────────────────
const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: 'je-001', entryNumber: 'JE-2026-001', date: '2026-06-01',
    description: 'OPD consultation revenue — June 1', reference: 'INV-2026-0481',
    status: JournalEntryStatus.POSTED,
    lines: [
      { id: 'l1', accountId: '3', accountCode: '1100', accountName: 'Accounts Receivable', description: 'Patient billing', debit: 25000, credit: 0 },
      { id: 'l2', accountId: '11', accountCode: '4001', accountName: 'OPD Consultation Revenue', description: 'June 1 OPD', debit: 0, credit: 25000 },
    ],
    totalDebit: 25000, totalCredit: 25000,
    postedBy: 'Admin', createdAt: '2026-06-01T10:30:00Z', updatedAt: '2026-06-01T10:30:00Z',
  },
  {
    id: 'je-002', entryNumber: 'JE-2026-002', date: '2026-06-01',
    description: 'Pharmacy stock purchase — Apollo Pharma', reference: 'PO-2026-0112',
    status: JournalEntryStatus.POSTED,
    lines: [
      { id: 'l3', accountId: '15', accountCode: '5001', accountName: 'Cost of Medicines Sold', description: 'Apollo Pharma invoice', debit: 85000, credit: 0 },
      { id: 'l4', accountId: '7', accountCode: '2002', accountName: 'GST Payable', description: 'GST on purchase', debit: 15300, credit: 0 },
      { id: 'l5', accountId: '6', accountCode: '2001', accountName: 'Accounts Payable', description: 'Amount due to Apollo', debit: 0, credit: 100300 },
    ],
    totalDebit: 100300, totalCredit: 100300,
    postedBy: 'Admin', createdAt: '2026-06-01T14:00:00Z', updatedAt: '2026-06-01T14:00:00Z',
  },
  {
    id: 'je-003', entryNumber: 'JE-2026-003', date: '2026-06-02',
    description: 'Utility payment — BESCOM electricity bill', reference: 'UTIL-JUN-001',
    status: JournalEntryStatus.POSTED,
    lines: [
      { id: 'l6', accountId: '17', accountCode: '5101', accountName: 'Utilities Expense', description: 'Electricity May 2026', debit: 42000, credit: 0 },
      { id: 'l7', accountId: '2', accountCode: '1002', accountName: 'HDFC Current Account', description: 'Bank payment', debit: 0, credit: 42000 },
    ],
    totalDebit: 42000, totalCredit: 42000,
    postedBy: 'Admin', createdAt: '2026-06-02T09:15:00Z', updatedAt: '2026-06-02T09:15:00Z',
  },
  {
    id: 'je-004', entryNumber: 'JE-2026-004', date: '2026-06-03',
    description: 'Lab diagnostic revenue — pathology tests', reference: 'DIAG-2026-0311',
    status: JournalEntryStatus.DRAFT,
    lines: [
      { id: 'l8', accountId: '1', accountCode: '1001', accountName: 'Cash in Hand', description: 'Cash received', debit: 18500, credit: 0 },
      { id: 'l9', accountId: '12', accountCode: '4002', accountName: 'Diagnostic Revenue', description: 'June 3 pathology', debit: 0, credit: 18500 },
    ],
    totalDebit: 18500, totalCredit: 18500,
    postedBy: '', createdAt: '2026-06-03T11:00:00Z', updatedAt: '2026-06-03T11:00:00Z',
  },
  {
    id: 'je-005', entryNumber: 'JE-2026-005', date: '2026-06-04',
    description: 'Staff salary disbursement — May 2026', reference: 'PAY-2026-05',
    status: JournalEntryStatus.DRAFT,
    lines: [
      { id: 'l10', accountId: '16', accountCode: '5100', accountName: 'Staff Salaries', description: 'May 2026 payroll', debit: 285000, credit: 0 },
      { id: 'l11', accountId: '2', accountCode: '1002', accountName: 'HDFC Current Account', description: 'Bank transfer', debit: 0, credit: 285000 },
    ],
    totalDebit: 285000, totalCredit: 285000,
    postedBy: '', createdAt: '2026-06-04T16:30:00Z', updatedAt: '2026-06-04T16:30:00Z',
  },
];

// ── Mapping helpers ──────────────────────────────────────────────────────────

function mapLine(raw: any): JournalLine {
  return {
    id: raw._id || raw.id,
    accountId: raw.account_id || raw.accountId || '',
    accountCode: raw.account_code || raw.accountCode || '',
    accountName: raw.account_name || raw.accountName || '',
    description: raw.description || '',
    debit: raw.debit ?? 0,
    credit: raw.credit ?? 0,
  };
}

function mapEntry(raw: any): JournalEntry {
  const lines: JournalLine[] = Array.isArray(raw.lines) ? raw.lines.map(mapLine) : [];
  return {
    id: raw._id || raw.id || '',
    entryNumber: raw.entry_number || raw.entryNumber || '',
    date: raw.entry_date || raw.date || '',
    description: raw.description || '',
    reference: raw.reference_number || raw.reference || '',
    status: raw.status as JournalEntryStatus || JournalEntryStatus.DRAFT,
    lines,
    totalDebit: raw.total_debit ?? lines.reduce((s, l) => s + l.debit, 0),
    totalCredit: raw.total_credit ?? lines.reduce((s, l) => s + l.credit, 0),
    postedBy: raw.posted_by || raw.postedBy || '',
    createdAt: raw.created_at || raw.createdAt || '',
    updatedAt: raw.updated_at || raw.updatedAt || '',
  };
}

function toBackendEntry(data: Partial<JournalEntry>): Record<string, any> {
  return {
    entry_date: data.date,
    description: data.description,
    reference_type: 'manual',
    reference_number: data.reference,
    lines: (data.lines || []).map(l => ({
      account_id: l.accountId,
      account_code: l.accountCode,
      account_name: l.accountName,
      description: l.description,
      debit: l.debit,
      credit: l.credit,
    })),
  };
}

// ── Mock fallback helpers ────────────────────────────────────────────────────

function mockListEntries(params: JournalListParams) {
  const { page = 1, limit = 25, search = '', status = '', dateFrom, dateTo } = params;
  let filtered = [...MOCK_ENTRIES];
  if (search) filtered = filtered.filter(e => e.entryNumber.includes(search) || e.description.toLowerCase().includes(search.toLowerCase()));
  if (status) filtered = filtered.filter(e => e.status === status);
  if (dateFrom) filtered = filtered.filter(e => e.date >= dateFrom);
  if (dateTo) filtered = filtered.filter(e => e.date <= dateTo);
  const start = (page - 1) * limit;
  return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) };
}

// ── Service methods ──────────────────────────────────────────────────────────

export async function listEntries(
  params: JournalListParams = {}
): Promise<{ data: JournalEntry[]; total: number; page: number; limit: number; totalPages: number }> {
  const { page = 1, limit = 25, search = '', status = '', dateFrom, dateTo } = params;
  try {
    const queryParams: Record<string, any> = { page, limit };
    if (search) queryParams.search = search;
    if (status) queryParams.status = status;
    if (dateFrom) queryParams.date_from = dateFrom;
    if (dateTo) queryParams.date_to = dateTo;

    const res = await apiClient.get('/journal-entries', { params: queryParams });
    const body = res.data;
    const data = (body.data || []).map(mapEntry);
    const total = body.total ?? data.length;
    return { data, total, page: body.page ?? page, limit: body.limit ?? limit, totalPages: Math.ceil(total / (body.limit ?? limit)) };
  } catch {
    console.warn('journalService.listEntries: backend unavailable, using mock data');
    return mockListEntries(params);
  }
}

export async function getEntry(id: string): Promise<JournalEntry> {
  try {
    const res = await apiClient.get(`/journal-entries/${id}`);
    return mapEntry(res.data);
  } catch {
    const entry = MOCK_ENTRIES.find(e => e.id === id);
    if (!entry) throw new Error('Journal entry not found');
    return entry;
  }
}

export async function createEntry(
  data: Omit<JournalEntry, 'id' | 'entryNumber' | 'totalDebit' | 'totalCredit' | 'postedBy' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> {
  try {
    const res = await apiClient.post('/journal-entries', toBackendEntry(data));
    return mapEntry(res.data);
  } catch {
    const totalDebit = data.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = data.lines.reduce((s, l) => s + l.credit, 0);
    const seq = MOCK_ENTRIES.length + 1;
    const newEntry: JournalEntry = {
      ...data, id: `je-${Date.now()}`,
      entryNumber: `JE-2026-${String(seq).padStart(3, '0')}`,
      totalDebit, totalCredit, postedBy: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    MOCK_ENTRIES.unshift(newEntry);
    return newEntry;
  }
}

export async function postEntry(id: string): Promise<JournalEntry> {
  try {
    const res = await apiClient.post(`/journal-entries/${id}/post`);
    return mapEntry(res.data);
  } catch {
    const idx = MOCK_ENTRIES.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Entry not found');
    MOCK_ENTRIES[idx] = { ...MOCK_ENTRIES[idx], status: JournalEntryStatus.POSTED, postedBy: 'Admin', updatedAt: new Date().toISOString() };
    return MOCK_ENTRIES[idx];
  }
}

export async function reverseEntry(id: string): Promise<JournalEntry> {
  try {
    const res = await apiClient.post(`/journal-entries/${id}/reverse`);
    return mapEntry(res.data);
  } catch {
    const idx = MOCK_ENTRIES.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Entry not found');
    MOCK_ENTRIES[idx] = { ...MOCK_ENTRIES[idx], status: JournalEntryStatus.REVERSED, updatedAt: new Date().toISOString() };
    return MOCK_ENTRIES[idx];
  }
}

export async function deleteEntry(id: string): Promise<void> {
  try {
    await apiClient.delete(`/journal-entries/${id}`);
  } catch {
    const idx = MOCK_ENTRIES.findIndex(e => e.id === id);
    if (idx !== -1) MOCK_ENTRIES.splice(idx, 1);
  }
}
