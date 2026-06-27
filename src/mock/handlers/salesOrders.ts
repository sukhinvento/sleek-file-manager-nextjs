import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { genId, now, paginate, textSearch, intParam } from '../helpers';

export function registerSalesOrderHandlers(mock: MockAdapter) {
  // ── Named sub-paths FIRST (before the /:id regex) ────────────────────────

  // GET /sales-orders/stats
  mock.onGet('/sales-orders/stats').reply(() => {
    const orders = store.salesOrders.findAll();
    const totalOrders      = orders.length;
    const pendingOrders    = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const shippedOrders    = orders.filter(o => o.status === 'shipped').length;
    const deliveredOrders  = orders.filter(o => ['delivered','fulfilled','invoiced'].includes(o.status)).length;
    const cancelledOrders  = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue     = orders.reduce((s, o) => s + (o.grand_total || o.total_amount || 0), 0);
    const pendingRevenue   = orders
      .filter(o => o.status === 'pending')
      .reduce((s, o) => s + (o.grand_total || o.total_amount || 0), 0);
    const pendingPayments  = orders.reduce(
      (s, o) => s + Math.max(0, (o.grand_total || o.total_amount || 0) - (o.paid_amount || 0)), 0,
    );
    return [200, {
      totalOrders, pendingOrders, processingOrders,
      shippedOrders, deliveredOrders, cancelledOrders,
      totalRevenue, pendingRevenue, pendingPayments,
      // legacy aliases
      total: totalOrders, pending: pendingOrders,
      fulfilled: deliveredOrders, cancelled: cancelledOrders,
    }];
  });

  // POST /sales-orders/:id/ship
  mock.onPost(/^\/sales-orders\/[^/]+\/ship$/).reply(config => {
    const id = config.url!.split('/')[2];
    const updated = store.salesOrders.update(id, { status: 'shipped' });
    if (!updated) return [404, { message: 'Sales order not found' }];
    return [200, updated];
  });

  // POST /sales-orders/:id/invoice
  mock.onPost(/^\/sales-orders\/[^/]+\/invoice$/).reply(config => {
    const id = config.url!.split('/')[2];
    const updated = store.salesOrders.update(id, { status: 'invoiced' });
    if (!updated) return [404, { message: 'Sales order not found' }];
    return [200, updated];
  });

  // PATCH /sales-orders/:id/status
  mock.onPatch(/^\/sales-orders\/[^/]+\/status$/).reply(config => {
    const parts   = config.url!.split('/');
    const id      = parts[parts.length - 2];
    const body    = JSON.parse(config.data || '{}');
    const updated = store.salesOrders.update(id, { status: body.status });
    if (!updated) return [404, { message: 'Sales order not found' }];
    return [200, updated];
  });

  // ── List / single / CRUD ─────────────────────────────────────────────────

  // GET /sales-orders
  mock.onGet('/sales-orders').reply(config => {
    const params = config.params || {};
    const page   = intParam(params.page, 1);
    const limit  = intParam(params.limit, 25);
    const search = params.search;
    const status = params.status;

    let items = store.salesOrders.findAll();
    if (search) items = textSearch(items, search, ['so_number', 'customer_name']);
    if (status && status !== 'All') items = items.filter(o => o.status === status);

    items = items.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const result = paginate(items, page, limit);
    return [200, { data: result.data, total: result.total, page: result.page, limit: result.limit }];
  });

  // GET /sales-orders/:id
  mock.onGet(/^\/sales-orders\/[^/]+$/).reply(config => {
    const id    = config.url!.split('/').pop()!;
    const order = store.salesOrders.findById(id);
    if (!order) return [404, { message: 'Sales order not found' }];
    return [200, order];
  });

  // POST /sales-orders
  mock.onPost('/sales-orders').reply(config => {
    const body  = JSON.parse(config.data || '{}');
    const id    = genId();
    const order = {
      _id: id,
      so_number: `SO-${Date.now()}`,
      status: 'pending',
      paid_amount: 0,
      payment_status: 'pending',
      grand_total: body.grand_total || body.total_amount || 0,
      ...body,
      createdAt: now(),
      updatedAt: now(),
    };
    store.salesOrders.insert(order);
    return [201, order];
  });

  // PATCH /sales-orders/:id
  mock.onPatch(/^\/sales-orders\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const body    = JSON.parse(config.data || '{}');
    const updated = store.salesOrders.update(id, body);
    if (!updated) return [404, { message: 'Sales order not found' }];
    return [200, updated];
  });

  // DELETE /sales-orders/:id
  mock.onDelete(/^\/sales-orders\/[^/]+$/).reply(config => {
    const id      = config.url!.split('/').pop()!;
    const removed = store.salesOrders.remove(id);
    if (!removed) return [404, { message: 'Sales order not found' }];
    return [204, null];
  });
}
