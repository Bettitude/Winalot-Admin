import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL: BASE, timeout: 15000 });

// Attach admin JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear credentials and redirect to login — but NOT for demo sessions.
// Demo tokens (prefix "dummy_") are not real JWTs so the backend will always
// reject them. Let individual pages handle those errors with their own fallbacks.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('admin_token');
      if (token && !token.startsWith('dummy_')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const get  = (path, params) => api.get(path, { params }).then(r => r.data);
const post = (path, body)   => api.post(path, body).then(r => r.data);
const put  = (path, body)   => api.put(path, body).then(r => r.data);
const patch = (path, body)  => api.patch(path, body).then(r => r.data);
const del  = (path)         => api.delete(path).then(r => r.data);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (email, password) => post('/api/auth/login', { email, password }),
  logout: ()                => post('/api/auth/logout'),
  me:     ()                => get('/api/auth/me'),
};

// ── Matches ───────────────────────────────────────────────────────────────────
export const matchesApi = {
  list:   (params) => get('/api/matches', params),
  get:    (id)     => get(`/api/matches/${id}`),
  create: (body)   => post('/api/matches', body),
  update: (id, b)  => put(`/api/matches/${id}`, b),
  remove: (id)     => del(`/api/matches/${id}`),
  sync:   (id)     => post(`/api/matches/${id}/sync`),
};

// ── Markets ───────────────────────────────────────────────────────────────────
export const marketsApi = {
  list:       (params)   => get('/api/markets', params),
  get:        (id)       => get(`/api/markets/${id}`),
  options:    (id)       => get(`/api/markets/${id}/options`),
  create:     (body)     => post('/api/markets', body),
  bulkCreate: (body)     => post('/api/markets/bulk', body),
  update:     (id, b)    => put(`/api/markets/${id}`, b),
  settle:     (id, body) => post(`/api/markets/${id}/settle`, body),
  remove:     (id)       => del(`/api/markets/${id}`),
};

// ── Tickets ───────────────────────────────────────────────────────────────────
export const ticketsApi = {
  list:        (params) => get('/api/tickets', params),
  get:         (id)     => get(`/api/tickets/${id}`),
  void:        (id)     => del(`/api/tickets/${id}`),
  marketCount: (mktId)  => get(`/api/tickets/market/${mktId}/count`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list:           (params)   => get('/api/users', params),
  get:            (id)       => get(`/api/users/${id}`),
  update:         (id, body) => patch(`/api/users/${id}`, body),
  walletAdjust:   (id, body) => post(`/api/users/${id}/wallet-adjust`, body),
  stats:          (id)       => get(`/api/users/${id}/stats`),
  getPayoutDetails: (id)     => get(`/api/users/${id}/payout-details`),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsApi = {
  list: (params) => get('/api/transactions', params),
};

// ── Draws ─────────────────────────────────────────────────────────────────────
export const drawsApi = {
  prepare: (marketId)            => post(`/api/draws/prepare/${marketId}`),
  run:     (marketId, clientSeed) => post(`/api/draws/run/${marketId}`, { client_seed: clientSeed }),
  verify:  (drawId)              => get(`/api/draws/verify/${drawId}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  push:            (body)   => post('/api/notifications/push', body),
  history:         ()       => get('/api/notifications/history'),
  templates:       ()       => get('/api/notifications/templates'),
  createTemplate:  (body)   => post('/api/notifications/templates', body),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview:        (params) => get('/api/analytics/overview', params),
  topPages:        (params) => get('/api/analytics/top-pages', params),
  topMarkets:      (params) => get('/api/analytics/top-markets', params),
  btpChart:        (params) => get('/api/analytics/btp-chart', params),
  topSpenders:     (params) => get('/api/analytics/top-spenders', params),
  tierStats:       (params) => get('/api/analytics/tier-stats', params),
  deviceBreakdown: (params) => get('/api/analytics/devices', params),
  regSources:      (params) => get('/api/analytics/reg-sources', params),
  activityFeed:    (params) => get('/api/analytics/activity', params),
  pageView:        (body)   => post('/api/analytics/page-view', body),
};

// ── BTP Settings ──────────────────────────────────────────────────────────────
export const btpSettingsApi = {
  get:    ()     => get('/api/btp-settings'),
  update: (body) => put('/api/btp-settings', body),
};

// ── World Cup Games ───────────────────────────────────────────────────────────
export const wcGamesApi = {
  fixtures: ()                     => get('/api/worldcup/fixtures'),
  sync:     ()                     => get('/api/worldcup/sync'),
  list:     ()                     => get('/api/worldcup/games'),
  create:   (body)                 => post('/api/worldcup/games', body),
  update:   (fixtureId, body)      => patch(`/api/worldcup/games/${fixtureId}`, body),
  settle:   (fixtureId, body)      => post(`/api/worldcup/games/${fixtureId}/settle`, body),
  remove:   (fixtureId)            => del(`/api/worldcup/games/${fixtureId}`),
  winners:  (fixtureId)            => get(`/api/worldcup/games/${fixtureId}/winners`),
};

// ── Admin Live Stats ──────────────────────────────────────────────────────────
export const liveStatsApi = {
  get: () => get('/api/admin/stats/live'),
};

// ── Football search & predictions (API-Football proxy) ────────────────────────
export const footballSearchApi = {
  searchFixtures:  (q)         => get('/api/football/fixtures/search', { q }),
  getPredictions:  (fixtureId) => get(`/api/markets/predictions`, { fixture_id: fixtureId }),
};

export default api;
