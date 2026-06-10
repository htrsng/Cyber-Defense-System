import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

function genDetectedVsBlocked() {
    return Array.from({ length: 24 }, (_, i) => {
        const detected = Math.floor(Math.random() * 40 + 10);
        return { hour: `${String(i).padStart(2, '0')}:00`, detected, blocked: detected - (Math.random() > 0.8 ? 1 : 0), success: Math.random() > 0.8 ? 1 : 0 };
    });
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0d1117', border: '1px solid var(--border-default)', borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize' }}>{p.name}</span>
                    <span>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function OverviewPage() {
    const [timeData] = useState(genDetectedVsBlocked);

    return (
        <div style={{ display: 'grid', gap: 24, paddingBottom: 40, maxWidth: 1400, margin: '0 auto' }}>
            
            {/* ZONE 1: Status Banner */}
            <div style={{ background: '#0d1520', borderLeft: '3px solid var(--color-green)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: 22, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="dot-pulse" style={{ width: 12, height: 12 }} />
                        All Systems Operational
                    </h2>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                        3 Active Tenants · 127 Attacks Blocked Today · 0 Successful Critical Breaches
                    </div>
                </div>
                <div className="badge badge-status passed" style={{ color: 'var(--color-green)', borderColor: 'var(--border-green)', background: 'var(--bg-green)', padding: '6px 12px' }}>
                    ● LIVE
                </div>
            </div>

            {/* ZONE 2: Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <div className="card">
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Active Tenants</div>
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--color-cyan)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>3</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Protected Apps</div>
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--color-cyan)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>3</div>
                </div>
                <div className="card" style={{ borderColor: 'var(--border-green)', background: 'var(--bg-card)' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Threats Blocked</div>
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--color-green)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>127</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Security Coverage</div>
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--color-cyan)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>96%</div>
                </div>
            </div>

            {/* ZONE 3: 60/40 Chart vs Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: 24 }}>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Attacks Detected vs Blocked</div>
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-green)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--color-green)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                                <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="blocked" stroke="var(--color-green)" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" activeDot={{ r: 6, fill: 'var(--color-green)' }} />
                                <Area type="monotone" dataKey="success" stroke="var(--color-red)" strokeWidth={2} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 24 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Protected Customers</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { name: 'PayGuard', plan: 'pro', score: 96, blocked: 127 },
                                { name: 'ShopNow', plan: 'enterprise', score: 91, blocked: 43 },
                                { name: 'EduPortal', plan: 'free', score: 78, blocked: 9 }
                            ].map((t, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 6 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{ fontWeight: 'bold', fontSize: 13 }}>{t.name}</span>
                                            <span className={`badge badge-plan ${t.plan}`}>{t.plan}</span>
                                        </div>
                                        <div style={{ height: 4, width: 60, background: 'var(--bg-card)', borderRadius: 2 }}>
                                            <div style={{ height: '100%', width: `${t.score}%`, background: t.score > 90 ? 'var(--color-green)' : 'var(--color-amber)', borderRadius: 2 }} />
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-green)' }}>{t.blocked}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>BLOCKED</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Rule Trigger Statistics</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { rule: 'SQLi Protection', count: 127, color: 'var(--color-red)' },
                                { rule: 'Brute Force Defense', count: 82, color: 'var(--color-orange)' },
                                { rule: 'Critical Alert', count: 12, color: 'var(--color-amber)' },
                                { rule: 'Honeypot Trap', count: 5, color: 'var(--color-purple)' },
                            ].map((r, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{r.rule}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)' }}>{r.count}</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3 }}>
                                        <div style={{ height: '100%', width: `${Math.min((r.count / 150) * 100, 100)}%`, background: r.color, borderRadius: 3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ZONE 4: Bottom 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 20, borderBottom: '1px solid var(--border-default)', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Top Risk IPs</div>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
                        <tbody>
                            {[
                                { ip: '10.0.0.77', flag: '🇺🇸', score: 95, reqs: 841, action: 'BLOCK' },
                                { ip: '45.33.32.156', flag: '🇬🇧', score: 88, reqs: 622, action: 'BLOCK' },
                                { ip: '192.168.1.105', flag: '🇻🇳', score: 72, reqs: 419, action: 'TARPIT' },
                                { ip: '203.0.113.42', flag: '🇸🇬', score: 61, reqs: 102, action: 'REVIEW' },
                                { ip: '198.51.100.7', flag: '🇩🇪', score: 45, reqs: 56, action: 'SAFE' },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                                    <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)' }}>{row.ip} {row.flag}</td>
                                    <td style={{ padding: '12px 20px' }}>
                                        <div className={`badge-risk ${row.score >= 90 ? 'critical' : row.score >= 70 ? 'high' : row.score >= 50 ? 'medium' : 'low'}`} style={{ width: 28, height: 28, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {row.score}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{row.reqs}</td>
                                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10 }}>{row.action}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 20, borderBottom: '1px solid var(--border-default)', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Recent Security Events</div>
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { time: '17:53:42', type: 'SQL_INJECTION', ip: '10.0.0.77', score: 95, status: 'BLOCKED' },
                            { time: '17:51:19', type: 'BRUTE_FORCE', ip: '45.33.32.156', score: 88, status: 'TARPIT' },
                            { time: '17:42:05', type: 'HONEYPOT', ip: '192.168.1.105', score: 72, status: 'BLOCKED' },
                            { time: '17:30:00', type: 'ANOMALY', ip: '203.0.113.42', score: 61, status: 'REVIEW' },
                            { time: '17:15:22', type: 'SQL_INJECTION', ip: '10.0.0.77', score: 95, status: 'BLOCKED' },
                        ].map((e, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 100px 1fr 30px 60px', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{e.time}</span>
                                <span className={`badge-attack ${e.type.toLowerCase()}`} style={{ fontSize: 9 }}>{e.type.replace('_', ' ')}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{e.ip}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: e.score >= 90 ? 'var(--color-red)' : 'var(--color-orange)', fontWeight: 'bold' }}>{e.score}</span>
                                <span style={{ fontSize: 10, textAlign: 'right', color: e.status === 'BLOCKED' ? 'var(--color-red)' : 'var(--text-muted)' }}>{e.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
