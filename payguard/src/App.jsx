import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const money = new Intl.NumberFormat('vi-VN');
const fmtVND = (v) => `${money.format(Number(v || 0))} ₫`;
const fmtShort = (v) => {
  const n = Number(v || 0);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ₫`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K ₫`;
  return fmtVND(n);
};

const DEMO_WALLET_STORAGE_KEY = 'payguard:demo-wallet';

function clampWalletBalance(wallet) {
  if (!wallet) return null;
  return {
    ...DEMO_WALLET,
    ...wallet,
    balance: Math.max(0, Number(wallet.balance ?? DEMO_WALLET.balance)),
    categories: Array.isArray(wallet.categories) && wallet.categories.length ? wallet.categories : DEFAULT_CATEGORIES,
  };
}

function readPersistedWallet() {
  try {
    const raw = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
    if (!raw) return null;
    return clampWalletBalance(JSON.parse(raw));
  } catch {
    return null;
  }
}

function persistWallet(wallet) {
  try {
    const next = clampWalletBalance(wallet);
    if (next) localStorage.setItem(DEMO_WALLET_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
}

/* ─── Static data ─── */
const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống', budget: 3000000, spent: 1200000, color: '#82ddaf', icon: '🍜' },
  { name: 'Di chuyển', budget: 1000000, spent: 450000, color: '#fbb1c5', icon: '🚗' },
  { name: 'Mua sắm', budget: 2000000, spent: 800000, color: '#fce4ec', icon: '🛍️' },
  { name: 'Giải trí', budget: 500000, spent: 200000, color: '#f59e0b', icon: '🎮' },
  { name: 'Hóa đơn', budget: 1500000, spent: 1500000, color: '#ef4444', icon: '💡' },
  { name: 'Tiết kiệm', budget: 2000000, spent: 500000, color: '#fbbf24', icon: '💰' },
];

const DEMO_WALLET = {
  balance: 10000000,
  accountNumber: 'PAY-20240601',
  bankLinked: true, bankName: 'Vietcombank', bankAccount: '****3456',
  categories: DEFAULT_CATEGORIES,
  transactions: [
    { _id: '1', type: 'deposit', description: 'Nạp tiền ví', amount: 5000000, status: 'success', ipAddress: '127.0.0.1', riskScore: 0, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: '2', type: 'transfer', description: 'Thanh toán mua hàng', amount: 850000, status: 'success', ipAddress: '10.0.0.12', riskScore: 18, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: '3', type: 'withdraw', description: 'Rút tiền về ngân hàng', amount: 250000, status: 'success', ipAddress: '10.0.0.12', riskScore: 5, createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
};

const RECIPIENTS = [
  { name: 'Nguyễn Văn A', account: 'PAY-00123', avatar: '👨', color: '#fbb1c5' },
  { name: 'Trần Thị B', account: 'PAY-00456', avatar: '👩', color: '#82ddaf' },
  { name: 'Lê Văn C', account: 'PAY-00789', avatar: '🧑', color: '#f59e0b' },
  { name: 'Phạm Thị D', account: 'PAY-00999', avatar: '👧', color: '#fce4ec' },
];

const BANKS = ['Vietcombank', 'Techcombank', 'MBBank', 'TPBank', 'VietinBank', 'BIDV', 'ACB', 'VPBank'];

/* ─── Helpers ─── */
function parseToken(t) {
  if (!t) return null;
  try {
    const p = JSON.parse(atob(t.split('.')[1]));
    return { email: p?.email || 'user@payguard.io', token: t };
  } catch { return { email: 'user@payguard.io', token: t }; }
}

function getRiskColor(s) {
  if (s >= 80) return '#ef4444';
  if (s >= 60) return '#fb923c';
  if (s >= 35) return '#f59e0b';
  if (s >= 15) return '#22d3ee';
  return '#82ddaf';
}
function getRiskLevel(s) {
  if (s >= 80) return 'critical';
  if (s >= 60) return 'high';
  if (s >= 35) return 'medium';
  if (s >= 15) return 'low';
  return 'safe';
}
function getRiskLabel(s) {
  if (s >= 80) return 'CRITICAL';
  if (s >= 60) return 'HIGH';
  if (s >= 35) return 'MEDIUM';
  if (s >= 15) return 'LOW';
  return 'SAFE';
}

/* ─── Animated balance counter ─── */
function useCountUp(target, ms = 700) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  const raf = useRef(null);
  useEffect(() => {
    const start = prev.current, end = target;
    if (start === end) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + (end - start) * e));
      if (p < 1) { raf.current = requestAnimationFrame(tick); }
      else { setVal(end); prev.current = end; }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms]);
  return val;
}

/* ─── Code Shield Modal ─── */
const CODE_LINES = [
  { cmd: 'app.use(cyberDefRateLimit)', comment: '// Đếm & giới hạn request theo IP' },
  { cmd: 'app.use(cyberDefTarpit)', comment: '// Làm chậm bot tấn công tự động' },
  { cmd: 'app.use(cyberDefRiskScorer)', comment: '// Tính điểm nguy cơ AI (0–100)' },
];

function CodeShieldModal({ onClose }) {
  const [visible, setVisible] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timers = CODE_LINES.map((_, i) => setTimeout(() => setVisible(v => v + 1), 700 + i * 950));
    const dt = setTimeout(() => setDone(true), 700 + CODE_LINES.length * 950 + 400);
    return () => { timers.forEach(clearTimeout); clearTimeout(dt); };
  }, []);
  return (
    <div className="pg-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && done) onClose(); }}>
      <div className="pg-modal">
        <div className="pg-modal-icon">🛡</div>
        <div className="pg-modal-title">Kích hoạt bảo mật PayGuard</div>
        <div className="pg-modal-sub">Thêm 3 lớp phòng thủ từ CyberDef AI</div>
        <div className="pg-code-block">
          {CODE_LINES.map((l, i) => (
            <div key={i} className={`pg-code-line${i < visible ? ' visible' : ''}`}>
              <div className="pg-code-cmd">
                <span className="check">{i < visible ? '✓' : '○'}</span>
                {l.cmd}
              </div>
              <div className="pg-code-comment">{l.comment}</div>
            </div>
          ))}
        </div>
        <button className="pg-modal-btn" disabled={!done} onClick={onClose}>
          {done ? '✓ Hoàn tất — Hệ thống đã được bảo vệ' : 'Đang kích hoạt...'}
        </button>
      </div>
    </div>
  );
}

/* ─── Toast ─── */
function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, display: 'grid', gap: 10, width: 'min(360px,calc(100vw - 40px))', zIndex: 200, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'rgba(13,20,36,0.97)',
          border: `1px solid ${t.tone === 'danger' ? 'rgba(239,68,68,.4)' : t.tone === 'success' ? 'rgba(16,185,129,.4)' : 'rgba(245,158,11,.4)'}`,
          borderLeft: `4px solid ${t.tone === 'danger' ? '#ef4444' : t.tone === 'success' ? '#82ddaf' : '#f59e0b'}`,
          borderRadius: 16, padding: '14px 16px',
          boxShadow: '0 16px 48px rgba(0,0,0,.35)',
          animation: 'slide-in-right 300ms ease',
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Spending Donut Chart ─── */
function SpendingChart({ categories }) {
  const data = categories.map(c => ({ name: c.name, value: c.spent, color: c.color }));
  const total = categories.reduce((s, c) => s + c.spent, 0);
  return (
    <div className="pg-chart-wrap">
      <div style={{ width: 180, height: 180, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value" stroke="none">
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip
              formatter={(v) => [fmtVND(v), '']}
              contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.1)', borderRadius: 12, fontSize: 12 }}
              itemStyle={{ color: '#0f172a' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="pg-chart-legend">
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Chi tiêu tháng này</div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>{fmtVND(total)}</div>
        {categories.map(c => {
          const pct = c.budget > 0 ? Math.min(100, Math.round(c.spent / c.budget * 100)) : 0;
          return (
            <div key={c.name} className="pg-legend-item">
              <div className="pg-legend-left">
                <div className="pg-legend-dot" style={{ background: c.color }} />
                <span className="pg-legend-name">{c.icon} {c.name}</span>
              </div>
              <div className="pg-legend-vals">
                <div className="pg-legend-spent">{fmtShort(c.spent)}</div>
                <div className="pg-legend-budget">{pct}% / {fmtShort(c.budget)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Category Modal ─── */
const CAT_EMOJIS = ['🍜','🚗','🛍️','🎮','💡','💰','🏥','📚','✈️','🏠','👕','☕','🎬','💻','🎁','📱'];
const CAT_COLORS = ['#2563eb','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#06b6d4'];

function CategoryModal({ cat, onSave, onClose }) {
  const [form, setForm] = useState({
    name: cat?.name || '',
    icon: cat?.icon || '🍜',
    color: cat?.color || '#2563eb',
    budget: cat?.budget ? String(cat.budget) : '',
  });
  const isEdit = !!cat;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.budget) return;
    onSave({
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      budget: Number(String(form.budget).replace(/[^0-9]/g, '')),
      spent: cat?.spent || 0,
    });
  };

  return (
    <div className="pg-cat-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pg-cat-modal">
        <div className="pg-cat-modal-title">{isEdit ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}</div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <div className="pg-field-label">Chọn biểu tượng</div>
            <div className="pg-emoji-grid">
              {CAT_EMOJIS.map(e => (
                <button type="button" key={e} className={`pg-emoji-btn${form.icon === e ? ' selected' : ''}`} onClick={() => setForm(f => ({ ...f, icon: e }))}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="pg-field-label">Chọn màu sắc</div>
            <div className="pg-color-grid">
              {CAT_COLORS.map(c => (
                <button type="button" key={c} className={`pg-color-btn${form.color === c ? ' selected' : ''}`} style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
              ))}
            </div>
          </div>
          <div>
            <div className="pg-field-label">Tên danh mục</div>
            <input className="pg-input" placeholder="VD: Ăn uống, Xăng xe..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </div>
          <div>
            <div className="pg-field-label">Ngân sách hàng tháng</div>
            <div className="pg-amount-input-wrap">
              <span className="pg-amount-currency">₫</span>
              <input className="pg-input" placeholder="VD: 3000000" inputMode="numeric" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
          </div>
          <div className="pg-modal-btns">
            <button type="button" className="pg-modal-cancel-btn" onClick={onClose}>Hủy</button>
            <button type="submit" className="pg-submit-btn" disabled={!form.name.trim() || !form.budget}>
              {isEdit ? '💾 Lưu thay đổi' : '➕ Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Transaction Item ─── */
const TX_ICONS = { deposit: '💚', transfer: '💸', withdraw: '🏦', blocked: '🚫', exploit: '💀', wipe: '⚠️', default: '📄' };
function TxItem({ tx }) {
  const isCredit = tx.type === 'deposit';
  const isBlocked = tx.status === 'blocked' || ['exploit', 'wipe', 'data_tamper'].includes(tx.type);
  const iconKey = isBlocked ? 'blocked' : (TX_ICONS[tx.type] ? tx.type : 'default');
  
  let catName = 'Giao dịch';
  let catIcon = TX_ICONS[iconKey] || TX_ICONS.default;
  let catColor = '#94a3b8';
  
  if (tx.description?.toLowerCase().includes('mua hàng')) { catName = 'Mua sắm'; catIcon = '🛍️'; catColor = '#fce4ec'; }
  else if (tx.description?.toLowerCase().includes('ăn')) { catName = 'Ăn uống'; catIcon = '🍔'; catColor = '#82ddaf'; }
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
}

/* ─── Feed Item ─── */
function FeedItem({ item }) {
  const cls = item.type === 'success' ? 'success' : item.type === 'tarpit' ? 'tarpit' : item.type === 'blocked' ? 'blocked' : 'info';
  const icon = item.type === 'success' ? '✓' : item.type === 'tarpit' ? '⏱' : item.type === 'blocked' ? '✗' : 'ℹ';
  return (
    <div className={`pg-feed-item ${cls}`}>
      <span className="pg-feed-icon">{icon}</span>
      <span className="pg-feed-text">{item.text}</span>
      {item.elapsed && <span className="pg-feed-elapsed">{item.elapsed}</span>}
      <span className="pg-feed-time">{format(new Date(item.ts || Date.now()), 'HH:mm:ss')}</span>
    </div>
  );
}

/* ─── Login Page ─── */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('tranghuyen20051312@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.message || 'Đăng nhập thất bại');
      localStorage.setItem('token', data.token);
      onLogin(parseToken(data.token));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="pg-login-shell">
      <div className="pg-login-card">
        <div className="pg-login-logo">
          <div className="pg-login-shield">🛡</div>
          <div className="pg-login-title">PayGuard</div>
          <div className="pg-login-sub">Ví điện tử bảo mật thế hệ mới</div>
        </div>
        <form className="pg-login-form" onSubmit={submit}>
          {error && <div className="pg-login-error">⚠ {error}</div>}
          <div>
            <div className="pg-field-label">Email</div>
            <input className="pg-input" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <div className="pg-field-label">Mật khẩu</div>
            <input className="pg-input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <button className="pg-submit-btn" type="submit" disabled={loading}>
            {loading ? <><div className="pg-spinner" /> Đang đăng nhập...</> : '🔐 Đăng nhập'}
          </button>
        </form>
        <div className="pg-demo-creds">
          Demo credentials:<br />
          Admin: tranghuyen20051312@gmail.com / Admin@123
        </div>
      </div>
    </div>
  );
}

/* ─── 2FA Page ─── */
function TwoFAPage({ onVerify }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    setTimeout(() => {
      setLoading(false);
      // For demo: pass if code is '123456'
      if (code === '123456') {
        onVerify();
      } else {
        setAttempts(a => a + 1);
        if (attempts >= 2) {
          setError('Tài khoản bị khóa tạm thời do nhập sai quá nhiều lần. (CyberDef Brute Force Defense)');
        } else {
          setError('Mã xác thực không hợp lệ');
        }
      }
    }, 800);
  };

  return (
    <div className="pg-login-shell">
      <div className="pg-login-card">
        <div className="pg-login-logo">
          <div className="pg-login-shield" style={{ background: 'linear-gradient(135deg,rgba(245,158,11,.2),rgba(236,72,153,.1))', borderColor: 'rgba(245,158,11,.35)' }}>🔐</div>
          <div className="pg-login-title">Xác thực 2 bước</div>
          <div className="pg-login-sub">Nhập mã 6 số từ Google Authenticator</div>
        </div>
        <form className="pg-login-form" onSubmit={submit}>
          {error && <div className="pg-login-error">⚠ {error}</div>}
          <div>
            <div className="pg-field-label">Mã xác thực (TOTP)</div>
            <input className="pg-input" type="text" inputMode="numeric" maxLength={6} style={{ fontSize: 24, letterSpacing: '0.5em', textAlign: 'center', fontFamily: 'var(--pg-mono)' }} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} autoFocus placeholder="------" />
          </div>
          <button className="pg-submit-btn" type="submit" disabled={loading || code.length !== 6 || attempts >= 3}>
            {loading ? <><div className="pg-spinner" /> Đang kiểm tra...</> : 'Xác nhận'}
          </button>
        </form>
        <div className="pg-demo-creds" style={{ textAlign: 'center' }}>
          Demo: Nhập <strong>123456</strong> để qua<br/>
          (Nhập sai 3 lần để xem block)
        </div>
      </div>
    </div>
  );
}

/* ─── Critical Alert Overlay ─── */
function CriticalAlertOverlay({ type, onDismiss, ip }) {
  if (!type) return null;
  const isBlocked = type === 'blocked';
  return (
    <div className={`pg-critical-overlay ${isBlocked ? 'blocked' : 'danger'}`} onClick={onDismiss}>
      <div>
        <div className="pg-critical-icon">{isBlocked ? '🛡' : '⚠'}</div>
        <div className="pg-critical-title">{isBlocked ? 'Tấn Công Bị Chặn' : 'HỆ THỐNG BỊ XÂM NHẬP'}</div>
        <div className="pg-critical-sub">
          {isBlocked 
            ? 'CyberDef đã phát hiện và chặn đứng kết nối độc hại.'
            : 'Phát hiện truy cập trái phép. Số dư ví đang bị tấn công!'}
        </div>
        {ip && <div className="pg-critical-ip">Nguồn: {ip}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  /* auth */
  const [user, setUser] = useState(() => parseToken(localStorage.getItem('token')));
  const [needs2FA, setNeeds2FA] = useState(false);

  /* nav */
  const [page, setPage] = useState('dashboard');

  /* wallet */
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  /* security */
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  /* attack */
  const [feedItems, setFeedItems] = useState([]);
  const [attackStats, setAttackStats] = useState({ attempts: 0, blocked: 0, tarpit: 0, stolen: 0 });
  const [underAttack, setUnderAttack] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [alertOverlay, setAlertOverlay] = useState(null);

  /* transfer form */
  const [tForm, setTForm] = useState({ toAccount: '', amount: '', description: '', bank: 'Vietcombank' });
  const [tLoading, setTLoading] = useState(false);

  /* history */
  const [histFilter, setHistFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* category management */
  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deletingCat, setDeletingCat] = useState(null);

  /* toasts */
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((title, message, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(p => [{ id, title, message, tone }, ...p].slice(0, 4));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);

  /* animated balance */
  const displayBalance = useCountUp(wallet?.balance ?? 0);
  const prevBal = useRef(wallet?.balance ?? 0);
  const [balDir, setBalDir] = useState('');
  useEffect(() => {
    if (wallet?.balance === undefined) return;
    if (wallet.balance < prevBal.current) setBalDir('decreasing');
    else if (wallet.balance > prevBal.current) setBalDir('increasing');
    prevBal.current = wallet.balance;
    const t = setTimeout(() => setBalDir(''), 750);
    return () => clearTimeout(t);
  }, [wallet?.balance]);

  /* fetch wallet */
  const fetchWallet = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      const storedWallet = readPersistedWallet() || DEMO_WALLET;
      setWallet(storedWallet);
      persistWallet(storedWallet);
      setWalletLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/payguard/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const nextWallet = clampWalletBalance(data.wallet) || DEMO_WALLET;
      setWallet(nextWallet);
      persistWallet(nextWallet);
    } catch {
      const fallbackWallet = readPersistedWallet() || DEMO_WALLET;
      setWallet(fallbackWallet);
      persistWallet(fallbackWallet);
    }
    finally { setWalletLoading(false); }
  }, []);

  /* fetch security */
  const fetchSecurity = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/payguard/status`);
      const data = await res.json();
      setIsSecurityEnabled(Boolean(data?.securityEnabled));
    } catch { /* ignore */ }
  }, []);

  /* toggle security */
  const toggleSecurity = async (enable) => {
    setSecuritySaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/demo/toggle-security`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ enabled: enable }),
      });
      if (!res.ok) throw new Error('Failed');
      setIsSecurityEnabled(enable);
      if (enable) {
        setShowCodeModal(true);
        setAttackStats({ attempts: 0, blocked: 0, tarpit: 0, stolen: 0 });
        setFeedItems([]);
        setRiskScore(0);
      } else {
        toast('⚠ Đã tắt bảo mật', 'Hệ thống đang ở chế độ mở — bot có thể tấn công tự do', 'danger');
      }
    } catch { toast('Lỗi', 'Không thể cập nhật trạng thái bảo mật', 'danger'); }
    finally { setSecuritySaving(false); }
  };

  /* init */
  useEffect(() => { fetchWallet(); fetchSecurity(); }, [fetchWallet, fetchSecurity]);

  /* keyboard shortcut Ctrl+Shift+S / R */
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          toggleSecurity(!isSecurityEnabled);
        }
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          setWallet(w => ({ ...w, balance: 1000000000 }));
          persistWallet({ ...wallet, balance: 1000000000 });
          setAttackStats({ attempts: 0, blocked: 0, tarpit: 0, stolen: 0 });
          setFeedItems([]);
          setRiskScore(0);
          setAlertOverlay(null);
          toast('Đã reset', 'Khôi phục số dư về 1 Tỷ VNĐ và xóa log tấn công', 'success');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isSecurityEnabled, wallet]);

  /* WebSocket */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(API_URL, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });

    socket.on('transfer_attempt', (data) => {
      const score = Number(data?.score || 0);
      const isBlocked = Boolean(data?.blocked);
      const hasTarpit = Number(data?.tarpitDelay) > 0;
      const type = isBlocked ? 'blocked' : hasTarpit ? 'tarpit' : 'success';
      const elapsed = hasTarpit
        ? `${(Number(data.tarpitDelay) / 1000).toFixed(1)}s`
        : data?.elapsed ? `${data.elapsed}ms` : undefined;
      const text = isBlocked
        ? `Attempt #${data?.attempt || '?'} — BLOCKED (Risk: ${score})`
        : hasTarpit
          ? `Attempt #${data?.attempt || '?'} — TARPIT delay ${elapsed}`
          : `Attempt #${data?.attempt || '?'} — SUCCESS -${fmtShort(data?.amount || 0)}`;

      setFeedItems(p => [{ id: Date.now() + Math.random(), type, text, elapsed, ts: new Date(), score }, ...p].slice(0, 40));
      setRiskScore(score);
      setUnderAttack(true);
      setAttackStats(p => ({
        attempts: p.attempts + 1,
        blocked: p.blocked + (isBlocked ? 1 : 0),
        tarpit: p.tarpit + (hasTarpit && !isBlocked ? 1 : 0),
        stolen: p.stolen + (!isBlocked && !hasTarpit ? Number(data?.amount || 0) : 0),
      }));
      
      if (isBlocked) {
        toast('🚫 Giao dịch bị chặn', `Risk Score: ${score} — IP đáng ngờ bị ngăn chặn`, 'danger');
        setAlertOverlay({ type: 'blocked', ip: data.ip || '10.0.0.77' });
      } else if (!hasTarpit && !isSecurityEnabled) {
         setAlertOverlay({ type: 'compromised', ip: data.ip || '10.0.0.77' });
      }
    });

    socket.on('wallet_update', (payload) => {
      if (payload?.wallet) {
        const nextWallet = clampWalletBalance(payload.wallet) || DEMO_WALLET;
        setWallet(nextWallet);
        persistWallet(nextWallet);
      } else if (typeof payload?.newBalance !== 'undefined') {
        setWallet(w => {
          if (!w) return w;
          const nextWallet = clampWalletBalance({ ...w, balance: payload.newBalance });
          persistWallet(nextWallet);
          return nextWallet;
        });
      } else {
        fetchWallet();
      }
    });

    socket.on('wallet_compromised', (data) => {
      setUnderAttack(true);
      // Force balance to 0 for dramatic effect
      setWallet(w => {
        const fakeTx = {
          _id: Date.now().toString(),
          type: 'transfer',
          amount: w.balance,
          status: 'success',
          description: 'HACKED - Chuyển toàn bộ số dư',
          createdAt: new Date().toISOString(),
          ipAddress: data?.ip || '10.0.0.77'
        };
        const nextWallet = { ...w, balance: 0, transactions: [fakeTx, ...(w.transactions || [])] };
        persistWallet(nextWallet);
        return nextWallet;
      });
      setAlertOverlay({ type: 'compromised', ip: data?.ip || '10.0.0.77' });
      toast('⚠️ HỆ THỐNG BỊ XÂM NHẬP', 'Số dư ví đang bị tấn công!', 'danger');
    });

    socket.on('security_status_changed', (data) => {
      setIsSecurityEnabled(Boolean(data?.enabled));
    });

    socket.on('attack_blocked', (data) => {
      toast('🛡 Đã chặn tấn công', `Risk Score: ${data?.score || 0} — IP attacker bị block`, 'success');
      setAlertOverlay({ type: 'blocked', ip: data?.ip || '10.0.0.77' });
    });

    return () => socket.disconnect();
  }, [toast, fetchWallet, isSecurityEnabled]);

  /* transfer */
  const handleTransfer = async (e) => {
    e.preventDefault();
    const amount = Number(String(tForm.amount).replace(/[^0-9]/g, ''));
    if (!amount || !tForm.toAccount) return;
    const token = localStorage.getItem('token');
    if (!token) { toast('Cần đăng nhập', 'Vui lòng đăng nhập để thực hiện giao dịch', 'danger'); return; }
    
    // Demo effect: If security is off, show money flying away before sending request
    if (!isSecurityEnabled) {
      const btn = e.target.querySelector('button[type="submit"]');
      if (btn) {
        btn.style.animation = 'shake-violent 0.5s ease';
        setTimeout(() => { btn.style.animation = ''; }, 500);
      }
      
      // Create flying money element
      const moneyEl = document.createElement('div');
      moneyEl.innerText = `-${fmtVND(amount)}`;
      moneyEl.style.position = 'fixed';
      moneyEl.style.left = '50%';
      moneyEl.style.top = '50%';
      moneyEl.style.transform = 'translate(-50%, -50%)';
      moneyEl.style.fontSize = '48px';
      moneyEl.style.fontWeight = 'bold';
      moneyEl.style.color = '#e11d48';
      moneyEl.style.zIndex = '9999';
      moneyEl.style.pointerEvents = 'none';
      moneyEl.style.fontFamily = 'var(--pg-mono)';
      moneyEl.style.animation = 'money-fly-away 1.5s ease forwards';
      document.body.appendChild(moneyEl);
      setTimeout(() => moneyEl.remove(), 1500);
      
      // Delay actual request for dramatic effect
      setTLoading(true);
      await new Promise(r => setTimeout(r, 800));
    } else {
      setTLoading(true);
    }
    
    try {
      const res = await fetch(`${API_URL}/api/payguard/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, toAccount: tForm.toAccount, description: tForm.description || 'Chuyển tiền' }),
      });
      const data = await res.json();
      if (res.status === 429) toast('🚫 Giao dịch bị tạm dừng', 'Hệ thống phát hiện hoạt động bất thường. Vui lòng thử lại sau.', 'danger');
      else if (res.ok) { toast('✓ Chuyển tiền thành công', `Đã chuyển ${fmtVND(amount)}`, 'success'); setTForm(f => ({ ...f, amount: '', description: '' })); fetchWallet(); }
      else toast('Lỗi giao dịch', data.error || 'Vui lòng thử lại', 'danger');
    } catch { toast('Lỗi kết nối', 'Không thể kết nối đến máy chủ', 'danger'); }
    finally { setTLoading(false); }
  };

  /* derived */
  const transactions = useMemo(() => [...(wallet?.transactions || [])].reverse().slice(0, 30), [wallet]);
  const filteredTx = useMemo(() => transactions.filter(tx => {
    const mFilter = histFilter === 'all' ? true
      : histFilter === 'blocked' ? (tx.status === 'blocked' || ['exploit', 'wipe', 'data_tamper'].includes(tx.type))
        : tx.type === histFilter;
    const mSearch = !searchQuery || tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) || tx.ipAddress?.includes(searchQuery);
    return mFilter && mSearch;
  }), [transactions, histFilter, searchQuery]);

  const categories = wallet?.categories?.length ? wallet.categories : DEFAULT_CATEGORIES;
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const totalPct = totalBudget > 0 ? Math.min(100, Math.round(totalSpent / totalBudget * 100)) : 0;
  const txToday = transactions.filter(t => new Date(t.createdAt || 0) > new Date(Date.now() - 86400000)).length;
  const riskColor = getRiskColor(riskScore);
  const riskPct = Math.min(100, riskScore);

  /* category CRUD */
  const handleSaveCategory = (catData) => {
    setWallet(w => {
      const cats = [...(w?.categories || DEFAULT_CATEGORIES)];
      if (editingCat !== null) {
        // Edit existing
        cats[editingCat] = { ...cats[editingCat], ...catData };
      } else {
        // Add new
        cats.push(catData);
      }
      const next = { ...w, categories: cats };
      persistWallet(next);
      return next;
    });
    setCatModal(false);
    setEditingCat(null);
    toast(editingCat !== null ? '✏️ Đã cập nhật' : '✅ Đã thêm', `Danh mục "${catData.name}" ${editingCat !== null ? 'đã được cập nhật' : 'đã được tạo'}`, 'success');
  };

  const handleDeleteCategory = (idx) => {
    setWallet(w => {
      const cats = [...(w?.categories || DEFAULT_CATEGORIES)];
      const removed = cats.splice(idx, 1)[0];
      const next = { ...w, categories: cats };
      persistWallet(next);
      toast('🗑️ Đã xóa', `Danh mục "${removed.name}" đã được xóa`, 'info');
      return next;
    });
    setDeletingCat(null);
  };

  const openEditCat = (idx) => {
    setEditingCat(idx);
    setCatModal(true);
  };

  const openAddCat = () => {
    setEditingCat(null);
    setCatModal(true);
  };

  /* render guards */
  if (!user) return <LoginPage onLogin={(u) => { setUser(u); setNeeds2FA(true); }} />;
  if (needs2FA) return <TwoFAPage onVerify={() => setNeeds2FA(false)} />;
  if (walletLoading) return (
    <div className="pg-loading-screen">
      <div className="pg-loading-logo">🛡</div>
      <div className="pg-spinner" />
      <div style={{ color: '#475569', fontSize: 13, fontFamily: 'var(--pg-mono)' }}>Đang khởi tạo PayGuard...</div>
    </div>
  );

  const NAV = [
    { id: 'dashboard', label: 'Tổng quan', icon: '🏠' },
    { id: 'transfer', label: 'Chuyển tiền', icon: '💸' },
    { id: 'budget', label: 'Ngân sách', icon: '📊' },
    { id: 'history', label: 'Lịch sử', icon: '📋' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
  ];
  const initLetter = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className={`pg-shell ${alertOverlay?.type === 'compromised' ? 'pg-hacked-flash' : ''}`}>
      {/* ─── SIDEBAR ─── */}
      <aside className="pg-sidebar">
        <div className="pg-sidebar-logo">
          <div className="pg-sidebar-logo-icon">🛡</div>
          <div>
            <div className="pg-sidebar-logo-text">PayGuard</div>
            <div className="pg-sidebar-logo-sub">Secure Wallet</div>
          </div>
        </div>
        <nav className="pg-nav">
          <div className="pg-nav-section">Menu</div>
          {NAV.map(n => (
            <button key={n.id} className={`pg-nav-item${page === n.id ? ' active' : ''}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        
        {/* Admin Panel Link */}
        <div style={{ padding: '0 16px', marginTop: '16px', flexShrink: 0 }}>
          <Link to="/admin/demo" style={{ display: 'block', padding: '12px', background: '#3b82f6', color: '#fff', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none', transition: 'all 200ms', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>
            🛡️ Trang Quản Trị
          </Link>
        </div>

        <div className="pg-sidebar-footer" style={{ marginTop: 'auto' }}>
          <div className="pg-user-card" onClick={() => { localStorage.removeItem('token'); setUser(null); }} title="Đăng xuất">
            <div className="pg-user-avatar">{initLetter}</div>
            <div>
              <div className="pg-user-name" style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              <div className="pg-user-role">Nhấn để đăng xuất</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="pg-main">
        {/* Topbar */}
        <header className="pg-topbar">
          <div className="pg-topbar-title">{NAV.find(n => n.id === page)?.label || 'PayGuard'}</div>
          
          {/* Demo Banner */}
          <div style={{
            margin: '0 auto',
            padding: '6px 16px',
            borderRadius: '999px',
            fontWeight: 'bold',
            fontSize: '13px',
            background: isSecurityEnabled ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            color: isSecurityEnabled ? '#34d399' : '#f87171',
            border: `1px solid ${isSecurityEnabled ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
            animation: !isSecurityEnabled ? 'pulse-danger 2s infinite' : 'none'
          }}>
            {isSecurityEnabled ? '🛡️ PROTECTED - CyberDef Active' : '⚠️ UNPROTECTED - Hệ thống không có tường lửa'}
          </div>

          <div className="pg-topbar-right">
            <button className="pg-icon-btn" onClick={() => setPage('settings')}>
              🔔
            </button>
            <div className="pg-user-avatar" style={{ width: 36, height: 36, cursor: 'pointer' }} onClick={() => { localStorage.removeItem('token'); setUser(null); }}>{initLetter}</div>
          </div>
        </header>

        {/* Page */}
        <main className="pg-page">

          {/* ════ DASHBOARD ════ */}
          {page === 'dashboard' && (<>
            {/* Hero Card */}
            <div className="pg-hero pg-shadow-xl pg-hover-elevate">
              <div className="pg-hero-scan" />
              <div className="pg-hero-inner">
                <div className="pg-hero-top">
                  <div>
                    <div className="pg-hero-label">Số dư khả dụng</div>
                    <div className={`pg-balance${balDir ? ` ${balDir}` : ''}`}>{fmtVND(displayBalance)}</div>
                  </div>
                  <div className="pg-hero-acct">📄 {wallet?.accountNumber || 'PAY-XXXXXXXX'}</div>
                </div>
                <div className="pg-hero-bank">
                  <div className="pg-bank-badge">{wallet?.bankName || 'Vietcombank'}</div>
                  <span>{wallet?.bankAccount || '****3456'}</span>
                  <span style={{ opacity: .5 }}>·</span>
                  <span>{user.email}</span>
                </div>
                <div className="pg-hero-actions">
                  <button className="pg-hero-btn" onClick={() => setPage('transfer')}><span>↑</span>Nạp tiền</button>
                  <button className="pg-hero-btn" onClick={() => setPage('transfer')}><span>→</span>Chuyển tiền</button>
                  <button className="pg-hero-btn" onClick={() => setPage('transfer')}><span>↓</span>Rút tiền</button>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="pg-stats-row">
              <div className="pg-stat-card">
                <div className="pg-stat-header">
                  <div className="pg-stat-icon indigo">📊</div>
                  <span className={`pg-stat-trend ${txToday > 0 ? 'up' : 'neutral'}`}>{txToday > 0 ? `+${txToday}` : '—'}</span>
                </div>
                <div className="pg-stat-label">Giao dịch hôm nay</div>
                <div className="pg-stat-value">{txToday}</div>
                <div className="pg-stat-sub">Tổng: {transactions.length} giao dịch</div>
              </div>
              <div className="pg-stat-card">
                <div className="pg-stat-header">
                  <div className="pg-stat-icon amber">💰</div>
                  <span className="pg-stat-trend neutral">{totalBudget > 0 ? Math.round(totalSpent / totalBudget * 100) : 0}%</span>
                </div>
                <div className="pg-stat-label">Chi tiêu tháng</div>
                <div className="pg-stat-value" style={{ fontSize: 22 }}>{fmtShort(totalSpent)}</div>
                <div className="pg-stat-sub">/ {fmtShort(totalBudget)} ngân sách</div>
              </div>
              <div className="pg-stat-card">
                <div className="pg-stat-header">
                  <div className="pg-stat-icon" style={{ background: 'rgba(37,99,235,.15)' }}>💳</div>
                </div>
                <div className="pg-stat-label">Ngân hàng liên kết</div>
                <div className="pg-stat-value" style={{ fontSize: 18 }}>{wallet?.bankName || 'Vietcombank'}</div>
                <div className="pg-stat-sub">{wallet?.bankAccount || '****3456'}</div>
              </div>
              <div className="pg-stat-card">
                <div className="pg-stat-header">
                  <div className="pg-stat-icon" style={{ background: 'rgba(16,185,129,.15)' }}>🔒</div>
                </div>
                <div className="pg-stat-label">Giới hạn GD/ngày</div>
                <div className="pg-stat-value" style={{ fontSize: 18 }}>{fmtShort(50000000)}</div>
                <div className="pg-stat-sub">Tối đa mỗi ngày</div>
              </div>
            </div>

            {/* Dashboard Grid - Full width */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
              {/* Spending Chart */}
              <div className="pg-panel pg-shadow-md pg-hover-elevate" style={{ cursor: 'pointer' }} onClick={() => setPage('budget')} title="Xem chi tiết ngân sách">
                <div className="pg-panel-header">
                  <div>
                    <div className="pg-panel-title">Chi tiêu theo danh mục</div>
                    <div className="pg-panel-sub">Tháng này</div>
                  </div>
                  <span className="pg-badge info">{categories.length} danh mục</span>
                </div>
                <SpendingChart categories={categories} />
              </div>
              {/* Recent Transactions */}
              <div className="pg-panel pg-shadow-md pg-hover-elevate">
                <div className="pg-panel-header">
                  <div>
                    <div className="pg-panel-title">Giao dịch gần đây</div>
                    <div className="pg-panel-sub">{transactions.length} giao dịch</div>
                  </div>
                  <button className="pg-badge muted" style={{ cursor: 'pointer' }} onClick={() => setPage('history')}>Xem tất cả →</button>
                </div>
                <div className="pg-tx-list">
                  {transactions.slice(0, 5).map((tx, i) => <TxItem key={tx._id || i} tx={tx} />)}
                  {!transactions.length && <div className="pg-empty"><div className="pg-empty-icon">📄</div><div className="pg-empty-title">Chưa có giao dịch</div></div>}
                </div>
              </div>
            </div>
          </>)}

          {/* ════ TRANSFER ════ */}
          {page === 'transfer' && (
            <div className="pg-transfer-grid">
              <div className="pg-panel pg-shadow-md pg-hover-elevate">
                <div className="pg-panel-header">
                  <div><div className="pg-panel-title">Chuyển tiền</div><div className="pg-panel-sub">Chuyển tiền nhanh, bảo mật</div></div>
                </div>
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
                  </div>
                  <div>
                    <div className="pg-field-label">Ngân hàng nhận</div>
                    <select className="pg-select" value={tForm.bank} onChange={e => setTForm(f => ({ ...f, bank: e.target.value }))}>
                      {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="pg-field-label">Số tài khoản / Số điện thoại</div>
                    <input className="pg-input" placeholder="VD: PAY-00000000" value={tForm.toAccount} onChange={e => setTForm(f => ({ ...f, toAccount: e.target.value }))} />
                  </div>
                  <div>
                    <div className="pg-field-label">Số tiền</div>
                    <div className="pg-amount-input-wrap">
                      <span className="pg-amount-currency">₫</span>
                      <input className="pg-input" placeholder="0" inputMode="numeric" value={tForm.amount} onChange={e => setTForm(f => ({ ...f, amount: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <div className="pg-field-label">Nội dung chuyển khoản</div>
                    <input className="pg-input" placeholder="VD: Thanh toán tiền hàng" value={tForm.description} onChange={e => setTForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className={`pg-security-info-box ${isSecurityEnabled ? 'safe' : 'danger'}`}>
                    {isSecurityEnabled
                      ? '🛡 Giao dịch của bạn đang được bảo vệ. Các hoạt động bất thường sẽ bị phát hiện tự động.'
                      : '⚠ Khuyến nghị bật tính năng bảo mật để bảo vệ tài khoản của bạn.'}
                  </div>
                  <button className="pg-submit-btn" type="submit" disabled={tLoading || !tForm.toAccount || !tForm.amount}>
                    {tLoading ? <><div className="pg-spinner" /> Đang xử lý...</> : '✓ Xác nhận chuyển tiền'}
                  </button>
                </form>
              </div>
              {/* Info panel */}
              <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
                <div className="pg-panel pg-shadow-md pg-hover-elevate">
                  <div className="pg-panel-title" style={{ marginBottom: 16 }}>💳 Thông tin tài khoản</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[['Số dư khả dụng', fmtVND(wallet?.balance || 0), '#10b981'], ['Tài khoản', wallet?.accountNumber || '—', undefined], ['Ngân hàng liên kết', `${wallet?.bankName} ${wallet?.bankAccount}`, undefined], ['Giới hạn GD/ngày', fmtVND(50000000), undefined]].map(([k, v, c]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 14 }}>
                        <span style={{ color: '#94a3b8' }}>{k}</span>
                        <span style={{ fontWeight: 700, color: c }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ════ HISTORY ════ */}
          {page === 'history' && (
            <div className="pg-panel pg-shadow-md pg-hover-elevate">
              <div className="pg-panel-header">
                <div><div className="pg-panel-title">Lịch sử giao dịch</div><div className="pg-panel-sub">{filteredTx.length} giao dịch</div></div>
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
          )}

          {/* ════ BUDGET ════ */}
          {page === 'budget' && (
            <div style={{ display: 'grid', gap: 24 }}>
              {/* Summary */}
              <div className="pg-budget-summary pg-shadow-md">
                <div className="pg-budget-summary-left">
                  <div className="pg-budget-summary-title">Tổng chi tiêu / Ngân sách</div>
                  <div className="pg-budget-summary-amounts">
                    <span className="pg-budget-summary-spent">{fmtVND(totalSpent)}</span>
                    <span className="pg-budget-summary-total">/ {fmtShort(totalBudget)}</span>
                  </div>
                  <div className="pg-budget-summary-bar">
                    <div className="pg-budget-summary-fill" style={{ width: `${totalPct}%`, background: totalPct > 100 ? '#ef4444' : totalPct > 80 ? '#f59e0b' : '#3b82f6' }} />
                  </div>
                </div>
                <div className="pg-budget-summary-pct" style={{ color: totalPct > 100 ? '#ef4444' : totalPct > 80 ? '#f59e0b' : '#3b82f6' }}>
                  {totalPct}%
                </div>
              </div>

              {/* Categories Grid */}
              <div className="pg-budget-grid">
                {categories.map((c, idx) => {
                  const pct = c.budget > 0 ? Math.min(100, Math.round(c.spent / c.budget * 100)) : 0;
                  const isOver = c.spent > c.budget;
                  return (
                    <div key={idx} className="pg-budget-card">
                      <div className="pg-budget-card-header">
                        <div className="pg-budget-card-left">
                          <div className="pg-budget-card-icon" style={{ background: `${c.color}22`, color: c.color }}>{c.icon}</div>
                          <div>
                            <div className="pg-budget-card-name">{c.name}</div>
                            <div className="pg-budget-card-budget">Ngân sách: {fmtShort(c.budget)}</div>
                          </div>
                        </div>
                        <div className="pg-budget-card-actions">
                          <button onClick={() => openEditCat(idx)} title="Sửa">✏️</button>
                          <button className="delete" onClick={() => setDeletingCat(idx)} disabled={categories.length <= 1} title="Xóa">🗑️</button>
                        </div>
                      </div>
                      <div className="pg-budget-card-body">
                        <div className="pg-budget-card-row">
                          <span className="label">Đã chi</span>
                          <span className={`value ${isOver ? 'over' : ''}`}>{fmtShort(c.spent)}</span>
                        </div>
                        <div className="pg-budget-progress">
                          <div className="pg-budget-progress-fill" style={{ width: `${pct}%`, background: isOver ? '#ef4444' : pct > 80 ? '#f59e0b' : c.color }} />
                        </div>
                        <div className="pg-budget-card-footer">
                          <span>{pct}%</span>
                          <span>Còn lại: {fmtShort(Math.max(0, c.budget - c.spent))}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="pg-add-cat-btn" onClick={openAddCat}>
                  <div className="pg-add-cat-btn-icon">➕</div>
                  <div className="pg-add-cat-btn-text">Thêm danh mục mới</div>
                </div>
              </div>
            </div>
          )}

          {/* ════ SETTINGS ════ */}
          {page === 'settings' && (
            <div style={{ display: 'grid', gap: 22, gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
              <div className="pg-panel pg-shadow-md pg-hover-elevate" style={{ gridColumn: '1 / -1', background: isSecurityEnabled ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)', border: `1px solid ${isSecurityEnabled ? '#34d399' : '#f87171'}` }}>
                <div className="pg-panel-title" style={{ marginBottom: 20, color: isSecurityEnabled ? '#34d399' : '#f87171' }}>🛡️ Hệ Thống Tường Lửa CyberDef (Demo)</div>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div className={`pg-security-toggle-card ${isSecurityEnabled ? 'protected' : 'danger'}`}>
                    <div className="pg-security-toggle-info">
                      <div className="pg-security-toggle-title">Web Application Firewall (WAF) + AI Tarpit</div>
                      <div className="pg-security-toggle-sub">Tự động phát hiện và ngăn chặn SQL Injection, XSS. Cơ chế Tarpit làm treo các tool tấn công tự động như sqlmap, hydra.</div>
                    </div>
                    <button className={`pg-toggle-btn ${isSecurityEnabled ? 'on' : ''}`} onClick={() => toggleSecurity(!isSecurityEnabled)} disabled={securitySaving} style={{ opacity: securitySaving ? 0.5 : 1 }}>
                      <span />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pg-panel pg-shadow-md pg-hover-elevate">
                <div className="pg-panel-title" style={{ marginBottom: 20 }}>🔐 Bảo mật tài khoản</div>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div className="pg-security-toggle-card protected" style={{ opacity: .8 }}>
                    <div className="pg-security-toggle-info">
                      <div className="pg-security-toggle-title">Xác thực 2 yếu tố (2FA)</div>
                      <div className="pg-security-toggle-sub">Bảo vệ tài khoản bằng mã xác thực</div>
                    </div>
                    <button className="pg-toggle-btn on"><span /></button>
                  </div>
                  <div className="pg-security-toggle-card protected" style={{ opacity: .8 }}>
                    <div className="pg-security-toggle-info">
                      <div className="pg-security-toggle-title">Thông báo giao dịch</div>
                      <div className="pg-security-toggle-sub">Nhận thông báo khi có giao dịch mới</div>
                    </div>
                    <button className="pg-toggle-btn on"><span /></button>
                  </div>
                  <div className="pg-security-toggle-card protected" style={{ opacity: .8 }}>
                    <div className="pg-security-toggle-info">
                      <div className="pg-security-toggle-title">Giới hạn giao dịch</div>
                      <div className="pg-security-toggle-sub">Giới hạn tối đa {fmtShort(50000000)}/ngày</div>
                    </div>
                    <button className="pg-toggle-btn on"><span /></button>
                  </div>
                </div>
              </div>

              <div className="pg-panel pg-shadow-md pg-hover-elevate">
                <div className="pg-panel-title" style={{ marginBottom: 20 }}>💳 Tài khoản & Ngân hàng</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[['Số ví', wallet?.accountNumber || '—'], ['Ngân hàng liên kết', `${wallet?.bankName || 'Vietcombank'} ${wallet?.bankAccount || '****3456'}`], ['Số dư hiện tại', fmtVND(wallet?.balance || 0)], ['Giới hạn GD/ngày', fmtVND(50000000)]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 14 }}>
                      <span style={{ color: '#94a3b8' }}>{k}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Code Shield Modal */}
      {showCodeModal && <CodeShieldModal onClose={() => setShowCodeModal(false)} />}
      
      {/* Category Modal */}
      {catModal && (
        <CategoryModal
          cat={editingCat !== null ? categories[editingCat] : null}
          onSave={handleSaveCategory}
          onClose={() => { setCatModal(false); setEditingCat(null); }}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingCat !== null && (
        <div className="pg-cat-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeletingCat(null); }}>
          <div className="pg-cat-modal" style={{ maxWidth: 360, padding: 24 }}>
            <div className="pg-cat-modal-title" style={{ marginBottom: 16 }}>🗑️ Xóa danh mục?</div>
            <div className="pg-confirm-delete">
              <div className="pg-confirm-delete-text">
                Bạn có chắc muốn xóa danh mục <strong>{categories[deletingCat]?.name}</strong>? Giao dịch cũ vẫn sẽ được giữ lại, nhưng danh mục này sẽ biến mất.
              </div>
              <div className="pg-confirm-delete-btns">
                <button className="pg-delete-no" onClick={() => setDeletingCat(null)}>Hủy</button>
                <button className="pg-delete-yes" onClick={() => handleDeleteCategory(deletingCat)}>Có, xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Alert Overlay */}
      <CriticalAlertOverlay type={alertOverlay?.type} ip={alertOverlay?.ip} onDismiss={() => setAlertOverlay(null)} />

      {/* Toasts */}
      <ToastStack toasts={toasts} />
      
      {/* Hidden Admin Toggles */}
      <div style={{ position: 'fixed', bottom: '10px', right: '10px', opacity: 0.05, display: 'flex', gap: '4px', zIndex: 99999 }}>
        <button style={{ width: '20px', height: '20px', background: 'red', borderRadius: '50%', cursor: 'pointer' }} onClick={() => toggleSecurity(!isSecurityEnabled)} title="Toggle CyberDef" />
        <button style={{ width: '20px', height: '20px', background: 'green', borderRadius: '50%', cursor: 'pointer' }} onClick={() => {
          setWallet(w => ({ ...w, balance: 1000000000 }));
          persistWallet({ ...wallet, balance: 1000000000 });
          setAttackStats({ attempts: 0, blocked: 0, tarpit: 0, stolen: 0 });
          setFeedItems([]);
          setRiskScore(0);
          setAlertOverlay(null);
          toast('Đã reset', 'Khôi phục số dư', 'success');
        }} title="Reset Demo" />
      </div>
    </div>
  );
}