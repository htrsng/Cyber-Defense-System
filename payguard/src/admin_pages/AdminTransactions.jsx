import React from 'react';

export default function AdminTransactions() {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Transactions</h1>
            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <th style={{ padding: '12px 0' }}>Transaction ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Risk Assessment</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '12px 0' }}>TX001</td>
                            <td style={{ fontWeight: 'bold' }}>1,000,000 VNĐ</td>
                            <td><span style={{ color: '#10b981' }}>Success</span></td>
                            <td><span className="pg-badge success">Risk: Low (12)</span></td>
                            <td>—</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 0' }}>TX002</td>
                            <td style={{ fontWeight: 'bold' }}>500,000,000 VNĐ</td>
                            <td><span style={{ color: '#f59e0b' }}>Flagged</span></td>
                            <td><span className="pg-badge danger">Risk: High (95)</span></td>
                            <td><button onClick={() => alert('Đang mở chi tiết giao dịch để rà soát...')} className="pg-badge warning" style={{ cursor: 'pointer', border: 'none' }}>Review Transfer</button></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 0' }}>TX003</td>
                            <td style={{ fontWeight: 'bold' }}>-</td>
                            <td><span style={{ color: '#ef4444' }}>Blocked</span></td>
                            <td><span className="pg-badge danger">Risk: Critical (99)</span></td>
                            <td><button onClick={() => alert('Đang chuyển hướng sang Hệ thống Nhật ký Bảo mật CyberDef...')} className="pg-badge info" style={{ cursor: 'pointer', border: 'none' }}>View Security Logs</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
