import { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { riskAPI, tarpitAPI, twoFactorAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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

function calculateTarpitDelay(riskScore) {
    const tarpitThreshold = 40;
    const blockThreshold = 80;
    const minDelay = 3000;
    const maxDelay = 30000;

    if (riskScore >= blockThreshold) return maxDelay;

    const ratio = (riskScore - tarpitThreshold) / (blockThreshold - tarpitThreshold);
    return Math.floor(minDelay + ratio * (maxDelay - minDelay));
}

function tarpitColor(score) {
    if (score >= 80) return 'var(--red)';
    if (score >= 60) return 'var(--orange)';
    return 'var(--amber)';
}

function formatDelay(ms) {
    if (!Number.isFinite(ms)) return '—';
    if (ms >= 1000) return `${Math.round(ms / 1000)}s`;
    return `${ms}ms`;
}

export default function OverviewPage({ liveAlerts, recentLogs, tarpitEvents = [] }) {
    const { user } = useAuth();
    const [timeData] = useState(genTimeSeriesData);
    const [topIPs, setTopIPs] = useState([]);
    const [stats, setStats] = useState(null);
    const [tarpitStatus, setTarpitStatus] = useState([]);
    const [now, setNow] = useState(Date.now());
    const [twoFactorStatus, setTwoFactorStatus] = useState(null);
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [twoFactorMessage, setTwoFactorMessage] = useState('');
    const [twoFactorError, setTwoFactorError] = useState('');
    const [twoFactorOtp, setTwoFactorOtp] = useState('');
    const [setupData, setSetupData] = useState(null);

    const refreshTwoFactorStatus = () => {
        twoFactorAPI.status()
            .then(r => setTwoFactorStatus(r.data))
            .catch(() => { });
    };

    const refreshTarpitStatus = () => {
        tarpitAPI.status()
            .then(r => setTarpitStatus(r.data.tarpit || r.data.tarpitted || []))
            .catch(() => { });
    };

    useEffect(() => {
        riskAPI.getTopIPs().then(r => setTopIPs(r.data.top || [])).catch(() => { });
        riskAPI.getStats().then(r => setStats(r.data)).catch(() => { });
        if (user) {
            refreshTwoFactorStatus();
            refreshTarpitStatus();
        }
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
            refreshTarpitStatus();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!tarpitEvents.length) return;

        setTarpitStatus((prev) => {
            const next = [...prev];

            tarpitEvents.slice(0, 10).forEach((event) => {
                const normalized = {
                    ip: event.ipAddress,
                    riskScore: event.riskScore,
                    delayMs: event.delayMs,
                    timestamp: event.timestamp,
                    ttl: event.ttl ?? 300,
                    endpoint: event.endpoint,
                };

                const existingIndex = next.findIndex((item) => item.ip === normalized.ip);
                if (existingIndex >= 0) {
                    next[existingIndex] = { ...next[existingIndex], ...normalized };
                } else {
                    next.unshift(normalized);
                }
            });

            return next.slice(0, 10);
        });
    }, [tarpitEvents]);

    useEffect(() => {
        if (user) {
            refreshTwoFactorStatus();
        }
    }, [user]);

    const startTwoFactorSetup = async () => {
        setTwoFactorLoading(true);
        setTwoFactorError('');
        setTwoFactorMessage('');
        try {
            const { data } = await twoFactorAPI.setup();
            setSetupData(data);
            setTwoFactorMessage(data.message || 'Scan QR code to continue');
            refreshTwoFactorStatus();
        } catch (error) {
            setTwoFactorError(error.response?.data?.error || 'Failed to start 2FA setup');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const confirmTwoFactorSetup = async () => {
        setTwoFactorLoading(true);
        setTwoFactorError('');
        try {
            await twoFactorAPI.verify({ token: twoFactorOtp });
            setTwoFactorMessage('2FA enabled successfully');
            setSetupData(null);
            setTwoFactorOtp('');
            refreshTwoFactorStatus();
        } catch (error) {
            setTwoFactorError(error.response?.data?.error || 'Invalid OTP');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const disableTwoFactor = async () => {
        setTwoFactorLoading(true);
        setTwoFactorError('');
        try {
            await twoFactorAPI.disable({ token: twoFactorOtp });
            setTwoFactorMessage('2FA disabled');
            setSetupData(null);
            setTwoFactorOtp('');
            refreshTwoFactorStatus();
        } catch (error) {
            setTwoFactorError(error.response?.data?.error || 'Invalid OTP');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const sevDist = [
        { name: 'Critical', value: 4, color: SEVERITY_COLORS.critical },
        { name: 'High', value: 12, color: SEVERITY_COLORS.high },
        { name: 'Medium', value: 28, color: SEVERITY_COLORS.medium },
        { name: 'Low', value: 31, color: SEVERITY_COLORS.low },
        { name: 'Info', value: 25, color: SEVERITY_COLORS.info },
    ];

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

    // Deduplicate: keep only the latest alert per type
    const uniqueAlerts = liveAlerts.reduce((acc, alert) => {
        const key = alert.type;
        if (!acc.find(a => a.type === key)) acc.push(alert);
        return acc;
    }, []).slice(0, 4);

    return (
        <div>
            <div className="section-title">◈ THREAT OVERVIEW</div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">Account Security / 2FA</span>
                    <span className={`badge ${twoFactorStatus?.enabled ? 'safe' : 'low'}`}>
                        {twoFactorStatus?.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                            {user?.email || '—'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
                            {twoFactorStatus?.enabled
                                ? 'Two-Factor Authentication is active for this account.'
                                : 'Enable TOTP 2FA to require one-time codes during login.'}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                            <button className="btn btn-primary" onClick={startTwoFactorSetup} disabled={twoFactorLoading}>
                                {twoFactorLoading ? '⟳ ĐANG XỬ LÝ...' : '▶ THIẾT LẬP 2FA'}
                            </button>
                            <button className="btn btn-ghost" onClick={disableTwoFactor} disabled={twoFactorLoading || !twoFactorStatus?.enabled}>
                                TẮT 2FA
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                            <input
                                type="text"
                                value={twoFactorOtp}
                                onChange={e => setTwoFactorOtp(e.target.value)}
                                placeholder="Enter OTP for verify/disable"
                                style={{
                                    minWidth: 260,
                                    background: 'var(--bg-base)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '8px 14px',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 13,
                                    outline: 'none',
                                }}
                            />
                            <button className="btn btn-ghost" onClick={confirmTwoFactorSetup} disabled={twoFactorLoading || !setupData}>
                                XÁC MINH & BẬT
                            </button>
                        </div>

                        {twoFactorMessage && (
                            <div style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 8 }}>
                                {twoFactorMessage}
                            </div>
                        )}
                        {twoFactorError && (
                            <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 8 }}>
                                {twoFactorError}
                            </div>
                        )}
                    </div>

                    {setupData?.qrCodeUrl && (
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={setupData.qrCodeUrl}
                                alt="2FA QR Code"
                                style={{ width: 160, height: 160, borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }}
                            />
                            <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-word', maxWidth: 180 }}>
                                {setupData.secret}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tarpit status ── */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">TARPIT STATUS</span>
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--amber)', borderColor: 'rgba(245, 158, 11, 0.28)' }}>
                        {tarpitStatus.length} ACTIVE
                    </span>
                </div>

                {tarpitStatus.length === 0 ? (
                    <div className="empty-state">Chưa có IP nào đang bị tarpit</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {tarpitStatus.map((item) => {
                            const delayMs = item.delayMs ?? calculateTarpitDelay(item.riskScore);
                            const eventTime = item.timestamp ? new Date(item.timestamp).getTime() : null;
                            const elapsed = eventTime ? Math.max(0, now - eventTime) : Math.max(0, (300 - Math.max(item.ttl ?? 0, 0)) * 1000);
                            const progress = eventTime
                                ? Math.min(100, (elapsed / delayMs) * 100)
                                : Math.min(100, ((300 - Math.max(item.ttl ?? 0, 0)) / 300) * 100);

                            return (
                                <div key={item.ip} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-panel)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                                        <span className="ip-tag" style={{ width: 'fit-content' }}>{item.ip}</span>
                                        <span className="badge" style={{ color: tarpitColor(item.riskScore), background: `${tarpitColor(item.riskScore)}18`, borderColor: `${tarpitColor(item.riskScore)}44` }}>
                                            Risk {item.riskScore}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                                            Delay {formatDelay(delayMs)}
                                        </span>
                                    </div>

                                    <div className="risk-bar" style={{ height: 8 }}>
                                        <div
                                            className="risk-bar-fill"
                                            style={{ width: `${progress}%`, background: tarpitColor(item.riskScore), transition: 'width 0.9s linear' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                                        <span>{item.endpoint || '/api/auth/login'}</span>
                                        <span>{eventTime ? `${Math.max(0, Math.ceil((delayMs - elapsed) / 1000))}s remaining` : `TTL ${item.ttl ?? '—'}s`}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Live alerts ── */}
            {uniqueAlerts.map((alert, i) => (
                <div key={i} className={`alert-banner ${ALERT_SEVERITY[alert.type] || alert.severity}`}>
                    <span style={{ flexShrink: 0 }}>⚠</span>
                    <div>
                        <strong>{ALERT_LABELS[alert.type] || alert.type?.replace(/_/g, ' ')}</strong>
                        {' — '}
                        <span className="ip-tag">{alert.ipAddress}</span>
                        {' '}
                        Risk Score: <strong>{alert.riskScore}</strong>
                        {alert.description && <span style={{ opacity: 0.8 }}> — {alert.description}</span>}
                    </div>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.6, flexShrink: 0 }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                </div>
            ))}

            {/* ── Stat tiles ── */}
            <div className="stat-grid">
                <div className="stat-tile cyan">
                    <div className="stat-label">Tổng số Events (24h)</div>
                    <div className="stat-value">{stats?.last24h?.totalEvents ?? '—'}</div>
                    <div className="stat-sub">↑ 12% so với hôm qua</div>
                </div>
                <div className="stat-tile red">
                    <div className="stat-label">Critical Threats</div>
                    <div className="stat-value">{stats?.last24h?.criticalEvents ?? '—'}</div>
                    <div className="stat-sub">Chưa xử lý trong trạng thái active</div>
                </div>
                <div className="stat-tile amber">
                    <div className="stat-label">Unresolved Events</div>
                    <div className="stat-value">{stats?.unresolvedThreats ?? '—'}</div>
                    <div className="stat-sub">Chờ review</div>
                </div>
                <div className="stat-tile green">
                    <div className="stat-label">IPs Monitored</div>
                    <div className="stat-value">{topIPs.length || '—'}</div>
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
                        <div className="empty-state">Chưa phát hiện IP có risk cao</div>
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
