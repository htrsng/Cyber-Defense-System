import React from 'react';

export default function UserSecurityPage({ isSecurityEnabled, riskScore }) {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div className="pg-panel pg-shadow-md pg-hover-elevate" style={{ background: isSecurityEnabled ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)', border: `1px solid ${isSecurityEnabled ? '#34d399' : '#f87171'}` }}>
                <div className="pg-panel-title" style={{ marginBottom: 20, color: isSecurityEnabled ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isSecurityEnabled ? '🟢 Tài khoản được bảo vệ bởi CyberDef' : '🔴 Tài khoản có nguy cơ bị tấn công'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>Điểm bảo mật</div>
                        <div style={{ fontSize: 28, fontWeight: 'bold', color: isSecurityEnabled ? '#34d399' : '#f87171' }}>{isSecurityEnabled ? '96' : '30'}</div>
                    </div>
                    <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>Xác thực 2 bước (2FA)</div>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#34d399', marginTop: 4 }}>Đã bật</div>
                    </div>
                </div>
            </div>

            <div className="pg-panel pg-shadow-md">
                <div className="pg-panel-title" style={{ marginBottom: 16 }}>Lịch sử đăng nhập</div>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '12px 0' }}>Thời gian</th>
                            <th>Thiết bị</th>
                            <th>Địa chỉ IP</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '12px 0' }}>Vừa xong</td>
                            <td>Chrome trên Windows</td>
                            <td>192.168.1.1</td>
                            <td><span style={{ color: '#34d399' }}>Thành công</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 0' }}>2 ngày trước</td>
                            <td>Safari trên iOS</td>
                            <td>113.190.23.4</td>
                            <td><span style={{ color: '#34d399' }}>Thành công</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 0' }}>3 ngày trước</td>
                            <td>Thiết bị lạ</td>
                            <td>45.33.22.1 (Nga)</td>
                            <td><span style={{ color: '#ef4444' }}>Đã chặn bởi CyberDef</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
