/**
 * Analytics handlers — exact URLs from analyticsService.ts:
 *
 *   GET /inventory/analytics/dashboard
 *   GET /purchase-orders/analytics/monthly
 *   GET /sales-orders/analytics/monthly
 *   GET /admissions/analytics/monthly
 *   GET /invoices/analytics/weekly
 *   GET /invoices/analytics/monthly
 *   GET /invoices/analytics/expenditure/monthly
 *   GET /diagnostics/bookings/analytics/monthly-category  (registered in diagnostics.ts)
 */
import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { intParam } from '../helpers';

export function registerAnalyticsHandlers(mock: MockAdapter) {
  // ── Inventory dashboard ───────────────────────────────────────────────────
  mock.onGet('/inventory/analytics/dashboard').reply(() => {
    const items = store.inventory.findAll();
    const totalValue = items.reduce((s, i) => s + (i.unit_price * i.current_stock), 0);
    const outOfStock = items.filter(i => i.current_stock === 0).length;
    const critical   = items.filter(i => i.current_stock > 0 && i.current_stock <= i.min_stock_level).length;
    const low        = items.filter(i => i.current_stock > i.min_stock_level && i.current_stock <= i.min_stock_level * 1.5).length;
    const normal     = items.filter(i => i.current_stock > i.min_stock_level * 1.5).length;
    const cats       = new Set(items.map(i => i.category));

    const categoryBreakdown = Array.from(cats).map(cat => {
      const ci = items.filter(i => i.category === cat);
      return {
        category: cat,
        items:    ci.length,
        value:    ci.reduce((s, i) => s + i.unit_price * i.current_stock, 0),
        critical: ci.filter(i => i.current_stock <= i.min_stock_level).length,
        consumed: Math.round(ci.reduce((s, i) => s + i.current_stock, 0) * 0.3),
      };
    });

    const stockLevels = items.slice(0, 10).map(i => ({
      name:    i.name,
      current: i.current_stock,
      minimum: i.min_stock_level,
      reorder: i.min_stock_level * 2,
    }));

    return [200, {
      stats: { total: items.length, totalValue, outOfStock, critical, low, normal, categories: cats.size },
      categoryBreakdown,
      stockLevels,
    }];
  });

  // ── Purchase Orders — monthly ─────────────────────────────────────────────
  mock.onGet('/purchase-orders/analytics/monthly').reply(config => {
    const months = intParam(config.params?.months, 12);
    const orders = store.purchaseOrders.findAll();
    return [200, buildMonthlyTotals(orders, months, 'total_amount', 'order_date')];
  });

  // ── Sales Orders — monthly ────────────────────────────────────────────────
  mock.onGet('/sales-orders/analytics/monthly').reply(config => {
    const months = intParam(config.params?.months, 12);
    const orders = store.salesOrders.findAll();
    return [200, buildMonthlyTotals(orders, months, 'total_amount', 'order_date')];
  });

  // ── Admissions — monthly ─────────────────────────────────────────────────
  mock.onGet('/admissions/analytics/monthly').reply(config => {
    const months     = intParam(config.params?.months, 12);
    const admissions = store.admissions.findAll();
    const monthKeys  = buildMonthKeys(months);

    const monthly = monthKeys.map(month => ({
      month,
      admissions: admissions.filter(a => dateStartsWith(a.admission_date, month)).length,
      discharges:  admissions.filter(a => dateStartsWith(a.actual_discharge_date, month)).length,
    }));

    // Compute average LOS from discharged records
    const discharged = admissions.filter(a => a.actual_discharge_date && a.admission_date);
    const avgLos = discharged.length
      ? discharged.reduce((s, a) => {
          const diff = (new Date(a.actual_discharge_date).getTime() - new Date(a.admission_date).getTime()) / 86400000;
          return s + Math.max(0, diff);
        }, 0) / discharged.length
      : 4.2;

    return [200, { monthly, avgLos: Math.round(avgLos * 10) / 10 }];
  });

  // ── Invoices — weekly ────────────────────────────────────────────────────
  mock.onGet('/invoices/analytics/weekly').reply(config => {
    const weeks    = intParam(config.params?.weeks, 12);
    const invoices = store.invoices.findAll();
    const weekKeys = buildWeekKeys(weeks);

    return [200, weekKeys.map(week => {
      const wi = invoices.filter(i => dateStartsWith(i.invoice_date || i.createdAt, week));
      return {
        week,
        billed:      wi.reduce((s, i) => s + (i.amount || i.grand_total || 0), 0),
        collected:   wi.reduce((s, i) => s + (i.paid_amount || 0), 0),
        outstanding: wi.reduce((s, i) => s + Math.max(0, (i.amount || i.grand_total || 0) - (i.paid_amount || 0)), 0),
        count: wi.length,
      };
    })];
  });

  // ── Invoices — monthly ───────────────────────────────────────────────────
  mock.onGet('/invoices/analytics/monthly').reply(config => {
    const months   = intParam(config.params?.months, 12);
    const invoices = store.invoices.findAll();
    return [200, buildMonthKeys(months).map(month => {
      const mi = invoices.filter(i => dateStartsWith(i.invoice_date || i.createdAt, month));
      return {
        month,
        revenue:   mi.reduce((s, i) => s + (i.amount || i.grand_total || 0), 0),
        collected: mi.reduce((s, i) => s + (i.paid_amount || 0), 0),
        count:     mi.length,
      };
    })];
  });

  // ── Invoices — expenditure monthly (vendor PO spend) ────────────────────
  mock.onGet('/invoices/analytics/expenditure/monthly').reply(config => {
    const months = intParam(config.params?.months, 12);
    const orders = store.purchaseOrders.findAll();
    return [200, buildMonthKeys(months).map(month => {
      const mo = orders.filter(o => dateStartsWith(o.order_date || o.createdAt, month));
      return {
        month,
        spend: mo.reduce((s, o) => s + (o.total_amount || 0), 0) / 1000,
        paid:  mo.reduce((s, o) => s + (o.paid_amount || 0), 0) / 1000,
        count: mo.length,
      };
    })];
  });

  // ── High-level dashboard KPIs (fallback catch-all) ───────────────────────
  mock.onGet('/analytics/dashboard').reply(() => {
    const patients   = store.patients.findAll();
    const invoices   = store.invoices.findAll();
    const admissions = store.admissions.findAll();
    const orders     = store.purchaseOrders.findAll();
    return [200, {
      totalPatients:    patients.length,
      activeAdmissions: admissions.filter(a => a.status === 'active').length,
      totalRevenue:     invoices.reduce((s, i) => s + (i.paid_amount || 0), 0),
      pendingInvoices:  invoices.filter(i => i.status !== 'paid').length,
      pendingOrders:    orders.filter(o => o.status === 'pending').length,
      lowStockItems:    store.inventory.findAll().filter(i => i.current_stock <= i.min_stock_level).length,
    }];
  });
}

// ── Shared utilities ─────────────────────────────────────────────────────────

function buildMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

function buildWeekKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 86400000);
    keys.push(d.toISOString().split('T')[0]);
  }
  return keys;
}

/** Returns true when dateStr starts with the given prefix (YYYY-MM or YYYY-MM-DD) */
function dateStartsWith(dateStr: string | undefined, prefix: string): boolean {
  if (!dateStr) return false;
  return dateStr.startsWith(prefix);
}

function buildMonthlyTotals(
  records: any[],
  months: number,
  amountField: string,
  dateField: string,
) {
  return buildMonthKeys(months).map(month => {
    const subset = records.filter(r => dateStartsWith(r[dateField] || r.createdAt, month));
    return {
      month,
      total: subset.reduce((s, r) => s + (r[amountField] || 0), 0),
      count: subset.length,
    };
  });
}
