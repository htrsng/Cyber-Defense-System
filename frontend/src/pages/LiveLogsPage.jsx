import { useState, useEffect, useRef } from 'react';
import AttackDetailDrawer from '../components/AttackDetailDrawer';

const TYPE_COLORS = { GET: 'var(--color-cyan)', POST: 'var(--color-amber)', PUT: 'var(--color-purple)', DELETE: 'var(--color-red)' };

export default function LiveLogsPage() {
    const [logs, setLogs] = useState([]);
    const [isLive, setIsLive] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const tableRef = useRef(null);

    useEffect(() => {
        if (!isLive) return;
        
        const MOCK_POOLS = [
            { tenant: 'PG', method: 'POST', path: '/api/login', ip: '10.0.0.77', score: 95, action: 'BLOCKED' },
            { tenant: 'SN', method: 'GET', path: '/products', ip: '192.168.1.1', score: 8, action: 'PASSED' },
            { tenant: 'PG', method: 'POST', path: '/api/transfer', ip: '45.33.32.156', score: 72, action: 'TARPIT' },
            { tenant: 'EP', method: 'GET', path: '/phpmyadmin', ip: '10.0.0.77', score: 95, action: 'HONEYPOT' },
            { tenant: 'PG', method: 'GET', path: '/api/balance', ip: '172.16.0.4', score: 2, action: 'PASSED' },
            { tenant: 'SN', method: 'POST', path: '/api/checkout', ip: '203.0.113.42', score: 91, action: 'BLOCKED' }
        ];

        // Seed initial data
        if (logs.length === 0) {
            setLogs(Array.from({ length: 15 }, (_, i) => {
                const entry = { ...MOCK_POOLS[Math.floor(Math.random() * MOCK_POOLS.length)], id: Math.random() };
                const d = new Date(Date.now() - i * 5000);
                entry.time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
                return entry;
            }));
        }

        const id = setInterval(() => {
            const entry = { ...MOCK_POOLS[Math.floor(Math.random() * MOCK_POOLS.length)], id: Math.random() };
            const d = new Date();
            entry.time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
            setLogs(prev => [entry, ...prev].slice(0, 100));
        }, 2000);

        return () => clearInterval(id);
    }, [isLive, logs.length]);

    useEffect(() => {
        if (tableRef.current) tableRef.current.scrollTop = 0;
    }, [logs]);

    const getScoreColor = (score) => {
        if (score >= 91) return 'critical';
        if (score >= 71) return 'high';
        if (score >= 51) return 'medium';
        if (score >= 31) return 'low';
        return 'safe';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 104px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        Live Request Logs
                        {isLive && <span className="badge badge-status passed" style={{ color: 'var(--color-green)', borderColor: 'var(--border-green)', background: 'var(--bg-green)' }}>● LIVE</span>}
                        {!isLive && <span className="badge badge-status passed" style={{ color: 'var(--text-muted)' }}>⏸ PAUSED</span>}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 13 }}>
                        <option>All Tenants</option>
                        <option>PayGuard</option>
                        <option>ShopNow</option>
                        <option>EduPortal</option>
                    </select>
                    <select style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 13 }}>
                        <option>All Risks</option>
                        <option>Critical (91-100)</option>
                        <option>High (71-90)</option>
                    </select>
                    <input type="text" placeholder="Search IP or Path..." style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 13 }} />
                    <button className={`btn ${isLive ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setIsLive(!isLive)}>
                        {isLive ? 'Pause Stream' : '▶ Resume Stream'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 60px 80px 1fr 150px 80px 100px 100px', padding: '12px 20px', background: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                    <div>Timestamp</div>
                    <div>Tenant</div>
                    <div>Method</div>
                    <div>Path</div>
                    <div>IP Address</div>
                    <div style={{ textAlign: 'center' }}>Score</div>
                    <div style={{ textAlign: 'right' }}>Action</div>
                    <div></div>
                </div>
                <div ref={tableRef} style={{ flex: 1, overflowY: 'auto' }}>
                    {logs.map((log) => (
                        <div key={log.id} className="hover:bg-hover" style={{ display: 'grid', gridTemplateColumns: '120px 60px 80px 1fr 150px 80px 100px 100px', padding: '12px 20px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', transition: '0.1s' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{log.time}</div>
                            <div><span style={{ fontSize: 10, background: 'var(--bg-input)', padding: '2px 6px', border: '1px solid var(--border-default)', borderRadius: 3, color: 'var(--text-muted)' }}>{log.tenant}</span></div>
                            <div><span style={{ fontSize: 10, fontWeight: 'bold', color: TYPE_COLORS[log.method], border: `1px solid ${TYPE_COLORS[log.method]}44`, background: `${TYPE_COLORS[log.method]}18`, padding: '2px 6px', borderRadius: 3 }}>{log.method}</span></div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.path}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{log.ip}</div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div className={`badge-risk ${getScoreColor(log.score)}`} style={{ width: 28, height: 28, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{log.score}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`badge-status ${log.action.toLowerCase()}`} style={{ fontSize: 10 }}>{log.action}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11, opacity: 0.7 }} onClick={() => setSelectedEvent(log)}>Details →</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)', fontSize: 11, color: 'var(--text-muted)' }}>
                    Showing {logs.length} of 2,841 requests today · Auto-refreshing every 2s
                </div>
            </div>

            {selectedEvent && (
                <AttackDetailDrawer 
                    attack={{
                        id: `ATK-20260605-${Math.floor(Math.random()*1000)}`,
                        riskScore: selectedEvent.score,
                        ipAddress: selectedEvent.ip,
                        action: selectedEvent.action,
                        type: selectedEvent.score > 90 ? 'SQL_INJECTION' : 'ANOMALY',
                        evidence: {
                            payload: `${selectedEvent.method} ${selectedEvent.path} HTTP/1.1\nHost: payguard.localhost:4000\nUser-Agent: curl/7.68.0`,
                            rule: 'SQLI > 70',
                            action: selectedEvent.action
                        }
                    }} 
                    onClose={() => setSelectedEvent(null)} 
                />
            )}
        </div>
    );
}
