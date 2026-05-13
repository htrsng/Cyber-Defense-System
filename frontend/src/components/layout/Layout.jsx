import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
    { icon: '⬡', label: 'Overview', path: 'overview' },
    { icon: '◈', label: 'Live Logs', path: 'logs' },
    { icon: '◎', label: 'Threats', path: 'threats' },
    { icon: '◇', label: 'Risk Scores', path: 'risk' },
    { icon: '⚡', label: 'Simulate', path: 'simulate' },
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
                        AI THREAT MONITORING SYSTEM
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {liveAlerts > 0 && (
                        <span className="badge critical">
                            ⚠ {liveAlerts} ACTIVE ALERT{liveAlerts > 1 ? 'S' : ''}
                        </span>
                    )}
                    <div className="connecting">
                        <div className={`dot ${socketOnline ? 'online' : 'offline'}`} />
                        <span>{socketOnline ? 'LIVE' : 'OFFLINE'}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                        {user?.email || 'admin@cyberdef'}
                    </span>
                    <button className="btn btn-ghost" onClick={logout} style={{ padding: '5px 12px' }}>
                        LOGOUT
                    </button>
                </div>
            </header>

            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div style={{ padding: '8px 20px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                        NAVIGATION
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
                        <div style={{ color: 'var(--cyan)' }}>● SYSTEM OPERATIONAL</div>
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
