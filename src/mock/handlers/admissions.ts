import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, paginate, intParam } from '../helpers';

export function registerAdmissionHandlers(mock: MockAdapter) {
  // GET /admissions
  mock.onGet('/admissions').reply(config => {
    const params  = config.params || {};
    const page    = intParam(params.page, 1);
    const limit   = intParam(params.limit, 25);
    const status  = params.status;
    const patient = params.patient_id || params.patientId;

    let items = store.admissions.findAll();
    if (status && status !== 'All') items = items.filter(a => a.status === status);
    if (patient) items = items.filter(a => a.patient_id === patient);

    items = items.sort((a, b) =>
      new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime(),
    );

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // GET /admissions/:id
  mock.onGet(/^\/admissions\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const admission = store.admissions.findById(id);
    if (!admission) return [404, { message: 'Admission not found' }];
    return [200, admission];
  });

  // POST /admissions
  mock.onPost('/admissions').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();
    const admission = {
      _id: id,
      admission_number: `ADM-${Date.now()}`,
      status: 'active',
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.admissions.insert(admission);

    // Mark patient as admitted
    if (body.patient_id) {
      store.patients.update(body.patient_id, { status: 'admitted' });
    }
    // Reduce room availability
    if (body.room_id) {
      const room = store.rooms.findById(body.room_id);
      if (room && room.available_beds > 0) {
        store.rooms.update(body.room_id, {
          available_beds: room.available_beds - 1,
          status: room.available_beds - 1 === 0 ? 'Full' : 'Available',
        });
      }
    }

    return [201, admission];
  });

  // PATCH /admissions/:id  (used for discharge too)
  mock.onPatch(/^\/admissions\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const body = JSON.parse(config.data || '{}');
    const existing = store.admissions.findById(id);
    if (!existing) return [404, { message: 'Admission not found' }];

    const updated = store.admissions.update(id, body);

    // If discharging, update patient status and free room
    if (body.status === 'discharged') {
      if (existing.patient_id) {
        store.patients.update(existing.patient_id, { status: 'discharged' });
      }
      if (existing.room_id) {
        const room = store.rooms.findById(existing.room_id);
        if (room) {
          const newAvail = Math.min(room.available_beds + 1, room.total_beds);
          store.rooms.update(existing.room_id, {
            available_beds: newAvail,
            status: newAvail > 0 ? 'Available' : 'Full',
          });
        }
      }
    }

    return [200, updated];
  });

  // DELETE /admissions/:id
  mock.onDelete(/^\/admissions\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    store.admissions.remove(id);
    return [204, null];
  });
}
