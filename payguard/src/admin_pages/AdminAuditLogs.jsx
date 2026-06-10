import React from 'react';

export default function AdminAuditLogs() {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Audit Logs</h1>
            
            <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151', padding: 24 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <input type="text" placeholder="Search logs..." style={{ padding: '8px 16px', background: '#111827', border: '1px solid #374151', borderRadius: 6, color: '#fff', flex: 1 }} />
                    <select style={{ padding: '8px 16px', background: '#111827', border: '1px solid #374151', borderRadius: 6, color: '#fff' }}>
                        <option>All Events</option>
                        <option>Security</option>
                        <option>Admin Action</option>
                        <option>System</option>
                    </select>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #374151', color: '#9ca3af' }}>
                            <th style={{ padding: '12px 16px' }}>Timestamp</th>
                            <th style={{ padding: '12px 16px' }}>Actor</th>
                            <th style={{ padding: '12px 16px' }}>Action</th>
                            <th style={{ padding: '12px 16px' }}>Resource</th>
                            <th style={{ padding: '12px 16px' }}>IP Address</th>
                            <th style={{ padding: '12px 16px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #374151', '&:hover': { background: '#111827' } }}>
                            <td style={{ padding: '12px 16px', color: '#d1d5db' }}>2026-06-05 22:15:43</td>
                            <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 24, height: 24, background: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 'bold' }}>A</div>
                                    <span>admin@payguard.vn</span>
                                </div>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#3b82f6', fontWeight: 500 }}>LOGIN_SUCCESS</td>
                            <td style={{ padding: '12px 16px', color: '#9ca3af' }}>/api/auth/login</td>
                            <td style={{ padding: '12px 16px', color: '#9ca3af' }}>113.190.23.4</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>SUCCESS</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 16px', color: '#d1d5db' }}>2026-06-05 22:10:12</td>
                            <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 24, height: 24, background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 'bold' }}>S</div>
                                    <span>SYSTEM_CYBERDEF</span>
                                </div>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: 500 }}>BLOCK_TRANSACTION</td>
                            <td style={{ padding: '12px 16px', color: '#9ca3af' }}>Transfer: 500M VNĐ</td>
                            <td style={{ padding: '12px 16px', color: '#9ca3af' }}>14.22.45.1</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>BLOCKED</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 16px', color: '#d1d5db' }}>2026-06-05 21:05:00</td>
                            <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 24, height: 24, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 'bold' }}>U</div>
                                    <span>user01@payguard.vn</span>
                                </div>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 500 }}>UPDATE_PROFILE</td>
                            <td style={{ padding: '12px 16px', color: '#9ca3af' }}>User Document</td>
                            <td style={{ padding: '12px 16px', color: '#9ca3af' }}>113.190.23.4</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>SUCCESS</span></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 16px', color: '#d1d5db' }}>2026-06-05 20:30:45</td>
                            <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 24, height: 24, background: '#6b7280', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 'bold' }}>?</div>
                                    <span>Unknown</span>
                                </div>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#f59e0b', fontWeight: 500 }}>LOGIN_FAILED</td>
                            <td style={{ padding: '12px 16px', color: '#9ca3af' }}>/api/auth/login</td>
                            <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: 'bold' }}>45.33.22.1</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>FAILED</span></td>
                        </tr>
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
                    <button style={{ padding: '6px 12px', background: '#374151', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Previous</button>
                    <button style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Next</button>
                </div>
            </div>
        </div>
    );
}
