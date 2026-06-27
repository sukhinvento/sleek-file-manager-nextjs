/**
 * Notification handlers
 *
 * notificationService.ts calls:
 *   GET  /notifications/unread-count          → { unreadCount: number }
 *   GET  /notifications?limit=20&offset=0     → { items, total, unreadCount, limit, offset }
 *   PATCH /notifications/:id/read             → AppNotification
 *   POST  /notifications/mark-all-read        → { modifiedCount: number }
 *
 * NOTE: getNotifications() embeds query params in the URL string
 *   (`/notifications?limit=20`) rather than passing as axios `params`.
 *   axios-mock-adapter strips the query string before matching, so
 *   `mock.onGet('/notifications')` correctly catches those requests.
 */
import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { now, intParam } from '../helpers';

export function registerNotificationHandlers(mock: MockAdapter) {
  // GET /notifications/unread-count  — must be registered BEFORE /notifications
  mock.onGet('/notifications/unread-count').reply(() => {
    const count = store.notifications.findAll().filter(n => !n.isRead).length;
    return [200, { unreadCount: count }];
  });

  // POST /notifications/mark-all-read  — must be registered BEFORE /:id patterns
  mock.onPost('/notifications/mark-all-read').reply(() => {
    const all = store.notifications.findAll();
    let modified = 0;
    all.forEach(n => {
      if (!n.isRead) {
        store.notifications.update(n._id, { isRead: true, readAt: now() });
        modified++;
      }
    });
    return [200, { modifiedCount: modified }];
  });

  // GET /notifications  (list)
  //
  // notificationService.getNotifications() embeds query params directly in the URL string:
  //   apiClient.get(`/notifications?limit=20`)
  //
  // axios-mock-adapter v2 isUrlMatching() does a strict string comparison (strips only the
  // leading slash, NOT the query string). So mock.onGet('/notifications') will NOT match
  // '/notifications?limit=20'. We must use a regex and parse the query string ourselves.
  //
  // The regex ^\/notifications(\?.*)?$ matches:
  //   /notifications          ← exact
  //   /notifications?limit=20 ← with embedded query
  // but NOT:
  //   /notifications/unread-count   ← already handled above
  //   /notifications/mark-all-read  ← already handled above
  mock.onGet(/^\/notifications(\?.*)?$/).reply(config => {
    // Parse params from BOTH config.params (axios params option) AND the embedded query string
    const axiosParams = config.params || {};
    const url         = config.url || '';
    const qs          = url.includes('?') ? url.split('?')[1] : '';
    const urlParams   = new URLSearchParams(qs);

    const limit      = intParam(axiosParams.limit      ?? urlParams.get('limit'),      20);
    const offset     = intParam(axiosParams.offset     ?? urlParams.get('offset'),      0);
    const unreadOnly = axiosParams.unreadOnly === 'true' || urlParams.get('unreadOnly') === 'true';

    let items = store.notifications.findAll();
    if (unreadOnly) items = items.filter(n => !n.isRead);

    // newest first
    items = items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total       = items.length;
    const unreadCount = store.notifications.findAll().filter(n => !n.isRead).length;
    const page        = items.slice(offset, offset + limit);

    return [200, { items: page, total, unreadCount, limit, offset }];
  });

  // PATCH /notifications/:id/read
  mock.onPatch(/^\/notifications\/[^/]+\/read$/).reply(config => {
    const parts   = config.url!.split('/');
    const id      = parts[parts.length - 2];   // …/:id/read
    const updated = store.notifications.update(id, { isRead: true, readAt: now() });
    if (!updated) return [404, { message: 'Notification not found' }];
    return [200, updated];
  });
}
