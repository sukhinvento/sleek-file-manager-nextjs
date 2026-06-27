/**
 * Extra handlers for all remaining endpoints:
 *   /locations/lookup
 *   /inventory/stats, /inventory/locations, /inventory/:id/locations
 *   /doctors/stats
 *   /purchase-orders/stats
 *   /sales-orders/stats
 *   /invoices/stats
 *   /rooms/available, /rooms/stats
 *   /stock/transfers, /stock/transfers/stats
 *   /departments/names
 *   /taxes/active/list, /taxes/by-ids
 *   /bank-accounts
 *   /medications/catalog, /medications/prescriptions
 *   /opd-visits, /opd-visits/stats, /opd-visits/today
 *   /fixed-assets, /fixed-assets/depreciation/run
 *   /payroll/employees, /payroll/runs, /payroll/run
 */
import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, today, paginate, textSearch, intParam } from '../helpers';

export function registerExtraHandlers(mock: MockAdapter) {
  registerLocationExtras(mock);
  registerInventoryExtras(mock);
  registerStatsEndpoints(mock);
  registerRoomExtras(mock);
  registerStockTransfers(mock);
  registerDepartmentExtras(mock);
  registerTaxExtras(mock);
  registerBankAccounts(mock);
  registerMedications(mock);
  registerOpdVisits(mock);
  registerFixedAssets(mock);
  registerPayroll(mock);
}

// ─── Locations extras ─────────────────────────────────────────────────────────
// /locations/lookup is now registered inside misc.ts registerLocations()
// to guarantee it comes before the /:id regex in registration order.

function registerLocationExtras(_mock: MockAdapter) {
  // intentionally empty — handler lives in misc.ts
}

// ─── Inventory extras ─────────────────────────────────────────────────────────

function registerInventoryExtras(mock: MockAdapter) {
  // GET /inventory/stats — must be before /:id
  mock.onGet('/inventory/stats').reply(() => {
    const items = store.inventory.findAll();
    const cats  = new Set(items.map(i => i.category));
    return [200, {
      total:      items.length,
      totalValue: items.reduce((s, i) => s + (i.unit_price * i.current_stock), 0),
      outOfStock: items.filter(i => i.current_stock === 0).length,
      lowStock:   items.filter(i => i.current_stock > 0 && i.current_stock <= i.min_stock_level).length,
      categories: cats.size,
    }];
  });

  // GET /inventory/locations — all unique locations in inventory
  mock.onGet('/inventory/locations').reply(() => {
    const locs = Array.from(new Set(store.inventory.findAll().map(i => i.location).filter(Boolean)));
    return [200, locs.map(l => ({ name: l, code: l }))];
  });

  // GET /inventory/:id/locations
  mock.onGet(/^\/inventory\/[^/]+\/locations$/).reply(config => {
    const id   = config.url!.split('/')[2];
    const item = store.inventory.findById(id);
    if (!item) return [404, { message: 'Item not found' }];
    return [200, [{ location: item.location || 'Main Store', quantity: item.current_stock }]];
  });

  // POST /inventory/:id/locations
  mock.onPost(/^\/inventory\/[^/]+\/locations$/).reply(config => {
    const id   = config.url!.split('/')[2];
    const body = JSON.parse(config.data || '{}');
    return [201, { item_id: id, ...body, createdAt: now() }];
  });

  // PATCH /inventory/:id/locations/:locId
  mock.onPatch(/^\/inventory\/[^/]+\/locations\/[^/]+$/).reply(config => {
    return [200, JSON.parse(config.data || '{}')];
  });
}

// ─── Stats endpoints ──────────────────────────────────────────────────────────
// All stats are now registered inside their own handler files BEFORE the /:id
// regex, so they are not accidentally caught by it. This function is a no-op.

function registerStatsEndpoints(_mock: MockAdapter) {
  // doctors/stats    → doctors.ts
  // purchase-orders/stats → purchaseOrders.ts
  // sales-orders/stats    → salesOrders.ts
  // invoices/stats        → misc.ts registerInvoices()
  // rooms/stats           → misc.ts registerRooms()
  // inventory/stats       → inventory.ts
}

// ─── Room extras ──────────────────────────────────────────────────────────────
// rooms/available and rooms/stats are now registered inside misc.ts
// registerRooms() before the /:id regex. No-op here.

function registerRoomExtras(_mock: MockAdapter) {}

// ─── Stock Transfers (/stock/transfers — note different path) ─────────────────

function registerStockTransfers(mock: MockAdapter) {
  // GET /stock/transfers/stats — before /:id
  mock.onGet('/stock/transfers/stats').reply(() => {
    const transfers = store.stockTransfers.findAll();
    return [200, {
      total:     transfers.length,
      pending:   transfers.filter(t => t.status === 'pending').length,
      completed: transfers.filter(t => t.status === 'completed').length,
      cancelled: transfers.filter(t => t.status === 'cancelled').length,
    }];
  });

  mock.onGet('/stock/transfers').reply(config => {
    const params = config.params || {};
    const result = paginate(
      store.stockTransfers.findAll(),
      intParam(params.page, 1),
      intParam(params.limit, 25),
    );
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onPost('/stock/transfers').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const item = { _id: id, transfer_number: `ST-${Date.now()}`, status: 'pending', ...body, createdAt: now(), updatedAt: now() };
    store.stockTransfers.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/stock\/transfers\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const updated = store.stockTransfers.update(id, JSON.parse(config.data || '{}'));
    return [200, updated];
  });

  mock.onDelete(/^\/stock\/transfers\/[^/]+$/).reply(config => {
    store.stockTransfers.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Department extras ────────────────────────────────────────────────────────

function registerDepartmentExtras(mock: MockAdapter) {
  // GET /departments/names — returns a simple string array
  mock.onGet('/departments/names').reply(() => {
    return [200, store.departments.findAll().map(d => d.name)];
  });
}

// ─── Tax extras ───────────────────────────────────────────────────────────────

function registerTaxExtras(mock: MockAdapter) {
  // GET /taxes/active/list
  mock.onGet('/taxes/active/list').reply(() => {
    return [200, store.taxSlabs.findAll()];
  });

  // GET /taxes/by-ids?ids=id1,id2
  mock.onGet('/taxes/by-ids').reply(config => {
    const ids = String(config.params?.ids || '').split(',').filter(Boolean);
    const result = ids.length
      ? store.taxSlabs.findAll().filter(t => ids.includes(t._id))
      : store.taxSlabs.findAll();
    return [200, result];
  });
}

// ─── Bank Accounts ────────────────────────────────────────────────────────────

function registerBankAccounts(mock: MockAdapter) {
  mock.onGet('/bank-accounts').reply(() => {
    const items = store.bankAccounts.findAll();
    return [200, { data: items, total: items.length }];
  });

  mock.onGet(/^\/bank-accounts\/[^/]+$/).reply(config => {
    return [200, store.bankAccounts.findById(config.url!.split('/').pop()!) || {}];
  });

  mock.onPost('/bank-accounts').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const item = { _id: id, balance: 0, ...body, createdAt: now() };
    store.bankAccounts.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/bank-accounts\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    return [200, store.bankAccounts.update(id, JSON.parse(config.data || '{}'))];
  });

  mock.onDelete(/^\/bank-accounts\/[^/]+$/).reply(config => {
    store.bankAccounts.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Medications ──────────────────────────────────────────────────────────────

function registerMedications(mock: MockAdapter) {
  mock.onGet('/medications/catalog').reply(config => {
    const params = config.params || {};
    const search = params.search;
    let items = store.medications.findAll();
    if (search) items = textSearch(items, search, ['name', 'category', 'form']);
    const result = paginate(items, intParam(params.page, 1), intParam(params.limit, 50));
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onPost('/medications/catalog').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const item = { _id: id, is_active: true, ...body, createdAt: now() };
    store.medications.insert(item);
    return [201, item];
  });

  mock.onGet('/medications/prescriptions').reply(config => {
    const params    = config.params || {};
    const patientId = params.patient_id || params.patientId;
    let items = store.prescriptions.findAll();
    if (patientId) items = items.filter(rx => rx.patient_id === patientId);
    const result = paginate(items, intParam(params.page, 1), intParam(params.limit, 25));
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onPost('/medications/prescriptions').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const med  = store.medications.findById(body.medication_id);
    const pat  = store.patients.findById(body.patient_id);
    const item = {
      _id: id,
      medication_name: med?.name || '',
      patient_name:    pat ? `${pat.first_name} ${pat.last_name}` : '',
      status: 'active',
      prescribed_date: today(),
      ...body,
      createdAt: now(),
    };
    store.prescriptions.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/medications\/prescriptions\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const updated = store.prescriptions.update(id, JSON.parse(config.data || '{}'));
    return [200, updated];
  });
}

// ─── OPD Visits ───────────────────────────────────────────────────────────────

function registerOpdVisits(mock: MockAdapter) {
  // GET /opd-visits/stats — before /:id
  mock.onGet('/opd-visits/stats').reply(() => {
    const visits = store.opdVisits.findAll();
    return [200, {
      total:       visits.length,
      today:       visits.filter(v => v.visit_date === today()).length,
      completed:   visits.filter(v => v.status === 'completed').length,
      inProgress:  visits.filter(v => v.status === 'in_progress').length,
      waiting:     visits.filter(v => v.status === 'waiting').length,
    }];
  });

  // GET /opd-visits/today — before /:id
  mock.onGet('/opd-visits/today').reply(() => {
    const visits = store.opdVisits.findAll().filter(v => v.visit_date === today());
    return [200, { data: visits, total: visits.length }];
  });

  mock.onGet('/opd-visits').reply(config => {
    const params    = config.params || {};
    const patientId = params.patient_id || params.patientId;
    const doctorId  = params.doctor_id  || params.doctorId;
    const status    = params.status;
    let items = store.opdVisits.findAll();
    if (patientId) items = items.filter(v => v.patient_id === patientId);
    if (doctorId)  items = items.filter(v => v.doctor_id  === doctorId);
    if (status && status !== 'All') items = items.filter(v => v.status === status);
    items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const result = paginate(items, intParam(params.page, 1), intParam(params.limit, 25));
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onPost('/opd-visits').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const pat  = store.patients.findById(body.patient_id);
    const item = {
      _id: id,
      visit_number: `OPD-${Date.now()}`,
      patient_name: pat ? `${pat.first_name} ${pat.last_name}` : '',
      visit_date:   today(),
      status:       'waiting',
      ...body,
      createdAt: now(),
    };
    store.opdVisits.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/opd-visits\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const updated = store.opdVisits.update(id, JSON.parse(config.data || '{}'));
    if (!updated) return [404, { message: 'Visit not found' }];
    return [200, updated];
  });

  mock.onDelete(/^\/opd-visits\/[^/]+$/).reply(config => {
    store.opdVisits.remove(config.url!.split('/').pop()!);
    return [204, null];
  });
}

// ─── Fixed Assets ─────────────────────────────────────────────────────────────

function registerFixedAssets(mock: MockAdapter) {
  mock.onGet('/fixed-assets').reply(config => {
    const params = config.params || {};
    const search = params.search;
    let items = store.fixedAssets.findAll();
    if (search) items = textSearch(items, search, ['name', 'category', 'location']);
    const result = paginate(items, intParam(params.page, 1), intParam(params.limit, 25));
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onGet(/^\/fixed-assets\/[^/]+$/).reply(config => {
    const asset = store.fixedAssets.findById(config.url!.split('/').pop()!);
    if (!asset) return [404, { message: 'Asset not found' }];
    return [200, asset];
  });

  mock.onPost('/fixed-assets').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const item = {
      _id: id,
      accumulated_depreciation: 0,
      book_value: body.purchase_cost || 0,
      status: 'active',
      ...body,
      createdAt: now(),
    };
    store.fixedAssets.insert(item);
    return [201, item];
  });

  mock.onPatch(/^\/fixed-assets\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const updated = store.fixedAssets.update(id, JSON.parse(config.data || '{}'));
    if (!updated) return [404, { message: 'Asset not found' }];
    return [200, updated];
  });

  mock.onDelete(/^\/fixed-assets\/[^/]+$/).reply(config => {
    store.fixedAssets.remove(config.url!.split('/').pop()!);
    return [204, null];
  });

  // POST /fixed-assets/depreciation/run
  mock.onPost('/fixed-assets/depreciation/run').reply(() => {
    const assets  = store.fixedAssets.findAll();
    let processed = 0;
    assets.forEach(a => {
      if (a.status === 'active') {
        const annual    = (a.purchase_cost || 0) * ((a.depreciation_rate || 10) / 100);
        const monthly   = Math.round(annual / 12);
        const newAccum  = (a.accumulated_depreciation || 0) + monthly;
        const newBook   = Math.max(0, (a.purchase_cost || 0) - newAccum);
        store.fixedAssets.update(a._id, {
          accumulated_depreciation: newAccum,
          book_value: newBook,
          status: newBook <= 0 ? 'fully_depreciated' : 'active',
        });
        processed++;
      }
    });
    return [200, { processed, message: `Depreciation run completed for ${processed} assets` }];
  });
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

function registerPayroll(mock: MockAdapter) {
  mock.onGet('/payroll/employees').reply(config => {
    const params = config.params || {};
    const search = params.search;
    const dept   = params.department;
    let items = store.payrollEmployees.findAll();
    if (search) items = textSearch(items, search, ['name', 'employee_id', 'department', 'role']);
    if (dept && dept !== 'All') items = items.filter(e => e.department === dept);
    const result = paginate(items, intParam(params.page, 1), intParam(params.limit, 25));
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onGet('/payroll/runs').reply(config => {
    const params = config.params || {};
    const result = paginate(
      store.payrollRuns.findAll(),
      intParam(params.page, 1),
      intParam(params.limit, 12),
    );
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  mock.onPost('/payroll/run').reply(config => {
    const body    = JSON.parse(config.data || '{}');
    const id      = genId();
    const emps    = store.payrollEmployees.findAll();
    const payout  = emps.reduce((s, e) => s + (e.net_salary || 0), 0);
    const run = {
      _id: id,
      period:          body.period || today().substring(0, 7),
      total_employees: emps.length,
      total_payout:    payout,
      status:          'completed',
      run_date:        now(),
      createdAt:       now(),
    };
    store.payrollRuns.insert(run);
    return [201, run];
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function groupBy<T extends Record<string, any>>(items: T[], key: string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = String(item[key] || 'Unknown');
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
