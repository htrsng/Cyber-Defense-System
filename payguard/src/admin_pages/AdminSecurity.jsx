import React from 'react';

export default function AdminSecurity({ logs }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h1 style={{ fontSize: 28, margin: 0, fontWeight: 800 }}>Trung tâm Bảo mật</h1>
                <div style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Powered by CyberDef
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Protection Status */}
                    <div className="pg-panel" style={{ background: 'linear-gradient(180deg, #111827, #09090b)', borderColor: '#1f2937', padding: 24, borderTop: '2px solid #34d399', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: 15, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Trạng thái Bảo vệ</h2>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 16px #34d399', animation: 'pulse-success 2s infinite' }} />
                            ĐANG HOẠT ĐỘNG & BẢO VỆ
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#d1d5db', fontSize: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#9ca3af' }}>Mối đe dọa đã chặn hôm nay</span>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>284</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#9ca3af' }}>Nỗ lực lừa đảo đã chặn</span>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>52</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#9ca3af' }}>Tài khoản được bảo vệ</span>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>124,592</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#9ca3af' }}>Quét môi trường lần cuối</span>
                                <span style={{ fontWeight: 700, color: '#34d399', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 12 }}>⏱</span> 2s trước
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ROI Widget */}
                    <div className="pg-panel" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)', borderColor: '#1e40af', padding: 24, boxShadow: '0 10px 25px -5px rgba(30,64,175,0.5)' }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: 15, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 1 }}>CyberDef ROI Analysis</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#bfdbfe', fontSize: 12, marginBottom: 4 }}>Chi phí bản quyền (Tháng)</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>210,000 ₫</div>
                            </div>
                            <div style={{ fontSize: 24, color: '#60a5fa' }}>→</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#bfdbfe', fontSize: 12, marginBottom: 4 }}>Thiệt hại đã chặn (Tháng)</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>4.2B ₫</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#93c5fd', fontWeight: 600 }}>Tỷ suất hoàn vốn (ROI)</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', background: 'rgba(59,130,246,0.3)', padding: '4px 12px', borderRadius: 8 }}>x20,000</span>
                        </div>
                    </div>

                    {/* Health Card */}
                    <div className="pg-panel" style={{ background: '#111827', borderColor: '#1f2937', padding: 24 }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: 15, color: '#fff' }}>Lớp bảo mật CyberDef</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8 }}>
                                <div style={{ color: '#e5e7eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>🛡️</span> Tường lửa Ứng dụng Web
                                </div>
                                <div style={{ color: '#34d399', fontSize: 12, background: 'rgba(52,211,153,0.1)', padding: '4px 10px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> ĐANG HOẠT ĐỘNG
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8 }}>
                                <div style={{ color: '#e5e7eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>🔍</span> Hệ thống phát hiện gian lận
                                </div>
                                <div style={{ color: '#34d399', fontSize: 12, background: 'rgba(52,211,153,0.1)', padding: '4px 10px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> ĐANG HOẠT ĐỘNG
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8 }}>
                                <div style={{ color: '#e5e7eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>🧠</span> Phân tích rủi ro AI
                                </div>
                                <div style={{ color: '#34d399', fontSize: 12, background: 'rgba(52,211,153,0.1)', padding: '4px 10px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> ĐANG HOẠT ĐỘNG
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event Feed */}
                <div className="pg-panel" style={{ background: '#0f172a', borderColor: '#1e293b', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: 15, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#60a5fa' }}>⚡</span> CyberDef Protection Summary
                        </h2>
                        <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse-success 2s infinite' }} />
                            Live
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, gap: 16 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 2, background: '#ef4444', borderRadius: 2 }} />
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>5p trước</div>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>127 lần cố truy cập trái phép</div>
                                <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>Đã tự động ngăn chặn • Risk: High</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 2, background: '#f59e0b', borderRadius: 2 }} />
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>7p trước</div>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>89 lần dò mật khẩu hàng loạt</div>
                                <div style={{ color: '#f59e0b', fontSize: 13, marginTop: 4 }}>Đã khóa tạm thời IP • Risk: Medium</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 2, background: '#3b82f6', borderRadius: 2 }} />
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>12p trước</div>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>21 giao dịch gian lận bị chặn</div>
                                <div style={{ color: '#3b82f6', fontSize: 13, marginTop: 4 }}>Tiết kiệm 840M ₫ • Action: Blocked</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 2, background: '#10b981', borderRadius: 2 }} />
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>20p trước</div>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>47 lần quét lỗ hổng hệ thống</div>
                                <div style={{ color: '#10b981', fontSize: 13, marginTop: 4 }}>Chuyển hướng sang Honeypot • Status: Secured</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
