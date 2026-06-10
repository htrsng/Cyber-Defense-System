import { useEffect, useState } from 'react';

const NAV_PLATFORM = [
    { icon: '⬡', label: 'Dashboard', path: 'overview' },
    { icon: '👥', label: 'Tenants', path: 'tenants' },
    { icon: '🔌', label: 'Integration', path: 'integration' },
    { icon: '💰', label: 'Subscription', path: 'pricing' },
];

const NAV_SECURITY = [
    { icon: '◈', label: 'Live Logs', path: 'logs' },
    { icon: '◎', label: 'Threats', path: 'threats' },
    { icon: '◇', label: 'Risk Analytics', path: 'risk' },
    { icon: '🛡️', label: 'Security Policies', path: 'rules' },
    { icon: '📈', label: 'Fraud Engine', path: 'fraud' },
];

const NAV_REPORTING = [
    { icon: '◉', label: 'Alerts', path: 'notifications' },
    { icon: '◈', label: 'Reports', path: 'reports' },
];

const NAV_DEMO = [
    { icon: '⚡', label: 'Simulator', path: 'attacker' },
];

export default function Layout({ currentPage, onNavigate, children }) {
    const [time, setTime] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('vi-VN', { hour12: false }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const renderNavItems = (items) => (
        items.map(item => (
            <div
                key={item.path}
                className={`sidebar-item ${currentPage === item.path ? 'sidebar-item--active' : ''}`}
                onClick={() => onNavigate(item.path)}
            >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
            </div>
        ))
    );

    return (
        <div className="app-shell">
            <header className="topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                        ◈ CYBERDEF <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>SaaS Platform</span>
                    </span>
                    <span style={{ color: 'var(--border-emphasis)', fontSize: 20 }}>│</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-green)', letterSpacing: '0.08em', fontWeight: 600 }}>
                        ● PROTECTING 3 ACTIVE TENANTS
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 'bold', color: 'var(--color-amber)', background: 'var(--bg-amber)', padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-amber)' }}>
                        $18 MRR
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-green)' }}>
                        <div className="dot-pulse" /> TRỰC TUYẾN
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        [{time}]
                    </div>

                    <span style={{ color: 'var(--border-emphasis)', fontSize: 20 }}>│</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>admin@cyberdef.io</span>
                        <span className="badge badge-plan enterprise">👑 ADMIN</span>
                        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => {
                            localStorage.removeItem('token');
                            window.location.reload();
                        }}>ĐĂNG XUẤT</button>
                    </div>
                </div>
            </header>

            <aside className="sidebar">
                <div className="sidebar-group-label">PLATFORM</div>
                {renderNavItems(NAV_PLATFORM)}

                <div className="sidebar-group-label">SECURITY</div>
                {renderNavItems(NAV_SECURITY)}

                <div className="sidebar-group-label">REPORTING</div>
                {renderNavItems(NAV_REPORTING)}

                <div className="sidebar-group-label">DEMO LAB</div>
                {renderNavItems(NAV_DEMO)}
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
