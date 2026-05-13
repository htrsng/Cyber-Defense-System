import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
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

export const simulateAPI = {
    bruteForce: (config) => api.post('/api/simulate/brute-force', config),
    sqli: (config) => api.post('/api/simulate/sqli', config),
    honeypot: () => api.post('/api/simulate/honeypot'),
};
