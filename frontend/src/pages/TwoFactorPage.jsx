import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

function buildOtpAuthUrl(secret, email) {
    if (!secret || !email) return '';
    const issuer = 'CyberDef';
    const label = encodeURIComponent(`${issuer} (${email})`);
    return `otpauth://totp/${label}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}`;
}

function StatusBadge({ enabled }) {
    return (
        <span className={`badge ${enabled ? 'safe' : 'critical'}`}>
            {enabled ? '✓ 2FA ACTIVE' : '✗ 2FA DISABLED'}
        </span>
    );
}

export default function TwoFactorPage() {
    const [step, setStep] = useState('status');
    const [status, setStatus] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const reloadStatus = async () => {
        try {
            const response = await api.get('/api/auth/2fa/status');
            setStatus(response.data);
        } catch {
            // ignore auth edge cases here; the shell already gates access
        }
    };

    useEffect(() => {
        reloadStatus();
    }, []);

    const normalizeOtp = (value) => value.replace(/\D/g, '').slice(0, 6);

    const handleSetup = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await api.post('/api/auth/2fa/setup');
            setQrCodeUrl(response.data.qrCodeUrl || '');
            setSecret(response.data.secret || '');
            setOtpInput('');
            setStep('setup');
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể thiết lập 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/2fa/verify', { token: otpInput });
            setSuccess('2FA đã được bật thành công!');
            setStep('done');
            await reloadStatus();
        } catch (err) {
            setError(err.response?.data?.error || 'OTP không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/api/auth/2fa/disable', { token: otpInput });
            setSuccess('2FA đã được tắt thành công!');
            setStep('done');
            setOtpInput('');
            await reloadStatus();
        } catch (err) {
            setError(err.response?.data?.error || 'OTP không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const onOtpChange = (value) => {
        setOtpInput(normalizeOtp(value));
    };

    const otpAuthUrl = buildOtpAuthUrl(secret, status?.email);
    const canDisable = Boolean(status?.enabled);

    return (
        <div>
            <div className="section-title">🔐 TWO-FACTOR AUTHENTICATION</div>

            {step === 'status' && (
                <>
                    <div style={{
                        padding: '12px 16px',
                        marginBottom: 18,
                        background: 'var(--amber-dim)',
                        border: '1px solid var(--amber)44',
                        borderRadius: 'var(--radius)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--amber)',
                    }}>
                        Bật 2FA để yêu cầu mã OTP từ Google Authenticator khi đăng nhập.
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <StatusBadge enabled={Boolean(status?.enabled)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">🔐 Bật 2FA</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 16 }}>
                                Thêm lớp bảo mật với Google Authenticator
                            </p>
                            <button className="btn btn-primary" onClick={handleSetup} disabled={loading || Boolean(status?.enabled)} style={{ width: '100%', justifyContent: 'center' }}>
                                SETUP 2FA
                            </button>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">🔓 Tắt 2FA</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 16 }}>
                                Nhập OTP để xác nhận tắt
                            </p>
                            <input
                                type="text"
                                value={otpInput}
                                onChange={(e) => onOtpChange(e.target.value)}
                                maxLength={6}
                                placeholder="123456"
                                disabled={!canDisable}
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-base)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '10px 14px',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 14,
                                    outline: 'none',
                                    marginBottom: 12,
                                }}
                            />
                            <button className="btn btn-ghost" onClick={handleDisable} disabled={loading || !canDisable} style={{ width: '100%', justifyContent: 'center' }}>
                                DISABLE
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{ marginTop: 16, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ marginTop: 16, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                            {success}
                        </div>
                    )}
                </>
            )}

            {step === 'setup' && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">2FA Setup</span>
                        <StatusBadge enabled={Boolean(status?.enabled)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    alt="2FA QR Code"
                                    width={200}
                                    height={200}
                                    style={{ border: '4px solid white', borderRadius: 8, background: '#fff' }}
                                />
                            ) : (
                                <QRCodeSVG value={otpAuthUrl || secret} size={200} bgColor="#ffffff" fgColor="#000000" />
                            )}
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>
                                Scan bằng Google Authenticator
                            </div>
                            <div style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 6,
                                border: '1px solid var(--border)',
                                background: 'var(--bg-base)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                wordBreak: 'break-all',
                            }}>
                                <div style={{ color: 'var(--text-dim)', marginBottom: 6 }}>Secret</div>
                                <div>{secret}</div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
                                OTP VERIFICATION
                            </div>
                            <ol style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8, paddingLeft: 20, marginBottom: 16 }}>
                                <li>Tải Google Authenticator</li>
                                <li>Scan QR code bên trái</li>
                                <li>Nhập mã 6 số bên dưới</li>
                            </ol>

                            <input
                                type="text"
                                inputMode="numeric"
                                value={otpInput}
                                onChange={(e) => onOtpChange(e.target.value)}
                                maxLength={6}
                                autoFocus
                                placeholder="000000"
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-base)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '14px 16px',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 24,
                                    letterSpacing: '0.28em',
                                    textAlign: 'center',
                                    outline: 'none',
                                    marginBottom: 14,
                                }}
                            />

                            <button className="btn btn-primary" onClick={handleVerify} disabled={loading || otpInput.length !== 6} style={{ width: '100%', justifyContent: 'center' }}>
                                ✓ XÁC NHẬN
                            </button>

                            {error && (
                                <div style={{ marginTop: 12, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 'done' && (
                <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
                    <div style={{ fontSize: 54, color: 'var(--green)', lineHeight: 1, marginBottom: 10 }}>✓</div>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, color: 'var(--green)', marginBottom: 8 }}>
                        {success || '2FA đã được bật thành công!'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
                        Từ bây giờ mỗi lần đăng nhập sẽ yêu cầu mã OTP
                    </div>
                    <button
                        className="btn btn-ghost"
                        onClick={async () => {
                            setStep('status');
                            setQrCodeUrl('');
                            setSecret('');
                            setOtpInput('');
                            setError('');
                            await reloadStatus();
                        }}
                        style={{ justifyContent: 'center' }}
                    >
                        ← Quay lại
                    </button>
                </div>
            )}
        </div>
    );
}