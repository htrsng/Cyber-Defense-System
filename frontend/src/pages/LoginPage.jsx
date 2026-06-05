import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage({ onBack }) {
    const { login, verifyTwoFactor } = useAuth();
    const [step, setStep] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [pendingUserId, setPendingUserId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const data = await login(email, password);

            if (data.requiresTwoFactor) {
                setStep('otp');
                setPendingUserId(data.userId);
                setOtp('');
                return;
            }

            setStep('login');
            setPendingUserId(null);
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleTwoFactorSubmit = async (e) => {
        e.preventDefault();
        if (!pendingUserId) return;

        setError('');
        setLoading(true);
        try {
            await verifyTwoFactor(pendingUserId, otp);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', background: 'var(--bg-base)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: '10px 14px', color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-base)',
        }}>
            {/* Grid overlay */}
            <div style={{
                position: 'fixed', inset: 0, opacity: 0.04,
                backgroundImage: 'linear-gradient(var(--cyan) 1px, transparent 1px), linear-gradient(90deg, var(--cyan) 1px, transparent 1px)',
                backgroundSize: '40px 40px', pointerEvents: 'none',
            }} />

            <div style={{ width: 400, position: 'relative' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 700,
                        color: 'var(--cyan)', letterSpacing: '0.12em', marginBottom: 8,
                    }}>
                        ◈ CYBERDEF
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
                        HỆ THỐNG AI THREAT MONITORING
                    </div>
                </div>

                {onBack && (
                    <button 
                        onClick={onBack} 
                        className="btn btn-outline" 
                        style={{ marginBottom: 20, fontSize: 12, padding: '6px 12px' }}>
                        ← Trở về trang chủ
                    </button>
                )}

                {/* Login card */}
                <div className="card" style={{ padding: '32px 28px' }}>
                    <div style={{
                        fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 600,
                        letterSpacing: '0.1em', color: 'var(--text-muted)',
                        marginBottom: 24, textTransform: 'uppercase',
                    }}>
                        Xác thực
                    </div>

                    <form onSubmit={step === 'otp' ? handleTwoFactorSubmit : handleLogin}>
                        {step === 'otp' && (
                            <div style={{
                                marginBottom: 16,
                                padding: '10px 12px',
                                borderRadius: 4,
                                border: '1px solid var(--cyan)44',
                                background: 'var(--cyan-dim)',
                                color: 'var(--cyan)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                            }}>
                                🔐 Nhập mã xác thực từ Google Authenticator
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 6 }}>
                                EMAIL
                            </label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={step === 'otp'}
                                placeholder="admin@cyberdef.io (demo)" style={inputStyle} required />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 6 }}>
                                {step === 'otp' ? 'OTP CODE' : 'PASSWORD'}
                            </label>
                            {step === 'otp' ? (
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="123456"
                                    style={inputStyle}
                                    required
                                />
                            ) : (
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" style={inputStyle} required />
                            )}
                        </div>

                        {error && (
                            <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 16, padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 4 }}>
                                ✗ {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}
                            disabled={loading}>
                            {loading ? '⟳ ĐANG XÁC THỰC...' : step === 'otp' ? '▶ XÁC MINH OTP' : '▶ TRUY CẬP HỆ THỐNG'}
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                    Mọi lần truy cập đều được giám sát và ghi log
                </div>
            </div>
        </div>
    );
}
