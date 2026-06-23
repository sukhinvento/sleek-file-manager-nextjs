export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

export enum AccountSubType {
  // Asset
  CASH = 'Cash',
  BANK = 'Bank',
  ACCOUNTS_RECEIVABLE = 'Accounts Receivable',
  CURRENT_ASSET = 'Current Asset',
  FIXED_ASSET = 'Fixed Asset',
  // Liability
  ACCOUNTS_PAYABLE = 'Accounts Payable',
  CURRENT_LIABILITY = 'Current Liability',
  LONG_TERM_LIABILITY = 'Long-term Liability',
  // Equity
  OWNERS_EQUITY = "Owner's Equity",
  RETAINED_EARNINGS = 'Retained Earnings',
  // Revenue
  OPERATING_REVENUE = 'Operating Revenue',
  OTHER_INCOME = 'Other Income',
  // Expense
  COGS = 'Cost of Goods Sold',
  OPERATING_EXPENSE = 'Operating Expense',
  OTHER_EXPENSE = 'Other Expense',
}

export const SUBTYPE_BY_TYPE: Record<AccountType, AccountSubType[]> = {
  [AccountType.ASSET]: [
    AccountSubType.CASH, AccountSubType.BANK, AccountSubType.ACCOUNTS_RECEIVABLE,
    AccountSubType.CURRENT_ASSET, AccountSubType.FIXED_ASSET,
  ],
  [AccountType.LIABILITY]: [
    AccountSubType.ACCOUNTS_PAYABLE, AccountSubType.CURRENT_LIABILITY, AccountSubType.LONG_TERM_LIABILITY,
  ],
  [AccountType.EQUITY]: [AccountSubType.OWNERS_EQUITY, AccountSubType.RETAINED_EARNINGS],
  [AccountType.REVENUE]: [AccountSubType.OPERATING_REVENUE, AccountSubType.OTHER_INCOME],
  [AccountType.EXPENSE]: [AccountSubType.COGS, AccountSubType.OPERATING_EXPENSE, AccountSubType.OTHER_EXPENSE],
};

export interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountSubType: AccountSubType;
  description: string;
  isActive: boolean;
  balance: number;
  parentAccountId?: string;
  parentAccountName?: string;
  createdAt: string;
  updatedAt: string;
}

export enum JournalEntryStatus {
  DRAFT = 'Draft',
  POSTED = 'Posted',
  REVERSED = 'Reversed',
}

export interface JournalLine {
  id?: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference: string;
  status: JournalEntryStatus;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgingEntry {
  id: string;
  entityId: string;
  entityName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  originalAmount: number;
  outstandingAmount: number;
  daysOverdue: number;
  bucket: 'current' | '31-60' | '61-90' | '90+';
}

export interface AgingBucketSummary {
  current: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
}

export interface AgingReport {
  type: 'AR' | 'AP';
  asOf: string;
  summary: AgingBucketSummary;
  entries: AgingEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PnLLine {
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface PnLSection {
  title: string;
  lines: PnLLine[];
  subtotal: number;
}

export interface PnLStatement {
  periodFrom: string;
  periodTo: string;
  revenue: PnLSection;
  cogs: PnLSection;
  grossProfit: number;
  operatingExpenses: PnLSection;
  operatingIncome: number;
  otherIncome: PnLSection;
  otherExpenses: PnLSection;
  netIncome: number;
  generatedAt: string;
}

export interface AccountListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: AccountType | '';
  isActive?: boolean;
}

export interface JournalListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: JournalEntryStatus | '';
  dateFrom?: string;
  dateTo?: string;
}

// ── Bank Accounts ────────────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  linkedAccountId: string;
  balance: number;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  transactionDate: string;
  description: string;
  referenceNumber: string;
  debit: number;
  credit: number;
  runningBalance: number;
  isReconciled: boolean;
  reconciledDate: string;
  journalEntryId: string;
}

// ── Payroll ──────────────────────────────────────────────────────────────────

export interface EmployeeSalary {
  id: string;
  doctorId: string;
  employeeName: string;
  designation: string;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  netSalary: number;
  isActive: boolean;
}

export interface PayrollRunEntry {
  employeeSalaryId: string;
  employeeName: string;
  designation: string;
  gross: number;
  deductions: number;
  net: number;
  paid: boolean;
}

export interface PayrollRun {
  id: string;
  payrollPeriod: string;
  runDate: string;
  status: string;
  entries: PayrollRunEntry[];
  totalGross: number;
  totalNet: number;
  journalEntryId: string;
  createdAt: string;
}

// ── Fixed Assets ─────────────────────────────────────────────────────────────

export interface FixedAsset {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  usefulLifeYears: number;
  depreciationMethod: string;
  salvageValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  linkedAccountId: string;
  depreciationAccountId: string;
  status: string;
  createdAt: string;
}

export interface DepreciationScheduleEntry {
  month: string;
  openingValue: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  closingValue: number;
}

// ── Balance Sheet ────────────────────────────────────────────────────────────

export interface BalanceSheetData {
  assets: { accounts: any[]; total: number };
  liabilities: { accounts: any[]; total: number };
  equity: { accounts: any[]; total: number };
  netAssets: number;
}
