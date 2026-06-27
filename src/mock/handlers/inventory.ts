import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, paginate, textSearch, intParam } from '../helpers';

export function registerInventoryHandlers(mock: MockAdapter) {
  // ── Named sub-paths FIRST (before any /:id regex) ────────────────────────

  // GET /inventory/stats
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

  // GET /inventory/locations — unique locations across all items
  mock.onGet('/inventory/locations').reply(() => {
    const locs = Array.from(new Set(store.inventory.findAll().map(i => i.location).filter(Boolean)));
    return [200, locs.map(l => ({ name: l, code: l }))];
  });

  // GET /inventory/search
  mock.onGet('/inventory/search').reply(config => {
    const q = config.params?.q || config.params?.search || '';
    let items = store.inventory.findAll();
    if (q) items = textSearch(items, q, ['name', 'sku']);
    return [200, items.slice(0, 20)];
  });

  // ── List ─────────────────────────────────────────────────────────────────

  // GET /inventory
  mock.onGet('/inventory').reply(config => {
    const params   = config.params || {};
    const page     = intParam(params.page, 1);
    const limit    = intParam(params.limit, 25);
    const search   = params.search;
    const cat      = params.category;
    const location = params.location;
    const lowStock = params.low_stock === 'true' || params.low_stock === true;

    let items = store.inventory.findAll();
    if (search)   items = textSearch(items, search, ['name', 'sku', 'supplier', 'category']);
    if (cat && cat !== 'All') items = items.filter(i => i.category === cat);
    if (location) items = items.filter(i => i.location === location);
    if (lowStock) items = items.filter(i => i.current_stock <= i.min_stock_level);

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // ── Sub-resource paths with :itemId BEFORE generic /:id ──────────────────

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

  // POST /inventory/:id/adjust-stock
  mock.onPost(/^\/inventory\/[^/]+\/adjust-stock$/).reply(config => {
    const id   = config.url!.split('/')[2];
    const body = JSON.parse(config.data || '{}');
    const item = store.inventory.findById(id);
    if (!item) return [404, { message: 'Item not found' }];
    const newStock = (item.current_stock || 0) + (body.adjustment || 0);
    const updated  = store.inventory.update(id, { current_stock: newStock });
    return [200, updated];
  });

  // ── Single item CRUD (/:id — must be last) ────────────────────────────────

  // GET /inventory/:id
  mock.onGet(/^\/inventory\/[^/]+$/).reply(config => {
    const id   = config.url!.split('/').pop()!;
    const item = store.inventory.findById(id);
    if (!item) return [404, { message: 'Item not found' }];
    return [200, item];
  });

  // POST /inventory
  mock.onPost('/inventory').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const id   = genId();
    const item = { _id: id, current_stock: 0, ...body, createdAt: now(), updatedAt: now() };
    store.inventory.insert(item);
    return [201, item];
  });

  // PATCH /inventory/:id
  mock.onPatch(/^\/inventory\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const body    = JSON.parse(config.data || '{}');
    const updated = store.inventory.update(id, body);
    if (!updated) return [404, { message: 'Item not found' }];
    return [200, updated];
  });

  // DELETE /inventory/:id
  mock.onDelete(/^\/inventory\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const removed = store.inventory.remove(id);
    if (!removed) return [404, { message: 'Item not found' }];
    return [204, null];
  });
}
