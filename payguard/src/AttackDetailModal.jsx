import React, { useState, useEffect } from 'react';

export default function AttackDetailModal({ attack, onClose, API_URL }) {
    const [loading, setLoading] = useState(true);
    const [riskData, setRiskData] = useState(null);

    useEffect(() => {
        const fetchRiskDetail = async () => {
            try {
                // If the feed item doesn't have an IP, we use a fallback
                const ip = attack.ip || '10.0.0.77';
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/risk/evaluate/${ip}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    setRiskData(data);
                } else {
                    // Mock data if API fails or is not accessible
                    setRiskData(getMockRiskData(attack.score || 85));
                }
            } catch (err) {
                setRiskData(getMockRiskData(attack.score || 85));
            } finally {
                setLoading(false);
            }
        };

        fetchRiskDetail();
    }, [attack, API_URL]);

    const getMockRiskData = (score) => ({
        score,
        breakdown: [
            { factor: 'IP Reputation', score: Math.min(30, score * 0.3), maxScore: 30, detail: 'Suspicious IP' },
            { factor: 'SQLi Payload', score: Math.min(40, score * 0.4), maxScore: 40, detail: 'SQL injection detected' },
            { factor: 'Request Velocity', score: Math.min(20, score * 0.2), maxScore: 20, detail: 'High request rate' },
            { factor: 'Device Fingerprint', score: Math.min(10, score * 0.1), maxScore: 10, detail: 'Headless browser' }
        ]
    });

    return (
        <div className="pg-modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="pg-modal pg-shadow-2xl" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 500 }}>
                <div className="pg-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 24 }}>🛡️</div>
                        <div>
                            <div className="pg-panel-title" style={{ fontSize: 18 }}>Chi Tiết Đánh Giá Rủi Ro</div>
                            <div className="pg-panel-sub" style={{ fontSize: 13 }}>Attack ID: {attack.id}</div>
                        </div>
                    </div>
                    <button className="pg-icon-btn" onClick={onClose} style={{ fontSize: 24, padding: 0 }}>×</button>
                </div>
                
                <div className="pg-modal-body" style={{ padding: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div className="pg-spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
                            <div style={{ marginTop: 12, color: '#64748b' }}>Đang phân tích rủi ro...</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 24 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Risk Score</div>
                                <div style={{ fontSize: 64, fontWeight: 900, color: riskData.score >= 80 ? '#ef4444' : riskData.score >= 40 ? '#f59e0b' : '#10b981', lineHeight: 1 }}>
                                    {riskData.score}
                                </div>
                            </div>
                            
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 16 }}>Risk Breakdown (Thành phần điểm rủi ro)</div>
                                <div style={{ display: 'grid', gap: 12 }}>
                                    {riskData.breakdown && riskData.breakdown.map((item, idx) => {
                                        const pct = (item.score / item.maxScore) * 100;
                                        return (
                                            <div key={idx}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                                    <span style={{ fontWeight: 600 }}>{item.factor}</span>
                                                    <span style={{ fontWeight: 600 }}>{Math.round(item.score)}/{item.maxScore}</span>
                                                </div>
                                                <div style={{ height: 8, background: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        height: '100%', 
                                                        width: `${pct}%`, 
                                                        background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#3b82f6',
                                                        borderRadius: 4
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                                    {item.detail}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ padding: 16, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#3b82f6', marginBottom: 4 }}>CyberDef Analysis</div>
                                <div style={{ fontSize: 13, color: '#475569' }}>
                                    Hệ thống sử dụng AI và Rules Engine để phân tích đa chiều (Payload, Velocity, Reputation). Các rule được cấu hình trên CyberDef Portal sẽ quyết định hành động Block hoặc Tarpit dựa trên điểm số này.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
