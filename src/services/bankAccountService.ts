import apiClient from '@/lib/api-client';
import { BankAccount, BankTransaction } from '@/types/finance';

// ── Mapping helpers ──────────────────────────────────────────────────────────

function mapBankAccount(raw: any): BankAccount {
  return {
    id: raw._id || raw.id || '',
    bankName: raw.bank_name || raw.bankName || '',
    accountNumber: raw.account_number || raw.accountNumber || '',
    ifscCode: raw.ifsc_code || raw.ifscCode || '',
    accountType: raw.account_type || raw.accountType || 'Current',
    linkedAccountId: raw.linked_account_id || raw.linkedAccountId || '',
    balance: raw.balance ?? 0,
    isActive: raw.is_active ?? raw.isActive ?? true,
    tenantId: raw.tenant_id || raw.tenantId || '',
    createdAt: raw.created_at || raw.createdAt || '',
    updatedAt: raw.updated_at || raw.updatedAt || '',
  };
}

function mapTransaction(raw: any): BankTransaction {
  return {
    id: raw._id || raw.id || '',
    bankAccountId: raw.bank_account_id || raw.bankAccountId || '',
    transactionDate: raw.transaction_date || raw.transactionDate || '',
    description: raw.description || '',
    referenceNumber: raw.reference_number || raw.referenceNumber || '',
    debit: raw.debit ?? 0,
    credit: raw.credit ?? 0,
    runningBalance: raw.running_balance ?? raw.runningBalance ?? 0,
    isReconciled: raw.is_reconciled ?? raw.isReconciled ?? false,
    reconciledDate: raw.reconciled_date || raw.reconciledDate || '',
    journalEntryId: raw.journal_entry_id || raw.journalEntryId || '',
  };
}

function toBackend(data: Partial<BankAccount>): Record<string, any> {
  return {
    bank_name: data.bankName,
    account_number: data.accountNumber,
    ifsc_code: data.ifscCode,
    account_type: data.accountType,
    linked_account_id: data.linkedAccountId,
    balance: data.balance,
    is_active: data.isActive,
  };
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  { id: 'ba-1', bankName: 'HDFC Bank', accountNumber: '50100123456789', ifscCode: 'HDFC0001234', accountType: 'Current', linkedAccountId: '2', balance: 4250000, isActive: true, tenantId: 'default', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'ba-2', bankName: 'SBI', accountNumber: '38762910045', ifscCode: 'SBIN0005432', accountType: 'Savings', linkedAccountId: '', balance: 1850000, isActive: true, tenantId: 'default', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'ba-3', bankName: 'ICICI Bank', accountNumber: '012345678901', ifscCode: 'ICIC0006789', accountType: 'Current', linkedAccountId: '', balance: 780000, isActive: true, tenantId: 'default', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'ba-4', bankName: 'Axis Bank', accountNumber: '917020012345678', ifscCode: 'UTIB0001122', accountType: 'Savings', linkedAccountId: '', balance: 320000, isActive: false, tenantId: 'default', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
];

const MOCK_TRANSACTIONS: Record<string, BankTransaction[]> = {
  'ba-1': [
    { id: 'txn-1', bankAccountId: 'ba-1', transactionDate: '2026-06-04', description: 'Staff salary May 2026', referenceNumber: 'PAY-05', debit: 285000, credit: 0, runningBalance: 4250000, isReconciled: true, reconciledDate: '2026-06-04', journalEntryId: 'je-005' },
    { id: 'txn-2', bankAccountId: 'ba-1', transactionDate: '2026-06-03', description: 'OPD collections deposit', referenceNumber: 'DEP-0603', debit: 0, credit: 125000, runningBalance: 4535000, isReconciled: false, reconciledDate: '', journalEntryId: '' },
    { id: 'txn-3', bankAccountId: 'ba-1', transactionDate: '2026-06-02', description: 'BESCOM electricity', referenceNumber: 'UTIL-JUN-001', debit: 42000, credit: 0, runningBalance: 4410000, isReconciled: true, reconciledDate: '2026-06-02', journalEntryId: 'je-003' },
  ],
};

// ── Service methods ──────────────────────────────────────────────────────────

export async function listBankAccounts(): Promise<BankAccount[]> {
  try {
    const res = await apiClient.get('/bank-accounts');
    return (res.data.data || res.data || []).map(mapBankAccount);
  } catch {
    console.warn('bankAccountService.listBankAccounts: backend unavailable, using mock data');
    return MOCK_BANK_ACCOUNTS;
  }
}

export async function createBankAccount(data: Partial<BankAccount>): Promise<BankAccount> {
  try {
    const res = await apiClient.post('/bank-accounts', toBackend(data));
    return mapBankAccount(res.data);
  } catch {
    const newAccount: BankAccount = {
      ...data as BankAccount,
      id: `ba-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_BANK_ACCOUNTS.push(newAccount);
    return newAccount;
  }
}

export async function updateBankAccount(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
  try {
    const res = await apiClient.patch(`/bank-accounts/${id}`, toBackend(data));
    return mapBankAccount(res.data);
  } catch {
    const idx = MOCK_BANK_ACCOUNTS.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Bank account not found');
    MOCK_BANK_ACCOUNTS[idx] = { ...MOCK_BANK_ACCOUNTS[idx], ...data, updatedAt: new Date().toISOString() };
    return MOCK_BANK_ACCOUNTS[idx];
  }
}

export async function getTransactions(
  bankAccountId: string,
  page = 1,
  limit = 25
): Promise<{ data: BankTransaction[]; total: number; page: number; limit: number }> {
  try {
    const res = await apiClient.get(`/bank-accounts/${bankAccountId}/transactions`, { params: { page, limit } });
    const body = res.data;
    const data = (body.data || []).map(mapTransaction);
    return { data, total: body.total ?? data.length, page: body.page ?? page, limit: body.limit ?? limit };
  } catch {
    const txns = MOCK_TRANSACTIONS[bankAccountId] || [];
    const start = (page - 1) * limit;
    return { data: txns.slice(start, start + limit), total: txns.length, page, limit };
  }
}

export async function createTransaction(
  bankAccountId: string,
  data: Partial<BankTransaction>
): Promise<BankTransaction> {
  try {
    const res = await apiClient.post(`/bank-accounts/${bankAccountId}/transactions`, {
      transaction_date: data.transactionDate,
      description: data.description,
      reference_number: data.referenceNumber,
      debit: data.debit,
      credit: data.credit,
    });
    return mapTransaction(res.data);
  } catch {
    const txn: BankTransaction = {
      id: `txn-${Date.now()}`,
      bankAccountId,
      transactionDate: data.transactionDate || new Date().toISOString().split('T')[0],
      description: data.description || '',
      referenceNumber: data.referenceNumber || '',
      debit: data.debit ?? 0,
      credit: data.credit ?? 0,
      runningBalance: 0,
      isReconciled: false,
      reconciledDate: '',
      journalEntryId: '',
    };
    if (!MOCK_TRANSACTIONS[bankAccountId]) MOCK_TRANSACTIONS[bankAccountId] = [];
    MOCK_TRANSACTIONS[bankAccountId].unshift(txn);
    return txn;
  }
}

export async function reconcileTransaction(bankAccountId: string, txnId: string): Promise<BankTransaction> {
  try {
    const res = await apiClient.post(`/bank-accounts/${bankAccountId}/transactions/${txnId}/reconcile`);
    return mapTransaction(res.data);
  } catch {
    const txns = MOCK_TRANSACTIONS[bankAccountId] || [];
    const idx = txns.findIndex(t => t.id === txnId);
    if (idx === -1) throw new Error('Transaction not found');
    txns[idx] = { ...txns[idx], isReconciled: true, reconciledDate: new Date().toISOString().split('T')[0] };
    return txns[idx];
  }
}
