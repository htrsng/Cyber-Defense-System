import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Sidebar
sidebar_original = """            <div className="pg-user-card">
              <div className="pg-user-avatar">T</div>
              <div>
                <div className="pg-user-name">Trang</div>
                <div className="pg-user-role">Quản trị viên</div>
              </div>
            </div>"""
sidebar_new = """            <div className="pg-user-card">
              <div className="pg-user-avatar">T</div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--pg-text-3)', fontWeight: 600 }}>Good Evening,</div>
                <div className="pg-user-name">Trang</div>
              </div>
            </div>
            
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--pg-glass)', borderRadius: 'var(--r-md)', border: '1px solid var(--pg-border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pg-text-2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Financial Health</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 999 }}>
                  <div style={{ width: '82%', height: '100%', background: 'var(--pg-primary)', borderRadius: 999 }}></div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--pg-mono)' }}>82<span style={{ fontSize: 10, opacity: 0.6 }}>/100</span></div>
              </div>
            </div>"""
content = content.replace(sidebar_original, sidebar_new)

# 2. Balance Card Trend
balance_card_orig = """                  <div className="pg-balance">{fmtVND(wallet?.balance || 0)}</div>"""
balance_card_new = """                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <div className="pg-balance">{fmtVND(wallet?.balance || 0)}</div>
                    <div className="pg-balance-trend">↑ 12%</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, opacity: 0.8, marginTop: 6 }}>So với tháng trước (Tăng 4.2M)</div>"""
content = content.replace(balance_card_orig, balance_card_new)

# 3. KPI Cards
kpi_orig = """          <div className="pg-stats-row">
            <div className="pg-stat-card">
              <div className="pg-stat-header">
                <div className="pg-stat-icon indigo">📊</div>
                <div className="pg-stat-trend neutral">Hôm nay</div>
              </div>
              <div>
                <div className="pg-stat-label">Giao dịch</div>
                <div className="pg-stat-value">{attackStats.total}</div>
              </div>
            </div>
            <div className="pg-stat-card">
              <div className="pg-stat-header">
                <div className="pg-stat-icon red">🛡️</div>
                <div className="pg-stat-trend neutral">Hôm nay</div>
              </div>
              <div>
                <div className="pg-stat-label">Đã chặn</div>
                <div className="pg-stat-value" style={{ color: attackStats.blocked > 0 ? '#e11d48' : undefined }}>{attackStats.blocked}</div>
              </div>
            </div>
            <div className="pg-stat-card">
              <div className="pg-stat-header">
                <div className="pg-stat-icon amber">⚠️</div>
                <div className="pg-stat-trend neutral">Real-time</div>
              </div>
              <div>
                <div className="pg-stat-label">Risk Score</div>
                <div className="pg-stat-value" style={{ color: riskColor, fontFamily: 'var(--pg-mono)' }}>{riskScore}</div>
              </div>
            </div>
            <div className="pg-stat-card">
              <div className="pg-stat-header">
                <div className="pg-stat-icon green">💰</div>
                <div className="pg-stat-trend up">+1.2%</div>
              </div>
              <div>
                <div className="pg-stat-label">Thu nhập</div>
                <div className="pg-stat-value">42.5M</div>
              </div>
            </div>
          </div>"""

kpi_new = """          <div className="pg-stats-row">
            <div className="pg-stat-card pg-shadow-md pg-hover-elevate">
              <div className="pg-stat-header">
                <div className="pg-stat-icon indigo" style={{ fontSize: 24, width: 44, height: 44 }}>💳</div>
                <div className="pg-stat-trend up">↑ 8%</div>
              </div>
              <div>
                <div className="pg-stat-label">Giao dịch hôm nay</div>
                <div className="pg-stat-value">{attackStats.total}</div>
              </div>
            </div>
            <div className="pg-stat-card pg-shadow-md pg-hover-elevate">
              <div className="pg-stat-header">
                <div className="pg-stat-icon red" style={{ fontSize: 24, width: 44, height: 44 }}>🛡️</div>
                <div className="pg-stat-trend down">↓ 2%</div>
              </div>
              <div>
                <div className="pg-stat-label">Đã chặn</div>
                <div className="pg-stat-value" style={{ color: attackStats.blocked > 0 ? '#e11d48' : undefined }}>{attackStats.blocked}</div>
              </div>
            </div>
            <div className="pg-stat-card pg-shadow-md pg-hover-elevate">
              <div className="pg-stat-header">
                <div className="pg-stat-icon amber" style={{ fontSize: 24, width: 44, height: 44 }}>🎯</div>
                <div className="pg-stat-trend up" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>SAFE</div>
              </div>
              <div>
                <div className="pg-stat-label">Risk Score</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div className="pg-stat-value" style={{ color: riskColor, fontFamily: 'var(--pg-mono)' }}>{riskScore}</div>
                  <div style={{ fontSize: 12, color: 'var(--pg-success)', fontWeight: 600 }}>↓ 15%</div>
                </div>
              </div>
            </div>
            <div className="pg-stat-card pg-shadow-md pg-hover-elevate">
              <div className="pg-stat-header">
                <div className="pg-stat-icon green" style={{ fontSize: 24, width: 44, height: 44 }}>💰</div>
                <div className="pg-stat-trend up">↑ 1.2%</div>
              </div>
              <div>
                <div className="pg-stat-label">Thu nhập</div>
                <div className="pg-stat-value">42.5M</div>
              </div>
            </div>
          </div>"""
content = content.replace(kpi_orig, kpi_new)

# Shadows and classes
content = content.replace('className="pg-hero"', 'className="pg-hero pg-shadow-xl pg-hover-elevate"')
content = content.replace('className="pg-panel"', 'className="pg-panel pg-shadow-md pg-hover-elevate"')
content = content.replace('className="pg-risk-panel"', 'className="pg-risk-panel pg-shadow-md"')
content = content.replace('className="pg-tx-item"', 'className="pg-tx-item pg-shadow-sm pg-hover-elevate"')

# 4. Donut Chart
donut_orig = """                  <PieChart width={140} height={140}>
                    <Pie data={SPENDING_DATA} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="spent">
                      {SPENDING_DATA.map((e, i) => <Cell key={i} fill={e.color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.1)', borderRadius: 12, fontSize: 12 }}
                      itemStyle={{ color: '#0f172a' }}
                      formatter={(val) => fmtVND(val)}
                    />
                  </PieChart>
                </div>
                <div className="pg-chart-legend">
                  {SPENDING_DATA.map(e => (
                    <div key={e.name} className="pg-legend-item">
                      <div className="pg-legend-left">
                        <div className="pg-legend-dot" style={{ background: e.color }} />
                        <div className="pg-legend-name">{e.name}</div>
                      </div>
                      <div className="pg-legend-vals">
                        <div className="pg-legend-spent">{fmtShort(e.spent)}</div>
                        <div className="pg-legend-budget">/ {fmtShort(e.budget)}</div>
                      </div>
                    </div>
                  ))}
                </div>"""

donut_new = """                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <PieChart width={220} height={220}>
                      <Pie data={SPENDING_DATA} innerRadius={80} outerRadius={105} paddingAngle={4} dataKey="spent">
                        {SPENDING_DATA.map((e, i) => <Cell key={i} fill={e.color} stroke="#ffffff" strokeWidth={3} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.1)', borderRadius: 12, fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                        formatter={(val) => fmtVND(val)}
                      />
                    </PieChart>
                    <div className="pg-donut-center">
                      <div className="pg-donut-val">4.6M</div>
                      <div className="pg-donut-lbl">Tổng chi tiêu</div>
                    </div>
                  </div>
                </div>
                <div className="pg-chart-legend">
                  {SPENDING_DATA.map(e => (
                    <div key={e.name} className="pg-legend-item pg-shadow-sm pg-hover-elevate" style={{ padding: '10px 14px', background: 'var(--pg-glass)', borderRadius: 'var(--r-md)', border: '1px solid var(--pg-border)', marginBottom: 8 }}>
                      <div className="pg-legend-left">
                        <div className="pg-legend-dot" style={{ background: e.color, width: 14, height: 14, borderRadius: 6 }} />
                        <div>
                          <div className="pg-legend-name" style={{ fontSize: 14 }}>{e.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--pg-success)', fontWeight: 600 }}>↑ 12%</div>
                        </div>
                      </div>
                      <div className="pg-legend-vals">
                        <div className="pg-legend-spent" style={{ fontSize: 15, color: 'var(--pg-text)' }}>{fmtShort(e.spent)}</div>
                        <div className="pg-legend-budget">/ {fmtShort(e.budget)}</div>
                      </div>
                    </div>
                  ))}
                </div>"""
content = content.replace(donut_orig, donut_new)

# Write back to App.jsx
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
