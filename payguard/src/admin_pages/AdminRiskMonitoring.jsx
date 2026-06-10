import React, { useEffect, useState } from 'react';

export default function AdminRiskMonitoring() {
    const [latestEvent, setLatestEvent] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('payguard:latest-risk-event');
        if (stored) {
            try {
                setLatestEvent(JSON.parse(stored));
                // Optional: clear it if we only want to show it once
                // localStorage.removeItem('payguard:latest-risk-event');
            } catch (e) { }
        }
    }, []);

    const moneyFormat = new Intl.NumberFormat('vi-VN');

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Risk Monitoring</h1>

            {latestEvent && (
                <div style={{ 
                    padding: 24, 
                    background: 'rgba(239,68,68,0.1)', 
                    border: '2px solid #ef4444', 
                    borderRadius: 12, 
                    animation: 'pulse-danger 2s infinite',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 'bold', borderBottomLeftRadius: 8 }}>
                        CRITICAL ALERT
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ fontSize: 40 }}>🔥</div>
                        <div>
                            <h2 style={{ color: '#ef4444', margin: '0 0 12px 0' }}>NEW CRITICAL EVENT INTERCEPTED</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', fontSize: 15 }}>
                                <div><span style={{ color: '#9ca3af' }}>User:</span> <strong>{latestEvent.user}</strong></div>
                                <div><span style={{ color: '#9ca3af' }}>Amount:</span> <strong style={{ color: '#f59e0b' }}>{moneyFormat.format(latestEvent.amount)} VNĐ</strong></div>
                                <div><span style={{ color: '#9ca3af' }}>Risk Score:</span> <span className="pg-badge danger" style={{ fontSize: 14 }}>{latestEvent.risk} (Critical)</span></div>
                                <div><span style={{ color: '#9ca3af' }}>Action:</span> <strong style={{ color: '#34d399' }}>Blocked by CyberDef</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                    <div style={{ color: '#9ca3af', marginBottom: 8 }}>Suspicious Users</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>12 Accounts</div>
                </div>
                <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                    <div style={{ color: '#9ca3af', marginBottom: 8 }}>Failed Logins (24h)</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>8,492</div>
                </div>
                <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                    <div style={{ color: '#9ca3af', marginBottom: 8 }}>High-Risk Transfers</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>{latestEvent ? '46' : '45'}</div>
                </div>
            </div>

            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <h2 style={{ marginTop: 0 }}>Recent Suspicious Activity</h2>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                            <th style={{ padding: '12px 0', fontWeight: 600 }}>User</th>
                            <th style={{ fontWeight: 600 }}>Event Type</th>
                            <th style={{ fontWeight: 600 }}>Detected By</th>
                            <th style={{ fontWeight: 600 }}>Risk Score</th>
                            <th style={{ fontWeight: 600 }}>Action Taken</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestEvent && (
                        <tr style={{ borderBottom: '1px solid #374151', background: 'rgba(239,68,68,0.05)' }}>
                            <td style={{ padding: '12px 0', color: '#fff' }}>{latestEvent.user}</td>
                            <td><span style={{ color: '#ef4444', fontWeight: 600 }}>Large Transfer</span></td>
                            <td><span style={{ color: '#60a5fa', fontWeight: 600, fontSize: 13 }}>CyberDef Fraud Engine</span></td>
                            <td><span className="pg-badge danger" style={{ padding: '4px 8px' }}>{latestEvent.risk} (Critical)</span></td>
                            <td><span style={{ color: '#10b981', fontWeight: 600 }}>Blocked by CyberDef</span></td>
                        </tr>
                        )}
                        <tr>
                            <td style={{ padding: '12px 0', color: '#e5e7eb' }}>User A (user01@payguard.vn)</td>
                            <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>Impossible Travel Login</span></td>
                            <td><span style={{ color: '#60a5fa', fontWeight: 600, fontSize: 13 }}>CyberDef AI</span></td>
                            <td><span className="pg-badge danger" style={{ padding: '4px 8px' }}>88 (High)</span></td>
                            <td><span style={{ color: '#10b981', fontWeight: 600 }}>Account Locked</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 0', color: '#e5e7eb' }}>hacker@evil.com</td>
                            <td><span style={{ color: '#ef4444', fontWeight: 600 }}>SQL Injection Attempt</span></td>
                            <td><span style={{ color: '#60a5fa', fontWeight: 600, fontSize: 13 }}>CyberDef WAF</span></td>
                            <td><span className="pg-badge danger" style={{ padding: '4px 8px' }}>99 (Critical)</span></td>
                            <td><span style={{ color: '#10b981', fontWeight: 600 }}>IP Blacklisted</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 0', color: '#e5e7eb' }}>user_test@demo.com</td>
                            <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>Suspicious Transfer</span></td>
                            <td><span style={{ color: '#60a5fa', fontWeight: 600, fontSize: 13 }}>CyberDef Fraud Engine</span></td>
                            <td><span className="pg-badge warning" style={{ padding: '4px 8px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4 }}>65 (Medium)</span></td>
                            <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>Flagged for Review</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
