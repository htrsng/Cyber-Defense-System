import React, { useState, useEffect } from 'react';
import './LandingPage.css';

export default function LandingPage({ onLoginClick }) {
  const [demoProgress, setDemoProgress] = useState(100);
  const [demoStatus, setDemoStatus] = useState('BLOCKED');

  return (
    <div className="landing-wrapper">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="nav-left">
          <a href="#" className="nav-logo">
            <div className="radar-pulse"></div>
            CYBERDEF
          </a>
          <div className="nav-menu">
            <a href="#features">Features</a>
            <a href="#pipeline">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Docs</a>
            <a href="#blog">Blog</a>
          </div>
        </div>
        <div className="nav-links">
          <button className="btn btn-outline" onClick={onLoginClick}>Log In</button>
          <button className="btn btn-primary" onClick={onLoginClick}>Start 14-day Trial</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero landing-section">
        <div className="hero-content">
          <div className="hero-badge">
            AI-POWERED SECURITY PLATFORM
          </div>
          <h1>
            Bảo vệ website khỏi<br /><em>tin tặc</em> với<br />độ trễ 18ms.
          </h1>
          <p>
            Ngăn chặn tự động Botnet, SQL Injection, và DDoS.
            Tích hợp chỉ với 1 dòng code, giám sát toàn diện bằng AI Threat Engine.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }} onClick={onLoginClick}>Bảo vệ ngay hôm nay</button>
            <button className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '15px' }} onClick={onLoginClick}>Xem Live Demo</button>
          </div>
        </div>

        {/* Realtime Security Dashboard Mockup */}
        <div className="hero-dashboard-wrapper">
          <div className="hero-dashboard">
            <div className="scan-line"></div>
            <div className="dash-header">
              <div className="dash-stat">
                <div className="dash-stat-val">127</div>
                <div className="dash-stat-label">Threats Blocked Today</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-val">18/100</div>
                <div className="dash-stat-label">Risk Score</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-val" style={{color: 'var(--success)'}}>99.9%</div>
                <div className="dash-stat-label">Uptime</div>
              </div>
            </div>
            <div className="dash-events">
              <div className="dash-event">
                <div className="dash-event-info">
                  <span className="dash-event-type">SQL Injection Attempt</span>
                  <span className="mono-text" style={{ fontSize: '12px', color: 'var(--text2)' }}>IP: 103.45.67.89</span>
                </div>
                <span className="dash-event-status status-blocked">BLOCKED</span>
              </div>
              <div className="dash-event">
                <div className="dash-event-info">
                  <span className="dash-event-type">Botnet DDoS Pattern</span>
                  <span className="mono-text" style={{ fontSize: '12px', color: 'var(--text2)' }}>IP: 185.220.x.x</span>
                </div>
                <span className="dash-event-status status-blocked">TARPITTED</span>
              </div>
              <div className="dash-event">
                <div className="dash-event-info">
                  <span className="dash-event-type">Path Scan /wp-admin</span>
                  <span className="mono-text" style={{ fontSize: '12px', color: 'var(--text2)' }}>IP: 45.142.x.x</span>
                </div>
                <span className="dash-event-status status-blocked">HONEYPOT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="trust-section">
        <div className="trust-label">ĐƯỢC TIN DÙNG BỞI CÁC HỆ THỐNG HÀNG ĐẦU</div>
        <div className="trust-metrics">
          <div>
            <div className="metric-val">3</div>
            <div className="metric-label">Active Tenants</div>
          </div>
          <div>
            <div className="metric-val">127</div>
            <div className="metric-label">Threats Blocked</div>
          </div>
          <div>
            <div className="metric-val">99.99%</div>
            <div className="metric-label">Uptime SLA</div>
          </div>
          <div>
            <div className="metric-val">18ms</div>
            <div className="metric-label">Avg Detection Time</div>
          </div>
        </div>
      </section>

      {/* DEFENSE PIPELINE */}
      <section id="pipeline" className="pipeline-section landing-section">
        <div className="section-header">
          <span className="section-eyebrow">Multi-layer Defense</span>
          <h2 className="section-title">Luồng phòng thủ 4 lớp tự động</h2>
        </div>
        
        <div className="pipeline-container">
          <div className="pipeline-line-active"></div>
          
          <div className="pipeline-node" style={{ background: '#111', color: '#fff', padding: '16px', borderRadius: '50%', width: 140, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🌍</span>
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>Internet<br/>Traffic</span>
          </div>
          <div className="pipeline-node" style={{ background: 'rgba(0, 212, 255, 0.1)', border: '2px solid var(--accent)', color: '#fff', padding: '16px', borderRadius: '50%', width: 140, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🧠</span>
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>AI Risk<br/>Engine</span>
          </div>
          <div className="pipeline-node" style={{ background: '#111', color: '#fff', padding: '16px', borderRadius: '50%', width: 140, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🍯</span>
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>Honeypot<br/>Traps</span>
          </div>
          <div className="pipeline-node" style={{ background: '#111', color: '#fff', padding: '16px', borderRadius: '50%', width: 140, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🕸️</span>
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>Tarpit<br/>Delay</span>
          </div>
          <div className="pipeline-node" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '2px solid var(--success)', color: '#fff', padding: '16px', borderRadius: '50%', width: 140, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🛡️</span>
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>Clean<br/>Server</span>
          </div>
        </div>
      </section>

      {/* AI INTELLIGENCE & DEMO */}
      <section id="features" className="ai-demo-section landing-section">
        <div>
          <span className="section-eyebrow">AI Threat Intelligence</span>
          <h2 className="section-title">Giám sát liên tục hàng ngàn request</h2>
          <ul className="ai-checklist">
            <li>Nhận diện mẫu (Pattern Recognition) chặn Botnet tự động.</li>
            <li>Ngăn chặn SQL Injection & XSS Payload ngay tại biên (Edge).</li>
            <li>Phòng thủ Credential Stuffing & Brute Force đa tầng.</li>
            <li>Kiểm soát DDoS Application Layer tinh vi.</li>
            <li>Báo cáo thông minh xuất ra định dạng PDF.</li>
          </ul>
        </div>
        
        <div className="demo-attack-box" style={{ border: '2px solid var(--danger)' }}>
          <div className="demo-title">INCOMING ATTACK DETECTED</div>
          <div className="mono-text demo-ip">185.22.143.99</div>
          <div className="demo-type">Payload: <code>' OR 1=1 --</code> (SQL Injection)</div>
          
          <div className="demo-progress-bg">
            <div className="demo-progress-bar" style={{ width: `${demoProgress}%` }}></div>
          </div>
          
          <div className="demo-status">
            <span style={{ color: 'var(--text2)' }}>Analyzing Risk...</span>
            <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
              BLOCKED
            </span>
          </div>
          
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--mono-font)', color: 'var(--danger)' }}>
            [✓] Connection forcefully reset by CyberDef.<br />
            [✓] IP Address permanently blacklisted.
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section landing-section">
        <div className="section-header">
          <span className="section-eyebrow">BẢNG GIÁ DOANH NGHIỆP</span>
          <h2 className="section-title">Đầu tư nhỏ, bảo mật tối đa</h2>
        </div>
        
        <div className="pricing-grid">
          {/* FREE */}
          <div className="pricing-card">
            <div className="pricing-tier">FREE</div>
            <div className="pricing-desc">Bảo vệ cơ bản cho website cá nhân.</div>
            <div className="pricing-price">$0<span> /mo</span></div>
            <ul className="pricing-features">
              <li>1 Website</li>
              <li>1,000 req/day</li>
              <li>Basic WAF</li>
              <li>Threat Logs</li>
              <li>Community Support</li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: 'auto' }} onClick={onLoginClick}>Bắt đầu Miễn phí</button>
          </div>

          {/* PRO */}
          <div className="pricing-card">
            <div className="pricing-tier" style={{ color: 'var(--accent)' }}>PRO</div>
            <div className="pricing-desc">Ngăn chặn gian lận, Giảm rủi ro tài chính, Bảo vệ tài khoản. Từ 300 ₫/ngày.</div>
            <div className="pricing-price">$9<span> /mo</span></div>
            <ul className="pricing-features">
              <li>10 Websites</li>
              <li>100,000 req/day</li>
              <li>Advanced WAF</li>
              <li>Risk Scoring</li>
              <li>Email Alerts</li>
              <li>Analytics Dashboard</li>
              <li>Basic Fraud Detection</li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: 'auto' }} onClick={onLoginClick}>Dùng thử 14 ngày</button>
          </div>

          {/* BUSINESS */}
          <div className="pricing-card featured">
            <div className="pricing-badge">RECOMMENDED</div>
            <div className="pricing-tier" style={{ color: 'var(--success)' }}>BUSINESS</div>
            <div className="pricing-desc">Bảo vệ ví điện tử, Bảo vệ API thanh toán, Ngăn giao dịch bất thường.</div>
            <div className="pricing-price">$29<span> /mo</span></div>
            <ul className="pricing-features">
              <li>50 Websites</li>
              <li>1M req/day</li>
              <li>Advanced Fraud Engine</li>
              <li>Honeypot & Tarpit</li>
              <li>Geo Blocking</li>
              <li>Attack Intelligence</li>
              <li>Security Reports</li>
              <li>API Access</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', background: 'var(--success)', color: '#000', border: 'none' }} onClick={onLoginClick}>Dùng thử 14 ngày</button>
          </div>

          {/* ENTERPRISE */}
          <div className="pricing-card">
            <div className="pricing-tier">ENTERPRISE</div>
            <div className="pricing-desc">Dành cho ngân hàng, Fintech, Sàn thương mại điện tử.</div>
            <div className="pricing-price" style={{ fontSize: 32, marginTop: 16 }}>Liên hệ</div>
            <ul className="pricing-features">
              <li>Unlimited Websites</li>
              <li>Unlimited Requests</li>
              <li>Dedicated Cluster</li>
              <li>Custom Rule Engine</li>
              <li>SOC Support 24/7</li>
              <li>SLA 99.9%</li>
              <li>Audit Export & Compliance Reports</li>
              <li>Dedicated IP</li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: 'auto', background: '#f3f4f6', color: '#000' }} onClick={onLoginClick}>Liên hệ Sale</button>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="landing-section" style={{ paddingTop: 0 }}>
        <div className="roi-section">
          <div style={{ color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 16 }}>BÀI TOÁN KINH TẾ (Ví dụ với 100,000 người dùng)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>CyberDef PRO</div>
              <div style={{ color: 'var(--text2)' }}>$9/tháng (~230.000 ₫)</div>
            </div>
            <div className="roi-arrow">→</div>
            <div>
              <div style={{ color: 'var(--text2)' }}>Ước tính thiệt hại được ngăn chặn</div>
              <div className="roi-highlight">Lên tới 4.2 tỷ ₫/tháng*</div>
            </div>
          </div>
          <div style={{ marginTop: 32, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'inline-block' }}>
            <span style={{ color: 'var(--text2)', marginRight: 16 }}>Tỷ suất hoàn vốn:</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>ROI x18,000</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text2)', opacity: 0.7 }}>
            * Dựa trên mô hình giả lập của PayGuard và thống kê giao dịch bất thường.
          </div>
        </div>

        {/* COMPARISON */}
        <div className="compare-section">
          <div className="section-header" style={{ marginBottom: 40 }}>
            <h2 className="section-title" style={{ fontSize: 32 }}>Tối ưu chi phí vận hành bảo mật</h2>
          </div>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Tính năng / Lợi ích</th>
                <th style={{ color: 'var(--text2)' }}>Truyền thống<br/><span style={{ fontSize: 12, fontWeight: 400 }}>(Tự xây dựng)</span></th>
                <th style={{ color: 'var(--accent)' }}>CyberDef PRO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chi phí vận hành</td>
                <td style={{ color: 'var(--danger)', fontWeight: 600 }}>~50-100 triệu ₫/tháng</td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>$9/tháng (~230K ₫)</td>
              </tr>
              <tr>
                <td>Khả năng bảo vệ 24/7 tự động</td>
                <td style={{ opacity: 0.5 }}>❌ Hạn chế</td>
                <td style={{ color: 'var(--success)' }}>✅ Tự động 100%</td>
              </tr>
              <tr>
                <td>Web Application Firewall (WAF)</td>
                <td style={{ opacity: 0.5 }}>❌ Cần cấu hình thủ công</td>
                <td style={{ color: 'var(--success)' }}>✅ Tích hợp AI</td>
              </tr>
              <tr>
                <td>Fraud Detection (Phát hiện gian lận)</td>
                <td style={{ opacity: 0.5 }}>❌ Phức tạp</td>
                <td style={{ color: 'var(--success)' }}>✅ Out-of-the-box</td>
              </tr>
              <tr>
                <td>Honeypot & Threat Analytics</td>
                <td style={{ opacity: 0.5 }}>❌ Tốn kém chi phí Dev</td>
                <td style={{ color: 'var(--success)' }}>✅ Có sẵn</td>
              </tr>
            </tbody>
          </table>
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 18, fontWeight: 600, color: 'var(--success)' }}>
            ✨ Tiết kiệm hơn 99.5% chi phí vận hành bảo mật.
          </div>
        </div>
      </section>

      {/* NEW TRUST METRICS */}
      <section className="trust-section" style={{ borderTop: 'none' }}>
        <div className="trust-label" style={{ fontSize: 16, color: 'var(--text)' }}>ĐƯỢC TIN DÙNG ĐỂ BẢO VỆ</div>
        <div className="trust-metrics" style={{ marginTop: 32 }}>
          <div>
            <div className="metric-val" style={{ color: 'var(--accent)' }}>124,592</div>
            <div className="metric-label">Tài khoản được bảo vệ</div>
          </div>
          <div>
            <div className="metric-val" style={{ color: 'var(--success)' }}>52</div>
            <div className="metric-label">Giao dịch gian lận bị chặn</div>
          </div>
          <div>
            <div className="metric-val" style={{ color: 'var(--danger)' }}>284</div>
            <div className="metric-label">Cuộc tấn công bị vô hiệu hóa</div>
          </div>
          <div>
            <div className="metric-val" style={{ color: 'var(--accent)' }}>99.99%</div>
            <div className="metric-label">Uptime Hệ thống</div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h2 style={{ fontSize: 40, marginBottom: 16 }}>Bảo vệ hệ thống của bạn ngay hôm nay</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 32, fontSize: 18 }}>Tích hợp trong 5 phút. Không cần thẻ tín dụng.</p>
        <button className="btn btn-primary" style={{ padding: '16px 40px', fontSize: 18 }} onClick={onLoginClick}>Bắt đầu miễn phí ngay hôm nay</button>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="nav-logo">CYBERDEF</div>
        <p>© 2026 CyberDef SaaS Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
