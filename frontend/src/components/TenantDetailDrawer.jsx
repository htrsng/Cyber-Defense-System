import React from 'react';

export default function TenantDetailDrawer({ tenant, onClose }) {
    if (!tenant) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s'
        }} onClick={onClose}>
            <div style={{
                width: 480, background: '#0d1117', borderLeft: '1px solid var(--border-default)',
                height: '100vh', display: 'flex', flexDirection: 'column',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.8)'
            }} onClick={e => e.stopPropagation()}>
                
                <div style={{ padding: 28, borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text-primary)' }}>{tenant.name}</span>
                            <span className={`badge badge-plan ${tenant.plan || 'free'}`}>{tenant.plan || 'FREE'}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>TEN-00{tenant.id || 1} · Active since 01/03/2026</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ padding: 28, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius)', border: '1px solid var(--border-default)' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>API Key (full)</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>
                            <span>{tenant.apiKey || 'cd_live_abc123...xyz789'}</span>
                            <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}>📋 Copy</button>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, marginBottom: 4 }}>Tenant ID</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>ten_{tenant.name?.toLowerCase()}_001</div>
                    </div>

                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 }}>THÁNG NÀY</div>
                        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Requests</span>
                                    <span style={{ fontFamily: 'var(--font-mono)' }}>{tenant.requests?.toLocaleString() || '2,841'} / 100,000</span>
                                </div>
                                <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: '2.8%', background: 'var(--color-cyan)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Threats blocked</div>
                                    <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: 'var(--color-green)', fontWeight: 'bold', marginTop: 4 }}>{tenant.threats || 127}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fraud prevented</div>
                                    <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: 'var(--color-green)', fontWeight: 'bold', marginTop: 4 }}>1.2B ₫</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 }}>5 ATTACKS GẦN NHẤT</div>
                        <div className="card" style={{ padding: '0 16px' }}>
                            {[
                                { type: 'SQL Injection', score: 95, action: 'BLOCKED', color: 'red' },
                                { type: 'Brute Force', score: 72, action: 'TARPIT', color: 'orange' },
                                { type: 'Honeypot', score: 95, action: 'LOG+BAN', color: 'purple' },
                                { type: 'Anomaly', score: 61, action: 'REVIEW', color: 'amber' },
                                { type: 'SQL Injection', score: 88, action: 'BLOCKED', color: 'red' },
                            ].map((atk, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 100px 40px 1fr', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>17:42:{12+i}</span>
                                    <span className={`badge-attack ${atk.color === 'red' ? 'sqli' : atk.color === 'orange' ? 'brute_force' : atk.color === 'purple' ? 'honeypot' : 'anomaly'}`} style={{ fontSize: 9 }}>{atk.type}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: `var(--color-${atk.color})` }}>{atk.score}</span>
                                    <span style={{ fontSize: 10, textAlign: 'right', color: atk.action === 'BLOCKED' ? 'var(--color-red)' : 'var(--text-secondary)' }}>{atk.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: 16, paddingTop: 24 }}>
                        <button className="btn btn-ghost" style={{ flex: 1 }}>Xem toàn bộ logs →</button>
                        <button className="btn btn-danger" style={{ flex: 1, background: 'var(--bg-red)' }}>Suspend tenant</button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
