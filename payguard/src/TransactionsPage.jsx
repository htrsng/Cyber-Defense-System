import React, { useState, useMemo } from 'react';

// Giả lập component TxItem nếu App.jsx không export
const TxItem = ({ tx }) => {
    const isNegative = tx.type === 'transfer' || tx.type === 'withdraw' || tx.type === 'exploit';
    const isSuccess = tx.status === 'success';
    const fmtShort = (n) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(n);
    const dateStr = new Date(tx.createdAt).toLocaleString('vi-VN');

    return (
        <div className={`pg-tx-item ${tx.type === 'exploit' ? 'danger' : ''} ${tx.status === 'blocked' ? 'blocked' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: tx.status === 'blocked' ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 24, opacity: 0.8 }}>
                    {tx.type === 'deposit' ? '📥' : tx.type === 'exploit' ? '⚠️' : tx.status === 'blocked' ? '🚫' : '📤'}
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: tx.status === 'blocked' ? '#ef4444' : 'inherit' }}>
                        {tx.description}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{dateStr}</div>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: tx.status === 'blocked' ? '#ef4444' : isNegative ? '#0f172a' : '#10b981', textDecoration: tx.status === 'blocked' ? 'line-through' : 'none' }}>
                    {isNegative ? '-' : '+'}{fmtShort(tx.amount)}
                </div>
                <div style={{ fontSize: 12, color: tx.status === 'blocked' ? '#ef4444' : isSuccess ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                    {tx.status === 'blocked' ? 'Bị chặn' : isSuccess ? 'Thành công' : 'Đang xử lý'}
                </div>
            </div>
        </div>
    );
};

export default function TransactionsPage({ transactions }) {
    const [histFilter, setHistFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTx = useMemo(() => transactions.filter(tx => {
        const mFilter = histFilter === 'all' ? true
            : histFilter === 'blocked' ? (tx.status === 'blocked' || ['exploit', 'wipe', 'data_tamper'].includes(tx.type))
                : tx.type === histFilter;
        const mSearch = !searchQuery || (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) || (tx.ipAddress && tx.ipAddress.includes(searchQuery));
        return mFilter && mSearch;
    }), [transactions, histFilter, searchQuery]);

    return (
        <div className="pg-panel pg-shadow-md pg-hover-elevate">
            <div className="pg-panel-header">
                <div>
                    <div className="pg-panel-title">Lịch sử giao dịch</div>
                    <div className="pg-panel-sub">{filteredTx.length} giao dịch</div>
                </div>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
                <div className="pg-filter-tabs">
                    {[['all', 'Tất cả'], ['deposit', 'Nạp tiền'], ['transfer', 'Chuyển tiền'], ['withdraw', 'Rút tiền'], ['blocked', 'Bị chặn']].map(([f, l]) => (
                        <button key={f} className={`pg-filter-tab${histFilter === f ? ` active${f === 'blocked' ? ' danger-tab' : ''}` : ''}`} onClick={() => setHistFilter(f)}>{l}</button>
                    ))}
                </div>
                <div className="pg-search-wrap">
                    <span className="pg-search-icon">🔍</span>
                    <input className="pg-search-input" placeholder="Tìm theo mô tả..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="pg-tx-list">
                    {filteredTx.length > 0
                        ? filteredTx.map((tx, i) => <TxItem key={tx._id || i} tx={tx} />)
                        : <div className="pg-empty"><div className="pg-empty-icon">🔍</div><div className="pg-empty-title">Không tìm thấy giao dịch</div><div className="pg-empty-sub">Thử thay đổi bộ lọc</div></div>
                    }
                </div>
            </div>
        </div>
    );
}
