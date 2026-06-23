import apiClient from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────

export interface InventoryDashboardAnalytics {
  stats: {
    total: number;
    totalValue: number;
    outOfStock: number;
    critical: number;
    low: number;
    normal: number;
    categories: number;
  };
  categoryBreakdown: Array<{
    category: string;
    items: number;
    value: number;
    critical: number;
    consumed: number;
  }>;
  stockLevels: Array<{
    name: string;
    current: number;
    minimum: number;
    reorder: number;
  }>;
}

export interface MonthlyOrderData {
  month: string; // "YYYY-MM"
  total: number;
  count: number;
}

export interface AdmissionsMonthlyData {
  monthly: Array<{ month: string; admissions: number; discharges: number }>;
  avgLos: number;
}

export interface BillingWeeklyData {
  week: string;
  collected: number;
  outstanding: number;
  billed: number;
  count: number;
}

export interface BillingMonthlyData {
  month: string;
  revenue: number;
  collected: number;
  count: number;
}

export interface ExpenditureMonthlyData {
  month: string;
  spend: number;   // PO vendor spend (₹K)
  paid: number;    // amount already paid to vendors (₹K)
  count: number;
}

export interface DiagnosticsMonthlyCategoryData {
  categories: string[];
  rows: Array<Record<string, any>>;
}

// ── Month label helpers ────────────────────────────────────────────────────

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

export function toMonthLabel(yyyyMM: string): string {
  const [, mm] = yyyyMM.split('-');
  return MONTH_LABELS[mm] ?? yyyyMM;
}

/** Fill in zero-value entries for missing months in a sorted month range */
export function fillMonthGaps<T extends { month: string }>(
  data: T[],
  months: number,
  defaults: Omit<T, 'month'>,
): Array<T & { label: string }> {
  const now = new Date();
  const filled: Array<T & { label: string }> = [];
  const map = new Map(data.map(d => [d.month, d]));

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = map.get(key) ?? ({ month: key, ...defaults } as T);
    filled.push({ ...entry, label: toMonthLabel(key) });
  }
  return filled;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const fetchInventoryDashboardAnalytics = async (): Promise<InventoryDashboardAnalytics> => {
  const res = await apiClient.get<InventoryDashboardAnalytics>('/inventory/analytics/dashboard');
  return res.data;
};

export const fetchPOMonthlyAnalytics = async (months = 12): Promise<MonthlyOrderData[]> => {
  const res = await apiClient.get<MonthlyOrderData[]>('/purchase-orders/analytics/monthly', { params: { months } });
  return Array.isArray(res.data) ? res.data : [];
};

export const fetchSOMonthlyAnalytics = async (months = 12): Promise<MonthlyOrderData[]> => {
  const res = await apiClient.get<MonthlyOrderData[]>('/sales-orders/analytics/monthly', { params: { months } });
  return Array.isArray(res.data) ? res.data : [];
};

export const fetchAdmissionsMonthlyAnalytics = async (months = 12): Promise<AdmissionsMonthlyData> => {
  const res = await apiClient.get<AdmissionsMonthlyData>('/admissions/analytics/monthly', { params: { months } });
  return res.data ?? { monthly: [], avgLos: 0 };
};

export const fetchBillingWeeklyAnalytics = async (weeks = 12): Promise<BillingWeeklyData[]> => {
  const res = await apiClient.get<BillingWeeklyData[]>('/invoices/analytics/weekly', { params: { weeks } });
  return Array.isArray(res.data) ? res.data : [];
};

export const fetchBillingMonthlyAnalytics = async (months = 12): Promise<BillingMonthlyData[]> => {
  const res = await apiClient.get<BillingMonthlyData[]>('/invoices/analytics/monthly', { params: { months } });
  return Array.isArray(res.data) ? res.data : [];
};

export const fetchExpenditureMonthlyAnalytics = async (months = 12): Promise<ExpenditureMonthlyData[]> => {
  const res = await apiClient.get<ExpenditureMonthlyData[]>('/invoices/analytics/expenditure/monthly', { params: { months } });
  return Array.isArray(res.data) ? res.data : [];
};

export const fetchDiagnosticsMonthlyCategoryAnalytics = async (months = 6): Promise<DiagnosticsMonthlyCategoryData> => {
  const res = await apiClient.get<DiagnosticsMonthlyCategoryData>(
    '/diagnostics/bookings/analytics/monthly-category',
    { params: { months } },
  );
  return res.data ?? { categories: [], rows: [] };
};
