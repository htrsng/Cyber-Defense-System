import React from 'react';

export default function AdminOverview({ resetDemo, toggleSecurity, securityEnabled }) {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            {/* Top Row: KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                {/* Threat Level */}
                <div className="pg-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155', position: 'relative', overflow: 'hidden', padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', marginBottom: 8, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: securityEnabled ? '#34d399' : '#ef4444', boxShadow: `0 0 12px ${securityEnabled ? '#34d399' : '#ef4444'}`, animation: securityEnabled ? 'none' : 'pulse-danger 2s infinite' }}/>
                        Threat Level
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: securityEnabled ? '#34d399' : '#ef4444' }}>
                        {securityEnabled ? 'LOW' : 'CRITICAL'}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>{securityEnabled ? 'Hệ thống an toàn' : 'Phát hiện nguy cơ tấn công'}</div>
                </div>

                {/* Fraud Prevented */}
                <div className="pg-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155', padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', marginBottom: 8, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🚫 Fraud Prevented
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
                        {securityEnabled ? '52' : '0'}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>Giao dịch lừa đảo đã chặn</div>
                </div>

                {/* Loss Prevented */}
                <div className="pg-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155', padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', marginBottom: 8, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        💰 Loss Prevented
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
                        {securityEnabled ? '4.2B' : '0'} <span style={{ fontSize: 16, color: '#9ca3af', fontWeight: 600 }}>VNĐ</span>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>Thiệt hại ước tính được ngăn chặn</div>
                </div>

                {/* Protected Users */}
                <div className="pg-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155', padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', marginBottom: 8, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        👥 Protected Users
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>124,592</div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>Tài khoản đang được bảo vệ</div>
                </div>
            </div>

            {/* Middle Row: Trend & Sources */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
                {/* Biểu đồ xu hướng tấn công (Attack Trend Chart) */}
                <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151', minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 16, color: '#fff' }}>Threats Blocked (24h)</h2>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#f87171', marginTop: 4 }}>2,847 <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>tấn công bị chặn</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => toggleSecurity(!securityEnabled)} style={{ background: securityEnabled ? 'rgba(248,113,113,0.1)' : 'rgba(16,185,129,0.1)', color: securityEnabled ? '#f87171' : '#10b981', border: `1px solid ${securityEnabled ? '#f87171' : '#10b981'}`, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>{securityEnabled ? 'Tắt WAF' : 'Bật WAF'}</button>
                            <button onClick={resetDemo} style={{ background: '#374151', border: '1px solid #4b5563', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>Reset</button>
                        </div>
                    </div>
                    {/* CSS Mock Chart */}
                    <div style={{ flex: 1, borderBottom: '1px solid #374151', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '3%', padding: '0 10px', marginTop: 20 }}>
                        {[20, 35, 10, 80, 45, 95, 60, 25, 40, 15, 75, 50, 30].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(180deg, rgba(248,113,113,0.8) 0%, rgba(248,113,113,0.1) 100%)', borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height 0.3s ease' }}>
                                <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: '#ef4444', fontWeight: 700 }}>{h * 10}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0', fontSize: 11, color: '#6b7280' }}>
                        <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>Now</span>
                    </div>
                </div>

                {/* Before vs After CyberDef */}
                <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151', padding: 24 }}>
                    <h2 style={{ margin: 0, fontSize: 16, marginBottom: 24, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>💡</span> Why CyberDef Matters
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: 'calc(100% - 48px)' }}>
                        {/* Without CyberDef */}
                        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Without CyberDef</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <div style={{ color: '#ef4444', fontSize: 24, fontWeight: 800 }}>~12</div>
                                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Fraud transactions / day</div>
                                </div>
                                <div>
                                    <div style={{ color: '#ef4444', fontSize: 24, fontWeight: 800 }}>~960M ₫</div>
                                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Estimated monthly loss</div>
                                </div>
                            </div>
                        </div>

                        {/* With CyberDef */}
                        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ color: '#34d399', fontWeight: 700, fontSize: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>With CyberDef</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <div style={{ color: '#34d399', fontSize: 24, fontWeight: 800 }}>0</div>
                                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Fraud today</div>
                                </div>
                                <div>
                                    <div style={{ color: '#34d399', fontSize: 24, fontWeight: 800 }}>18ms</div>
                                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Detection time</div>
                                </div>
                                <div style={{ color: '#10b981', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                                    <span>✨</span> 99.9% auto detection
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Map & Live Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
                {/* CyberDef Business Impact / Demo Exposure */}
                <div className="pg-panel" style={{ background: securityEnabled ? 'linear-gradient(135deg, #1e293b 0%, #111827 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(127,29,29,0.3) 100%)', borderColor: securityEnabled ? '#374151' : '#ef4444', padding: 24, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
                    <h2 style={{ margin: 0, fontSize: 16, marginBottom: 24, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {securityEnabled ? (
                            <><span style={{ color: '#60a5fa' }}>🛡️</span> CyberDef Business Impact</>
                        ) : (
                            <><span style={{ color: '#ef4444', animation: 'pulse-danger 2s infinite' }}>⚠️</span> DEMO MODE (UNPROTECTED)</>
                        )}
                    </h2>
                    
                    {securityEnabled ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>Threats Blocked</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>284</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>Fraud Prevented</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>52</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>Estimated Loss Prevented</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>4.2B ₫</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>Detection Time</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa' }}>18<span style={{ fontSize: 20 }}>ms</span></div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 4 }}>Estimated Fraud Exposure</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444' }}>960M ₫ <span style={{ fontSize: 16, fontWeight: 600 }}>/ month</span></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 4 }}>Expected Fraud Transactions</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444' }}>~12 <span style={{ fontSize: 16, fontWeight: 600 }}>/ day</span></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 4 }}>Risk Level</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444' }}>CRITICAL</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 4 }}>System Status</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444' }}>EXPOSED</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Activity */}
                <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ margin: 0, fontSize: 16, color: '#fff' }}>Hoạt động trực tiếp (Live)</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 999 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse-success 2s infinite' }} />
                            Live
                        </div>
                    </div>
                    
                    <div style={{ position: 'relative', paddingLeft: 16 }}>
                        {/* Timeline line */}
                        <div style={{ position: 'absolute', top: 10, bottom: 10, left: 19, width: 2, background: '#374151' }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ display: 'flex', gap: 20, position: 'relative' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', position: 'absolute', left: -1, top: 6, border: '2px solid #1f2937', boxShadow: '0 0 8px #ef4444' }} />
                                <div style={{ flex: 1, paddingLeft: 12 }}>
                                    <div style={{ fontSize: 14, color: '#ef4444', fontWeight: 600 }}>Fraud Blocked</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Phát hiện hành vi gian lận</div>
                                </div>
                                <div style={{ fontSize: 11, color: '#6b7280', paddingTop: 2 }}>2s trước</div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 20, position: 'relative' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', position: 'absolute', left: -1, top: 6, border: '2px solid #1f2937' }} />
                                <div style={{ flex: 1, paddingLeft: 12 }}>
                                    <div style={{ fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>Multiple Login Attempts</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Từ chối 15 yêu cầu đăng nhập</div>
                                </div>
                                <div style={{ fontSize: 11, color: '#6b7280', paddingTop: 2 }}>2p trước</div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 20, position: 'relative' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', position: 'absolute', left: -1, top: 6, border: '2px solid #1f2937' }} />
                                <div style={{ flex: 1, paddingLeft: 12 }}>
                                    <div style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>SQL Injection Blocked</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Ngăn chặn truy cập trái phép</div>
                                </div>
                                <div style={{ fontSize: 11, color: '#6b7280', paddingTop: 2 }}>5p trước</div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 20, position: 'relative' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', position: 'absolute', left: -1, top: 6, border: '2px solid #1f2937' }} />
                                <div style={{ flex: 1, paddingLeft: 12 }}>
                                    <div style={{ fontSize: 14, color: '#e5e7eb', fontWeight: 600 }}>New Account Created</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>demo_user@payguard</div>
                                </div>
                                <div style={{ fontSize: 11, color: '#6b7280', paddingTop: 2 }}>15p trước</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Audit Logs / Incidents Placeholder */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                <div className="pg-panel" style={{ background: '#111827', borderColor: '#1f2937', overflowX: 'auto', padding: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #1f2937', background: '#0f172a' }}>
                        <h2 style={{ margin: 0, fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#ef4444' }}>🚨</span> Sự cố gần đây (Recent Incidents)
                        </h2>
                        <button onClick={() => window.location.href = '#/admin/audit'} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: '#e5e7eb', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>Xem Nhật ký →</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr style={{ color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Thời gian</th>
                                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Loại tấn công</th>
                                <th style={{ padding: '16px 24px', fontWeight: 700 }}>IP Nguồn</th>
                                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Mục tiêu</th>
                                <th style={{ padding: '16px 24px', fontWeight: 700 }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderTop: '1px solid #1f2937', transition: 'background 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '16px 24px', color: '#e5e7eb', fontWeight: 500 }}>2026-06-10 20:30:15</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                                        <span>💉</span> SQL Injection
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}><span style={{ color: '#94a3b8', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>45.33.22.1</span></td>
                                <td style={{ padding: '16px 24px', color: '#94a3b8' }}>/api/payguard/transfer</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} /> ĐÃ CHẶN
                                    </div>
                                </td>
                            </tr>
                            <tr style={{ borderTop: '1px solid #1f2937', transition: 'background 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '16px 24px', color: '#e5e7eb', fontWeight: 500 }}>2026-06-10 20:25:40</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                                        <span>🔑</span> Brute Force
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}><span style={{ color: '#94a3b8', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>112.11.23.4</span></td>
                                <td style={{ padding: '16px 24px', color: '#94a3b8' }}>/api/login</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 700 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} /> LÀM CHẬM
                                    </div>
                                </td>
                            </tr>
                            <tr style={{ borderTop: '1px solid #1f2937', transition: 'background 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '16px 24px', color: '#e5e7eb', fontWeight: 500 }}>2026-06-10 20:10:05</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                                        <span>🕷️</span> Data Scraping
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}><span style={{ color: '#94a3b8', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>192.168.1.100</span></td>
                                <td style={{ padding: '16px 24px', color: '#94a3b8' }}>/api/users</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} /> ĐÃ CHẶN
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
