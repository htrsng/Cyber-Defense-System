import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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

                {/* Login card */}
                <div className="card" style={{ padding: '32px 28px' }}>
                    <div style={{
                        fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 600,
                        letterSpacing: '0.1em', color: 'var(--text-muted)',
                        marginBottom: 24, textTransform: 'uppercase',
                    }}>
                        Xác thực
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 6 }}>
                                EMAIL
                            </label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@cyberdef.io" style={inputStyle} required />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 6 }}>
                                PASSWORD
                            </label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" style={inputStyle} required />
                        </div>

                        {error && (
                            <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 16, padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 4 }}>
                                ✗ {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}
                            disabled={loading}>
                            {loading ? '⟳ ĐANG XÁC THỰC...' : '▶ TRUY CẬP HỆ THỐNG'}
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
