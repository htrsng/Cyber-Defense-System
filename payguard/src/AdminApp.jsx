import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './index.css';

import AdminOverview from './admin_pages/AdminOverview';
import AdminUsers from './admin_pages/AdminUsers';
import AdminTransactions from './admin_pages/AdminTransactions';
import AdminRiskMonitoring from './admin_pages/AdminRiskMonitoring';
import AdminSecurity from './admin_pages/AdminSecurity';
import AdminDemo from './admin_pages/AdminDemo';
import AdminSettings from './admin_pages/AdminSettings';
import AdminKYC from './admin_pages/AdminKYC';
import AdminAuditLogs from './admin_pages/AdminAuditLogs';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AdminApp() {
    const location = useLocation();
    const navigate = useNavigate();
    const [securityEnabled, setSecurityEnabled] = useState(false);
    const [stats, setStats] = useState({ users: 0, txs: 0, totalMoney: 0 });
    const [logs, setLogs] = useState([]);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);

    // Fetch initial status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/api/payguard/status`);
                if (res.ok) {
                    const data = await res.json();
                    setSecurityEnabled(Boolean(data.securityEnabled));
                }
            } catch (err) {
                console.error("Failed to fetch initial security status", err);
            }
        };
        fetchStatus();
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

    const navGroups = [
        {
            title: 'TỔNG QUAN',
            items: [
                { path: '/admin/overview', label: 'Tổng quan', icon: '📊' }
            ]
        },
        {
            title: 'VẬN HÀNH',
            items: [
                { path: '/admin/users', label: 'Người dùng', icon: '👥' },
                { path: '/admin/kyc', label: 'Xác thực KYC', icon: '🪪' },
                { path: '/admin/transactions', label: 'Giao dịch', icon: '💳' },
            ]
        },
        {
            title: 'BẢO MẬT',
            items: [
                { path: '/admin/risk', label: 'Giám sát rủi ro', icon: '⚠️' },
                { path: '/admin/security', label: 'Bảo mật CyberDef', icon: '🛡️' },
                { path: '/admin/audit', label: 'Nhật ký hệ thống', icon: '📋' },
            ]
        },
        {
            title: 'HỆ THỐNG',
            items: [
                { path: '/admin/settings', label: 'Cài đặt', icon: '⚙️' },
            ]
        }
    ];

    // Redirect /admin to /admin/overview
    useEffect(() => {
        if (location.pathname === '/admin' || location.pathname === '/admin/') {
            navigate('/admin/overview');
        }
    }, [location, navigate]);

    return (
        <div className="pg-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#09090b', color: '#fff' }}>
            {/* Sidebar */}
            <aside className="pg-sidebar" style={{ position: 'relative', width: 280, flexShrink: 0, background: '#111827', borderRight: '1px solid #1f2937' }}>
                <div className="brand-section" style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,.08)', background: 'linear-gradient(180deg, rgba(37,99,235,.15), transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div className="logo-icon" style={{ fontSize: 48, filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.6)) drop-shadow(0 0 20px rgba(6,182,212,0.4))' }}>🛡️</div>
                        <div>
                            <div className="logo-title" style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>PayGuard</div>
                            <div className="logo-subtitle" style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>Hệ thống Quản trị</div>
                        </div>
                    </div>
                    
                    <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: securityEnabled ? '#34d399' : '#ef4444' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: securityEnabled ? '#34d399' : '#ef4444', boxShadow: `0 0 8px ${securityEnabled ? '#34d399' : '#ef4444'}` }} />
                            {securityEnabled ? 'ĐÃ BẢO VỆ' : 'NGUY HIỂM'}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, marginLeft: 16 }}>
                            {securityEnabled ? 'Hệ thống hoạt động bình thường' : 'Phát hiện mối đe dọa'}
                        </div>
                    </div>
                </div>
                
                <div className="pg-nav" style={{ gap: 8, padding: '0 16px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ marginBottom: 24 }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                            <span style={{ fontSize: 16 }}>⬅️</span> Về lại PayGuard
                        </Link>
                    </div>
                    {navGroups.map((group, idx) => (
                        <div key={idx} style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 8, letterSpacing: '0.05em' }}>{group.title}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {group.items.map(item => {
                                    const isActive = location.pathname.startsWith(item.path);
                                    return (
                                        <Link key={item.path} to={item.path} className={`pg-nav-item ${isActive ? 'active' : ''}`} style={{ ...(isActive ? { background: '#1e3a8a', color: '#60a5fa' } : { color: '#d1d5db' }), padding: '10px 14px', fontSize: 14, borderRadius: 8, display: 'flex', gap: 12, textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}>
                                            <span className="pg-nav-icon" style={{ fontSize: 18 }}>{item.icon}</span>
                                            <span className="pg-nav-label" style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pg-sidebar-bottom" style={{ position: 'relative', padding: 16, borderTop: '1px solid #1f2937' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#1f2937', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setShowAvatarMenu(!showAvatarMenu)} onMouseEnter={(e) => e.currentTarget.style.background = '#374151'} onMouseLeave={(e) => e.currentTarget.style.background = '#1f2937'}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>A</div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@payguard.vn</span>
                                <span style={{ flexShrink: 0, fontSize: 9, background: '#f59e0b', color: '#fff', padding: '2px 4px', borderRadius: 4, fontWeight: 800 }}>ADMIN</span>
                            </div>
                            <div style={{ fontSize: 11, color: securityEnabled ? '#34d399' : '#f87171', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: securityEnabled ? '#34d399' : '#f87171' }} />
                                {securityEnabled ? 'Hệ thống an toàn' : 'Hệ thống đang bị đe dọa'}
                            </div>
                        </div>
                    </div>
                    {showAvatarMenu && (
                        <div style={{ position: 'absolute', bottom: '100%', left: 16, right: 16, marginBottom: 8, background: '#1e293b', borderRadius: 8, overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', zIndex: 100 }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', color: '#fff', fontSize: 14, cursor: 'pointer' }} onClick={() => { setShowAvatarMenu(false); alert('Tính năng Hồ sơ đang phát triển'); }}>Hồ sơ cá nhân</div>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', color: '#fff', fontSize: 14, cursor: 'pointer' }} onClick={() => { setShowAvatarMenu(false); navigate('/admin/security'); }}>Bảo mật CyberDef</div>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', color: '#34d399', fontSize: 14, cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/')}>
                                Chuyển sang App Người dùng
                            </div>
                            <div style={{ padding: '12px 16px', color: '#ef4444', fontSize: 14, cursor: 'pointer' }} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userEmail'); navigate('/'); }}>Đăng xuất</div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh', overflow: 'hidden' }}>
                <header style={{ padding: '0 32px', minHeight: 64, background: '#111827', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Trung tâm điều khiển</h2>
                        <div style={{ width: 1, height: 24, background: '#374151' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: securityEnabled ? '#34d399' : '#f87171' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: securityEnabled ? '#34d399' : '#f87171', boxShadow: `0 0 8px ${securityEnabled ? '#34d399' : '#f87171'}` }} />
                                Trạng thái SOC: <span style={{ fontWeight: 600 }}>{securityEnabled ? 'Đã bảo vệ' : 'Cảnh báo'}</span>
                            </div>
                            <button 
                                onClick={() => toggleSecurity(!securityEnabled)}
                                style={{
                                    background: securityEnabled ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                    color: securityEnabled ? '#ef4444' : '#10b981',
                                    border: `1px solid ${securityEnabled ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                    padding: '4px 12px',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {securityEnabled ? '🛑 TẮT BẢO VỆ' : '🛡️ BẬT BẢO VỆ'}
                            </button>
                            <div style={{ color: '#9ca3af' }}>⏱ Quét lần cuối: <span style={{ color: '#fff' }}>2s trước</span></div>
                            <div style={{ color: '#9ca3af' }}>🌍 Khu vực: <span style={{ color: '#fff' }}>Global</span></div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <button onClick={() => navigate('/admin/audit')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: 18, cursor: 'pointer', position: 'relative' }}>
                            🔔
                            <div style={{ position: 'absolute', top: 0, right: -4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid #111827' }} />
                        </button>
                        <button onClick={() => navigate('/admin/settings')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: 18, cursor: 'pointer' }}>⚙️</button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 20, borderLeft: '1px solid #374151', cursor: 'pointer' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>A</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Admin</div>
                        </div>
                    </div>
                </header>
                <main className="pg-main" style={{ marginLeft: 0, padding: '32px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <Routes>
                    <Route path="overview" element={<AdminOverview resetDemo={resetDemo} toggleSecurity={toggleSecurity} securityEnabled={securityEnabled} />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="kyc" element={<AdminKYC />} />
                    <Route path="transactions" element={<AdminTransactions />} />
                    <Route path="risk" element={<AdminRiskMonitoring />} />
                    <Route path="security" element={<AdminSecurity logs={logs} />} />
                    <Route path="audit" element={<AdminAuditLogs />} />
                    <Route path="demo" element={<AdminDemo resetDemo={resetDemo} toggleSecurity={toggleSecurity} securityEnabled={securityEnabled} />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Routes>
                </main>
            </div>
        </div>
    );
}

export default AdminApp;
