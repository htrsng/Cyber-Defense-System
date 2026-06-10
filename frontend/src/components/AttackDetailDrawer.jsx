import React from 'react';

export default function AttackDetailDrawer({ attack, onClose }) {
    if (!attack) return null;

    const alertIP = attack.ipAddress || attack.ip || attack.data?.ipAddress || 'Unknown IP';
    const isBlocked = attack.severity === 'critical' || attack.type === 'HONEYPOT_TRIGGERED' || attack.type === 'SQLI_DETECTED';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s'
        }} onClick={onClose}>
            <div style={{
                width: 450, background: 'var(--bg-panel)', borderLeft: `1px solid ${isBlocked ? 'var(--green)' : 'var(--red)'}`,
                height: '100vh', display: 'flex', flexDirection: 'column',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>
                
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1 }}>ATTACK DETAIL</div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--text-primary)', marginTop: 4 }}>
                            {attack.id || `ATK-${new Date(attack.timestamp || Date.now()).toISOString().split('T')[0].replace(/-/g, '')}-001`}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Risk Score</div>
                        <div style={{ fontSize: 64, fontWeight: '900', color: attack.riskScore >= 80 ? 'var(--red)' : 'var(--amber)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginTop: 8 }}>
                            {attack.riskScore || 95}
                        </div>
                    </div>

                    <div className="card" style={{ padding: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 16, color: 'var(--text-primary)' }}>Risk Breakdown</div>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {[
                                { name: 'IP Reputation', score: 30, max: 30, color: 'var(--red)' },
                                { name: 'SQLi Payload', score: 35, max: 40, color: 'var(--red)' },
                                { name: 'Velocity', score: 20, max: 20, color: 'var(--amber)' },
                                { name: 'Fingerprint', score: 10, max: 10, color: 'var(--cyan)' },
                            ].map(f => (
                                <div key={f.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)' }}>{f.score}/{f.max}</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(f.score / f.max) * 100}%`, background: f.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="card" style={{ padding: 16, background: isBlocked ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', borderColor: isBlocked ? 'var(--green)' : 'var(--red)' }}>
                            <div style={{ fontSize: 11, color: isBlocked ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase', fontWeight: 'bold' }}>Action Taken</div>
                            <div style={{ fontSize: 18, fontWeight: 'bold', color: isBlocked ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
                                {isBlocked ? 'BLOCKED' : 'ALLOWED'}
                            </div>
                        </div>
                        <div className="card" style={{ padding: 16 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Rule Triggered</div>
                            <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--amber)', marginTop: 8 }}>
                                {attack.type === 'SQLI_DETECTED' ? 'SQLI > 70' : 'RISK > 80'}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Source IP</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)' }}>{alertIP}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 12, marginBottom: 8 }}>Target Endpoint</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan)' }}>{attack.description || 'API Authentication'}</div>
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
