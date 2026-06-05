import React, { useState, useEffect } from 'react';
import './LandingPage.css';

export default function LandingPage({ onLoginClick }) {
  const [attacks, setAttacks] = useState(126);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoStatus, setDemoStatus] = useState('SCANNING');

  useEffect(() => {
    // Randomly increment attacks
    const attackTimer = setInterval(() => {
      if (Math.random() > 0.6) setAttacks(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);

    // Demo Attack Animation Loop
    const runDemo = () => {
      setDemoProgress(0);
      setDemoStatus('DETECTING...');
      
      setTimeout(() => setDemoProgress(30), 500);
      setTimeout(() => setDemoProgress(65), 1200);
      setTimeout(() => setDemoProgress(95), 2000);
      setTimeout(() => {
        setDemoProgress(100);
        setDemoStatus('BLOCKED');
      }, 2500);
    };

    runDemo();
    const demoTimer = setInterval(runDemo, 6000);

    return () => {
      clearInterval(attackTimer);
      clearInterval(demoTimer);
    };
  }, []);

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
                <div className="dash-stat-val">{attacks}</div>
                <div className="dash-stat-label">Threats Blocked</div>
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
            <div className="metric-val">500+</div>
            <div className="metric-label">Websites Protected</div>
          </div>
          <div>
            <div className="metric-val">2.3M+</div>
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
          
          <div className="pipeline-node">
            <span className="pipeline-icon">🌍</span>
            <span className="pipeline-label">Internet<br/>Traffic</span>
          </div>
          <div className="pipeline-node" style={{ borderColor: 'var(--accent)', background: 'rgba(0, 212, 255, 0.05)' }}>
            <span className="pipeline-icon">🧠</span>
            <span className="pipeline-label">AI Risk<br/>Engine</span>
          </div>
          <div className="pipeline-node">
            <span className="pipeline-icon">🍯</span>
            <span className="pipeline-label">Honeypot<br/>Traps</span>
          </div>
          <div className="pipeline-node">
            <span className="pipeline-icon">🕸️</span>
            <span className="pipeline-label">Tarpit<br/>Delay</span>
          </div>
          <div className="pipeline-node" style={{ borderColor: 'var(--success)' }}>
            <span className="pipeline-icon">🛡️</span>
            <span className="pipeline-label">Clean<br/>Server</span>
          </div>
        </div>
      </section>

      {/* AI INTELLIGENCE & DEMO */}
      <section id="features" className="ai-demo-section landing-section">
        <div>
          <span className="section-eyebrow">AI Threat Intelligence</span>
          <h2 className="section-title">Phân tích 2.3 triệu request mỗi ngày</h2>
          <ul className="ai-checklist">
            <li>Nhận diện mẫu (Pattern Recognition) chặn Botnet tự động.</li>
            <li>Ngăn chặn SQL Injection & XSS Payload ngay tại biên (Edge).</li>
            <li>Phòng thủ Credential Stuffing & Brute Force đa tầng.</li>
            <li>Kiểm soát DDoS Application Layer tinh vi.</li>
            <li>Báo cáo thông minh xuất ra định dạng PDF.</li>
          </ul>
        </div>
        
        <div className="demo-attack-box">
          <div className="demo-title">INCOMING ATTACK DETECTED</div>
          <div className="mono-text demo-ip">185.22.143.99</div>
          <div className="demo-type">Payload: <code>' OR 1=1 --</code> (SQL Injection)</div>
          
          <div className="demo-progress-bg">
            <div className="demo-progress-bar" style={{ width: `${demoProgress}%` }}></div>
          </div>
          
          <div className="demo-status">
            <span style={{ color: 'var(--text2)' }}>Analyzing Risk...</span>
            <span style={{ color: demoStatus === 'BLOCKED' ? 'var(--danger)' : 'var(--accent)', fontWeight: 'bold' }}>
              {demoStatus}
            </span>
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
          {/* STARTER */}
          <div className="pricing-card">
            <div className="pricing-tier">Starter</div>
            <div className="pricing-desc">Hoàn hảo cho website cá nhân hoặc blog.</div>
            <div className="pricing-price">$0<span> /mo</span></div>
            <ul className="pricing-features">
              <li>10,000 requests / tháng</li>
              <li>Bảo vệ Brute Force cơ bản</li>
              <li>Community Support</li>
            </ul>
            <button className="btn-pricing ghost" onClick={onLoginClick}>Bắt đầu Miễn phí</button>
          </div>

          {/* PRO */}
          <div className="pricing-card featured">
            <div className="pricing-badge">RECOMMENDED</div>
            <div className="pricing-tier" style={{ color: 'var(--accent)' }}>Pro</div>
            <div className="pricing-desc">Cho doanh nghiệp vừa và nhỏ (SMEs).</div>
            <div className="pricing-price">$29<span> /mo</span></div>
            <ul className="pricing-features">
              <li>1,000,000 requests / tháng</li>
              <li>Full AI Risk Scorer</li>
              <li>Tarpit & Honeypot Active</li>
              <li>PDF Reports & Telegram Alerts</li>
            </ul>
            <button className="btn-pricing accent" onClick={onLoginClick}>Dùng thử 14 ngày</button>
          </div>

          {/* ENTERPRISE */}
          <div className="pricing-card">
            <div className="pricing-tier">Enterprise</div>
            <div className="pricing-desc">Hệ thống phân tán cần bảo vệ tối đa.</div>
            <div className="pricing-price">$199<span> /mo</span></div>
            <ul className="pricing-features">
              <li>Unlimited requests</li>
              <li>Custom Rules (WAF)</li>
              <li>Dedicated Account Manager</li>
              <li>SLA 99.99% Uptime</li>
            </ul>
            <button className="btn-pricing solid" onClick={onLoginClick}>Liên hệ Sale</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="nav-logo">CYBERDEF</div>
        <p>© 2026 CyberDef SaaS Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
