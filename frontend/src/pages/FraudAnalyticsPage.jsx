import { useState } from 'react';

export default function FraudAnalyticsPage() {
    const [fraudData] = useState({
        prevented: '1.2B ₫',
        flagged: 14,
        falsePositive: '2.1%'
    });

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>Platform / Fraud Analytics</div>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 8 }}>Gian lận & Thiệt hại (Fraud Analytics)</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Phân tích lượng tài sản được bảo vệ nhờ việc ngăn chặn kịp thời các cuộc tấn công.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ padding: 24, border: '1px solid var(--border-green)', background: 'var(--bg-card)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Fraud Prevented</div>
                    <div style={{ fontSize: 36, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-green)', marginTop: 8 }}>{fraudData.prevented}</div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Transactions Flagged</div>
                    <div style={{ fontSize: 36, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-amber)', marginTop: 8 }}>{fraudData.flagged}</div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>False Positive Rate</div>
                    <div style={{ fontSize: 36, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-green)', marginTop: 8 }}>{fraudData.falsePositive}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>Phân bố rủi ro (Risk Distribution)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[
                            { label: 'Safe (0-30)', percent: 68, color: 'var(--color-green)' },
                            { label: 'Low (31-50)', percent: 18, color: 'var(--color-cyan)' },
                            { label: 'Medium (51-70)', percent: 8, color: 'var(--color-amber)' },
                            { label: 'High (71-90)', percent: 4, color: 'var(--color-orange)' },
                            { label: 'Critical (91-100)', percent: 2, color: 'var(--color-red)' },
                        ].map(bar => (
                            <div key={bar.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{bar.label}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)' }}>{bar.percent}%</span>
                                </div>
                                <div style={{ height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${bar.percent}%`, background: bar.color, borderRadius: 4, transition: 'width 1s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: 20, borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Transaction Monitoring</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Nguồn: PayGuard (TEN-001)</div>
                        </div>
                        <a href="http://localhost:4000" target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>
                            Xem PayGuard Dashboard ↗
                        </a>
                    </div>
                    
                    <div style={{ padding: 16, background: 'rgba(52,211,153,0.05)', borderBottom: '1px solid var(--border-default)', fontSize: 12, color: 'var(--text-secondary)' }}>
                        Dữ liệu giao dịch được CyberDef phân tích risk score real-time mỗi khi PayGuard xử lý thanh toán qua middleware tích hợp.
                    </div>

                    <div style={{ overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                            <tbody>
                                {[
                                    { id: 'TX001', amount: '850,000 ₫', desc: 'Chuyển khoản bất thường 3AM', score: 95, status: 'BLOCKED' },
                                    { id: 'TX002', amount: '200,000 ₫', desc: 'New device + Foreign IP', score: 67, status: 'REVIEW' },
                                    { id: 'TX003', amount: '50,000 ₫', desc: 'Regular payment pattern', score: 12, status: 'SAFE' },
                                    { id: 'TX004', amount: '150,000 ₫', desc: 'Known merchant, normal hours', score: 8, status: 'SAFE' },
                                    { id: 'TX005', amount: '2,000,000 ₫', desc: 'Velocity abuse 12 txn/min', score: 98, status: 'BLOCKED' },
                                ].map((tx, i) => {
                                    const scoreColor = tx.score >= 90 ? 'var(--color-red)' : tx.score >= 50 ? 'var(--color-amber)' : 'var(--color-green)';
                                    return (
                                        <tr key={i} style={{ borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none', borderLeft: `3px solid ${scoreColor}` }}>
                                            <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>{tx.id}</td>
                                            <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{tx.amount}</td>
                                            <td style={{ padding: '14px 20px', color: 'var(--text-primary)' }}>{tx.desc}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <div className={`badge-risk ${tx.score >= 90 ? 'critical' : tx.score >= 50 ? 'medium' : 'safe'}`} style={{ width: 30, height: 30, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {tx.score}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                                <span className={`badge-status ${tx.status.toLowerCase()}`} style={{ fontSize: 10 }}>{tx.status}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>Attack Impact Timeline</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 40, top: 0, bottom: 0, width: 2, background: 'var(--border-default)' }} />
                    {[
                        { time: '17:53:42', type: 'SQL Injection', loss: '1,000,000,000 ₫', blocked: true },
                        { time: '16:15:00', type: 'Brute Force / Account Takeover', loss: '150,000 ₫', blocked: true },
                        { time: '14:20:44', type: 'API Rate Limit Abuse', loss: '0 ₫ (System downtime risk)', blocked: true },
                        { time: '09:05:12', type: 'XSS Attack', loss: 'Tài khoản User', blocked: false }, // Mô phỏng lúc chưa bật CyberDef
                        { time: '03:12:05', type: 'Fraudulent Transfer', loss: '850,000 ₫', blocked: true },
                    ].map((evt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '16px 0', position: 'relative' }}>
                            <div style={{ width: 80, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', paddingTop: 2 }}>
                                {evt.time}
                            </div>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: evt.blocked ? 'var(--color-green)' : 'var(--color-red)', marginTop: 4, zIndex: 1, marginLeft: -35, border: '2px solid var(--bg-card)' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 4 }}>{evt.type}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Thiệt hại tiềm năng: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{evt.loss}</span></div>
                            </div>
                            <div>
                                {evt.blocked ? (
                                    <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-green)', background: 'var(--bg-green)', padding: '4px 8px', borderRadius: 4 }}>✓ BLOCKED BY CYBERDEF</span>
                                ) : (
                                    <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-red)', background: 'var(--bg-red)', padding: '4px 8px', borderRadius: 4 }}>✗ SUCCESSFUL (UNPROTECTED)</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
