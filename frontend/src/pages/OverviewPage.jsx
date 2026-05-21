import { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { riskAPI } from '../services/api';

// ─── Mock data generators (replaced by real API in prod) ─────────────────────
function genTimeSeriesData() {
    return Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        events: Math.floor(Math.random() * 40 + 5),
        threats: Math.floor(Math.random() * 10),
        blocked: Math.floor(Math.random() * 6),
    }));
}

const SEVERITY_COLORS = {
    critical: '#ff3d5a',
    high: '#ff7a1a',
    medium: '#ffb300',
    low: '#00d4ff',
    info: '#2d4a66',
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12,
        }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                    <span>{p.name.toUpperCase()}</span>
                    <span>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function OverviewPage({ liveAlerts, recentLogs }) {
    const [timeData] = useState(genTimeSeriesData);
    const [topIPs, setTopIPs] = useState([]);
    const [stats, setStats] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportRange, setExportRange] = useState(24);

    useEffect(() => {
        riskAPI.getTopIPs().then(r => setTopIPs(r.data.top || [])).catch(() => { });
        riskAPI.getStats().then(r => setStats(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        if (liveAlerts.length > 0) {
            // Re-fetch top IPs whenever a new alert comes in
            riskAPI.getTopIPs()
                .then(r => setTopIPs(r.data.top || []))
                .catch(() => { });
            // Re-fetch stats
            riskAPI.getStats()
                .then(r => setStats(r.data))
                .catch(() => { });
        }
    }, [liveAlerts.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            riskAPI.getStats()
                .then(r => setStats(r.data))
                .catch(() => { });
            riskAPI.getTopIPs()
                .then(r => setTopIPs(r.data.top || []))
                .catch(() => { });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    async function handleExportPDF() {
        setExportLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/reports/security?hours=${exportRange}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (!response.ok) throw new Error('Failed to generate report');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cyberdef-report-${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExportLoading(false);
        }
    }

    const severityCounts = recentLogs.reduce((acc, log) => {
        const key = (log.severity || 'info').toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0, info: 0 });

    const severityTotal = Math.max(1, recentLogs.length);
    const sevDist = [
        { name: 'Critical', value: Math.round((severityCounts.critical / severityTotal) * 100), color: SEVERITY_COLORS.critical },
        { name: 'High', value: Math.round((severityCounts.high / severityTotal) * 100), color: SEVERITY_COLORS.high },
        { name: 'Medium', value: Math.round((severityCounts.medium / severityTotal) * 100), color: SEVERITY_COLORS.medium },
        { name: 'Low', value: Math.round((severityCounts.low / severityTotal) * 100), color: SEVERITY_COLORS.low },
        { name: 'Info', value: Math.round((severityCounts.info / severityTotal) * 100), color: SEVERITY_COLORS.info },
    ];

    const totalEvents = stats?.last24h?.totalEvents ?? recentLogs.length;
    const criticalEvents = stats?.last24h?.criticalEvents ?? severityCounts.critical;
    const unresolvedEvents = stats?.unresolvedThreats ?? 0;
    const monitoredIps = topIPs.length;

    function riskColor(score) {
        if (score >= 80) return 'var(--red)';
        if (score >= 60) return 'var(--orange)';
        if (score >= 35) return 'var(--amber)';
        if (score >= 15) return 'var(--cyan)';
        return 'var(--green)';
    }

    const ALERT_LABELS = {
        BRUTE_FORCE_DETECTED: '⚡ BRUTE FORCE DETECTED',
        SQLI_DETECTED: '💉 SQL INJECTION DETECTED',
        HONEYPOT_TRIGGERED: '🍯 HONEYPOT TRIGGERED',
        SCANNING_DETECTED: '🔍 SCANNING DETECTED',
    };

    const ALERT_SEVERITY = {
        BRUTE_FORCE_DETECTED: 'high',
        SQLI_DETECTED: 'high',
        HONEYPOT_TRIGGERED: 'critical',
        SCANNING_DETECTED: 'medium',
    };

    // Deduplicate: keep only one alert per attack type family.
    const uniqueAlerts = liveAlerts.reduce((acc, alert) => {
        const key = alert.type?.split('_').slice(0, 2).join('_');
        if (!acc.find(a => a.type?.split('_').slice(0, 2).join('_') === key)) acc.push(alert);
        return acc;
    }, []).slice(0, 4);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="section-title" style={{ marginBottom: 0, flex: 1 }}>
                    ◈ THREAT OVERVIEW
                </div>

                <select
                    value={exportRange}
                    onChange={e => setExportRange(Number(e.target.value))}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', padding: '6px 10px',
                        color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                        fontSize: 12, outline: 'none',
                    }}
                >
                    <option value={24}>Last 24h</option>
                    <option value={48}>Last 48h</option>
                    <option value={168}>Last 7 days</option>
                </select>

                <button
                    className="btn btn-primary"
                    onClick={handleExportPDF}
                    disabled={exportLoading}
                    style={{ gap: 6 }}
                >
                    {exportLoading ? '⟳ GENERATING...' : '↓ EXPORT PDF'}
                </button>
            </div>

            {/* ── Live alerts ── */}
            {uniqueAlerts.map((alert, i) => {
                const alertIP = alert.ipAddress || alert.ip || alert.data?.ipAddress || 'Unknown IP';
                return (
                    <div key={i} className={`alert-banner ${ALERT_SEVERITY[alert.type] || alert.severity}`}>
                        <span style={{ flexShrink: 0 }}>⚠</span>
                        <div>
                            <strong>{ALERT_LABELS[alert.type] || alert.type?.replace(/_/g, ' ')}</strong>
                            {' — '}
                            <span className="ip-tag">{alertIP}</span>
                            {' '}
                            Risk Score: <strong>{alert.riskScore}</strong>
                            {alert.description && <span style={{ opacity: 0.8 }}> — {alert.description}</span>}
                        </div>
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.6, flexShrink: 0 }}>
                            {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                );
            })}

            {/* ── Stat tiles ── */}
            <div className="stat-grid">
                <div className="stat-tile cyan">
                    <div className="stat-label">Tổng số Events (24h)</div>
                    <div className="stat-value">{totalEvents}</div>
                    <div className="stat-sub">Dữ liệu đồng bộ từ backend và live feed</div>
                </div>
                <div className="stat-tile red">
                    <div className="stat-label">Critical Threats</div>
                    <div className="stat-value">{criticalEvents}</div>
                    <div className="stat-sub">Theo tổng hợp 24h gần nhất</div>
                </div>
                <div className="stat-tile amber">
                    <div className="stat-label">Unresolved Events</div>
                    <div className="stat-value">{unresolvedEvents}</div>
                    <div className="stat-sub">Chờ review hoặc xử lý thủ công</div>
                </div>
                <div className="stat-tile green">
                    <div className="stat-label">IPs Monitored</div>
                    <div className="stat-value">{monitoredIps}</div>
                    <div className="stat-sub">Hoạt động trong 1 giờ gần nhất</div>
                </div>
            </div>

            {/* ── Charts grid ── */}
            <div className="dashboard-grid">

                {/* Event timeline */}
                <div className="card span-2">
                    <div className="card-header">
                        <span className="card-title">Event Timeline — 24 giờ gần nhất</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={timeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gEvents" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gThreats" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff3d5a" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#ff3d5a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="hour" tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} interval={3} />
                            <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="events" stroke="#00d4ff" fill="url(#gEvents)" strokeWidth={1.5} name="events" />
                            <Area type="monotone" dataKey="threats" stroke="#ff3d5a" fill="url(#gThreats)" strokeWidth={1.5} name="threats" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Severity distribution */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Severity Distribution</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 130, height: 130 }}>
                            <PieChart width={130} height={130}>
                                <Pie data={sevDist} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                                    dataKey="value" strokeWidth={0} paddingAngle={2}>
                                    {sevDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                            </PieChart>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {sevDist.map(s => (
                                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>{s.name}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: s.color }}>{s.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top risky IPs */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Top Risk IPs</span>
                    </div>
                    {topIPs.length === 0 ? (
                        <div className="empty-state">Chưa có IP nào nổi bật trong 1 giờ gần nhất. Hệ thống sẽ tự cập nhật khi có traffic mới.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {topIPs.slice(0, 8).map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="risk-circle" style={{ color: riskColor(item.score), width: 44, height: 44, fontSize: 13 }}>
                                        {item.score}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="ip-tag" style={{ marginBottom: 4 }}>{item.ip}</div>
                                        <div className="risk-bar">
                                            <div className="risk-bar-fill"
                                                style={{ width: `${item.score}%`, background: riskColor(item.score) }} />
                                        </div>
                                    </div>
                                    <span className={`badge ${item.level}`}>{item.level}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Blocked attacks bar */}
                <div className="card span-2">
                    <div className="card-header">
                        <span className="card-title">Blocked Attacks Per Hour</span>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={timeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="hour" tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} interval={3} />
                            <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="blocked" fill="#ff3d5a" opacity={0.7} radius={[2, 2, 0, 0]} name="blocked" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
