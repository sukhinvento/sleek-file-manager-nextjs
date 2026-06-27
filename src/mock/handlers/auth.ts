import MockAdapter from 'axios-mock-adapter';
import { store } from '../store';
import { now } from '../helpers';

/**
 * Token registry — maps token string → userId.
 * Using a registry (instead of parsing the token string) avoids issues
 * with underscores inside userIds like 'user_admin'.
 *
 * token format: demo_token_<userId>_<timestamp>
 * Parsing by split('_')[2] was broken for ids containing underscores.
 */
const tokenRegistry = new Map<string, string>();

/** Extract userId from a Bearer token using the registry. Returns null if not found. */
function userIdFromToken(authHeader: string): string | null {
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // Try the registry first (set during login)
  if (tokenRegistry.has(token)) return tokenRegistry.get(token)!;

  // Fallback: strip known prefix 'demo_token_' and numeric timestamp suffix
  // e.g. 'demo_token_user_admin_1234567890' → 'user_admin'
  const withoutPrefix = token.replace(/^demo_token_/, '');
  const userId = withoutPrefix.replace(/_\d+$/, '');
  if (userId && store.users.findById(userId)) return userId;

  return null;
}

export function registerAuthHandlers(mock: MockAdapter) {
  // POST /auth/login
  mock.onPost('/auth/login').reply(config => {
    const body = JSON.parse(config.data || '{}');
    const { username, password } = body;

    const user = store.users
      .findAll()
      .find(u => (u.username === username || u.email === username) && u.password === password);

    if (!user) {
      return [401, { message: 'Invalid credentials. Try admin / Admin123!' }];
    }

    const token = `demo_token_${user._id}_${Date.now()}`;
    tokenRegistry.set(token, user._id);

    return [200, {
      access_token: token,
      roles:    user.roles,
      scopes:   user.scopes,
      tenantId: user.tenantId,
      user: {
        userId:   user._id,
        username: user.username,
        name:     user.name,
        roles:    user.roles,
        scopes:   user.scopes,
        tenantId: user.tenantId,
      },
    }];
  });

  // POST /auth/logout
  mock.onPost('/auth/logout').reply(config => {
    const token = (config.headers?.Authorization || '').replace(/^Bearer\s+/i, '').trim();
    tokenRegistry.delete(token);
    return [200, { message: 'Logged out' }];
  });

  // GET /auth/profile
  mock.onGet('/auth/profile').reply(config => {
    const userId = userIdFromToken(config.headers?.Authorization || '');
    if (!userId) return [401, { message: 'Unauthorized' }];

    const user = store.users.findById(userId);
    if (!user) return [401, { message: 'Unauthorized' }];

    return [200, {
      _id:        user._id,
      username:   user.username,
      name:       user.name,
      first_name: user.first_name,
      last_name:  user.last_name,
      email:      user.email,
      phone:      user.phone,
      department: user.department,
      designation:user.designation,
      roles:      user.roles,
      scopes:     user.scopes,
      tenantId:   user.tenantId,
      status:     user.status,
      createdAt:  user.createdAt,
      updatedAt:  user.updatedAt || user.createdAt,
    }];
  });

  // PATCH /auth/profile
  mock.onPatch('/auth/profile').reply(config => {
    const userId = userIdFromToken(config.headers?.Authorization || '');
    if (!userId) return [401, { message: 'Unauthorized' }];

    const body    = JSON.parse(config.data || '{}');
    const updated = store.users.update(userId, {
      name:        body.name,
      email:       body.email,
      phone:       body.phone,
      department:  body.department,
      designation: body.designation,
    });
    if (!updated) return [404, { message: 'User not found' }];

    return [200, {
      _id:        updated._id,
      username:   updated.username,
      name:       updated.name,
      first_name: updated.first_name,
      last_name:  updated.last_name,
      email:      updated.email,
      phone:      updated.phone,
      department: updated.department,
      designation:updated.designation,
      roles:      updated.roles,
      scopes:     updated.scopes,
      tenantId:   updated.tenantId,
      status:     updated.status,
      createdAt:  updated.createdAt,
      updatedAt:  now(),
    }];
  });

  // POST /auth/profile/change-password
  mock.onPost('/auth/profile/change-password').reply(config => {
    const body = JSON.parse(config.data || '{}');
    if (!body.currentPassword || !body.newPassword) {
      return [400, { message: 'Both current and new password are required' }];
    }
    // Demo: accept any password change
    return [200, { message: 'Password changed successfully' }];
  });

  // GET /tenants/:id  — called by Settings page for GST/tax registration details
  mock.onGet(/^\/tenants\/[^/]+$/).reply(config => {
    const tenantId = config.url!.split('/').pop()!;
    return [200, {
      _id:                tenantId,
      name:               'MedSystem Demo Hospital',
      legal_name:         'MedSystem Healthcare Pvt. Ltd.',
      gstin:              '27AABCM1234A1Z5',
      pan:                'AABCM1234A',
      state_code:         '27',
      registered_address: '123 Healthcare Street, Mumbai, Maharashtra - 400001',
      email:              'admin@medsystem.in',
      phone:              '+91 98000 00001',
      createdAt:          '2024-01-01T00:00:00.000Z',
    }];
  });

  // PATCH /tenants/:id  — called by Settings page when saving GST settings
  mock.onPatch(/^\/tenants\/[^/]+$/).reply(config => {
    const body = JSON.parse(config.data || '{}');
    return [200, { _id: config.url!.split('/').pop()!, ...body, updatedAt: now() }];
  });
}
