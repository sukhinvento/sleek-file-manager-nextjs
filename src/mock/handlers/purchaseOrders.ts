import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, paginate, textSearch, intParam } from '../helpers';

export function registerPurchaseOrderHandlers(mock: MockAdapter) {
  // ── Named sub-paths FIRST (before the /:id regex) ────────────────────────

  // GET /purchase-orders/stats
  mock.onGet('/purchase-orders/stats').reply(() => {
    const orders = store.purchaseOrders.findAll();
    const total     = orders.length;
    const pending   = orders.filter(o => o.status === 'pending').length;
    const approved  = orders.filter(o => o.status === 'approved').length;
    const fulfilled = orders.filter(o => ['fulfilled','delivered','received'].includes(o.status)).length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const partial   = orders.filter(o => o.status === 'partial').length;
    const totalValue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const paidValue  = orders.reduce((s, o) => s + (o.paid_amount  || 0), 0);
    return [200, {
      totalOrders: total, pendingOrders: pending, approvedOrders: approved,
      fulfilledOrders: fulfilled, cancelledOrders: cancelled, partialOrders: partial,
      totalValue, paidValue,
      // legacy aliases used by some pages
      total, pending, approved, fulfilled, cancelled,
    }];
  });

  // PATCH /purchase-orders/:id/status
  mock.onPatch(/^\/purchase-orders\/[^/]+\/status$/).reply(config => {
    const parts   = config.url!.split('/');
    const id      = parts[parts.length - 2];
    const body    = JSON.parse(config.data || '{}');
    const updated = store.purchaseOrders.update(id, { status: body.status });
    if (!updated) return [404, { message: 'Purchase order not found' }];
    return [200, updated];
  });

  // ── List / single / CRUD ─────────────────────────────────────────────────

  // GET /purchase-orders
  mock.onGet('/purchase-orders').reply(config => {
    const params = config.params || {};
    const page   = intParam(params.page, 1);
    const limit  = intParam(params.limit, 25);
    const search = params.search;
    const status = params.status;

    let items = store.purchaseOrders.findAll();
    if (search) items = textSearch(items, search, ['po_number', 'vendor_name']);
    if (status && status !== 'All') items = items.filter(o => o.status === status);

    items = items.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // GET /purchase-orders/:id
  mock.onGet(/^\/purchase-orders\/[^/]+$/).reply(config => {
    const id    = config.url!.split('/').pop()!;
    const order = store.purchaseOrders.findById(id);
    if (!order) return [404, { message: 'Purchase order not found' }];
    return [200, order];
  });

  // POST /purchase-orders
  mock.onPost('/purchase-orders').reply(config => {
    const body  = JSON.parse(config.data || '{}');
    const id    = genId();
    const order = {
      _id: id,
      po_number: `PO-${Date.now()}`,
      status: 'pending',
      paid_amount: 0,
      total_amount: body.total_amount || 0,
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.purchaseOrders.insert(order);
    return [201, order];
  });

  // PATCH /purchase-orders/:id
  mock.onPatch(/^\/purchase-orders\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const body    = JSON.parse(config.data || '{}');
    const updated = store.purchaseOrders.update(id, body);
    if (!updated) return [404, { message: 'Purchase order not found' }];
    return [200, updated];
  });

  // DELETE /purchase-orders/:id
  mock.onDelete(/^\/purchase-orders\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const removed = store.purchaseOrders.remove(id);
    if (!removed) return [404, { message: 'Purchase order not found' }];
    return [204, null];
  });
}
