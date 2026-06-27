import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, paginate, textSearch, intParam } from '../helpers';

export function registerVendorHandlers(mock: MockAdapter) {
  // GET /vendors
  mock.onGet('/vendors').reply(config => {
    const params = config.params || {};
    const page  = intParam(params.page,  1);
    const limit = intParam(params.limit, 25);
    const q     = params.search || params.q;

    let items = store.vendors.findAll();

    // Text search
    if (q) {
      items = textSearch(items, q, ['name', 'vendor_code']);
    }

    // Filter support (JSON string)
    if (params.filter) {
      try {
        const filter = JSON.parse(params.filter);
        if (filter['custom_fields.status']) {
          items = items.filter(v => v.custom_fields?.status === filter['custom_fields.status']);
        }
        if (filter['custom_fields.category'] || filter['custom_fields.industry']) {
          const cat = filter['custom_fields.category'] || filter['custom_fields.industry'];
          items = items.filter(v => v.custom_fields?.category === cat || v.custom_fields?.industry === cat);
        }
      } catch { /* ignore bad filter */ }
    }

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages }];
  });

  // GET /vendors/search
  mock.onGet('/vendors/search').reply(config => {
    const params = config.params || {};
    const q = params.q || params.search || '';
    let items = store.vendors.findAll();
    if (q) items = textSearch(items, q, ['name', 'vendor_code']);
    const page  = intParam(params.page, 1);
    const limit = intParam(params.limit, 10);
    const result = paginate(items, page, limit);
    return [200, result.data];
  });

  // GET /vendors/:id
  mock.onGet(/^\/vendors\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const vendor = store.vendors.findById(id);
    if (!vendor) return [404, { message: 'Vendor not found' }];
    return [200, vendor];
  });

  // POST /vendors
  mock.onPost('/vendors').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id = genId();
    const vendor = {
      _id: id,
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.vendors.insert(vendor);
    return [201, vendor];
  });

  // PATCH /vendors/:id
  mock.onPatch(/^\/vendors\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const body = JSON.parse(config.data || '{}');
    const updated = store.vendors.update(id, body);
    if (!updated) return [404, { message: 'Vendor not found' }];
    return [200, updated];
  });

  // DELETE /vendors/:id
  mock.onDelete(/^\/vendors\/[^/]+$/).reply(config => {
    const id = config.url!.split('/').pop()!;
    const removed = store.vendors.remove(id);
    if (!removed) return [404, { message: 'Vendor not found' }];
    return [204, null];
  });
}
