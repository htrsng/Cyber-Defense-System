import React from 'react';

export default function UserWalletPage({ wallet, fmtVND }) {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div className="pg-hero pg-shadow-xl" style={{ margin: 0 }}>
                <div className="pg-hero-inner">
                    <div className="pg-hero-top">
                        <div>
                            <div className="pg-hero-label">Số dư khả dụng</div>
                            <div className="pg-balance">{fmtVND(wallet?.balance || 0)}</div>
                        </div>
                    </div>
                    <div className="pg-hero-actions" style={{ marginTop: 24 }}>
                        <button className="pg-hero-btn"><span>↑</span> Nạp tiền</button>
                        <button className="pg-hero-btn"><span>↓</span> Rút tiền</button>
                    </div>
                </div>
            </div>

            <div className="pg-panel pg-shadow-md">
                <div className="pg-panel-title" style={{ marginBottom: 16 }}>Ngân hàng liên kết</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, background: '#10b981', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏦</div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{wallet?.bankName || 'Vietcombank'}</div>
                            <div style={{ color: '#9ca3af', fontSize: 14 }}>{wallet?.bankAccount || '****3456'}</div>
                        </div>
                    </div>
                    <button className="pg-badge info" style={{ padding: '8px 16px', cursor: 'pointer' }}>Quản lý</button>
                </div>
            </div>

            <div className="pg-panel pg-shadow-md">
                <div className="pg-panel-title" style={{ marginBottom: 16 }}>Thẻ đã lưu</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                    <div style={{ color: '#9ca3af' }}>+ Thêm thẻ tín dụng / ghi nợ</div>
                </div>
            </div>
        </div>
    );
}
