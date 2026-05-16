import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
    { icon: '⬡', label: 'Tổng quan', path: 'overview' },
    { icon: '◈', label: 'Live Logs', path: 'logs' },
    { icon: '◎', label: 'Threats', path: 'threats' },
    { icon: '◇', label: 'Risk Score', path: 'risk' },
    { icon: '⚡', label: 'Simulate', path: 'simulate' },
    { icon: '⚡', label: 'XSS Demo', path: 'xss' },
    { icon: '⚔', label: 'Visualizer', path: 'visualizer' },
];

export default function Layout({ currentPage, onNavigate, children, liveAlerts = 0 }) {
    const { user, logout } = useAuth();
    const [socketOnline] = useState(true); // replaced by real socket status in parent

    return (
        <div className="app-shell">
            {/* ── Topbar ── */}
            <header className="topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{
                        fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700,
                        letterSpacing: '0.1em', color: 'var(--cyan)',
                    }}>
                        ◈ CYBERDEF
                    </span>
                    <span style={{ color: 'var(--border)', fontSize: 20 }}>│</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                        HỆ THỐNG AI THREAT MONITORING
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {liveAlerts > 0 && (
                        <span className="badge critical">
                            ⚠ {liveAlerts} CẢNH BÁO ĐANG HOẠT ĐỘNG
                        </span>
                    )}
                    <div className="connecting">
                        <div className={`dot ${socketOnline ? 'online' : 'offline'}`} />
                        <span>{socketOnline ? 'TRỰC TUYẾN' : 'NGOẠI TUYẾN'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                            {user?.email || 'admin@cyberdef'}
                        </span>
                        {user?.role === 'admin' && (
                            <span className="badge" style={{ background: 'var(--red)22', color: 'var(--red)', borderColor: 'var(--red)44' }}>
                                👑 ADMIN
                            </span>
                        )}
                        {user?.role === 'viewer' && (
                            <span className="badge" style={{ background: 'var(--text-dim)22', color: 'var(--text-dim)', borderColor: 'var(--text-dim)44' }}>
                                👁 VIEWER
                            </span>
                        )}
                    </div>
                    <button className="btn btn-ghost" onClick={logout} style={{ padding: '5px 12px' }}>
                        ĐĂNG XUẤT
                    </button>
                </div>
            </header>

            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div style={{ padding: '8px 20px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                        ĐIỀU HƯỚNG
                    </div>
                </div>

                {NAV.map(item => (
                    <div
                        key={item.path}
                        className={`nav-item ${currentPage === item.path ? 'active' : ''}`}
                        onClick={() => onNavigate(item.path)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </div>
                ))}

                <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.8 }}>
                        <div>NODE.JS + EXPRESS</div>
                        <div>MONGODB + REDIS</div>
                        <div style={{ color: 'var(--cyan)' }}>● HỆ THỐNG ĐANG HOẠT ĐỘNG</div>
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
