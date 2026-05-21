import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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

/* ─── Static data ─── */
const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống',   budget: 3000000, spent: 1200000, color: '#10b981', icon: '🍜' },
  { name: 'Di chuyển', budget: 1000000, spent: 450000,  color: '#6366f1', icon: '🚗' },
  { name: 'Mua sắm',   budget: 2000000, spent: 800000,  color: '#8b5cf6', icon: '🛍️' },
  { name: 'Giải trí',  budget: 500000,  spent: 200000,  color: '#f59e0b', icon: '🎮' },
  { name: 'Hóa đơn',   budget: 1500000, spent: 1500000, color: '#ef4444', icon: '💡' },
  { name: 'Tiết kiệm', budget: 2000000, spent: 500000,  color: '#fbbf24', icon: '💰' },
];

const DEMO_WALLET = {
  balance: 10000000,
  accountNumber: 'PAY-20240601',
  bankLinked: true, bankName: 'Vietcombank', bankAccount: '****3456',
  categories: DEFAULT_CATEGORIES,
  transactions: [
    { _id: '1', type: 'deposit',  description: 'Nạp tiền ví',           amount: 5000000, status: 'success', ipAddress: '127.0.0.1', riskScore: 0,  createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: '2', type: 'transfer', description: 'Thanh toán mua hàng',   amount: 850000,  status: 'success', ipAddress: '10.0.0.12', riskScore: 18, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: '3', type: 'withdraw', description: 'Rút tiền về ngân hàng', amount: 250000,  status: 'success', ipAddress: '10.0.0.12', riskScore: 5,  createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
};

const RECIPIENTS = [
  { name: 'Nguyễn Văn A', account: 'PAY-00123', avatar: '👨', color: '#6366f1' },
  { name: 'Trần Thị B',   account: 'PAY-00456', avatar: '👩', color: '#10b981' },
  { name: 'Lê Văn C',     account: 'PAY-00789', avatar: '🧑', color: '#f59e0b' },
  { name: 'Phạm Thị D',   account: 'PAY-00999', avatar: '👧', color: '#8b5cf6' },
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
  return '#10b981';
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
  const raf  = useRef(null);
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
  { cmd: 'app.use(cyberDefRateLimit)',   comment: '// Đếm & giới hạn request theo IP' },
  { cmd: 'app.use(cyberDefTarpit)',      comment: '// Làm chậm bot tấn công tự động' },
  { cmd: 'app.use(cyberDefRiskScorer)', comment: '// Tính điểm nguy cơ AI (0–100)' },
];

function CodeShieldModal({ onClose }) {
  const [visible, setVisible] = useState(0);
  const [done, setDone]       = useState(false);
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
          borderLeft: `4px solid ${t.tone === 'danger' ? '#ef4444' : t.tone === 'success' ? '#10b981' : '#f59e0b'}`,
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
  const data  = categories.map(c => ({ name: c.name, value: c.spent, color: c.color }));
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
              contentStyle={{ background: '#0d1424', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, fontSize: 12 }}
              itemStyle={{ color: '#f1f5f9' }}
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

/* ─── Transaction Item ─── */
const TX_ICONS = { deposit: '💚', transfer: '💸', withdraw: '🏦', blocked: '🚫', exploit: '💀', wipe: '⚠️', default: '📄' };
function TxItem({ tx }) {
  const isCredit  = tx.type === 'deposit';
  const isBlocked = tx.status === 'blocked' || ['exploit', 'wipe', 'data_tamper'].includes(tx.type);
  const iconKey   = isBlocked ? 'blocked' : (TX_ICONS[tx.type] ? tx.type : 'default');
  return (
    <div className="pg-tx-item">
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
}

/* ─── Feed Item ─── */
function FeedItem({ item }) {
  const cls  = item.type === 'success' ? 'success' : item.type === 'tarpit' ? 'tarpit' : item.type === 'blocked' ? 'blocked' : 'info';
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
  const [email,    setEmail]    = useState('tranghuyen20051312@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
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

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  /* auth */
  const [user, setUser] = useState(() => parseToken(localStorage.getItem('token')));

  /* nav */
  const [page, setPage] = useState('dashboard');

  /* wallet */
  const [wallet,        setWallet]        = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  /* security */
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
  const [securitySaving,    setSecuritySaving]    = useState(false);
  const [showCodeModal,     setShowCodeModal]     = useState(false);

  /* attack */
  const [feedItems,   setFeedItems]   = useState([]);
  const [attackStats, setAttackStats] = useState({ attempts: 0, blocked: 0, tarpit: 0, stolen: 0 });
  const [underAttack, setUnderAttack] = useState(false);
  const [riskScore,   setRiskScore]   = useState(0);

  /* transfer form */
  const [tForm,    setTForm]    = useState({ toAccount: '', amount: '', description: '', bank: 'Vietcombank' });
  const [tLoading, setTLoading] = useState(false);

  /* history */
  const [histFilter,   setHistFilter]   = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');

  /* toasts */
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((title, message, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(p => [{ id, title, message, tone }, ...p].slice(0, 4));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);

  /* animated balance */
  const displayBalance = useCountUp(wallet?.balance ?? 0);
  const prevBal        = useRef(wallet?.balance ?? 0);
  const [balDir, setBalDir] = useState('');
  useEffect(() => {
    if (wallet?.balance === undefined) return;
    if (wallet.balance < prevBal.current)      setBalDir('decreasing');
    else if (wallet.balance > prevBal.current) setBalDir('increasing');
    prevBal.current = wallet.balance;
    const t = setTimeout(() => setBalDir(''), 750);
    return () => clearTimeout(t);
  }, [wallet?.balance]);

  /* fetch wallet */
  const fetchWallet = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setWallet(DEMO_WALLET); setWalletLoading(false); return; }
    try {
      const res  = await fetch(`${API_URL}/api/payguard/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setWallet(w => ({
        ...DEMO_WALLET,
        ...data.wallet,
        categories: data.wallet?.categories?.length ? data.wallet.categories : DEFAULT_CATEGORIES,
      }));
    } catch { setWallet(DEMO_WALLET); }
    finally  { setWalletLoading(false); }
  }, []);

  /* fetch security */
  const fetchSecurity = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/api/payguard/status`);
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

  /* keyboard shortcut Ctrl+Shift+S */
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        toggleSecurity(!isSecurityEnabled);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isSecurityEnabled]);

  /* WebSocket */
  useEffect(() => {
    const token  = localStorage.getItem('token');
    const socket = io(API_URL, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });

    socket.on('transfer_attempt', (data) => {
      const score     = Number(data?.score || 0);
      const isBlocked = Boolean(data?.blocked);
      const hasTarpit = Number(data?.tarpitDelay) > 0;
      const type      = isBlocked ? 'blocked' : hasTarpit ? 'tarpit' : 'success';
      const elapsed   = hasTarpit
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
        blocked:  p.blocked  + (isBlocked ? 1 : 0),
        tarpit:   p.tarpit   + (hasTarpit && !isBlocked ? 1 : 0),
        stolen:   p.stolen   + (!isBlocked && !hasTarpit ? Number(data?.amount || 0) : 0),
      }));
      if (isBlocked) toast('🚫 Giao dịch bị chặn', `Risk Score: ${score} — IP đáng ngờ bị ngăn chặn`, 'danger');
    });

    socket.on('wallet_update', (payload) => {
      if (payload?.wallet) {
        setWallet(w => ({ ...DEMO_WALLET, ...payload.wallet, categories: payload.wallet?.categories?.length ? payload.wallet.categories : DEFAULT_CATEGORIES }));
      } else if (typeof payload?.newBalance !== 'undefined') {
        setWallet(w => w ? { ...w, balance: payload.newBalance } : w);
      } else {
        fetchWallet();
      }
    });

    socket.on('wallet_compromised', () => {
      setUnderAttack(true);
      fetchWallet();
      toast('⚠️ Hệ thống bị xâm nhập', 'Dữ liệu ví đang bị thay đổi bởi attacker!', 'danger');
    });

    socket.on('security_status_changed', (data) => {
      setIsSecurityEnabled(Boolean(data?.enabled));
    });

    socket.on('attack_blocked', (data) => {
      toast('🛡 Đã chặn tấn công', `Risk Score: ${data?.score || 0} — IP attacker bị block`, 'success');
    });

    return () => socket.disconnect();
  }, [toast, fetchWallet]);

  /* transfer */
  const handleTransfer = async (e) => {
    e.preventDefault();
    const amount = Number(String(tForm.amount).replace(/[^0-9]/g, ''));
    if (!amount || !tForm.toAccount) return;
    const token = localStorage.getItem('token');
    if (!token) { toast('Cần đăng nhập', 'Vui lòng đăng nhập để thực hiện giao dịch', 'danger'); return; }
    setTLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/payguard/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, toAccount: tForm.toAccount, description: tForm.description || 'Chuyển tiền' }),
      });
      const data = await res.json();
      if (res.status === 429)  toast('🚫 Giao dịch bị chặn', `Risk Score: ${data.riskScore} — Phát hiện bất thường`, 'danger');
      else if (res.ok) { toast('✓ Chuyển tiền thành công', `Đã chuyển ${fmtVND(amount)}`, 'success'); setTForm(f => ({ ...f, amount: '', description: '' })); fetchWallet(); }
      else             toast('Lỗi giao dịch', data.error || 'Vui lòng thử lại', 'danger');
    } catch { toast('Lỗi kết nối', 'Không thể kết nối đến máy chủ', 'danger'); }
    finally { setTLoading(false); }
  };

  /* derived */
  const transactions = useMemo(() => [...(wallet?.transactions || [])].reverse().slice(0, 30), [wallet]);
  const filteredTx   = useMemo(() => transactions.filter(tx => {
    const mFilter = histFilter === 'all' ? true
      : histFilter === 'blocked' ? (tx.status === 'blocked' || ['exploit', 'wipe', 'data_tamper'].includes(tx.type))
      : tx.type === histFilter;
    const mSearch = !searchQuery || tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) || tx.ipAddress?.includes(searchQuery);
    return mFilter && mSearch;
  }), [transactions, histFilter, searchQuery]);

  const categories  = wallet?.categories?.length ? wallet.categories : DEFAULT_CATEGORIES;
  const totalSpent  = categories.reduce((s, c) => s + c.spent, 0);
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const txToday     = transactions.filter(t => new Date(t.createdAt || 0) > new Date(Date.now() - 86400000)).length;
  const riskColor   = getRiskColor(riskScore);
  const riskPct     = Math.min(100, riskScore);

  /* render guards */
  if (!user) return <LoginPage onLogin={setUser} />;
  if (walletLoading) return (
    <div className="pg-loading-screen">
      <div className="pg-loading-logo">🛡</div>
      <div className="pg-spinner" />
      <div style={{ color: '#475569', fontSize: 13, fontFamily: 'var(--pg-mono)' }}>Đang khởi tạo PayGuard...</div>
    </div>
  );

  const NAV = [
    { id: 'dashboard', label: 'Tổng quan',   icon: '🏠' },
    { id: 'transfer',  label: 'Chuyển tiền', icon: '💸' },
    { id: 'history',   label: 'Lịch sử',     icon: '📋' },
    { id: 'settings',  label: 'Bảo mật',     icon: '🔐' },
  ];
  const initLetter = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="pg-shell">
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
          <div className="pg-nav-section" style={{ marginTop: 8 }}>Liên kết</div>
          <button className="pg-nav-item" onClick={() => window.open('http://localhost:3000', '_blank')}>
            <span className="nav-icon">📊</span>CyberDef Dashboard
          </button>
        </nav>
        <div className="pg-sidebar-footer">
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
          <div className="pg-topbar-right">
            <div className={`pg-security-badge ${isSecurityEnabled ? 'protected' : 'unprotected'}`}>
              <div className="pg-security-dot" />
              {isSecurityEnabled ? '🛡 Được bảo vệ' : '⚠ Chưa bảo mật'}
            </div>
            <button className="pg-icon-btn" onClick={() => setPage('settings')}>
              🔔
              {attackStats.attempts > 0 && <div className="pg-notif-dot" />}
            </button>
            <div className="pg-user-avatar" style={{ width: 36, height: 36, cursor: 'pointer' }} onClick={() => { localStorage.removeItem('token'); setUser(null); }}>{initLetter}</div>
          </div>
        </header>

        {/* Page */}
        <main className="pg-page">

          {/* ════ DASHBOARD ════ */}
          {page === 'dashboard' && (<>
            {/* Banner */}
            {!isSecurityEnabled && (
              <div className="pg-attack-banner danger">
                <div className="pg-banner-content">
                  <div className="pg-banner-title">⚠ HỆ THỐNG CHƯA CÓ BẢO MẬT</div>
                  <div className="pg-banner-sub">Bot có thể thực hiện chuyển tiền trái phép không bị chặn. Bật bảo mật ngay!</div>
                </div>
                <div className="pg-banner-stats">
                  <div className="pg-banner-stat">
                    <div className="pg-banner-stat-val">{attackStats.attempts}</div>
                    <div className="pg-banner-stat-label">Attempts</div>
                  </div>
                  <div className="pg-banner-stat">
                    <div className="pg-banner-stat-val" style={{ color: '#ef4444' }}>{fmtShort(attackStats.stolen)}</div>
                    <div className="pg-banner-stat-label">Đã mất</div>
                  </div>
                </div>
              </div>
            )}
            {isSecurityEnabled && underAttack && attackStats.blocked > 0 && (
              <div className="pg-attack-banner success">
                <div className="pg-banner-content">
                  <div className="pg-banner-title">✅ Hệ thống bảo mật đang hoạt động</div>
                  <div className="pg-banner-sub">Đã chặn {attackStats.blocked} yêu cầu bất thường — Số dư của bạn vẫn an toàn</div>
                </div>
                <div className="pg-banner-stats">
                  <div className="pg-banner-stat">
                    <div className="pg-banner-stat-val" style={{ color: '#10b981' }}>{attackStats.blocked}</div>
                    <div className="pg-banner-stat-label">Đã chặn</div>
                  </div>
                  <div className="pg-banner-stat">
                    <div className="pg-banner-stat-val" style={{ color: '#10b981' }}>{fmtShort(wallet?.balance || 0)}</div>
                    <div className="pg-banner-stat-label">An toàn</div>
                  </div>
                </div>
              </div>
            )}

            {/* Hero Card */}
            <div className="pg-hero">
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
                  <div className="pg-stat-icon red">🚫</div>
                  {attackStats.blocked > 0 && <span className="pg-stat-trend down">LIVE</span>}
                </div>
                <div className="pg-stat-label">Đã chặn hôm nay</div>
                <div className="pg-stat-value" style={{ color: attackStats.blocked > 0 ? '#ef4444' : undefined }}>{attackStats.blocked}</div>
                <div className="pg-stat-sub">{attackStats.attempts} tổng số cố gắng tấn công</div>
              </div>
              <div className="pg-stat-card">
                <div className="pg-stat-header">
                  <div className="pg-stat-icon" style={{ background: `${getRiskColor(riskScore)}22` }}>🎯</div>
                  {riskScore > 0 && <span className={`pg-stat-trend ${riskScore >= 60 ? 'down' : 'neutral'}`}>{getRiskLabel(riskScore)}</span>}
                </div>
                <div className="pg-stat-label">Risk Score hiện tại</div>
                <div className="pg-stat-value" style={{ color: riskColor, fontFamily: 'var(--pg-mono)' }}>{riskScore}</div>
                <div className="pg-stat-sub">{attackStats.attempts > 0 ? 'IP: 10.0.0.77' : 'Không có tấn công'}</div>
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
            </div>

            {/* Dashboard Grid */}
            <div className="pg-dashboard-grid">
              <div className="pg-left-col">
                {/* Spending Chart */}
                <div className="pg-panel">
                  <div className="pg-panel-header">
                    <div>
                      <div className="pg-panel-title">Chi tiêu theo danh mục</div>
                      <div className="pg-panel-sub">Tháng này</div>
                    </div>
                    <span className="pg-badge info">6 danh mục</span>
                  </div>
                  <SpendingChart categories={categories} />
                </div>
                {/* Recent Transactions */}
                <div className="pg-panel">
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

              {/* Right: Security Panel */}
              <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
                <div className="pg-panel">
                  <div className="pg-panel-header"><div className="pg-panel-title">🛡 Bảo mật CyberDef</div></div>
                  <div className="pg-security-panel">
                    {/* Big toggle */}
                    <button
                      className={`pg-security-enable-btn${isSecurityEnabled ? ' enabled' : ''}`}
                      onClick={() => toggleSecurity(!isSecurityEnabled)}
                      disabled={securitySaving}
                    >
                      {securitySaving
                        ? <><div className="pg-spinner" /> Đang cập nhật...</>
                        : isSecurityEnabled ? '🛡 Đang bảo vệ — Nhấn để tắt' : '⚡ BẬT BẢO MẬT NGAY'}
                    </button>

                    {/* Risk Meter */}
                    <div className="pg-risk-panel">
                      <div className="pg-risk-label">
                        <span>Risk Score</span>
                        <span style={{ color: riskColor }}>{getRiskLabel(riskScore)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <div className={`pg-risk-score-val ${getRiskLevel(riskScore)}`}>{riskScore}</div>
                        <div style={{ color: '#475569', fontSize: 14 }}>/100</div>
                      </div>
                      <div className="pg-risk-bar-track">
                        <div className="pg-risk-bar-fill" style={{
                          width: `${riskPct}%`,
                          background: riskScore >= 80 ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                            : riskScore >= 60 ? 'linear-gradient(90deg,#fb923c,#f97316)'
                            : riskScore >= 35 ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                            : 'linear-gradient(90deg,#10b981,#059669)',
                        }} />
                      </div>
                      <div className="pg-risk-levels"><span>SAFE</span><span>MEDIUM</span><span>HIGH</span><span>CRITICAL</span></div>
                    </div>

                    {/* Stats */}
                    <div className="pg-attack-stats">
                      <div className="pg-attack-stat"><div className="pg-attack-stat-val">{attackStats.attempts}</div><div className="pg-attack-stat-label">Attempts</div></div>
                      <div className="pg-attack-stat danger"><div className="pg-attack-stat-val">{attackStats.blocked}</div><div className="pg-attack-stat-label">Blocked</div></div>
                      <div className="pg-attack-stat warning"><div className="pg-attack-stat-val">{attackStats.tarpit}</div><div className="pg-attack-stat-label">Tarpit</div></div>
                      <div className="pg-attack-stat danger"><div className="pg-attack-stat-val" style={{ fontSize: 16 }}>{fmtShort(attackStats.stolen)}</div><div className="pg-attack-stat-label">Stolen</div></div>
                    </div>

                    {/* Live Feed */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: underAttack ? '#ef4444' : '#475569', boxShadow: underAttack ? '0 0 8px #ef4444' : undefined }} />
                        Live Attack Feed
                      </div>
                      <div className="pg-feed">
                        {feedItems.length === 0
                          ? <div className="pg-feed-empty">Không có hoạt động tấn công</div>
                          : feedItems.map(item => <FeedItem key={item.id} item={item} />)
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>)}

          {/* ════ TRANSFER ════ */}
          {page === 'transfer' && (
            <div className="pg-transfer-grid">
              <div className="pg-panel">
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
                      ? '🛡 Giao dịch đang được giám sát bởi CyberDef AI. Các giao dịch bất thường sẽ bị chặn tự động.'
                      : '⚠ Bảo mật chưa bật — Giao dịch không được kiểm tra. Bot có thể thực hiện chuyển tiền không giới hạn.'}
                  </div>
                  <button className="pg-submit-btn" type="submit" disabled={tLoading || !tForm.toAccount || !tForm.amount}>
                    {tLoading ? <><div className="pg-spinner" /> Đang xử lý...</> : '✓ Xác nhận chuyển tiền'}
                  </button>
                </form>
              </div>
              {/* Info panel */}
              <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
                <div className="pg-panel">
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
                <div className="pg-panel">
                  <div className="pg-panel-title" style={{ marginBottom: 12 }}>🛡 Trạng thái bảo mật</div>
                  <div className={`pg-security-toggle-card ${isSecurityEnabled ? 'protected' : 'unprotected'}`}>
                    <div className="pg-security-toggle-info">
                      <div className="pg-security-toggle-title">{isSecurityEnabled ? '✅ Được bảo vệ' : '⚠ Chưa bảo mật'}</div>
                      <div className="pg-security-toggle-sub">{isSecurityEnabled ? 'CyberDef AI đang giám sát' : 'Tắt bảo mật — Rủi ro cao'}</div>
                    </div>
                    <button className={`pg-toggle-btn${isSecurityEnabled ? ' on' : ''}`} onClick={() => toggleSecurity(!isSecurityEnabled)} disabled={securitySaving}>
                      <span />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ HISTORY ════ */}
          {page === 'history' && (
            <div className="pg-panel">
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
                  <input className="pg-search-input" placeholder="Tìm theo mô tả, IP..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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

          {/* ════ SETTINGS ════ */}
          {page === 'settings' && (
            <div style={{ display: 'grid', gap: 22, gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
              <div className="pg-panel">
                <div className="pg-panel-title" style={{ marginBottom: 20 }}>🔐 Cài đặt bảo mật</div>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div className={`pg-security-toggle-card ${isSecurityEnabled ? 'protected' : 'unprotected'}`}>
                    <div className="pg-security-toggle-info">
                      <div className="pg-security-toggle-title">Bảo mật hệ thống PayGuard</div>
                      <div className="pg-security-toggle-sub">Bật để chặn tấn công, tắt để mô phỏng lỗ hổng</div>
                    </div>
                    <button className={`pg-toggle-btn${isSecurityEnabled ? ' on' : ''}`} onClick={() => toggleSecurity(!isSecurityEnabled)} disabled={securitySaving}><span /></button>
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', padding: '12px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,.06)' }}>
                    Trạng thái: <strong style={{ color: isSecurityEnabled ? '#10b981' : '#ef4444' }}>{isSecurityEnabled ? 'Đang bảo vệ' : 'Chưa bảo mật'}</strong><br />
                    Phím tắt: <kbd style={{ fontFamily: 'var(--pg-mono)', fontSize: 11, padding: '2px 6px', background: '#1f2937', borderRadius: 4 }}>Ctrl+Shift+S</kbd>
                  </div>
                  <div className="pg-security-toggle-card protected" style={{ opacity: .8 }}>
                    <div className="pg-security-toggle-info">
                      <div className="pg-security-toggle-title">Xác thực 2 yếu tố (2FA)</div>
                      <div className="pg-security-toggle-sub">TOTP với Google Authenticator</div>
                    </div>
                    <button className="pg-toggle-btn on"><span /></button>
                  </div>
                  <button className="pg-submit-btn" onClick={() => window.open('http://localhost:3000', '_blank')}>
                    📊 Xem báo cáo bảo mật CyberDef
                  </button>
                </div>
              </div>

              <div className="pg-panel">
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

              {attackStats.attempts > 0 && (
                <div className="pg-panel" style={{ gridColumn: '1/-1' }}>
                  <div className="pg-panel-title" style={{ marginBottom: 16 }}>📈 Tóm tắt tấn công phiên này</div>
                  <div className="pg-attack-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                    <div className="pg-attack-stat"><div className="pg-attack-stat-val">{attackStats.attempts}</div><div className="pg-attack-stat-label">Tổng cố gắng</div></div>
                    <div className="pg-attack-stat danger"><div className="pg-attack-stat-val">{attackStats.blocked}</div><div className="pg-attack-stat-label">Đã chặn</div></div>
                    <div className="pg-attack-stat warning"><div className="pg-attack-stat-val">{attackStats.tarpit}</div><div className="pg-attack-stat-label">Bị Tarpit</div></div>
                    <div className="pg-attack-stat danger"><div className="pg-attack-stat-val" style={{ fontSize: 18 }}>{fmtVND(attackStats.stolen)}</div><div className="pg-attack-stat-label">Thiệt hại</div></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Code Shield Modal */}
      {showCodeModal && <CodeShieldModal onClose={() => setShowCodeModal(false)} />}

      {/* Toasts */}
      <ToastStack toasts={toasts} />
    </div>
  );
}