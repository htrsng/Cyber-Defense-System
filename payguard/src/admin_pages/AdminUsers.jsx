import React from 'react';

export default function AdminUsers() {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Users Management</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => alert('Đã xuất dữ liệu người dùng ra file users_export.csv')} style={{ padding: '8px 16px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📥</span> Export CSV
                    </button>
                    <button onClick={() => alert('Đang mở form Thêm người dùng mới...')} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        <span>➕</span> Add User
                    </button>
                </div>
            </div>

            <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: 20, borderBottom: '1px solid #374151', display: 'flex', gap: 16 }}>
                    <input type="text" placeholder="Search by name, email or ID..." style={{ padding: '10px 16px', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', flex: 1 }} />
                    <select style={{ padding: '10px 16px', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff' }}>
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Locked</option>
                        <option>Pending KYC</option>
                    </select>
                </div>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ background: 'rgba(17,24,39,0.5)', color: '#9ca3af', textTransform: 'uppercase', fontSize: 12 }}>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>User</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Role</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>KYC Status</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Risk Level</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Account Status</th>
                            <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>A</div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#f3f4f6' }}>Admin System</div>
                                        <div style={{ fontSize: 12, color: '#9ca3af' }}>admin@payguard.vn</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#f59e0b', fontWeight: 600 }}>Admin</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><span>✅</span> Verified</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#10b981' }}>Low (0)</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Active</span></td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <button onClick={() => alert('Tính năng quản lý chi tiết người dùng đang được hoàn thiện!')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>⋮</button>
                            </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>U</div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#f3f4f6' }}>Demo User 01</div>
                                        <div style={{ fontSize: 12, color: '#9ca3af' }}>user01@payguard.vn</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px 20px', color: '#d1d5db' }}>Customer</td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><span>✅</span> Verified</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#10b981' }}>Low (12)</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Active</span></td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <button onClick={() => alert('Tính năng quản lý chi tiết người dùng đang được hoàn thiện!')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>⋮</button>
                            </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151', background: 'rgba(239,68,68,0.05)' }}>
                            <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B</div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#f3f4f6' }}>Bad Actor</div>
                                        <div style={{ fontSize: 12, color: '#9ca3af' }}>hacker@evil.com</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px 20px', color: '#d1d5db' }}>Customer</td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><span>❌</span> Rejected</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Critical (99)</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Locked</span></td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <button onClick={() => alert('Tính năng quản lý chi tiết người dùng đang được hoàn thiện!')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>⋮</button>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>N</div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#f3f4f6' }}>Newbie User</div>
                                        <div style={{ fontSize: 12, color: '#9ca3af' }}>newbie@gmail.com</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px 20px', color: '#d1d5db' }}>Customer</td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}><span>⏳</span> Pending</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ color: '#10b981' }}>Low (0)</span></td>
                            <td style={{ padding: '16px 20px' }}><span style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Active</span></td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <button onClick={() => alert('Tính năng quản lý chi tiết người dùng đang được hoàn thiện!')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>⋮</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div style={{ padding: 16, borderTop: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9ca3af', fontSize: 14 }}>
                    <div>Showing 1 to 4 of 1,248 entries</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => alert('Đang tải danh sách người dùng...')} style={{ padding: '4px 12px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>Prev</button>
                        <button onClick={() => alert('Đang tải danh sách người dùng...')} style={{ padding: '4px 12px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>1</button>
                        <button onClick={() => alert('Đang tải danh sách người dùng...')} style={{ padding: '4px 12px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>2</button>
                        <button onClick={() => alert('Đang tải danh sách người dùng...')} style={{ padding: '4px 12px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
