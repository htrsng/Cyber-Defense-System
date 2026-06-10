import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';

const MOCK_EVENTS = [
    { _id: '1', type: 'HONEYPOT_ACCESS', ipAddress: '10.0.0.77', riskScore: 95, tenant: 'PG', description: 'Honeypot endpoint accessed: /phpmyadmin', evidence: { payload: 'GET /phpmyadmin HTTP/1.1\nHost: payguard.localhost:4000\nUser-Agent: sqlmap/1.7.8', rule: 'HONEYPOT_ACCESS', action: 'LOG + BAN IP' }, createdAt: new Date() },
    { _id: '2', type: 'HONEYPOT_ACCESS', ipAddress: '10.0.0.77', riskScore: 95, tenant: 'PG', description: 'Honeypot endpoint accessed: /admin/backup', evidence: { payload: 'GET /admin/backup HTTP/1.1\nHost: payguard.localhost:4000\nUser-Agent: curl/7.68.0', rule: 'HONEYPOT_ACCESS', action: 'LOG + BAN IP' }, createdAt: new Date(Date.now() - 50000) },
    { _id: '3', type: 'SQL_INJECTION', ipAddress: '192.168.1.105', riskScore: 88, tenant: 'PG', description: "POST /api/login payload: ' OR 1=1", evidence: { payload: "POST /api/login HTTP/1.1\nHost: payguard.localhost:4000\n\nusername=' OR 1=1 --", rule: 'SQLI > 70', action: 'BLOCKED' }, createdAt: new Date(Date.now() - 150000) },
    { _id: '4', type: 'BRUTE_FORCE', ipAddress: '45.33.32.156', riskScore: 72, tenant: 'SN', description: '47 attempts/min trên /api/login', evidence: { payload: 'Multiple failed POST /api/login\nRate: 47/min', rule: 'BRUTE_FORCE > 10/min', action: 'TARPIT' }, createdAt: new Date(Date.now() - 300000) },
    { _id: '5', type: 'ANOMALY', ipAddress: '10.0.0.99', riskScore: 61, tenant: 'SN', description: 'Unusual request pattern detected', evidence: { payload: 'Rapid sequential access across 5 endpoints', rule: 'ANOMALY_SCORE > 50', action: 'REVIEW' }, createdAt: new Date(Date.now() - 600000) },
    { _id: '6', type: 'SQL_INJECTION', ipAddress: '203.0.113.42', riskScore: 91, tenant: 'EP', description: 'GET /users?id=1 UNION SELECT', evidence: { payload: 'GET /users?id=1 UNION SELECT 1,2,3,4 HTTP/1.1\nHost: eduportal.localhost:4002', rule: 'SQLI > 70', action: 'BLOCKED' }, createdAt: new Date(Date.now() - 1200000) },
];

export default function ThreatsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [showResolved, setShowResolved] = useState(false);
    const [expandedEvents, setExpandedEvents] = useState(new Set());

    useEffect(() => {
        setLoading(true);
        eventsAPI.getAll({ resolved: showResolved ? undefined : false, type: filter !== 'ALL' ? filter : undefined })
            .then(res => {
                const apiData = res.data.events || [];
                setEvents(apiData.length > 0 ? apiData : MOCK_EVENTS.filter(e => filter === 'ALL' || e.type === filter));
            })
            .catch(() => setEvents(MOCK_EVENTS.filter(e => filter === 'ALL' || e.type === filter)))
            .finally(() => setLoading(false));
    }, [filter, showResolved]);

    const handleResolve = (id) => {
        setEvents(prev => prev.map(e => e._id === id ? { ...e, resolved: true } : e));
        // eventsAPI.resolve(id); 
    };

    const toggleExpandEvent = (id) => {
        setExpandedEvents(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    const getSeverityColor = (score) => {
        if (score >= 91) return 'var(--color-red)';
        if (score >= 71) return 'var(--color-orange)';
        if (score >= 51) return 'var(--color-amber)';
        return 'var(--color-cyan)';
    };

    const getBadgeClass = (type) => {
        if (type === 'BRUTE_FORCE') return 'brute_force';
        if (type === 'SQL_INJECTION') return 'sqli';
        if (type === 'HONEYPOT_ACCESS') return 'honeypot';
        if (type === 'ANOMALY') return 'anomaly';
        return 'xss';
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>🛡️</span>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase' }}>SECURITY EVENTS</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Monitored security threats and detected anomalies</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['ALL', 'BRUTE_FORCE', 'SQL_INJECTION', 'HONEYPOT_ACCESS', 'ANOMALY'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                background: filter === type ? 'var(--bg-hover)' : 'transparent',
                                border: `1px solid ${filter === type ? 'var(--border-emphasis)' : 'transparent'}`,
                                color: filter === type ? 'var(--text-primary)' : 'var(--text-muted)',
                                padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: filter === type ? 'bold' : 'normal',
                                transition: '0.2s'
                            }}
                        >
                            {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} style={{ accentColor: 'var(--color-cyan)' }} />
                    Show Resolved
                </label>
            </div>

            {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading events...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {events.map(event => {
                        const isExpanded = expandedEvents.has(event._id);
                        const isResolved = event.resolved;
                        const borderColor = isResolved ? 'var(--border-default)' : getSeverityColor(event.riskScore);

                        return (
                            <div key={event._id} className="card" style={{ padding: 0, opacity: isResolved ? 0.5 : 1, borderLeft: `3px solid ${borderColor}`, transition: '0.2s' }}>
                                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <span className={`badge-attack ${getBadgeClass(event.type)}`}>{event.type.replace('_', ' ')}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-primary)' }}>{event.ipAddress}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(event.createdAt)}</span>
                                            <span style={{ fontSize: 10, background: 'var(--bg-input)', padding: '2px 6px', border: '1px solid var(--border-default)', borderRadius: 3, color: 'var(--text-muted)' }}>{event.tenant || 'PG'}</span>
                                        </div>
                                        <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>{event.description}</div>
                                        
                                        <button onClick={() => toggleExpandEvent(event._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                                            {isExpanded ? '▼' : '▶'} Evidence Details
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                                        <div className={`badge-risk ${event.riskScore >= 90 ? 'critical' : event.riskScore >= 70 ? 'high' : event.riskScore >= 50 ? 'medium' : 'low'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, fontSize: 16, fontWeight: 'bold' }}>
                                            {event.riskScore}
                                        </div>
                                        {isResolved ? (
                                            <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text-muted)', border: '1px solid var(--border-default)', padding: '4px 8px', borderRadius: 4 }}>RESOLVED</div>
                                        ) : (
                                            <button onClick={() => handleResolve(event._id)} style={{ background: 'var(--bg-green)', color: 'var(--color-green)', border: '1px solid var(--border-green)', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}>✓ RESOLVE</button>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid var(--border-default)', padding: 20, background: 'var(--bg-hover)' }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 }}>ATTACK PAYLOAD</div>
                                        <pre style={{ background: '#060a0f', border: '1px solid var(--border-default)', padding: 12, borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', overflowX: 'auto', marginBottom: 16 }}>
                                            {event.evidence?.payload || JSON.stringify(event.evidence, null, 2)}
                                        </pre>
                                        <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 120 }}>Triggered Rule:</span>
                                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{event.evidence?.rule || event.type}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 120 }}>Action Taken:</span>
                                                <span style={{ fontWeight: 'bold', color: event.evidence?.action === 'BLOCKED' ? 'var(--color-red)' : 'var(--text-primary)' }}>[{event.evidence?.action || 'LOGGED'}]</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
