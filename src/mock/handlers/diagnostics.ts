import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, paginate, textSearch, intParam } from '../helpers';

export function registerDiagnosticsHandlers(mock: MockAdapter) {
  // ── Test Catalog  /diagnostics/tests ─────────────────────────────────────

  mock.onGet('/diagnostics/tests').reply(config => {
    const params  = config.params || {};
    const page    = intParam(params.page, 1);
    const limit   = intParam(params.limit, 50);
    const search  = params.search;
    const cat     = params.category;

    let items = store.diagnosticTests.findAll();
    if (search) items = textSearch(items, search, ['name', 'category', 'department']);
    if (cat && cat !== 'All') items = items.filter(t => t.category === cat);

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // GET /diagnostics/tests/:id
  mock.onGet(/^\/diagnostics\/tests\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const test = store.diagnosticTests.findById(id);
    if (!test) return [404, { message: 'Test not found' }];
    return [200, test];
  });

  // POST /diagnostics/tests
  mock.onPost('/diagnostics/tests').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();
    const test = {
      _id: id,
      status: 'Active',
      is_active: true,
      ...body,
      // normalise duration_minutes → duration string
      duration: body.duration_minutes ? `${body.duration_minutes} minutes` : (body.duration || ''),
      preparation: body.preparation_instructions || body.preparation,
      createdAt: now(),
      updatedAt: now(),
    };
    store.diagnosticTests.insert(test);
    return [201, test];
  });

  // PATCH /diagnostics/tests/:id
  mock.onPatch(/^\/diagnostics\/tests\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const body = JSON.parse(config.data || '{}');
    const patch = {
      ...body,
      ...(body.duration_minutes ? { duration: `${body.duration_minutes} minutes` } : {}),
      ...(body.preparation_instructions ? { preparation: body.preparation_instructions } : {}),
    };
    const updated = store.diagnosticTests.update(id, patch);
    if (!updated) return [404, { message: 'Test not found' }];
    return [200, updated];
  });

  // DELETE /diagnostics/tests/:id
  mock.onDelete(/^\/diagnostics\/tests\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    store.diagnosticTests.remove(id);
    return [204, null];
  });

  // ── Bookings  /diagnostics/bookings ──────────────────────────────────────

  // GET /diagnostics/bookings/stats  — must be before the /:id handler
  mock.onGet('/diagnostics/bookings/stats').reply(() => {
    const bookings = store.diagnosticBookings.findAll();
    const statuses = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];
    const byStatus = statuses.map(s => ({
      _id: s,
      count: bookings.filter(b => b.status === s).length,
    }));
    const byCategory = Array.from(new Set(bookings.map(b => b.category))).map(cat => ({
      _id: cat,
      count: bookings.filter(b => b.category === cat).length,
      revenue: bookings.filter(b => b.category === cat).reduce((s, b) => s + (b.price || 0), 0),
    }));
    return [200, {
      total: bookings.length,
      byStatus,
      byCategory,
      totalRevenue: bookings.reduce((s, b) => s + (b.price || 0), 0),
    }];
  });

  // GET /diagnostics/bookings/analytics/monthly-category
  mock.onGet('/diagnostics/bookings/analytics/monthly-category').reply(config => {
    const months = intParam(config.params?.months, 6);
    const bookings = store.diagnosticBookings.findAll();
    const categories = Array.from(new Set(bookings.map(b => b.category).filter(Boolean)));
    const now = new Date();
    const rows: Record<string, any>[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const row: Record<string, any> = { month: monthKey };
      for (const cat of categories) {
        row[cat] = bookings.filter(
          b => b.category === cat && (b.ordered_date || b.createdAt || '').startsWith(monthKey),
        ).length;
      }
      rows.push(row);
    }
    return [200, { categories, rows }];
  });

  // GET /diagnostics/bookings  (all bookings, with filters)
  mock.onGet('/diagnostics/bookings').reply(config => {
    const params   = config.params || {};
    const page     = intParam(params.page, 1);
    const limit    = intParam(params.limit, 25);
    const search   = params.search;
    const status   = params.status;
    const patientId = params.patient_id || params.patientId;

    let items = store.diagnosticBookings.findAll();
    if (search)    items = textSearch(items, search, ['patient_name', 'test_name', 'ordered_by']);
    if (status && status !== 'All') items = items.filter(b => b.status === status);
    if (patientId) items = items.filter(b => b.patient_id === patientId);

    items = items.sort((a, b) =>
      new Date(b.ordered_date || b.createdAt).getTime() - new Date(a.ordered_date || a.createdAt).getTime(),
    );

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // GET /diagnostics/bookings/:id
  mock.onGet(/^\/diagnostics\/bookings\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const booking = store.diagnosticBookings.findById(id);
    if (!booking) return [404, { message: 'Booking not found' }];
    return [200, booking];
  });

  // POST /diagnostics/bookings
  mock.onPost('/diagnostics/bookings').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();

    // Resolve patient name and test name from store if only IDs are given
    const patient = store.patients.findById(body.patient_id);
    const test    = store.diagnosticTests.findById(body.test_id);

    const booking = {
      _id: id,
      status: 'pending',
      priority: 'routine',
      patient_name: patient
        ? `${patient.first_name} ${patient.last_name}`
        : (body.patient_name || ''),
      test_name:    test?.name || body.test_name || '',
      category:     test?.category || body.category || '',
      ordered_date: body.ordered_date || now().split('T')[0],
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.diagnosticBookings.insert(booking);
    return [201, booking];
  });

  // PATCH /diagnostics/bookings/:id
  mock.onPatch(/^\/diagnostics\/bookings\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const body = JSON.parse(config.data || '{}');
    const updated = store.diagnosticBookings.update(id, body);
    if (!updated) return [404, { message: 'Booking not found' }];
    return [200, updated];
  });

  // DELETE /diagnostics/bookings/:id
  mock.onDelete(/^\/diagnostics\/bookings\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    store.diagnosticBookings.remove(id);
    return [204, null];
  });
}
