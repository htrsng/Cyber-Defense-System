import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function SimulatorPage() {
    const [protectionOn, setProtectionOn] = useState(false);
    const [step, setStep] = useState(1);
    const [logs, setLogs] = useState([]);
    const [isAttacking, setIsAttacking] = useState(false);
    const logEndRef = useRef(null);
    const navigate = useNavigate();

    const addLog = (type, msg) => {
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false }) + '.' + String(new Date().getMilliseconds()).padStart(3, '0');
        setLogs(prev => [...prev, { time, type, msg }]);
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const runAttack = (attackType) => {
        if (isAttacking) return;
        setIsAttacking(true);
        addLog('info', `[!] Khởi chạy tấn công: ${attackType}`);
        
        let delay = 0;
        const seq = [
            () => addLog('warning', `Connecting to target: payguard.localhost:4000...`),
            () => addLog('warning', `Sending malicious payloads...`)
        ];

        seq.forEach((fn, i) => setTimeout(fn, delay += 600));

        setTimeout(() => {
            if (!protectionOn) {
                addLog('error', `[SUCCESS] Tấn công thành công! Hệ thống phòng thủ không hoạt động.`);
                addLog('error', `[IMPACT] Chiếm quyền Admin. Thiệt hại ước tính: 1,000,000,000 ₫.`);
                setStep(3);
            } else {
                addLog('success', `[BLOCKED] Connection reset by peer. Yêu cầu bị chặn bởi CyberDef.`);
                addLog('success', `[INFO] Risk Score: 95/100. Hành động: Tarpit Activated. IP Blacklisted.`);
                setStep(5);
            }
            setIsAttacking(false);
        }, delay + 1000);

        if (step === 1 && !protectionOn) setStep(2);
        if (step === 3 && protectionOn) setStep(4);
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40, height: 'calc(100vh - 104px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 8 }}>Interactive Demo Lab</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Kịch bản giả lập các cuộc tấn công vào hệ thống PayGuard.</p>
                </div>
                
                {/* Progress Indicator */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5, 6].map(s => (
                        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ 
                                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold',
                                background: step >= s ? 'var(--color-cyan)' : 'var(--bg-hover)', color: step >= s ? '#000' : 'var(--text-muted)'
                            }}>
                                {s}
                            </div>
                            <div style={{ fontSize: 9, color: step >= s ? 'var(--color-cyan)' : 'var(--text-muted)' }}>BƯỚC {s}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: 24, flex: 1, minHeight: 0 }}>
                {/* LEFT COL: Attack Control */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* PayGuard Toggle */}
                    <div className="card" style={{ padding: 24, border: `2px solid ${protectionOn ? 'var(--color-green)' : 'var(--color-red)'}`, background: protectionOn ? 'rgba(52,211,153,0.05)' : 'rgba(239,68,68,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--text-primary)' }}>CyberDef Protection</div>
                            <div className={`toggle-switch ${protectionOn ? 'on' : ''}`} onClick={() => { setProtectionOn(!protectionOn); if(step === 3) setStep(4); }}>
                                <div className="toggle-thumb" />
                            </div>
                        </div>
                        {protectionOn ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-green)', fontWeight: 'bold', fontSize: 13 }}>
                                ✓ PayGuard đang được bảo vệ bởi CyberDef
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-red)', fontWeight: 'bold', fontSize: 13 }}>
                                ⚠ PayGuard đang KHÔNG được bảo vệ
                            </div>
                        )}
                    </div>

                    {/* Simulator Panel */}
                    <div className="card" style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>Attack Simulator</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button className="btn" onClick={() => runAttack('SQL_INJECTION')} disabled={isAttacking} style={{ padding: 16, background: 'var(--bg-red)', border: '1px solid var(--border-red)', color: 'var(--color-red)', justifyContent: 'flex-start', fontSize: 14 }}>
                                ▶ SQL Injection (Data Breach)
                            </button>
                            <button className="btn" onClick={() => runAttack('BRUTE_FORCE')} disabled={isAttacking} style={{ padding: 16, background: 'var(--bg-orange)', border: '1px solid var(--border-orange)', color: 'var(--color-orange)', justifyContent: 'flex-start', fontSize: 14 }}>
                                ▶ Brute Force Attack (Account Takeover)
                            </button>
                            <button className="btn" onClick={() => runAttack('HONEYPOT_SCAN')} disabled={isAttacking} style={{ padding: 16, background: 'var(--bg-purple)', border: '1px solid var(--border-purple)', color: 'var(--color-purple)', justifyContent: 'flex-start', fontSize: 14 }}>
                                ▶ Honeypot Scan (Reconnaissance)
                            </button>
                            <button className="btn" onClick={() => runAttack('COMBINED_ASSAULT')} disabled={isAttacking} style={{ padding: 16, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', justifyContent: 'flex-start', fontSize: 14 }}>
                                ▶ Tấn công tổng hợp
                            </button>
                        </div>

                        {step >= 5 && (
                            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
                                <button className="btn btn-primary" style={{ width: '100%', padding: 16 }} onClick={() => { setStep(6); navigate('/overview'); }}>
                                    Xem kết quả trên Dashboard →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COL: Terminal */}
                <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', background: '#060a0f', border: '1px solid var(--border-default)' }}>
                    <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>root@attacker-kali:~# console</span>
                        {isAttacking && <span className="dot-pulse" style={{ width: 8, height: 8, background: 'var(--color-red)', boxShadow: '0 0 8px var(--color-red)' }} />}
                    </div>
                    <div style={{ flex: 1, padding: 20, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6 }}>
                        {logs.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Waiting for command...</span>}
                        {logs.map((log, i) => (
                            <div key={i} style={{ 
                                color: log.type === 'error' ? 'var(--color-red)' : log.type === 'success' ? 'var(--color-green)' : log.type === 'warning' ? 'var(--color-amber)' : 'var(--color-cyan)',
                                marginBottom: 4
                            }}>
                                <span style={{ color: 'var(--text-muted)', marginRight: 12 }}>[{log.time}]</span>
                                {log.msg}
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}
