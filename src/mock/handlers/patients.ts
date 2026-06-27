import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, paginate, textSearch, intParam } from '../helpers';

export function registerPatientHandlers(mock: MockAdapter) {
  // GET /patients/stats  (must be before /:id)
  mock.onGet('/patients/stats').reply(() => {
    const all = store.patients.findAll();
    const byStatus = ['active','admitted','discharged','critical','registered'].map(s => ({
      _id: s,
      count: all.filter(p => p.status === s).length,
    }));
    const byDepartment = Array.from(
      new Set(all.map(p => p.department).filter(Boolean)),
    ).map(dept => ({ _id: dept, count: all.filter(p => p.department === dept).length }));

    return [200, { byStatus, byDepartment, total: all.length }];
  });

  // GET /patients
  mock.onGet('/patients').reply(config => {
    const params = config.params || {};
    const page   = intParam(params.page, 1);
    const limit  = intParam(params.limit, 25);
    const search = params.search;
    const status = params.status;
    const dept   = params.department;

    let items = store.patients.findAll();

    if (search) items = textSearch(items, search, ['first_name','last_name','phone','email','patient_id']);
    if (status && status !== 'All') items = items.filter(p => p.status === status);
    if (dept) items = items.filter(p => p.department === dept);

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // GET /patients/:id
  mock.onGet(/^\/patients\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const patient = store.patients.findById(id);
    if (!patient) return [404, { message: 'Patient not found' }];
    return [200, patient];
  });

  // POST /patients
  mock.onPost('/patients').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();
    const patient = {
      _id: id,
      patient_id: `PAT${Date.now()}`,
      status: 'registered',
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.patients.insert(patient);
    return [201, patient];
  });

  // PATCH /patients/:id
  mock.onPatch(/^\/patients\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const body = JSON.parse(config.data || '{}');
    const updated = store.patients.update(id, body);
    if (!updated) return [404, { message: 'Patient not found' }];
    return [200, updated];
  });

  // DELETE /patients/:id
  mock.onDelete(/^\/patients\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const removed = store.patients.remove(id);
    if (!removed) return [404, { message: 'Patient not found' }];
    return [204, null];
  });
}
