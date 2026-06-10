import { useState, useEffect } from 'react';
import { tenantsAPI } from '../services/api';
import TenantDetailDrawer from '../components/TenantDetailDrawer';

const FALLBACK_TENANTS = [
    { id: '1', domain: 'payguard.localhost:4000', name: 'PayGuard', plan: 'pro', score: 96, threats: 127, requests: 2841, apiKey: 'cd_live_a8b9...8f2a', status: 'active' },
    { id: '2', domain: 'shopnow.localhost:4001', name: 'ShopNow', plan: 'enterprise', score: 91, threats: 43, requests: 1205, apiKey: 'cd_live_k9m2...3c91', status: 'active' },
    { id: '3', domain: 'eduportal.localhost:4002', name: 'EduPortal', plan: 'free', score: 78, threats: 9, requests: 312, apiKey: 'cd_test_p4q1...7d44', status: 'trial' },
];

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTenant, setSelectedTenant] = useState(null);

    useEffect(() => {
        tenantsAPI.getAll()
            .then(res => {
                const apiData = res.data.map((t, i) => ({
                    ...t,
                    name: t.name || t.domain.split('.')[0].toUpperCase(),
                    threats: [127, 43, 9][i] || 0,
                    requests: [2841, 1205, 312][i] || 0,
                    score: [96, 91, 78][i] || 80,
                    status: i === 2 ? 'trial' : 'active'
                }));
                setTenants(apiData.length > 0 ? apiData : FALLBACK_TENANTS);
            })
            .catch(() => setTenants(FALLBACK_TENANTS))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content" style={{ color: 'var(--text-muted)' }}>Loading tenants...</div>;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>Platform / Tenant Management</div>
                    <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 8 }}>Quản lý khách hàng (Tenants)</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Danh sách các domain tích hợp CyberDef SaaS.</p>
                </div>
                <button className="btn" style={{ background: 'var(--bg-cyan)', border: '1px solid var(--border-cyan)', color: 'var(--color-cyan)', textTransform: 'uppercase' }}>
                    ＋ Thêm tenant mới
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Tenants</div>
                    <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-cyan)', marginTop: 8 }}>{tenants.length}</div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Threats Blocked</div>
                    <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-green)', marginTop: 8 }}>127</div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Avg Security Score</div>
                    <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: 8 }}>94%</div>
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Monthly Revenue</div>
                    <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-amber)', marginTop: 8 }}>$18 MRR</div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px 20px', fontWeight: 'normal', textTransform: 'uppercase', fontSize: 11 }}>Tenant</th>
                            <th style={{ padding: '12px 20px', fontWeight: 'normal', textTransform: 'uppercase', fontSize: 11 }}>Plan</th>
                            <th style={{ padding: '12px 20px', fontWeight: 'normal', textTransform: 'uppercase', fontSize: 11 }}>API Key</th>
                            <th style={{ padding: '12px 20px', fontWeight: 'normal', textTransform: 'uppercase', fontSize: 11 }}>Score</th>
                            <th style={{ padding: '12px 20px', fontWeight: 'normal', textTransform: 'uppercase', fontSize: 11 }}>Threats</th>
                            <th style={{ padding: '12px 20px', fontWeight: 'normal', textTransform: 'uppercase', fontSize: 11 }}>Req/hôm nay</th>
                            <th style={{ padding: '12px 20px', fontWeight: 'normal', textTransform: 'uppercase', fontSize: 11 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((t, i) => (
                            <tr key={t.id || i} style={{ borderTop: '1px solid var(--border-default)', cursor: 'pointer', transition: '0.15s' }} className="hover:bg-hover" onClick={() => setSelectedTenant(t)}>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className={`dot-pulse`} style={{ animation: t.status === 'active' ? 'pulse-green 2s infinite' : 'none', background: t.status === 'active' ? 'var(--color-green)' : 'var(--color-amber)', boxShadow: t.status === 'active' ? '0 0 8px var(--color-green)' : 'none' }} />
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 14 }}>{t.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>TEN-00{i+1} · {t.domain}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span className={`badge badge-plan ${t.plan || 'free'}`}>{t.plan || 'FREE'}</span>
                                </td>
                                <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                    {t.apiKey ? t.apiKey.substring(0, 12) + '...' + t.apiKey.slice(-4) : 'cd_live_***...8f2a'}
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ color: t.score >= 90 ? 'var(--color-green)' : 'var(--color-amber)', fontWeight: 'bold', marginBottom: 4 }}>{t.score}%</div>
                                    <div style={{ height: 4, width: 60, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${t.score}%`, background: t.score >= 90 ? 'var(--color-green)' : 'var(--color-amber)' }} />
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)' }}>{t.threats}</td>
                                <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)' }}>{t.requests.toLocaleString()}</td>
                                <td style={{ padding: '16px 20px' }} onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button style={{ width: 28, height: 28, background: 'var(--bg-hover)', border: 'none', borderRadius: 4, color: 'var(--text-secondary)', cursor: 'pointer' }}>⚙</button>
                                        <button style={{ width: 28, height: 28, background: 'var(--bg-hover)', border: 'none', borderRadius: 4, color: 'var(--text-secondary)', cursor: 'pointer' }}>↗</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedTenant && <TenantDetailDrawer tenant={selectedTenant} onClose={() => setSelectedTenant(null)} />}
        </div>
    );
}
