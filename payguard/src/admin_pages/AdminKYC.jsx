import React from 'react';

export default function AdminKYC() {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Kiểm duyệt KYC</h1>
                <div style={{ background: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>
                    12 Yêu cầu đang chờ
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                    <h2 style={{ marginTop: 0, marginBottom: 20 }}>Thông tin khách hàng: Nguyễn Văn A</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <div style={{ color: '#9ca3af', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>ẢNH MẶT TRƯỚC CCCD</div>
                            <div style={{ height: 180, background: '#374151', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #4b5563' }}>
                                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                    <div style={{ fontSize: 24, marginBottom: 8 }}>🪪</div>
                                    <div style={{ fontSize: 13 }}>Mockup ID Front</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#9ca3af', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>ẢNH KHUÔN MẶT (SELFIE)</div>
                            <div style={{ height: 180, background: '#374151', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #4b5563' }}>
                                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                    <div style={{ fontSize: 24, marginBottom: 8 }}>👱‍♂️</div>
                                    <div style={{ fontSize: 13 }}>Mockup Selfie</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 24, padding: 16, background: '#111827', borderRadius: 8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
                            <div><span style={{ color: '#9ca3af' }}>Họ và tên:</span> <strong>Nguyễn Văn A</strong></div>
                            <div><span style={{ color: '#9ca3af' }}>Số CCCD:</span> <strong>001099123456</strong></div>
                            <div><span style={{ color: '#9ca3af' }}>Ngày sinh:</span> <strong>12/05/1999</strong></div>
                            <div><span style={{ color: '#9ca3af' }}>Quê quán:</span> <strong>Hà Nội</strong></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                        <button onClick={() => alert('Đã phê duyệt KYC thành công cho khách hàng Nguyễn Văn A!')} style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: 8 }}>
                            <span>✅</span> Duyệt hồ sơ (Approve)
                        </button>
                        <button onClick={() => alert('Đã từ chối KYC cho khách hàng Nguyễn Văn A!')} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: 8 }}>
                            <span>❌</span> Từ chối (Reject)
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Hệ thống AI Đánh giá</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                                98%
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fff' }}>Trùng khớp khuôn mặt</div>
                                <div style={{ fontSize: 12, color: '#9ca3af' }}>Độ chính xác cao</div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid #374151', paddingTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                <span style={{ color: '#9ca3af' }}>Phát hiện giấy tờ giả</span>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>Sạch</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                <span style={{ color: '#9ca3af' }}>Phát hiện liveness (Selfie)</span>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>Thật</span>
                            </div>
                        </div>
                    </div>

                    <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Hàng đợi duyệt (12)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ padding: '8px 12px', background: '#3b82f6', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                                <strong>Nguyễn Văn A</strong> - 001099123456
                            </div>
                            <div style={{ padding: '8px 12px', background: '#111827', borderRadius: 6, color: '#d1d5db', fontSize: 13, cursor: 'pointer', border: '1px solid #374151' }}>
                                <strong>Trần Thị B</strong> - 079192000012
                            </div>
                            <div style={{ padding: '8px 12px', background: '#111827', borderRadius: 6, color: '#d1d5db', fontSize: 13, cursor: 'pointer', border: '1px solid #374151' }}>
                                <strong>Lê Hoàng C</strong> - 001088222333
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
