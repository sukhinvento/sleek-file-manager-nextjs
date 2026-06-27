import apiClient from '@/lib/api-client';
import * as invoiceService from './invoiceService';
import {
  AgingReport, AgingEntry, AgingBucketSummary,
  PnLStatement, PnLSection, BalanceSheetData,
} from '@/types/finance';

// ── Mock AR aging data ────────────────────────────────────────────────────────
const MOCK_AR: AgingEntry[] = [
  { id: 'ar-1', entityId: 'p-01', entityName: 'Ramesh Kumar', invoiceNumber: 'INV-2026-0421', invoiceDate: '2026-05-01', dueDate: '2026-05-31', originalAmount: 45000, outstandingAmount: 45000, daysOverdue: 5, bucket: 'current' },
  { id: 'ar-2', entityId: 'p-02', entityName: 'Priya Sharma', invoiceNumber: 'INV-2026-0389', invoiceDate: '2026-04-20', dueDate: '2026-05-20', outstandingAmount: 18500, originalAmount: 18500, daysOverdue: 16, bucket: '31-60' },
  { id: 'ar-3', entityId: 'p-03', entityName: 'Sun City Clinic', invoiceNumber: 'INV-2026-0312', invoiceDate: '2026-03-15', dueDate: '2026-04-14', outstandingAmount: 82000, originalAmount: 120000, daysOverdue: 52, bucket: '31-60' },
  { id: 'ar-4', entityId: 'p-04', entityName: 'Dr. Anand Mehta', invoiceNumber: 'INV-2026-0278', invoiceDate: '2026-03-01', dueDate: '2026-03-31', outstandingAmount: 35000, originalAmount: 35000, daysOverdue: 66, bucket: '61-90' },
  { id: 'ar-5', entityId: 'p-05', entityName: 'Lotus Medicare', invoiceNumber: 'INV-2026-0190', invoiceDate: '2026-01-20', dueDate: '2026-02-19', outstandingAmount: 95000, originalAmount: 150000, daysOverdue: 106, bucket: '90+' },
  { id: 'ar-6', entityId: 'p-06', entityName: 'Vikram Hospitals', invoiceNumber: 'INV-2025-1122', invoiceDate: '2025-12-01', dueDate: '2025-12-31', outstandingAmount: 210000, originalAmount: 210000, daysOverdue: 157, bucket: '90+' },
  { id: 'ar-7', entityId: 'p-07', entityName: 'Aisha Begum', invoiceNumber: 'INV-2026-0455', invoiceDate: '2026-05-10', dueDate: '2026-06-09', outstandingAmount: 12000, originalAmount: 12000, daysOverdue: -4, bucket: 'current' },
];

const MOCK_AP: AgingEntry[] = [
  { id: 'ap-1', entityId: 'v-01', entityName: 'Apollo Pharma Dist.', invoiceNumber: 'APOL-0845', invoiceDate: '2026-05-05', dueDate: '2026-06-04', originalAmount: 185000, outstandingAmount: 185000, daysOverdue: 1, bucket: 'current' },
  { id: 'ap-2', entityId: 'v-02', entityName: 'Mediline Supplies', invoiceNumber: 'MEDL-3312', invoiceDate: '2026-04-15', dueDate: '2026-05-15', originalAmount: 62000, outstandingAmount: 62000, daysOverdue: 21, bucket: '31-60' },
  { id: 'ap-3', entityId: 'v-03', entityName: 'BioTech Diagnostics', invoiceNumber: 'BTCH-0771', invoiceDate: '2026-03-20', dueDate: '2026-04-19', originalAmount: 44000, outstandingAmount: 44000, daysOverdue: 47, bucket: '31-60' },
  { id: 'ap-4', entityId: 'v-04', entityName: 'Surgical Imports Ltd.', invoiceNumber: 'SURG-2208', invoiceDate: '2026-02-28', dueDate: '2026-03-30', originalAmount: 130000, outstandingAmount: 75000, daysOverdue: 67, bucket: '61-90' },
  { id: 'ap-5', entityId: 'v-05', entityName: 'Global Medical Corp.', invoiceNumber: 'GMC-0092', invoiceDate: '2025-12-10', dueDate: '2026-01-09', originalAmount: 280000, outstandingAmount: 280000, daysOverdue: 147, bucket: '90+' },
];

function computeSummary(entries: AgingEntry[]): AgingBucketSummary {
  return entries.reduce(
    (acc, e) => {
      acc.total += e.outstandingAmount;
      if (e.bucket === 'current') acc.current += e.outstandingAmount;
      else if (e.bucket === '31-60') acc.days31to60 += e.outstandingAmount;
      else if (e.bucket === '61-90') acc.days61to90 += e.outstandingAmount;
      else acc.over90 += e.outstandingAmount;
      return acc;
    },
    { current: 0, days31to60: 0, days61to90: 0, over90: 0, total: 0 }
  );
}

function mapAgingEntry(raw: any): AgingEntry {
  return {
    id: raw._id || raw.id || raw.invoice_number || '',
    entityId: raw.entity_id || raw.entityId || raw.customer_id || raw.vendor_id || '',
    // Backend returns customer_name (AR) or vendor_name (AP)
    entityName: raw.customer_name || raw.vendor_name || raw.entity_name || raw.entityName || '',
    invoiceNumber: raw.invoice_number || raw.invoiceNumber || '',
    invoiceDate: raw.invoice_date || raw.invoiceDate || raw.order_date || raw.due_date || '',
    dueDate: raw.due_date || raw.dueDate || '',
    // Backend returns 'amount' for original and 'outstanding' for balance
    originalAmount: raw.amount ?? raw.original_amount ?? raw.originalAmount ?? 0,
    outstandingAmount: raw.outstanding ?? raw.outstanding_amount ?? raw.outstandingAmount ?? 0,
    daysOverdue: raw.days_overdue ?? raw.daysOverdue ?? 0,
    bucket: raw.bucket || 'current',
  };
}

// ── Calculate days overdue ──────────────────────────────────────────────────────
function calculateDaysOverdue(dueDate: string, asOf: string): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const ref = new Date(asOf);
  const daysDiff = Math.floor((ref.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysDiff);
}

function getAgingBucket(daysOverdue: number): AgingEntry['bucket'] {
  if (daysOverdue === 0 || daysOverdue < 0) return 'current';
  if (daysOverdue <= 30) return 'current';
  if (daysOverdue <= 60) return '31-60';
  if (daysOverdue <= 90) return '61-90';
  return '90+';
}

// ── Aging Report ─────────────────────────────────────────────────────────────

export async function getAgingReport(
  type: 'AR' | 'AP',
  asOf: string,
  page = 1,
  limit = 25
): Promise<AgingReport> {
  try {
    // Try backend API first
    const res = await apiClient.get('/accounts/reports/aging', {
      params: { type, as_of: asOf, page, limit },
    });
    const body = res.data;
    const entries = (body.entries || body.data || []).map(mapAgingEntry);
    const summary = body.summary || computeSummary(entries);
    const total = body.total ?? entries.length;
    return {
      type, asOf,
      summary: {
        // Backend uses days1to30 + days31to60 for the 1-60 day bucket
        current: summary.current ?? 0,
        days31to60: (summary.days1to30 ?? 0) + (summary.days31to60 ?? summary.days_31_to_60 ?? 0),
        days61to90: summary.days61to90 ?? summary.days_61_to_90 ?? 0,
        over90: summary.over90 ?? summary.over_90 ?? 0,
        total: summary.total ?? 0,
      },
      entries,
      total,
      page: body.page ?? page,
      limit: body.limit ?? limit,
      totalPages: Math.ceil(total / (body.limit ?? limit)),
    };
  } catch (error) {
    console.warn('financeReportService.getAgingReport: fetching from real invoices', error);

    // Calculate from real invoices
    try {
      const invoiceResponse = await invoiceService.fetchInvoices(1, 500);
      const allInvoices = invoiceResponse.data || [];

      // Filter invoices by type and unpaid status
      const entries: AgingEntry[] = allInvoices
        .filter(inv => {
          const isAR = type === 'AR' && inv.customerName; // Customer invoices (sales)
          const isAP = type === 'AP' && inv.vendorName; // Vendor invoices (purchases)
          const isUnpaid = inv.status !== 'Paid' && inv.status !== 'Cancelled' && inv.status !== 'Draft';
          return (isAR || isAP) && isUnpaid;
        })
        .map((inv, idx) => {
          const daysOverdue = calculateDaysOverdue(inv.dueDate, asOf);
          const bucket = getAgingBucket(daysOverdue);
          const outstandingAmount = (inv.grandTotal || 0) - (inv.paidAmount || 0);

          return {
            id: `entry-${idx}`,
            entityId: type === 'AR' ? inv.customerId : inv.vendorId,
            entityName: type === 'AR' ? inv.customerName : inv.vendorName,
            invoiceNumber: inv.invoiceNumber,
            invoiceDate: inv.issueDate,
            dueDate: inv.dueDate,
            originalAmount: inv.grandTotal || 0,
            outstandingAmount: Math.max(0, outstandingAmount),
            daysOverdue,
            bucket,
          };
        });

      // Sort by days overdue descending
      entries.sort((a, b) => b.daysOverdue - a.daysOverdue);

      const summary = computeSummary(entries);
      const total = entries.length;
      const start = (page - 1) * limit;

      return {
        type, asOf,
        summary: {
          current: summary.current,
          days31to60: summary.days31to60,
          days61to90: summary.days61to90,
          over90: summary.over90,
          total: summary.total,
        },
        entries: entries.slice(start, start + limit),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (fallbackError) {
      console.warn('financeReportService.getAgingReport: both backend and invoice fetch failed, using mock data', fallbackError);
      const entries = type === 'AR' ? MOCK_AR : MOCK_AP;
      const start = (page - 1) * limit;
      return {
        type, asOf,
        summary: computeSummary(entries),
        entries: entries.slice(start, start + limit),
        total: entries.length,
        page, limit,
        totalPages: Math.ceil(entries.length / limit),
      };
    }
  }
}

// ── P&L Statement ────────────────────────────────────────────────────────────

function mapPnLSection(raw: any, title: string): PnLSection {
  const accounts = raw?.accounts || [];
  return {
    title,
    lines: accounts.map((a: any) => ({
      accountCode: a.account_code || a.accountCode || '',
      accountName: a.account_name || a.accountName || '',
      amount: a.amount ?? a.balance ?? 0,
    })),
    subtotal: raw?.total ?? accounts.reduce((s: number, a: any) => s + (a.amount ?? a.balance ?? 0), 0),
  };
}

export async function getPnLStatement(periodFrom: string, periodTo: string): Promise<PnLStatement> {
  try {
    const res = await apiClient.get('/accounts/reports/profit-loss', {
      params: { from: periodFrom, to: periodTo },
    });
    const body = res.data;

    const revenue = mapPnLSection(body.revenue, 'Revenue');
    const cogs = mapPnLSection(body.costOfGoods || body.cogs, 'Cost of Goods Sold');
    const grossProfit = body.grossProfit ?? (revenue.subtotal - cogs.subtotal);
    const operatingExpenses = mapPnLSection(body.operatingExpenses, 'Operating Expenses');
    const operatingIncome = body.operatingProfit ?? (grossProfit - operatingExpenses.subtotal);

    // Backend may not return otherIncome / otherExpenses — default to empty sections
    const otherIncome = body.otherIncome
      ? mapPnLSection(body.otherIncome, 'Other Income')
      : { title: 'Other Income', lines: [], subtotal: 0 };
    const financeExpenses = body.financeExpenses
      ? mapPnLSection(body.financeExpenses, 'Other Expenses')
      : { title: 'Other Expenses', lines: [], subtotal: 0 };
    const netIncome = body.netProfit ?? (operatingIncome + otherIncome.subtotal - financeExpenses.subtotal);

    return {
      periodFrom, periodTo,
      revenue, cogs, grossProfit,
      operatingExpenses, operatingIncome,
      otherIncome, otherExpenses: financeExpenses, netIncome,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    console.warn('financeReportService.getPnLStatement: backend unavailable, using mock data');
    // Fall back to mock data
    const revenue: PnLSection = {
      title: 'Revenue',
      lines: [
        { accountCode: '4001', accountName: 'OPD Consultation Revenue', amount: 1850000 },
        { accountCode: '4002', accountName: 'Diagnostic Revenue', amount: 975000 },
        { accountCode: '4003', accountName: 'Pharmacy Sales', amount: 1240000 },
      ],
      subtotal: 4065000,
    };
    const cogs: PnLSection = { title: 'Cost of Goods Sold', lines: [{ accountCode: '5001', accountName: 'Cost of Medicines Sold', amount: 680000 }], subtotal: 680000 };
    const operatingExpenses: PnLSection = {
      title: 'Operating Expenses',
      lines: [
        { accountCode: '5100', accountName: 'Staff Salaries', amount: 920000 },
        { accountCode: '5101', accountName: 'Utilities Expense', amount: 145000 },
        { accountCode: '5102', accountName: 'Medical Supplies Expense', amount: 230000 },
      ],
      subtotal: 1295000,
    };
    const otherIncome: PnLSection = { title: 'Other Income', lines: [{ accountCode: '4100', accountName: 'Interest Income', amount: 45000 }], subtotal: 45000 };
    const otherExpenses: PnLSection = { title: 'Other Expenses', lines: [{ accountCode: '5200', accountName: 'Bank Interest Expense', amount: 88000 }], subtotal: 88000 };
    const grossProfit = revenue.subtotal - cogs.subtotal;
    const operatingIncome = grossProfit - operatingExpenses.subtotal;
    const netIncome = operatingIncome + otherIncome.subtotal - otherExpenses.subtotal;
    return { periodFrom, periodTo, revenue, cogs, grossProfit, operatingExpenses, operatingIncome, otherIncome, otherExpenses, netIncome, generatedAt: new Date().toISOString() };
  }
}

// ── Balance Sheet ────────────────────────────────────────────────────────────

export async function getBalanceSheet(): Promise<BalanceSheetData> {
  try {
    const res = await apiClient.get('/accounts/reports/balance-sheet');
    const body = res.data;
    return {
      assets: { accounts: body.assets?.accounts || [], total: body.assets?.total ?? 0 },
      liabilities: { accounts: body.liabilities?.accounts || [], total: body.liabilities?.total ?? 0 },
      equity: { accounts: body.equity?.accounts || [], total: body.equity?.total ?? 0 },
      netAssets: body.netAssets ?? body.net_assets ?? 0,
    };
  } catch {
    console.warn('financeReportService.getBalanceSheet: backend unavailable, using mock data');
    return {
      assets: {
        accounts: [
          { accountCode: '1001', accountName: 'Cash in Hand', balance: 125000 },
          { accountCode: '1002', accountName: 'HDFC Current Account', balance: 4250000 },
          { accountCode: '1100', accountName: 'Accounts Receivable', balance: 820000 },
          { accountCode: '1200', accountName: 'Pharmaceutical Inventory', balance: 1350000 },
          { accountCode: '1500', accountName: 'Medical Equipment', balance: 8500000 },
        ],
        total: 15045000,
      },
      liabilities: {
        accounts: [
          { accountCode: '2001', accountName: 'Accounts Payable', balance: 430000 },
          { accountCode: '2002', accountName: 'GST Payable', balance: 215000 },
          { accountCode: '2100', accountName: 'Bank Loan - HDFC', balance: 3000000 },
        ],
        total: 3645000,
      },
      equity: {
        accounts: [
          { accountCode: '3001', accountName: "Owner's Capital", balance: 5000000 },
          { accountCode: '3002', accountName: 'Retained Earnings', balance: 6400000 },
        ],
        total: 11400000,
      },
      netAssets: 15045000 - 3645000,
    };
  }
}
