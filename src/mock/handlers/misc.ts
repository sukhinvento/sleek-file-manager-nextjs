/**
 * Misc handlers — rooms, locations, departments, tax-slabs,
 * accounts (Chart of Accounts + reports), invoices, journal-entries,
 * stock-transfers, users, health.
 */
import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, today, paginate, textSearch, intParam } from '../helpers';

export function registerMiscHandlers(mock: MockAdapter) {
  registerRooms(mock);
  registerLocations(mock);
  registerDepartments(mock);
  registerTaxSlabs(mock);
  registerAccounts(mock);
  registerFinanceReports(mock);
  registerInvoices(mock);
  registerJournalEntries(mock);
  registerUsers(mock);
  registerStockTransfers(mock);
  registerHealth(mock);
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

function registerRooms(mock: MockAdapter) {
  mock.onGet('/rooms').reply(config => {
    const params = config.params || {};
    let items = store.rooms.findAll();
    if (params.type && params.type !== 'All') items = items.filter(r => r.type === params.type);
    if (params.status && params.status !== 'All') items = items.filter(r => r.status === params.status);
    const result = paginate(items, intParam(params.page, 1), intParam(params.limit, 50));
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // Named sub-paths BEFORE the /:id regex
  mock.onGet('/rooms/available').reply(config => {
    const type = config.params?.type;
    let rooms = store.rooms.findAll().filter(r => r.available_beds > 0);
    if (type && type !== 'All') rooms = rooms.filter(r => r.type === type);
    return [200, { data: rooms, total: rooms.length }];
  });

  mock.onGet('/rooms/stats').reply(() => {
    const rooms = store.rooms.findAll();
    const totalBeds     = rooms.reduce((s, r) => s + (r.total_beds || 0), 0);
    const availableBeds = rooms.reduce((s, r) => s + (r.available_beds || 0), 0);
    return [200, {
      totalRooms:     rooms.length,
      availableRooms: rooms.filter(r => r.available_beds > 0).length,
      fullRooms:      rooms.filter(r => r.available_beds === 0).length,
      totalBeds,
      availableBeds,
      occupiedBeds:   totalBeds - availableBeds,
      occupancyRate:  totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0,
    }];
  });

  mock.onGet(/^\/rooms\/[^/]+$/).reply(config => {
    const room = store.rooms.findById(config.url!.split('/').pop()!);
    if (!room) return [404, { message: 'Room not found' }];
    return [200, room];
  });

  mock.onPost('/rooms').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();
    const room = { _id: id, available_beds: body.total_beds || 1, status: 'Available', ...body, createdAt: now() };
    store.rooms.insert(room);
    return [201, room];
  });

  mock.onPatch(/^\/rooms\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const updated = store.rooms.update(id, JSON.parse(config.data || '{}'));
    if (!updated) return [404, { message: 'Room not found' }];
    return [200, updated];
  });

  mock.onDelete(/^\/rooms\/[^/]+$/).reply(config => {
    store.rooms.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Locations ────────────────────────────────────────────────────────────────

function registerLocations(mock: MockAdapter) {
  mock.onGet('/locations').reply(config => {
    const params = config.params || {};
    const items  = store.locations.findAll();
    return [200, { data: items, total: items.length, page: 1, limit: 100 }];
  });

  // /locations/lookup MUST come before the /:id regex so it is matched first
  mock.onGet('/locations/lookup').reply(config => {
    const search = config.params?.search;
    let items = store.locations.findAll();
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(l =>
        String(l.name || '').toLowerCase().includes(q) ||
        String(l.code || '').toLowerCase().includes(q) ||
        String(l.type || '').toLowerCase().includes(q),
      );
    }
    return [200, items.map(l => ({
      value:         l._id,
      label:         l.name,
      code:          l.code  || '',
      type:          l.type  || '',
      address:       l.address || '',
      sub_locations: l.sub_locations || [],
    }))];
  });

  mock.onGet(/^\/locations\/[^/]+$/).reply(config => {
    return [200, store.locations.findById(config.url!.split('/').pop()!) || {}];
  });

  mock.onPost('/locations').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();
    const item = { _id: id, status: 'Active', ...body, createdAt: now() };
    store.locations.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/locations\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    return [200, store.locations.update(id, JSON.parse(config.data || '{}'))];
  });

  mock.onDelete(/^\/locations\/[^/]+$/).reply(config => {
    store.locations.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Departments ──────────────────────────────────────────────────────────────

function registerDepartments(mock: MockAdapter) {
  mock.onGet('/departments').reply(() => {
    const items = store.departments.findAll();
    return [200, { data: items, total: items.length }];
  });

  mock.onPost('/departments').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();
    const item = { _id: id, status: 'Active', ...body, createdAt: now() };
    store.departments.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/departments\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    return [200, store.departments.update(id, JSON.parse(config.data || '{}'))];
  });

  mock.onDelete(/^\/departments\/[^/]+$/).reply(config => {
    store.departments.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Tax Slabs ────────────────────────────────────────────────────────────────

function registerTaxSlabs(mock: MockAdapter) {
  mock.onGet('/tax-slabs').reply(() => {
    const items = store.taxSlabs.findAll();
    return [200, { data: items, total: items.length }];
  });

  mock.onGet(/^\/tax-slabs\/[^/]+$/).reply(config => {
    return [200, store.taxSlabs.findById(config.url!.split('/').pop()!) || {}];
  });

  mock.onPost('/tax-slabs').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();
    const item = { _id: id, ...body, createdAt: now() };
    store.taxSlabs.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/tax-slabs\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    return [200, store.taxSlabs.update(id, JSON.parse(config.data || '{}'))];
  });

  mock.onDelete(/^\/tax-slabs\/[^/]+$/).reply(config => {
    store.taxSlabs.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Chart of Accounts ────────────────────────────────────────────────────────
// accountService.ts calls:
//   GET  /accounts?page&limit&search&type&is_active
//   GET  /accounts/stats
//   GET  /accounts/:id
//   POST /accounts
//   PATCH /accounts/:id
//   DELETE /accounts/:id

function registerAccounts(mock: MockAdapter) {
  // /accounts/stats must be before /:id
  mock.onGet('/accounts/stats').reply(() => {
    const all = store.accounts.findAll();
    const result: Record<string, number> = { total: all.length };
    for (const acc of all) {
      const t = String(acc.account_type || acc.type || '').toLowerCase();
      result[t] = (result[t] || 0) + 1;
    }
    return [200, result];
  });

  mock.onGet('/accounts').reply(config => {
    const params   = config.params || {};
    const page     = intParam(params.page, 1);
    const limit    = intParam(params.limit, 25);
    const search   = params.search;
    const typeFilter = params.type;
    const isActive = params.is_active;

    let items = store.accounts.findAll();

    if (search) items = textSearch(items, search, ['account_code', 'account_name', 'accountCode', 'accountName']);
    if (typeFilter) {
      items = items.filter(a =>
        (a.account_type || a.type || '').toLowerCase() === typeFilter.toLowerCase() ||
        (a.accountType || '').toLowerCase() === typeFilter.toLowerCase(),
      );
    }
    if (isActive !== undefined) {
      const active = String(isActive) === 'true';
      items = items.filter(a => (a.is_active ?? a.isActive ?? true) === active);
    }

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages }];
  });

  mock.onGet(/^\/accounts\/[^/]+$/).reply(config => {
    const id  = config.url!.split('/').pop()!;
    const acc = store.accounts.findById(id);
    if (!acc) return [404, { message: 'Account not found' }];
    return [200, acc];
  });

  mock.onPost('/accounts').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const item = { _id: id, id, balance: 0, is_active: true, ...body, createdAt: now(), updatedAt: now() };
    store.accounts.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/accounts\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const updated = store.accounts.update(id, JSON.parse(config.data || '{}'));
    if (!updated) return [404, { message: 'Account not found' }];
    return [200, updated];
  });

  mock.onDelete(/^\/accounts\/[^/]+$/).reply(config => {
    store.accounts.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Finance Reports ──────────────────────────────────────────────────────────
// financeReportService.ts calls:
//   GET  /accounts/reports/aging?type=AR|AP&as_of=YYYY-MM-DD&page&limit
//   GET  /accounts/reports/profit-loss?from=YYYY-MM-DD&to=YYYY-MM-DD
//   GET  /accounts/reports/balance-sheet

function registerFinanceReports(mock: MockAdapter) {
  // ── AR / AP Aging ──────────────────────────────────────────────────────────
  mock.onGet('/accounts/reports/aging').reply(config => {
    const params = config.params || {};
    const type   = (params.type || 'AR').toUpperCase();
    const asOf   = params.as_of || today();
    const page   = intParam(params.page, 1);
    const limit  = intParam(params.limit, 25);

    let entries: any[];

    if (type === 'AR') {
      // Accounts Receivable — from unpaid customer invoices
      const invoices = store.invoices.findAll().filter(i => i.status !== 'paid' && i.status !== 'cancelled');
      entries = invoices.map((inv, idx) => {
        const dueDate   = inv.due_date || inv.dueDate || '';
        const daysOver  = calcDaysOverdue(dueDate, asOf);
        return {
          id:                `ar-${idx}`,
          entity_id:         inv.patient_id || inv.customer_id || '',
          customer_name:     inv.patient_name || inv.customer_name || 'Customer',
          invoice_number:    inv.invoice_number || inv.invoiceNumber || '',
          invoice_date:      inv.invoice_date || inv.createdAt || '',
          due_date:          dueDate,
          amount:            inv.amount || inv.grand_total || 0,
          outstanding:       Math.max(0, (inv.amount || inv.grand_total || 0) - (inv.paid_amount || 0)),
          days_overdue:      daysOver,
          bucket:            agingBucket(daysOver),
        };
      });
    } else {
      // Accounts Payable — from unpaid purchase orders
      const orders = store.purchaseOrders.findAll().filter(o =>
        o.status !== 'cancelled' && (o.paid_amount || 0) < (o.total_amount || 0),
      );
      entries = orders.map((order, idx) => {
        const dueDate  = order.expected_delivery_date || order.createdAt || '';
        const daysOver = calcDaysOverdue(dueDate, asOf);
        return {
          id:             `ap-${idx}`,
          entity_id:      order.vendor_id || '',
          vendor_name:    order.vendor_name || 'Vendor',
          invoice_number: order.po_number  || '',
          invoice_date:   order.order_date || order.createdAt || '',
          due_date:       dueDate,
          amount:         order.total_amount || 0,
          outstanding:    Math.max(0, (order.total_amount || 0) - (order.paid_amount || 0)),
          days_overdue:   daysOver,
          bucket:         agingBucket(daysOver),
        };
      });
    }

    entries.sort((a, b) => b.days_overdue - a.days_overdue);

    const total   = entries.length;
    const paged   = paginate(entries, page, limit);
    const summary = summariseAging(entries);

    return [200, {
      type, asOf,
      entries: paged.data,
      total,
      page,
      limit,
      summary,
    }];
  });

  // ── P&L Statement ─────────────────────────────────────────────────────────
  mock.onGet('/accounts/reports/profit-loss').reply(config => {
    const { from, to } = config.params || {};

    const accounts = store.accounts.findAll();

    const revenueAccs   = accounts.filter(a => matchType(a, 'revenue'));
    const cogsAccs      = accounts.filter(a => matchSubtype(a, ['cogs']));
    const opexAccs      = accounts.filter(a => matchType(a, 'expense') && !matchSubtype(a, ['cogs', 'other_expense']));
    const otherIncAccs  = accounts.filter(a => matchSubtype(a, ['other_income']));
    const otherExpAccs  = accounts.filter(a => matchSubtype(a, ['other_expense']));

    const revenueTotal  = sum(revenueAccs);
    const cogsTotal     = sum(cogsAccs);
    const grossProfit   = revenueTotal - cogsTotal;
    const opexTotal     = sum(opexAccs);
    const opIncome      = grossProfit - opexTotal;
    const otherInc      = sum(otherIncAccs);
    const otherExp      = sum(otherExpAccs);
    const netProfit     = opIncome + otherInc - otherExp;

    return [200, {
      periodFrom:  from || firstDayOfYear(),
      periodTo:    to   || today(),
      revenue: {
        accounts: revenueAccs.map(toReportLine),
        total:    revenueTotal,
      },
      costOfGoods: {
        accounts: cogsAccs.map(toReportLine),
        total:    cogsTotal,
      },
      grossProfit,
      operatingExpenses: {
        accounts: opexAccs.map(toReportLine),
        total:    opexTotal,
      },
      operatingProfit: opIncome,
      otherIncome: {
        accounts: otherIncAccs.map(toReportLine),
        total:    otherInc,
      },
      financeExpenses: {
        accounts: otherExpAccs.map(toReportLine),
        total:    otherExp,
      },
      netProfit,
    }];
  });

  // ── Balance Sheet ──────────────────────────────────────────────────────────
  mock.onGet('/accounts/reports/balance-sheet').reply(() => {
    const accounts = store.accounts.findAll();

    const assetAccs     = accounts.filter(a => matchType(a, 'asset'));
    const liabAccs      = accounts.filter(a => matchType(a, 'liability'));
    const equityAccs    = accounts.filter(a => matchType(a, 'equity'));

    const assetsTotal   = sum(assetAccs);
    const liabTotal     = sum(liabAccs);
    const equityTotal   = sum(equityAccs);

    return [200, {
      assets: {
        accounts: assetAccs.map(toBalanceSheetLine),
        total:    assetsTotal,
      },
      liabilities: {
        accounts: liabAccs.map(toBalanceSheetLine),
        total:    liabTotal,
      },
      equity: {
        accounts: equityAccs.map(toBalanceSheetLine),
        total:    equityTotal,
      },
      netAssets: assetsTotal - liabTotal,
    }];
  });
}

// ─── Invoices / Billing ───────────────────────────────────────────────────────
// invoiceService.ts calls GET /invoices with:
//   page, limit, status, source_type, search
// It maps: invoice_number, vendor_name, customer_name, amount, paid_amount,
//   status, due_date, invoice_date, tax_breakdown, items, etc.

function registerInvoices(mock: MockAdapter) {
  // Named sub-paths BEFORE the /:id regex
  mock.onGet('/invoices/stats').reply(() => {
    const invoices = store.invoices.findAll();
    return [200, {
      total:            invoices.length,
      paid:             invoices.filter(i => i.status === 'paid').length,
      pending:          invoices.filter(i => i.status === 'pending').length,
      partiallyPaid:    invoices.filter(i => i.status === 'partially_paid').length,
      overdue:          invoices.filter(i => i.status === 'overdue').length,
      cancelled:        invoices.filter(i => i.status === 'cancelled').length,
      totalBilled:      invoices.reduce((s, i) => s + (i.grand_total || i.amount || 0), 0),
      totalCollected:   invoices.reduce((s, i) => s + (i.paid_amount || 0), 0),
      totalOutstanding: invoices.reduce((s, i) => s + Math.max(0, (i.grand_total || i.amount || 0) - (i.paid_amount || 0)), 0),
    }];
  });

  mock.onGet('/invoices').reply(config => {
    const params   = config.params || {};
    const page     = intParam(params.page, 1);
    const limit    = intParam(params.limit, 25);
    const status   = params.status;
    const search   = params.search;
    const patientId = params.patient_id || params.patientId;
    const sourceType = params.source_type;

    let items = store.invoices.findAll();
    if (search)     items = textSearch(items, search, ['invoice_number', 'patient_name', 'customer_name', 'vendor_name']);
    if (status && status !== 'All') items = items.filter(i => i.status === status);
    if (patientId)  items = items.filter(i => i.patient_id === patientId);
    if (sourceType) items = items.filter(i => i.source_type === sourceType);

    items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onGet(/^\/invoices\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const invoice = store.invoices.findById(id);
    if (!invoice) return [404, { message: 'Invoice not found' }];
    return [200, invoice];
  });

  mock.onPost('/invoices').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const invoice = {
      _id:            id,
      invoice_number: `INV-${Date.now()}`,
      status:         'pending',
      paid_amount:    0,
      amount:         body.grand_total || body.amount || 0,
      grand_total:    body.grand_total || body.amount || 0,
      invoice_date:   body.invoice_date || today(),
      due_date:       body.due_date     || addDays(today(), 30),
      tax_breakdown:  [],
      items:          body.items || [],
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.invoices.insert(invoice);
    return [201, invoice];
  });

  mock.onPatch(/^\/invoices\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const body    = JSON.parse(config.data || '{}');
    const updated = store.invoices.update(id, body);
    if (!updated) return [404, { message: 'Invoice not found' }];
    return [200, updated];
  });

  mock.onDelete(/^\/invoices\/[^/]+$/).reply(config => {
    store.invoices.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

function registerJournalEntries(mock: MockAdapter) {
  mock.onGet('/journal-entries').reply(config => {
    const params = config.params || {};
    const page   = intParam(params.page, 1);
    const limit  = intParam(params.limit, 25);
    const search = params.search;
    const status = params.status;

    let items = store.journalEntries.findAll();
    if (search) items = textSearch(items, search, ['reference', 'description', 'debit_account', 'credit_account']);
    if (status) items = items.filter(je => je.status === status);
    items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onGet(/^\/journal-entries\/[^/]+$/).reply(config => {
    return [200, store.journalEntries.findById(config.url!.split('/').pop()!) || {}];
  });

  mock.onPost('/journal-entries').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const item = {
      _id:       id,
      reference: `JE-${Date.now()}`,
      status:    'draft',
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.journalEntries.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/journal-entries\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const updated = store.journalEntries.update(id, JSON.parse(config.data || '{}'));
    return [200, updated];
  });

  mock.onDelete(/^\/journal-entries\/[^/]+$/).reply(config => {
    store.journalEntries.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Users (Settings) ─────────────────────────────────────────────────────────

function registerUsers(mock: MockAdapter) {
  mock.onGet('/users').reply(config => {
    const params = config.params || {};
    const page   = intParam(params.page, 1);
    const limit  = intParam(params.limit, 25);
    const items  = store.users.findAll().map(u => ({ ...u, password: undefined }));
    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onGet(/^\/users\/[^/]+$/).reply(config => {
    const id   = config.url!.split('/').pop()!;
    const user = store.users.findById(id);
    if (!user) return [404, { message: 'User not found' }];
    return [200, { ...user, password: undefined }];
  });

  mock.onPost('/users').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const user = { _id: id, tenantId: 'demo-tenant', status: 'Active', ...body, password: 'Demo123!', createdAt: now() };
    store.users.insert(user);
    return [201, { ...user, password: undefined }];
  });

  mock.onPatch(/^\/users\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const updated = store.users.update(id, JSON.parse(config.data || '{}'));
    if (!updated) return [404, { message: 'User not found' }];
    return [200, { ...updated, password: undefined }];
  });

  mock.onDelete(/^\/users\/[^/]+$/).reply(config => {
    store.users.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Stock Transfers ──────────────────────────────────────────────────────────

function registerStockTransfers(mock: MockAdapter) {
  mock.onGet('/stock-transfers').reply(config => {
    const params = config.params || {};
    const result = paginate(
      store.stockTransfers.findAll(),
      intParam(params.page, 1),
      intParam(params.limit, 25),
    );
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onPost('/stock-transfers').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const item = { _id: id, transfer_number: `ST-${Date.now()}`, status: 'pending', ...body, createdAt: now(), updatedAt: now() };
    store.stockTransfers.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/stock-transfers\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const updated = store.stockTransfers.update(id, JSON.parse(config.data || '{}'));
    return [200, updated];
  });

  mock.onDelete(/^\/stock-transfers\/[^/]+$/).reply(config => {
    store.stockTransfers.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Health ───────────────────────────────────────────────────────────────────

function registerHealth(mock: MockAdapter) {
  mock.onGet('/health').reply(200, { status: 'ok', mode: 'demo' });
  mock.onGet('/').reply(200,      { status: 'ok', mode: 'demo' });
}

// ─── Finance report helpers ───────────────────────────────────────────────────

function matchType(acc: any, type: string): boolean {
  return (
    (acc.account_type || acc.accountType || acc.type || '').toLowerCase() === type.toLowerCase()
  );
}

function matchSubtype(acc: any, subtypes: string[]): boolean {
  const sub = (acc.account_sub_type || acc.accountSubType || acc.subtype || '').toLowerCase();
  return subtypes.some(s => sub.includes(s));
}

function sum(accounts: any[]): number {
  return accounts.reduce((s, a) => s + (a.balance ?? 0), 0);
}

function toReportLine(acc: any) {
  return {
    account_code: acc.account_code || acc.accountCode || acc.code || '',
    account_name: acc.account_name || acc.accountName || acc.name || '',
    amount:       acc.balance ?? 0,
  };
}

function toBalanceSheetLine(acc: any) {
  return {
    accountCode:  acc.account_code || acc.accountCode || acc.code || '',
    accountName:  acc.account_name || acc.accountName || acc.name || '',
    balance:      acc.balance ?? 0,
  };
}

function calcDaysOverdue(dueDate: string, asOf: string): number {
  if (!dueDate) return 0;
  const diff = (new Date(asOf).getTime() - new Date(dueDate).getTime()) / 86400000;
  return Math.max(0, Math.floor(diff));
}

function agingBucket(days: number): string {
  if (days <= 0)  return 'current';
  if (days <= 30) return 'current';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

function summariseAging(entries: any[]) {
  return entries.reduce(
    (acc, e) => {
      acc.total += e.outstanding;
      if      (e.bucket === 'current') acc.current     += e.outstanding;
      else if (e.bucket === '31-60')  acc.days31to60  += e.outstanding;
      else if (e.bucket === '61-90')  acc.days61to90  += e.outstanding;
      else                             acc.over90       += e.outstanding;
      return acc;
    },
    { current: 0, days31to60: 0, days61to90: 0, over90: 0, total: 0 },
  );
}

function firstDayOfYear(): string {
  return `${new Date().getFullYear()}-01-01`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}
