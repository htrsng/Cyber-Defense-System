import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const websiteId = localStorage.getItem('selectedWebsiteId');
    if (websiteId) {
        config.params = { ...config.params, websiteId };
    }
    
    return config;
});

// ─── Socket.io singleton ──────────────────────────────────────────────────────
let socketInstance = null;

export function getSocket() {
    if (!socketInstance) {
        socketInstance = io(BASE_URL, { autoConnect: false, transports: ['websocket'] });
    }
    return socketInstance;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
export const authAPI = {
    login: (data) => api.post('/api/auth/login', data),
    register: (data) => api.post('/api/auth/register', data),
    logout: () => api.post('/api/auth/logout'),
    me: () => api.get('/api/auth/me'),
};

export const twoFactorAPI = {
    setup: () => api.post('/api/auth/2fa/setup'),
    verify: (data) => api.post('/api/auth/2fa/verify', data),
    validate: (data) => api.post('/api/auth/2fa/validate', data),
    disable: (data) => api.post('/api/auth/2fa/disable', data),
    status: () => api.get('/api/auth/2fa/status'),
};

export const logsAPI = {
    getAll: (params) => api.get('/api/logs', { params }),
    getStats: () => api.get('/api/logs/stats'),
};

export const riskAPI = {
    getByIP: (ip) => api.get(`/api/risk/${ip}`),
    getTopIPs: () => api.get('/api/risk/top/ips'),
    getStats: () => api.get('/api/risk/stats/overview'),
    analyze: () => api.post('/api/risk/analyze'),
};

export const eventsAPI = {
    getAll: (params) => api.get('/api/events', { params }),
    resolve: (id) => api.patch(`/api/events/${id}/resolve`),
};

export const tarpitAPI = {
    status: () => api.get('/api/tarpit/status'),
    clear: (ip) => api.delete(`/api/tarpit/clear/${encodeURIComponent(ip)}`),
    force: (ip, score) => api.post(`/api/tarpit/force/${encodeURIComponent(ip)}`, { score }),
};

export const simulateAPI = {
    bruteForce: (config) => api.post('/api/simulate/brute-force', config),
    sqli: (config) => api.post('/api/simulate/sqli', config),
    honeypot: () => api.post('/api/simulate/honeypot'),
};

export const adminAPI = {
    getEmailConfig: () => api.get('/api/admin/email-config'),
    testEmail: () => api.post('/api/admin/test-email'),
    sendDailyReport: () => api.post('/api/admin/daily-report'),
};

export const tenantsAPI = {
    getAll: () => api.get('/api/tenants'),
    getById: (id) => api.get(`/api/tenants/${id}`),
    getStats: (id) => api.get(`/api/tenants/${id}/stats`),
    update: (id, data) => api.patch(`/api/tenants/${id}`, data)
};

export const policiesAPI = {
    getAll: () => api.get('/api/policies'),
    getStats: () => api.get('/api/policies/stats'),
    getById: (id) => api.get(`/api/policies/${id}`),
    update: (id, data) => api.patch(`/api/policies/${id}`, data)
};

export const analyticsAPI = {
    getAttacks: () => api.get('/api/analytics/attacks'),
    getFraud: () => api.get('/api/analytics/fraud'),
    getOverview: () => api.get('/api/analytics/overview')
};

export const pricingAPI = {
    getPlans: () => api.get('/api/pricing/plans'),
    getCompare: () => api.get('/api/pricing/compare'),
    upgrade: (data) => api.post('/api/pricing/upgrade', data)
};
