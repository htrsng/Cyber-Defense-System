import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './index.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AdminApp() {
    const location = useLocation();
    const navigate = useNavigate();
    const [securityEnabled, setSecurityEnabled] = useState(false);
    const [stats, setStats] = useState({ users: 0, txs: 0, totalMoney: 0 });
    const [logs, setLogs] = useState([]);

    // Fetch initial status
    useEffect(() => {
        // Here we'd normally fetch the real status from backend
        // For demo, we just rely on sockets or a /api/demo/status route if we had one.
        // We'll mock a simple fetch or wait for socket event
    }, []);

    // Socket listeners for live security monitor
    useEffect(() => {
        const socket = io(API_URL);
        socket.on('security_status_changed', (data) => {
            setSecurityEnabled(data.enabled);
        });
        socket.on('activity_log', (log) => {
            setLogs(prev => [log, ...prev].slice(0, 100)); // keep last 100 logs
        });
        return () => socket.disconnect();
    }, []);

    const toggleSecurity = async (enabled) => {
        try {
            // Need a valid token if authMiddleware is strict. For demo, we assume we have an admin token or bypass.
            // Let's grab token from localStorage
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/demo/toggle-security`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ enabled })
            });
            if (res.ok) {
                setSecurityEnabled(enabled);
            } else {
                alert('Failed to toggle security');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const resetDemo = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/demo/reset-public`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Demo reset successfully!');
                setLogs([]); // clear logs on reset
            }
        } catch (e) {
            console.error(e);
        }
    };

    const navItems = [
        { path: '/admin/overview', label: 'Overview', icon: '📊' },
        { path: '/admin/users', label: 'Quản Lý Users', icon: '👥' },
        { path: '/admin/transactions', label: 'Quản Lý Giao Dịch', icon: '💳' },
        { path: '/admin/security', label: 'Security Monitor', icon: '🛡️' },
        { path: '/admin/demo', label: 'Demo Control', icon: '🎮' },
        { path: '/admin/settings', label: 'System Settings', icon: '⚙️' },
    ];

    // Redirect /admin to /admin/overview
    useEffect(() => {
        if (location.pathname === '/admin' || location.pathname === '/admin/') {
            navigate('/admin/overview');
        }
    }, [location, navigate]);

    return (
        <div className="pg-layout" style={{ background: '#09090b', color: '#fff' }}>
            {/* Sidebar */}
            <aside className="pg-sidebar" style={{ background: '#111827', borderRight: '1px solid #1f2937' }}>
                <div className="pg-brand" style={{ color: '#60a5fa' }}>
                    <div className="pg-logo">🛡️</div>
                    <div>
                        <div className="pg-brand-name">CyberDef Admin</div>
                        <div className="pg-brand-sub">Command Center</div>
                    </div>
                </div>
                
                <div className="pg-nav">
                    {navItems.map(item => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link key={item.path} to={item.path} className={`pg-nav-item ${isActive ? 'active' : ''}`} style={isActive ? { background: '#1e3a8a', color: '#60a5fa' } : {}}>
                                <span className="pg-nav-icon">{item.icon}</span>
                                <span className="pg-nav-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="pg-sidebar-bottom">
                    <div className="pg-user-badge" style={{ background: '#1f2937' }}>
                        <div className="pg-avatar" style={{ background: '#60a5fa' }}>A</div>
                        <div className="pg-user-info">
                            <div className="pg-user-name">Administrator</div>
                            <div className="pg-user-role" style={{ color: securityEnabled ? '#34d399' : '#f87171' }}>
                                {securityEnabled ? '🟢 System Protected' : '🔴 System Vulnerable'}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pg-main" style={{ padding: '32px' }}>
                <Routes>
                    <Route path="overview" element={<AdminOverview resetDemo={resetDemo} toggleSecurity={toggleSecurity} securityEnabled={securityEnabled} />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="transactions" element={<AdminTransactions />} />
                    <Route path="security" element={<AdminSecurity logs={logs} />} />
                    <Route path="demo" element={<AdminDemo resetDemo={resetDemo} toggleSecurity={toggleSecurity} securityEnabled={securityEnabled} />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Routes>
            </main>
        </div>
    );
}

// ─── PAGE COMPONENTS ───

function AdminOverview({ resetDemo, toggleSecurity, securityEnabled }) {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Overview</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                    <div style={{ color: '#9ca3af', marginBottom: 8 }}>Trạng thái hệ thống</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: securityEnabled ? '#34d399' : '#f87171' }}>
                        {securityEnabled ? '🛡️ PROTECTED' : '⚠️ UNPROTECTED'}
                    </div>
                </div>
                <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                    <div style={{ color: '#9ca3af', marginBottom: 8 }}>Tổng người dùng</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>1,248</div>
                </div>
                <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                    <div style={{ color: '#9ca3af', marginBottom: 8 }}>Tổng tiền giao dịch (24h)</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>42.5B VNĐ</div>
                </div>
            </div>

            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <h2 style={{ marginTop: 0 }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: 16 }}>
                    <button 
                        onClick={() => toggleSecurity(!securityEnabled)}
                        style={{ 
                            padding: '12px 24px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer',
                            background: securityEnabled ? '#f87171' : '#34d399', color: '#fff', border: 'none'
                        }}
                    >
                        {securityEnabled ? 'TẮT CyberDef (Vulnerable)' : 'BẬT CyberDef (Protected)'}
                    </button>
                    <button 
                        onClick={resetDemo}
                        style={{ 
                            padding: '12px 24px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer',
                            background: '#3b82f6', color: '#fff', border: 'none'
                        }}
                    >
                        🔄 Hoàn tiền về 1 Tỷ (Reset Demo)
                    </button>
                </div>
            </div>
        </div>
    );
}

function AdminUsers() {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Quản Lý Users</h1>
            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <th style={{ padding: '12px 0' }}>Email</th>
                            <th>Trạng thái</th>
                            <th>Risk Score</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '12px 0' }}>admin@payguard.vn</td>
                            <td><span className="pg-badge success">Active</span></td>
                            <td><span className="pg-badge success">0 (Safe)</span></td>
                            <td><button className="pg-badge muted" style={{ cursor: 'pointer' }}>Chi tiết</button></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 0' }}>hacker@evil.com</td>
                            <td><span className="pg-badge danger">Suspicious</span></td>
                            <td><span className="pg-badge danger">95 (Critical)</span></td>
                            <td><button className="pg-badge info" style={{ cursor: 'pointer' }}>Unlock IP</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AdminTransactions() {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Quản Lý Giao Dịch</h1>
            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <th style={{ padding: '12px 0' }}>Mã GD</th>
                            <th>Số tiền</th>
                            <th>Người gửi</th>
                            <th>Trạng thái / Flag</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '12px 0' }}>TX-10924</td>
                            <td>1,000,000,000đ</td>
                            <td>admin@payguard.vn</td>
                            <td><span className="pg-badge danger">⚠️ Suspicious</span></td>
                            <td><button className="pg-badge warning" style={{ cursor: 'pointer' }}>Reverse</button></td>
                        </tr>
                        <tr>
                            <td style={{ padding: '12px 0' }}>TX-10923</td>
                            <td>500,000đ</td>
                            <td>user@demo.com</td>
                            <td><span className="pg-badge success">Normal</span></td>
                            <td>—</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AdminSecurity({ logs }) {
    return (
        <div style={{ display: 'grid', gap: 24, height: '100%' }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Security Monitor (Live Logs)</h1>
            <div className="pg-panel" style={{ background: '#111827', borderColor: '#374151', height: '600px', overflowY: 'auto', fontFamily: 'monospace' }}>
                {logs.length === 0 ? (
                    <div style={{ color: '#6b7280', textAlign: 'center', marginTop: 40 }}>Waiting for security events...</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} style={{ 
                            padding: '12px', borderBottom: '1px solid #1f2937', 
                            color: log.severity === 'critical' ? '#ef4444' : log.severity === 'high' ? '#f59e0b' : '#3b82f6'
                        }}>
                            <span style={{ color: '#9ca3af' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                            <strong>[{log.eventType}]</strong> IP: {log.ipAddress} — {log.riskLevel} (Score: {log.riskScore})
                            {log.metadata?.triggerPattern && <div>↳ Pattern matched: {log.metadata.triggerPattern}</div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function AdminDemo({ resetDemo, toggleSecurity, securityEnabled }) {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Demo Control Panel</h1>
            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <h2 style={{ marginTop: 0 }}>Chuẩn bị kịch bản</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    
                    <div style={{ border: '2px dashed #f87171', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                        <h3 style={{ color: '#f87171' }}>1. Unprotected Mode</h3>
                        <p style={{ color: '#9ca3af', fontSize: 14 }}>Tắt WAF. Lệnh sqlmap sẽ bypass login và trừ sạch tiền.</p>
                        <button 
                            onClick={() => { resetDemo(); setTimeout(() => toggleSecurity(false), 500); }}
                            style={{ padding: '12px 24px', background: '#f87171', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
                            Kích hoạt Unprotected
                        </button>
                    </div>

                    <div style={{ border: '2px dashed #34d399', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                        <h3 style={{ color: '#34d399' }}>2. Protected Mode</h3>
                        <p style={{ color: '#9ca3af', fontSize: 14 }}>Bật WAF. Lệnh sqlmap sẽ bị chặn, Tarpit kích hoạt, tiền an toàn.</p>
                        <button 
                            onClick={() => { resetDemo(); setTimeout(() => toggleSecurity(true), 500); }}
                            style={{ padding: '12px 24px', background: '#34d399', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
                            Kích hoạt Protected
                        </button>
                    </div>

                </div>
            </div>
            
            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <h2 style={{ marginTop: 0 }}>Terminal Command (Copy & Paste)</h2>
                <div style={{ background: '#000', padding: 16, borderRadius: 8, fontFamily: 'monospace', color: '#34d399' }}>
                    sqlmap -u "http://localhost:5000/api/auth/login" --data="email=admin@payguard.vn&password=1" --dbs --batch
                </div>
            </div>
        </div>
    );
}

function AdminSettings() {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>System Settings</h1>
            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <p>Cấu hình CyberDef API Endpoint, Email Alert, Whitelist IP... (Static Demo)</p>
                <div style={{ opacity: 0.5 }}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Ngưỡng Auto-Lock (Risk Score)</label>
                        <input type="number" value="80" disabled style={{ padding: 8, background: '#111827', border: '1px solid #374151', color: '#fff' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminApp;
