import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function RiskPage() {
    const [ip, setIp] = useState('');
    const [analyzed, setAnalyzed] = useState(false);

    const trendData = Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        critical: Math.floor(Math.random() * 20),
        high: Math.floor(Math.random() * 40 + 10),
        medium: Math.floor(Math.random() * 60 + 20),
    }));

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 8 }}>Risk Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Công cụ phân tích chuyên sâu rủi ro của từng IP và tổng thể hệ thống.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* IP Lookup Tool */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>IP Lookup Tool</div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                        <input 
                            type="text" 
                            placeholder="192.168.1.1 or ::1" 
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-default)', padding: '10px 16px', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                        />
                        <button className="btn btn-primary" onClick={() => setAnalyzed(true)}>▶ PHÂN TÍCH</button>
                    </div>

                    {analyzed ? (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-red)', border: '1px solid var(--border-red)', borderRadius: 'var(--radius)', width: 120, height: 120 }}>
                                    <div style={{ fontSize: 11, color: 'var(--color-red)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>Risk Score</div>
                                    <div style={{ fontSize: 48, fontWeight: 'bold', color: 'var(--color-red)' }}>95</div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                                    {[
                                        { label: 'IP Reputation', val: 30, max: 30 },
                                        { label: 'Payload Analysis', val: 35, max: 40 },
                                        { label: 'Velocity', val: 20, max: 20 },
                                        { label: 'Fingerprint', val: 10, max: 10 },
                                    ].map(b => (
                                        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 110, fontSize: 11, color: 'var(--text-secondary)' }}>{b.label}</div>
                                            <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 3 }}>
                                                <div style={{ height: '100%', width: `${(b.val / b.max) * 100}%`, background: 'var(--color-red)', borderRadius: 3 }} />
                                            </div>
                                            <div style={{ width: 30, textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{b.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-hover)', padding: 16, borderRadius: 'var(--radius)' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Recommendation</div>
                                <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--color-red)' }}>BLOCK PERMANENTLY</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius)' }}>
                            Nhập IP để phân tích rủi ro
                        </div>
                    )}
                </div>

                {/* Top Risky IPs */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 20, borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Top Risky IPs (Live)</div>
                        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}>↻ LÀM MỚI</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                        <tbody>
                            {[
                                { ip: '10.0.0.77', score: 95, requests: 47, type: 'Honeypot + SQLi', tenant: 'PayGuard' },
                                { ip: '192.168.1.105', score: 88, requests: 23, type: 'SQL Injection', tenant: 'PayGuard' },
                                { ip: '45.33.32.156', score: 72, requests: 89, type: 'Brute Force', tenant: 'ShopNow' },
                                { ip: '203.0.113.42', score: 91, requests: 12, type: 'SQL Injection', tenant: 'EduPortal' },
                                { ip: '198.51.100.7', score: 61, requests: 34, type: 'Anomaly', tenant: 'ShopNow' },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>#{i + 1}</td>
                                    <td style={{ padding: '14px 0', fontFamily: 'var(--font-mono)' }}>{row.ip}</td>
                                    <td style={{ padding: '14px 0' }}>
                                        <span className={`badge-risk ${row.score >= 90 ? 'critical' : row.score >= 70 ? 'high' : 'medium'}`} style={{ width: 28, height: 28, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{row.score}</span>
                                    </td>
                                    <td style={{ padding: '14px 0', fontSize: 11, color: 'var(--text-muted)' }}>{row.requests} reqs</td>
                                    <td style={{ padding: '14px 0' }}>
                                        <div style={{ fontSize: 11 }}>{row.type}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{row.tenant}</div>
                                    </td>
                                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10, color: 'var(--color-red)' }}>BLOCK</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Attack Heatmap */}
                <div className="card">
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>Attack Heatmap (24h)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(24, 1fr)', gap: 2, fontSize: 10 }}>
                        <div />
                        {Array.from({ length: 24 }).map((_, i) => <div key={i} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{i}</div>)}
                        
                        {['SQLi', 'Brute Force', 'Honeypot', 'Anomaly', 'XSS', 'CSRF', 'Other'].map((type, rowIdx) => (
                            <React.Fragment key={type}>
                                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>{type}</div>
                                {Array.from({ length: 24 }).map((_, colIdx) => {
                                    const intensity = Math.random();
                                    const active = Math.random() > 0.6;
                                    return (
                                        <div key={colIdx} style={{ 
                                            aspectRatio: '1/1', 
                                            background: active ? `rgba(239, 68, 68, ${intensity})` : 'var(--bg-hover)',
                                            borderRadius: 2
                                        }} title={`${type} at ${colIdx}:00`} />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="card">
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>Risk Trend (7 Days)</div>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid var(--border-default)', borderRadius: 6 }} itemStyle={{ fontFamily: 'var(--font-mono)' }} />
                                <Area type="monotone" dataKey="critical" stroke="var(--color-red)" fill="var(--bg-red)" strokeWidth={2} />
                                <Area type="monotone" dataKey="high" stroke="var(--color-orange)" fill="var(--bg-orange)" strokeWidth={2} />
                                <Area type="monotone" dataKey="medium" stroke="var(--color-amber)" fill="var(--bg-amber)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
}
