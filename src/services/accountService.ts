import apiClient from '@/lib/api-client';
import {
  Account, AccountType, AccountSubType, AccountListParams,
} from '@/types/finance';

// ── Mock data (fallback when backend is not running) ─────────────────────────
const MOCK_ACCOUNTS: Account[] = [
  { id: '1', accountCode: '1001', accountName: 'Cash in Hand', accountType: AccountType.ASSET, accountSubType: AccountSubType.CASH, description: 'Petty cash and physical currency', isActive: true, balance: 125000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '2', accountCode: '1002', accountName: 'HDFC Current Account', accountType: AccountType.ASSET, accountSubType: AccountSubType.BANK, description: 'Primary operating bank account', isActive: true, balance: 4250000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '3', accountCode: '1100', accountName: 'Accounts Receivable', accountType: AccountType.ASSET, accountSubType: AccountSubType.ACCOUNTS_RECEIVABLE, description: 'Amounts owed by customers', isActive: true, balance: 820000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '4', accountCode: '1200', accountName: 'Pharmaceutical Inventory', accountType: AccountType.ASSET, accountSubType: AccountSubType.CURRENT_ASSET, description: 'Medicine and drug stock', isActive: true, balance: 1350000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '5', accountCode: '1500', accountName: 'Medical Equipment', accountType: AccountType.ASSET, accountSubType: AccountSubType.FIXED_ASSET, description: 'MRI, CT scan, lab equipment', isActive: true, balance: 8500000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '6', accountCode: '2001', accountName: 'Accounts Payable', accountType: AccountType.LIABILITY, accountSubType: AccountSubType.ACCOUNTS_PAYABLE, description: 'Amounts owed to vendors', isActive: true, balance: 430000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '7', accountCode: '2002', accountName: 'GST Payable', accountType: AccountType.LIABILITY, accountSubType: AccountSubType.CURRENT_LIABILITY, description: 'GST collected from customers', isActive: true, balance: 215000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '8', accountCode: '2100', accountName: 'Bank Loan - HDFC', accountType: AccountType.LIABILITY, accountSubType: AccountSubType.LONG_TERM_LIABILITY, description: 'Term loan for equipment purchase', isActive: true, balance: 3000000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '9', accountCode: '3001', accountName: "Owner's Capital", accountType: AccountType.EQUITY, accountSubType: AccountSubType.OWNERS_EQUITY, description: "Proprietor's capital contribution", isActive: true, balance: 5000000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '10', accountCode: '3002', accountName: 'Retained Earnings', accountType: AccountType.EQUITY, accountSubType: AccountSubType.RETAINED_EARNINGS, description: 'Cumulative profits retained', isActive: true, balance: 6610000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '11', accountCode: '4001', accountName: 'OPD Consultation Revenue', accountType: AccountType.REVENUE, accountSubType: AccountSubType.OPERATING_REVENUE, description: 'Revenue from outpatient consultations', isActive: true, balance: 1850000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '12', accountCode: '4002', accountName: 'Diagnostic Revenue', accountType: AccountType.REVENUE, accountSubType: AccountSubType.OPERATING_REVENUE, description: 'Lab tests and imaging revenue', isActive: true, balance: 975000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '13', accountCode: '4003', accountName: 'Pharmacy Sales', accountType: AccountType.REVENUE, accountSubType: AccountSubType.OPERATING_REVENUE, description: 'Medicine retail revenue', isActive: true, balance: 1240000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '14', accountCode: '4100', accountName: 'Interest Income', accountType: AccountType.REVENUE, accountSubType: AccountSubType.OTHER_INCOME, description: 'Bank interest and FD income', isActive: true, balance: 45000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '15', accountCode: '5001', accountName: 'Cost of Medicines Sold', accountType: AccountType.EXPENSE, accountSubType: AccountSubType.COGS, description: 'Purchase cost of drugs dispensed', isActive: true, balance: 680000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '16', accountCode: '5100', accountName: 'Staff Salaries', accountType: AccountType.EXPENSE, accountSubType: AccountSubType.OPERATING_EXPENSE, description: 'Doctor, nurse, admin salaries', isActive: true, balance: 920000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '17', accountCode: '5101', accountName: 'Utilities Expense', accountType: AccountType.EXPENSE, accountSubType: AccountSubType.OPERATING_EXPENSE, description: 'Electricity, water, telecom', isActive: true, balance: 145000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '18', accountCode: '5102', accountName: 'Medical Supplies Expense', accountType: AccountType.EXPENSE, accountSubType: AccountSubType.OPERATING_EXPENSE, description: 'Disposables, PPE, consumables', isActive: true, balance: 230000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: '19', accountCode: '5200', accountName: 'Bank Interest Expense', accountType: AccountType.EXPENSE, accountSubType: AccountSubType.OTHER_EXPENSE, description: 'Interest paid on loans', isActive: true, balance: 88000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
];

// ── Mapping helpers ──────────────────────────────────────────────────────────

// Backend uses lowercase snake_case; frontend enums use Title Case
const TYPE_NORM: Record<string, AccountType> = {
  asset:     AccountType.ASSET,
  liability: AccountType.LIABILITY,
  equity:    AccountType.EQUITY,
  revenue:   AccountType.REVENUE,
  expense:   AccountType.EXPENSE,
};

const SUBTYPE_NORM: Record<string, AccountSubType> = {
  cash:                AccountSubType.CASH,
  bank:                AccountSubType.BANK,
  accounts_receivable: AccountSubType.ACCOUNTS_RECEIVABLE,
  current_asset:       AccountSubType.CURRENT_ASSET,
  fixed_asset:         AccountSubType.FIXED_ASSET,
  contra_asset:        AccountSubType.CURRENT_ASSET,
  accounts_payable:    AccountSubType.ACCOUNTS_PAYABLE,
  current_liability:   AccountSubType.CURRENT_LIABILITY,
  long_term_liability: AccountSubType.LONG_TERM_LIABILITY,
  owners_equity:       AccountSubType.OWNERS_EQUITY,
  retained_earnings:   AccountSubType.RETAINED_EARNINGS,
  operating_revenue:   AccountSubType.OPERATING_REVENUE,
  other_income:        AccountSubType.OTHER_INCOME,
  cogs:                AccountSubType.COGS,
  operating_expense:   AccountSubType.OPERATING_EXPENSE,
  other_expense:       AccountSubType.OTHER_EXPENSE,
};

function normalizeType(raw: string): AccountType {
  if (!raw) return AccountType.ASSET;
  return TYPE_NORM[raw.toLowerCase()] || (raw as AccountType) || AccountType.ASSET;
}

function normalizeSubType(raw: string): AccountSubType {
  if (!raw) return AccountSubType.CURRENT_ASSET;
  return SUBTYPE_NORM[raw.toLowerCase()] || (raw as AccountSubType) || AccountSubType.CURRENT_ASSET;
}

function mapAccount(raw: any): Account {
  return {
    id: raw._id || raw.id || '',
    accountCode: raw.account_code || raw.accountCode || '',
    accountName: raw.account_name || raw.accountName || '',
    accountType: normalizeType(raw.account_type || raw.accountType),
    accountSubType: normalizeSubType(raw.account_sub_type || raw.accountSubType),
    description: raw.description || '',
    isActive: raw.is_active ?? raw.isActive ?? true,
    balance: raw.balance ?? 0,
    parentAccountId: raw.parent_account_id || raw.parentAccountId,
    parentAccountName: raw.parent_account_name || raw.parentAccountName,
    createdAt: raw.created_at || raw.createdAt || '',
    updatedAt: raw.updated_at || raw.updatedAt || '',
  };
}

function toBackend(data: Partial<Account>): Record<string, any> {
  return {
    account_code: data.accountCode,
    account_name: data.accountName,
    account_type: data.accountType,
    account_sub_type: data.accountSubType,
    description: data.description,
    is_active: data.isActive,
    parent_account_id: data.parentAccountId,
  };
}

// ── Mock fallback helpers ────────────────────────────────────────────────────

function mockListAccounts(params: AccountListParams) {
  const { page = 1, limit = 25, search = '', type = '', isActive } = params;
  let filtered = MOCK_ACCOUNTS;
  if (search) filtered = filtered.filter(a => a.accountCode.includes(search) || a.accountName.toLowerCase().includes(search.toLowerCase()));
  if (type) filtered = filtered.filter(a => a.accountType === type);
  if (isActive !== undefined) filtered = filtered.filter(a => a.isActive === isActive);
  const start = (page - 1) * limit;
  return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) };
}

// ── Service methods ──────────────────────────────────────────────────────────

export async function listAccounts(
  params: AccountListParams = {}
): Promise<{ data: Account[]; total: number; page: number; limit: number; totalPages: number }> {
  const { page = 1, limit = 25, search = '', type = '', isActive } = params;
  try {
    const queryParams: Record<string, any> = { page, limit };
    if (search) queryParams.search = search;
    // Backend expects lowercase type (e.g. 'asset' not 'Asset')
    if (type) queryParams.type = type.toLowerCase();
    if (isActive !== undefined) queryParams.is_active = isActive;

    const res = await apiClient.get('/accounts', { params: queryParams });
    const body = res.data;
    const data = (body.data || []).map(mapAccount);
    const total = body.total ?? data.length;
    return { data, total, page: body.page ?? page, limit: body.limit ?? limit, totalPages: Math.ceil(total / (body.limit ?? limit)) };
  } catch {
    console.warn('accountService.listAccounts: backend unavailable, using mock data');
    return mockListAccounts(params);
  }
}

export async function getAccount(id: string): Promise<Account> {
  try {
    const res = await apiClient.get(`/accounts/${id}`);
    return mapAccount(res.data);
  } catch {
    const account = MOCK_ACCOUNTS.find(a => a.id === id);
    if (!account) throw new Error('Account not found');
    return account;
  }
}

export async function createAccount(data: Omit<Account, 'id' | 'balance' | 'createdAt' | 'updatedAt'>): Promise<Account> {
  try {
    const res = await apiClient.post('/accounts', toBackend(data));
    return mapAccount(res.data);
  } catch {
    const newAccount: Account = {
      ...data, id: Date.now().toString(), balance: 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    MOCK_ACCOUNTS.push(newAccount);
    return newAccount;
  }
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account> {
  try {
    const res = await apiClient.patch(`/accounts/${id}`, toBackend(data));
    return mapAccount(res.data);
  } catch {
    const idx = MOCK_ACCOUNTS.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Account not found');
    MOCK_ACCOUNTS[idx] = { ...MOCK_ACCOUNTS[idx], ...data, updatedAt: new Date().toISOString() };
    return MOCK_ACCOUNTS[idx];
  }
}

export async function deleteAccount(id: string): Promise<void> {
  try {
    await apiClient.delete(`/accounts/${id}`);
  } catch {
    const idx = MOCK_ACCOUNTS.findIndex(a => a.id === id);
    if (idx !== -1) MOCK_ACCOUNTS.splice(idx, 1);
  }
}

/**
 * Fetch account counts grouped by type
 * GET /accounts/stats
 * Returns e.g. { asset: 12, liability: 8, equity: 3, revenue: 7, expense: 13, total: 43 }
 */
export async function fetchAccountStats(): Promise<Record<string, number>> {
  try {
    const res = await apiClient.get('/accounts/stats');
    return res.data || {};
  } catch {
    return {};
  }
}

export async function getAccountOptions(): Promise<Array<{ value: string; label: string; code: string }>> {
  try {
    const res = await apiClient.get('/accounts', { params: { limit: 200 } });
    return (res.data.data || []).map((raw: any) => {
      const a = mapAccount(raw);
      return { value: a.id, label: a.accountName, code: a.accountCode };
    });
  } catch {
    const result = await listAccounts({ limit: 200 });
    return result.data.map(a => ({ value: a.id, label: a.accountName, code: a.accountCode }));
  }
}
