import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const EVENT_ICONS = {
    LOGIN_SUCCESS: '✓',
    LOGIN_FAILED: '✗',
    LOGOUT: '→',
    HONEYPOT_TRIGGERED: '🍯',
    RATE_LIMIT_HIT: '⊘',
    ATTACK_SIM_BRUTE_FORCE: '⚡',
    ATTACK_SIM_SQLI: '💉',
    ANOMALY_DETECTED: '◎',
    SUSPICIOUS_ACTIVITY: '⚠',
    IP_BLOCKED: '⛔',
    DEFAULT: '·',
};

const COUNTRY_FLAGS = {
    US: '🇺🇸', VN: '🇻🇳', CN: '🇨🇳', RU: '🇷🇺', KP: '🇰🇵',
    DE: '🇩🇪', GB: '🇬🇧', FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷',
    IR: '🇮🇷', SY: '🇸🇾', CU: '🇨🇺', IN: '🇮🇳', BR: '🇧🇷',
};

function severityOf(entry) {
    return entry.severity || 'info';
}

function riskColor(score) {
    if (score >= 80) return 'var(--red)';
    if (score >= 60) return 'var(--orange)';
    if (score >= 35) return 'var(--amber)';
    if (score >= 15) return 'var(--cyan)';
    return 'var(--text-dim)';
}

export default function LiveLogsPage({ logs }) {
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

    const visible = logs.filter(l => {
        const sev = severityOf(l).toUpperCase();
        const matchSev = filter === 'ALL' || sev === filter;
        const matchSearch = !search ||
            l.ipAddress?.includes(search) ||
            l.eventType?.includes(search.toUpperCase()) ||
            l.endpoint?.includes(search);
        return matchSev && matchSearch;
    });

    useEffect(() => {
        const feed = document.querySelector('.log-feed');
        if (feed) feed.scrollTop = 0;
    }, [logs.length]);

    return (
        <div>
            <div className="section-title">◈ LIVE ACTIVITY LOG</div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '5px 12px', fontSize: 11 }}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Lọc theo IP hoặc event..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', padding: '6px 12px',
                        color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                        fontSize: 12, outline: 'none', width: 240,
                    }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', marginLeft: 'auto' }}>
                    {visible.length} / {logs.length} entries
                </span>
            </div>

            {/* Column headers */}
            <div style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 100px 64px',
                gap: 12, padding: '6px 12px', marginBottom: 4,
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--text-dim)', letterSpacing: '0.08em',
                borderBottom: '1px solid var(--border)',
            }}>
                <span>TIME</span>
                <span>EVENT</span>
                <span>IP ADDRESS</span>
                <span style={{ textAlign: 'right' }}>RISK</span>
            </div>

            {/* Log feed */}
            <div className="log-feed">
                {visible.length === 0 ? (
                    <div className="empty-state">
                        {logs.length === 0
                            ? 'Đang chờ sự kiện mới từ backend. Khi có traffic hoặc attack simulation, log sẽ xuất hiện ở đây.'
                            : 'Không có event nào khớp bộ lọc hiện tại. Hãy đổi filter hoặc xoá từ khóa tìm kiếm.'}
                    </div>
                ) : (
                    visible.map((entry, i) => (
                        <div key={entry._id || i} className={`log-entry ${severityOf(entry)}`}>
                            <span className="log-time">
                                {entry.timestamp
                                    ? format(new Date(entry.timestamp), 'HH:mm:ss')
                                    : '--:--:--'}
                            </span>
                            <span className="log-event">
                                <span style={{ marginRight: 6 }}>
                                    {EVENT_ICONS[entry.eventType] || EVENT_ICONS.DEFAULT}
                                </span>
                                {entry.eventType?.replace(/_/g, ' ')}
                                {entry.endpoint && (
                                    <span style={{ color: 'var(--text-dim)', marginLeft: 8, fontSize: 11 }}>
                                        {entry.endpoint}
                                    </span>
                                )}
                            </span>
                            <span className="log-ip">
                                {entry.ipAddress || '—'}
                                {entry.metadata?.country && (
                                    <span style={{ marginLeft: 4, fontSize: 14 }}>
                                        {COUNTRY_FLAGS[entry.metadata.country] || '🌐'}
                                        <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 2 }}>
                                            {entry.metadata.country}
                                        </span>
                                    </span>
                                )}
                            </span>
                            <span className="log-score" style={{ color: riskColor(entry.riskScore), fontFamily: 'var(--font-mono)' }}>
                                {entry.riskScore > 0 ? entry.riskScore : '—'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
