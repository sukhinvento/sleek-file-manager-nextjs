import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, paginate, textSearch, intParam } from '../helpers';

export function registerDoctorHandlers(mock: MockAdapter) {
  // ── Named sub-paths FIRST (before the /:id regex) ────────────────────────

  // GET /doctors/stats
  mock.onGet('/doctors/stats').reply(() => {
    const docs = store.doctors.findAll();
    const byDept = docs.reduce((acc, d) => {
      const dept = d.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [200, {
      total:    docs.length,
      active:   docs.filter(d => d.status === 'active').length,
      onLeave:  docs.filter(d => d.status === 'on_leave').length,
      inactive: docs.filter(d => d.status === 'inactive').length,
      byDepartment: Object.entries(byDept).map(([department, count]) => ({ department, count })),
    }];
  });

  // ── List / single / CRUD ─────────────────────────────────────────────────

  // GET /doctors
  mock.onGet('/doctors').reply(config => {
    const params = config.params || {};
    const page   = intParam(params.page, 1);
    const limit  = intParam(params.limit, 25);
    const search = params.search;
    const dept   = params.department;
    const status = params.status;

    let items = store.doctors.findAll();
    if (search) items = textSearch(items, search, ['name', 'specialisation', 'department', 'employee_id']);
    if (dept && dept !== 'All') items = items.filter(d => d.department === dept);
    if (status && status !== 'All') items = items.filter(d => d.status === status);

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // GET /doctors/:id
  mock.onGet(/^\/doctors\/[^/]+$/).reply(config => {
    const id     = config.url!.split('/').pop()!;
    const doctor = store.doctors.findById(id);
    if (!doctor) return [404, { message: 'Doctor not found' }];
    return [200, doctor];
  });

  // POST /doctors
  mock.onPost('/doctors').reply(config => {
    const body   = JSON.parse(config.data || '{}');
    const id     = genId();
    const doctor = {
      _id: id,
      employee_id: `EMP${Date.now()}`,
      status: 'active',
      active_patients: 0,
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.doctors.insert(doctor);
    return [201, doctor];
  });

  // PATCH /doctors/:id
  mock.onPatch(/^\/doctors\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const body    = JSON.parse(config.data || '{}');
    const updated = store.doctors.update(id, body);
    if (!updated) return [404, { message: 'Doctor not found' }];
    return [200, updated];
  });

  // DELETE /doctors/:id
  mock.onDelete(/^\/doctors\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const removed = store.doctors.remove(id);
    if (!removed) return [404, { message: 'Doctor not found' }];
    return [204, null];
  });
}
