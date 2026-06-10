import React from 'react';

export default function UsersPage() {
    const users = [
        { id: 1, email: 'admin@payguard.vn', role: 'Admin', status: 'Active', lastLogin: 'Vừa xong', risk: 'Safe' },
        { id: 2, email: 'user@payguard.vn', role: 'User', status: 'Active', lastLogin: '2 giờ trước', risk: 'Safe' },
        { id: 3, email: 'hacker@evil.com', role: 'User', status: 'Flagged', lastLogin: '10 phút trước', risk: 'Critical' },
    ];

    return (
        <div className="pg-panel pg-shadow-md pg-hover-elevate">
            <div className="pg-panel-header">
                <div>
                    <div className="pg-panel-title">Quản lý người dùng</div>
                    <div className="pg-panel-sub">{users.length} người dùng trong hệ thống</div>
                </div>
            </div>
            <div style={{ marginTop: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', color: '#64748b' }}>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Người dùng</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vai trò</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Trạng thái</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Đăng nhập cuối</th>
                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Mức độ rủi ro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.email}</td>
                                <td style={{ padding: '12px 16px' }}>{u.role}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold',
                                        background: u.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                                        color: u.status === 'Active' ? '#10b981' : '#f87171'
                                    }}>
                                        {u.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.lastLogin}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold',
                                        background: u.risk === 'Safe' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                        color: u.risk === 'Safe' ? '#10b981' : '#ef4444'
                                    }}>
                                        {u.risk}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
