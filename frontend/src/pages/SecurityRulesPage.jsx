import { useState, useEffect, useRef } from 'react';
import { policiesAPI } from '../services/api';

function RuleCard({ rule, updateRule }) {
    const [threshold, setThreshold] = useState(rule.condition.threshold);
    const debounceTimer = useRef(null);

    // Sync state if rule updates externally
    useEffect(() => {
        setThreshold(rule.condition.threshold);
    }, [rule.condition.threshold]);

    const handleThresholdChange = (e) => {
        const newValue = parseInt(e.target.value, 10);
        setThreshold(newValue);

        // Debounce update
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            try {
                await updateRule(rule._id, { condition: { ...rule.condition, threshold: newValue } });
            } catch (err) {
                console.error(err);
            }
        }, 500);
    };

    const toggleRule = async () => {
        try {
            await updateRule(rule._id, { enabled: !rule.enabled });
        } catch (err) {
            console.error(err);
        }
    };

    // Determine icon and color based on name
    let icon = '🛡️';
    let iconColor = 'var(--color-cyan)';
    let badgeClass = 'critical';
    if (rule.name.includes('Brute')) {
        icon = '⏱️'; iconColor = 'var(--color-amber)'; badgeClass = 'tarpit';
    } else if (rule.name.includes('Critical')) {
        icon = '🔔'; iconColor = 'var(--color-red)'; badgeClass = 'critical';
    } else if (rule.name.includes('Honeypot')) {
        icon = '🐛'; iconColor = 'var(--color-purple)'; badgeClass = 'honeypot';
    }

    return (
        <div className="card" style={{ opacity: rule.enabled ? 1 : 0.4, transition: '0.2s', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        {icon}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)' }}>{rule.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Cấu hình tự động dựa trên mức độ rủi ro.</div>
                    </div>
                    <div className={`badge badge-status ${badgeClass}`} style={{ marginLeft: 16 }}>
                        {rule.action.toUpperCase()}
                    </div>
                </div>
                <div className={`toggle-switch ${rule.enabled ? 'on' : ''}`} onClick={toggleRule}>
                    <div className="toggle-thumb" />
                </div>
            </div>

            {rule.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24, background: 'var(--bg-hover)' }}>
                    <div style={{ borderRight: '1px solid var(--border-default)', paddingRight: 24 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 }}>CONDITION</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 14 }}>
                            <span style={{ color: 'var(--text-faint)' }}>IF</span>
                            <span style={{ color: 'var(--color-cyan)' }}>{rule.condition.metric}</span>
                            <span style={{ color: 'var(--text-faint)' }}>{rule.condition.operator}</span>
                            <span style={{ color: 'var(--color-cyan)', fontSize: 20, fontWeight: 'bold' }}>{threshold}</span>
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={threshold} 
                                onChange={handleThresholdChange}
                                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-cyan)' }}
                            />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>Triggered {rule.stats?.triggered || 0} lần hôm nay</div>
                    </div>

                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 }}>ACTION</div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>
                            {rule.action === 'block' ? 'Chặn request tức thì, trả về mã lỗi 403 Forbidden.' : 
                             rule.action === 'tarpit' ? 'Đưa IP vào Tarpit (làm chậm tốc độ phản hồi).' :
                             'Ghi nhận log và cảnh báo.'}
                        </div>
                        {rule.action === 'tarpit' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Delay: 30s</span>
                                <input type="range" min="5" max="120" defaultValue="30" style={{ flex: 1, accentColor: 'var(--color-amber)' }} />
                            </div>
                        )}
                        {rule.action === 'alert' && (
                            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', padding: '6px 12px', borderRadius: 4, fontSize: 12, flex: 1 }}>admin@cyberdef.io</div>
                                <button className="btn btn-ghost" style={{ padding: '6px 12px' }}>Test Alert</button>
                            </div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--color-green)', marginTop: 16 }}>
                            ✓ Đang hoạt động bảo vệ hệ thống
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SecurityRulesPage() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        policiesAPI.getAll()
            .then(res => setPolicies(res.data))
            .catch(err => console.error('Error fetching policies', err))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const updateRule = async (id, data) => {
        const res = await policiesAPI.update(id, data);
        setPolicies(prev => prev.map(p => p._id === id ? res.data : p));
        if (data.condition?.threshold !== undefined) {
            showToast(`✓ Rule updated — Threshold: ${data.condition.threshold}`);
        } else if (data.enabled !== undefined) {
            showToast(`✓ Rule ${data.enabled ? 'Enabled' : 'Disabled'}`);
        }
    };

    if (loading) return <div className="main-content" style={{ color: 'var(--text-muted)' }}>Loading rules engine...</div>;

    const activeCount = policies.filter(p => p.enabled).length;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 8 }}>Security Rules Engine</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cấu hình tự động phòng thủ dựa trên Risk Score Breakdown và Event Rate.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--color-cyan)' }}>{activeCount}</strong> rules active
                    </div>
                    <button className="btn btn-primary">＋ Thêm rule mới</button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
                {policies.map(p => <RuleCard key={p._id} rule={p} updateRule={updateRule} />)}
            </div>

            <div className="card" style={{ marginTop: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Rule Execution Log</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead>
                        <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '12px 8px' }}>Timestamp</th>
                            <th style={{ padding: '12px 8px' }}>Rule Triggered</th>
                            <th style={{ padding: '12px 8px' }}>IP</th>
                            <th style={{ padding: '12px 8px' }}>Action Taken</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { time: '17:42:12', rule: 'SQL Injection Protection', ip: '10.0.0.77', action: 'BLOCKED' },
                            { time: '16:15:00', rule: 'Brute Force Defense', ip: '45.33.32.156', action: 'TARPIT' },
                            { time: '15:20:44', rule: 'Critical Risk Alert', ip: '192.168.1.105', action: 'EMAIL ALERT' },
                        ].map((log, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{log.time}</td>
                                <td style={{ padding: '12px 8px', color: 'var(--text-primary)' }}>{log.rule}</td>
                                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>{log.ip}</td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className={`badge-status ${log.action.toLowerCase()}`} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3 }}>
                                        {log.action}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, background: 'var(--bg-surface)',
                    border: '1px solid var(--border-green)', color: 'var(--color-green)',
                    padding: '12px 20px', borderRadius: 'var(--radius)', fontSize: 13,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'slideInRight 0.3s'
                }}>
                    {toast}
                </div>
            )}
            <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        </div>
    );
}
