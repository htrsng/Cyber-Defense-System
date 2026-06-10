import React, { useState } from 'react';
import AttackDetailModal from './AttackDetailModal';

export default function CyberDefSecurityPage({ isSecurityEnabled, toggleSecurity, securitySaving, attackStats, riskScore, feedItems, API_URL }) {
    const [selectedAttack, setSelectedAttack] = useState(null);

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            {/* Header section with toggle */}
            <div className={`pg-panel pg-shadow-md pg-hover-elevate ${isSecurityEnabled ? 'protected-panel' : 'danger-panel'}`} style={{ border: `1px solid ${isSecurityEnabled ? '#34d399' : '#f87171'}`, background: isSecurityEnabled ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="pg-panel-title" style={{ color: isSecurityEnabled ? '#34d399' : '#f87171', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isSecurityEnabled ? '🛡️ CyberDef Protection: Tự động bảo vệ' : '⚠️ Hệ thống không được bảo vệ'}
                        </div>
                        <div className="pg-panel-sub" style={{ marginTop: 8, fontSize: 15, maxWidth: 600, color: 'var(--pg-text-secondary)' }}>
                            CyberDef SaaS tự động phát hiện, ngăn chặn và làm chậm các cuộc tấn công nhắm vào ứng dụng bằng công nghệ AI và WAF.
                        </div>
                    </div>
                    <div className={`pg-security-toggle-card ${isSecurityEnabled ? 'protected' : 'danger'}`} style={{ border: 'none', background: 'transparent' }}>
                        <button className={`pg-toggle-btn ${isSecurityEnabled ? 'on' : ''}`} onClick={() => toggleSecurity(!isSecurityEnabled)} disabled={securitySaving} style={{ opacity: securitySaving ? 0.5 : 1, transform: 'scale(1.5)', transformOrigin: 'right center' }}>
                            <span />
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gap: 16 }}>
                    <div className="pg-panel pg-shadow-md">
                        <div className="pg-panel-title">Thống kê Phòng chống</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                            <div className="pg-stat-card" style={{ padding: 16 }}>
                                <div className="pg-stat-label">Tổng tấn công</div>
                                <div className="pg-stat-value" style={{ fontSize: 28, color: '#ef4444' }}>{attackStats.attempts}</div>
                            </div>
                            <div className="pg-stat-card" style={{ padding: 16 }}>
                                <div className="pg-stat-label">Bị CyberDef chặn</div>
                                <div className="pg-stat-value" style={{ fontSize: 28, color: '#10b981' }}>{attackStats.blocked}</div>
                            </div>
                            <div className="pg-stat-card" style={{ padding: 16 }}>
                                <div className="pg-stat-label">Đưa vào Tarpit</div>
                                <div className="pg-stat-value" style={{ fontSize: 28, color: '#f59e0b' }}>{attackStats.tarpit}</div>
                            </div>
                            <div className="pg-stat-card" style={{ padding: 16 }}>
                                <div className="pg-stat-label">Tiền bị đánh cắp</div>
                                <div className="pg-stat-value" style={{ fontSize: 20, color: '#ef4444', wordBreak: 'break-all' }}>-{new Intl.NumberFormat('vi-VN').format(attackStats.stolen)} ₫</div>
                            </div>
                        </div>
                    </div>

                    <div className="pg-panel pg-shadow-md">
                        <div className="pg-panel-title">Mức độ rủi ro hiện tại</div>
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 48, fontWeight: 800, color: riskScore >= 80 ? '#ef4444' : riskScore >= 40 ? '#f59e0b' : '#10b981' }}>
                                {riskScore}/100
                            </div>
                            <div style={{ color: 'var(--pg-text-secondary)', marginTop: 8 }}>
                                {riskScore >= 80 ? 'CRITICAL - Nguy cơ cực cao' : riskScore >= 40 ? 'WARNING - Phát hiện dấu hiệu tấn công' : 'SAFE - Hoạt động bình thường'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Feed */}
                <div className="pg-panel pg-shadow-md">
                    <div className="pg-panel-header">
                        <div>
                            <div className="pg-panel-title">Log Giám sát Thời gian thực</div>
                            <div className="pg-panel-sub">Theo dõi các truy cập và tấn công liên tục</div>
                        </div>
                    </div>
                    <div className="pg-live-feed" style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 8, marginTop: 16 }}>
                        {feedItems.length > 0 ? feedItems.map(item => (
                            <div key={item.id} className={`pg-feed-item ${item.type}`} style={{ cursor: 'pointer', padding: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setSelectedAttack(item)}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: item.type === 'blocked' ? '#ef4444' : item.type === 'tarpit' ? '#f59e0b' : '#10b981' }}>
                                        {item.text}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--pg-text-secondary)', marginTop: 4 }}>
                                        {item.ts.toLocaleTimeString()} {item.elapsed ? ` | Phản hồi: ${item.elapsed}` : ''}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#3b82f6' }}>
                                    Risk: {item.score || 0}
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--pg-text-secondary)' }}>
                                <div style={{ fontSize: 32, marginBottom: 10 }}>👀</div>
                                Đang giám sát hệ thống. Chưa có hoạt động nào.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedAttack && (
                <AttackDetailModal 
                    attack={selectedAttack} 
                    onClose={() => setSelectedAttack(null)} 
                    API_URL={API_URL}
                />
            )}
        </div>
    );
}
