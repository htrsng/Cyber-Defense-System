import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update TxItem
tx_item_orig = """function TxItem({ tx }) {
  const isCredit = tx.type === 'deposit';
  const isBlocked = tx.status === 'blocked' || ['exploit', 'wipe', 'data_tamper'].includes(tx.type);
  const iconKey = isBlocked ? 'blocked' : (TX_ICONS[tx.type] ? tx.type : 'default');
  return (
    <div className="pg-tx-item pg-shadow-sm pg-hover-elevate">
      <div className={`pg-tx-icon ${isBlocked ? 'blocked' : (tx.type || 'default')}`}>{TX_ICONS[iconKey] || TX_ICONS.default}</div>
      <div className="pg-tx-info">
        <div className="pg-tx-desc">{tx.description || tx.type}</div>
        <div className="pg-tx-meta">
          {format(new Date(tx.createdAt || Date.now()), 'dd/MM/yyyy HH:mm')}
          {tx.ipAddress && tx.ipAddress !== '127.0.0.1' && ` · IP: ${tx.ipAddress}`}
        </div>
      </div>
      <div className="pg-tx-right">
        <div className={`pg-tx-amount ${isCredit ? 'credit' : 'debit'}`}>
          {isCredit ? '+' : '-'}{fmtVND(tx.amount)}
        </div>
        <div className="pg-tx-status">
          <span className={`pg-badge ${isBlocked ? 'danger' : tx.status === 'success' ? 'success' : 'warning'}`}>
            {isBlocked ? 'Bị chặn' : tx.status === 'success' ? 'Thành công' : 'Thất bại'}
          </span>
          {tx.riskScore > 0 && <span className="pg-badge muted" style={{ marginLeft: 4 }}>Risk {tx.riskScore}</span>}
        </div>
      </div>
    </div>
  );
}"""

tx_item_new = """function TxItem({ tx }) {
  const isCredit = tx.type === 'deposit';
  const isBlocked = tx.status === 'blocked' || ['exploit', 'wipe', 'data_tamper'].includes(tx.type);
  const iconKey = isBlocked ? 'blocked' : (TX_ICONS[tx.type] ? tx.type : 'default');
  
  let catName = 'Giao dịch';
  let catIcon = TX_ICONS[iconKey] || TX_ICONS.default;
  let catColor = '#94a3b8';
  
  if (tx.description?.toLowerCase().includes('mua hàng')) { catName = 'Mua sắm'; catIcon = '🛍️'; catColor = '#f472b6'; }
  else if (tx.description?.toLowerCase().includes('ăn')) { catName = 'Ăn uống'; catIcon = '🍔'; catColor = '#10b981'; }
  else if (tx.description?.toLowerCase().includes('nạp tiền')) { catName = 'Tiết kiệm'; catIcon = '💰'; catColor = '#fbbf24'; }
  else if (tx.description?.toLowerCase().includes('rút tiền')) { catName = 'Ngân hàng'; catIcon = '🏦'; catColor = '#0284c7'; }
  
  if (isBlocked) { catName = 'Bị chặn'; catIcon = '🚫'; catColor = '#e11d48'; }

  return (
    <div className="pg-tx-item pg-shadow-sm pg-hover-elevate">
      <div className="pg-tx-icon" style={{ background: `${catColor}22`, fontSize: 20 }}>{catIcon}</div>
      <div className="pg-tx-info">
        <div className="pg-tx-merchant">{tx.description || tx.type}</div>
        <div className="pg-tx-cat">
          <span style={{ color: catColor, fontWeight: 700 }}>{catName}</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>{format(new Date(tx.createdAt || Date.now()), 'dd/MM/yyyy HH:mm')}</span>
          {tx.ipAddress && tx.ipAddress !== '127.0.0.1' && <><span style={{ opacity: 0.5 }}>•</span><span>IP: {tx.ipAddress}</span></>}
        </div>
      </div>
      <div className="pg-tx-right">
        <div className={`pg-tx-amount ${isCredit ? 'credit' : 'debit'}`}>
          {isCredit ? '+' : '-'}{fmtVND(tx.amount)}
        </div>
        <div className="pg-tx-status">
          <span className={`pg-badge ${isBlocked ? 'danger' : tx.status === 'success' ? 'success' : 'warning'}`}>
            {isBlocked ? 'Bị chặn' : tx.status === 'success' ? 'Thành công' : 'Thất bại'}
          </span>
          {tx.riskScore > 0 && <span className="pg-badge muted" style={{ marginLeft: 4 }}>Risk {tx.riskScore}</span>}
        </div>
      </div>
    </div>
  );
}"""
content = content.replace(tx_item_orig, tx_item_new)

# 2. Update Transfer Page
transfer_orig = """          {page === 'transfer' && (
            <div className="pg-transfer-grid">
              <div className="pg-panel pg-shadow-md pg-hover-elevate">
                <div className="pg-panel-title" style={{ marginBottom: 24 }}>Chuyển tiền</div>
                <form className="pg-form" onSubmit={handleTransfer}>
                  <div>
                    <div className="pg-field-label">Người nhận gần đây</div>
                    <div className="pg-recent-recipients">
                      {RECIPIENTS.map(r => (
                        <div key={r.account} className="pg-recipient-btn" onClick={() => setTForm(f => ({ ...f, toAccount: r.account }))}>
                          <div className="pg-recipient-avatar" style={{ background: `${r.color}22` }}>{r.avatar}</div>
                          <div className="pg-recipient-name">{r.name.split(' ').pop()}</div>
                          <div className="pg-recipient-acct">{r.account}</div>
                        </div>
                      ))}
                    </div>
                  </div>"""

transfer_new = """          {page === 'transfer' && (
            <div className="pg-transfer-grid">
              <div className="pg-panel pg-shadow-md pg-hover-elevate">
                <div className="pg-panel-title" style={{ marginBottom: 24 }}>Chuyển khoản</div>
                
                <div className="pg-step-indicator">
                  <div className="pg-step-line" />
                  <div className="pg-step active">
                    <div className="pg-step-circle">1</div>
                    <div className="pg-step-label">Thông tin</div>
                  </div>
                  <div className="pg-step">
                    <div className="pg-step-circle">2</div>
                    <div className="pg-step-label">Xác nhận</div>
                  </div>
                  <div className="pg-step">
                    <div className="pg-step-circle">3</div>
                    <div className="pg-step-label">Hoàn tất</div>
                  </div>
                </div>

                <form className="pg-form" onSubmit={handleTransfer}>
                  <div>
                    <div className="pg-field-label">Người nhận gần đây</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {RECIPIENTS.map(r => (
                        <div key={r.account} className={`pg-recipient-card ${tForm.toAccount === r.account ? 'active' : ''}`} onClick={() => setTForm(f => ({ ...f, toAccount: r.account, bank: 'Vietcombank' }))}>
                          <div className="pg-recipient-avatar" style={{ background: `${r.color}22`, fontSize: 24, width: 44, height: 44 }}>{r.avatar}</div>
                          <div>
                            <div className="pg-recipient-name" style={{ fontSize: 14, color: 'var(--pg-text)' }}>{r.name}</div>
                            <div className="pg-recipient-acct" style={{ fontSize: 11, color: 'var(--pg-text-3)', marginTop: 2 }}>Vietcombank • {r.account}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>"""

content = content.replace(transfer_orig, transfer_new)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
