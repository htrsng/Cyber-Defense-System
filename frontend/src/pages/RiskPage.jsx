import { useState } from 'react';
import { riskAPI } from '../services/api';

function riskColor(score) {
    if (score >= 80) return 'var(--red)';
    if (score >= 60) return 'var(--orange)';
    if (score >= 35) return 'var(--amber)';
    if (score >= 15) return 'var(--cyan)';
    return 'var(--green)';
}

function RiskGauge({ score }) {
    const color = riskColor(score);
    const pct = score;
    // SVG arc
    const r = 54, cx = 64, cy = 64;
    const arc = (pct / 100) * Math.PI;
    const x = cx + r * Math.cos(Math.PI - arc);
    const y = cy - r * Math.sin(arc);
    const largeArc = pct > 50 ? 1 : 0;

    return (
        <svg viewBox="0 0 128 80" width="200" style={{ display: 'block', margin: '0 auto' }}>
            {/* Track */}
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" />
            {/* Fill */}
            {score > 0 && (
                <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`}
                    fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
            )}
            {/* Score text */}
            <text x={cx} y={cy - 6} textAnchor="middle"
                fill={color} fontSize="22" fontFamily="var(--font-head)" fontWeight="700">{score}</text>
            <text x={cx} y={cy + 8} textAnchor="middle"
                fill="var(--text-dim)" fontSize="9" fontFamily="var(--font-mono)">/100</text>
        </svg>
    );
}

export default function RiskPage({ topIPs }) {
    const [ip, setIp] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const lookup = async () => {
        if (!ip.trim()) return;
        setLoading(true); setError(''); setResult(null);
        try {
            const { data } = await riskAPI.getByIP(ip.trim());
            setResult(data);
        } catch {
            setError('Could not fetch risk score — is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="section-title">◇ RISK SCORE ANALYZER</div>

            {/* IP Lookup */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">Lookup IP Address</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        type="text"
                        placeholder="192.168.1.1 or ::1"
                        value={ip}
                        onChange={e => setIp(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && lookup()}
                        style={{
                            flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '8px 14px',
                            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                            fontSize: 13, outline: 'none',
                        }}
                    />
                    <button className="btn btn-primary" onClick={lookup} disabled={loading}>
                        {loading ? 'ANALYZING...' : '▶ ANALYZE'}
                    </button>
                </div>
                {error && <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 10 }}>{error}</div>}

                {/* Result */}
                {result && (
                    <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'center' }}>
                        <div>
                            <RiskGauge score={result.score} />
                            <div style={{ textAlign: 'center', marginTop: 6 }}>
                                <span className={`badge ${result.level}`}>{result.level?.toUpperCase()}</span>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                                {result.summary}
                            </div>
                            {result.reasons?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 4 }}>
                                        TRIGGERED RULES
                                    </div>
                                    {result.reasons.map((r, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            fontFamily: 'var(--font-mono)', fontSize: 12,
                                            padding: '6px 10px', borderRadius: 4,
                                            background: 'var(--bg-base)', border: '1px solid var(--border)',
                                        }}>
                                            <span style={{ color: 'var(--red)' }}>▸</span>
                                            <span>{r}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>
                                    ✓ No suspicious rules triggered
                                </div>
                            )}
                            {result.signals && (
                                <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    {Object.entries(result.signals).map(([k, v]) => (
                                        <div key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                                            <div style={{ color: 'var(--text-dim)', marginBottom: 2 }}>{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                                            <div style={{ color: 'var(--cyan)' }}>{v}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Top risky IPs table */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Top Risky IPs (Live)</span>
                    <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => riskAPI.getTopIPs().then(r => { }).catch(() => { })}>
                        ↻ REFRESH
                    </button>
                </div>
                {topIPs.length === 0 ? (
                    <div className="empty-state">No high-risk IPs in the last hour</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        <thead>
                            <tr style={{ color: 'var(--text-dim)', fontSize: 10, letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>
                                {['RANK', 'IP ADDRESS', 'SCORE', 'LEVEL', 'TOP REASON'].map(h => (
                                    <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topIPs.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>#{i + 1}</td>
                                    <td style={{ padding: '8px 12px' }}><span className="ip-tag">{item.ip}</span></td>
                                    <td style={{ padding: '8px 12px', color: riskColor(item.score), fontWeight: 700, fontSize: 14 }}>{item.score}</td>
                                    <td style={{ padding: '8px 12px' }}><span className={`badge ${item.level}`}>{item.level}</span></td>
                                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.reasons?.[0] || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
