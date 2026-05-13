import { useState } from 'react';
import { simulateAPI } from '../services/api';

function SimCard({ title, icon, description, color, children, onRun, running, label }) {
    return (
        <div className="card" style={{ borderColor: running ? color : undefined, boxShadow: running ? `0 0 20px ${color}22` : undefined }}>
            <div className="card-header">
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color }}>{icon}</span> {title}
                </span>
                {running && <span className="badge critical">RUNNING</span>}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>{description}</p>
            {children}
            <button
                className="btn"
                style={{ marginTop: 14, background: `${color}22`, color, borderColor: `${color}44`, width: '100%', justifyContent: 'center' }}
                onClick={onRun}
                disabled={running}
            >
                {running ? '⟳ RUNNING...' : `⚡ LAUNCH ${label}`}
            </button>
        </div>
    );
}

function Slider({ label, value, onChange, min, max, unit }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>{label}</span>
                <span style={{ color: 'var(--cyan)' }}>{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)' }} />
        </div>
    );
}

export default function SimulatePage({ logs }) {
    const [bfAttempts, setBfAttempts] = useState(15);
    const [bfDelay, setBfDelay] = useState(200);
    const [bfRunning, setBfRunning] = useState(false);
    const [bfResult, setBfResult] = useState(null);

    const [sqliRunning, setSquliRunning] = useState(false);
    const [sqliResult, setSqliResult] = useState(null);

    const [hpRunning, setHpRunning] = useState(false);
    const [hpResult, setHpResult] = useState(null);

    const [simLogs, setSimLogs] = useState([]);

    function pushLog(msg, color = 'var(--text-muted)') {
        setSimLogs(prev => [{ msg, color, ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 49)]);
    }

    const runBruteForce = async () => {
        setBfRunning(true); setBfResult(null);
        pushLog(`⚡ Launching brute force: ${bfAttempts} attempts @ ${bfDelay}ms delay`, 'var(--red)');
        try {
            const { data } = await simulateAPI.bruteForce({ attempts: bfAttempts, delayMs: bfDelay });
            setBfResult(data);
            pushLog(`✓ Brute force complete — ${data.blocked ? 'IP BLOCKED' : 'completed'} (Risk: ${data.finalRiskScore})`,
                data.blocked ? 'var(--red)' : 'var(--amber)');
        } catch {
            pushLog('✗ Simulation failed — backend not reachable', 'var(--text-dim)');
        } finally {
            setBfRunning(false);
        }
    };

    const runSQLi = async () => {
        setSquliRunning(true); setSqliResult(null);
        pushLog('💉 Injecting SQL payloads...', 'var(--orange)');
        try {
            const { data } = await simulateAPI.sqli({});
            setSqliResult(data);
            pushLog(`✓ SQLi simulation — ${data.payloadsTested} payloads tested, Risk: ${data.riskScore}`, 'var(--orange)');
        } catch {
            pushLog('✗ Simulation failed — backend not reachable', 'var(--text-dim)');
        } finally {
            setSquliRunning(false);
        }
    };

    const runHoneypot = async () => {
        setHpRunning(true); setHpResult(null);
        pushLog('🍯 Accessing honeypot endpoints...', 'var(--amber)');
        try {
            const { data } = await simulateAPI.honeypot();
            setHpResult(data);
            pushLog(`✓ Honeypot triggered — ${data.endpointsHit} endpoints, Risk: ${data.riskScore}`, 'var(--red)');
        } catch {
            pushLog('✗ Simulation failed — backend not reachable', 'var(--text-dim)');
        } finally {
            setHpRunning(false);
        }
    };

    return (
        <div>
            <div className="section-title">⚡ ATTACK SIMULATION ENGINE</div>

            <div style={{
                padding: '10px 16px', marginBottom: 20,
                background: 'var(--amber-dim)', border: '1px solid var(--amber)44',
                borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber)',
            }}>
                ⚠ DEMO MODE — Simulations call real API endpoints and generate real logs. All events are recorded and scored.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>

                {/* Brute Force */}
                <SimCard
                    title="Brute Force Attack"
                    icon="⚡" color="var(--red)"
                    description="Simulates rapid successive login attempts from a single IP to trigger rate limiting and anomaly detection."
                    onRun={runBruteForce} running={bfRunning} label="BRUTE FORCE"
                >
                    <Slider label="Attempts" value={bfAttempts} onChange={setBfAttempts} min={5} max={50} unit="" />
                    <Slider label="Delay (ms)" value={bfDelay} onChange={setBfDelay} min={50} max={1000} unit="ms" />
                    {bfResult && (
                        <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-base)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>RESULT</div>
                            <div style={{ color: 'var(--red)' }}>Attempts: {bfResult.attempts}</div>
                            <div style={{ color: bfResult.blocked ? 'var(--red)' : 'var(--green)' }}>
                                {bfResult.blocked ? '⛔ IP BLOCKED' : '✓ Not blocked'}
                            </div>
                            <div style={{ color: 'var(--amber)' }}>Risk Score: {bfResult.finalRiskScore}/100</div>
                        </div>
                    )}
                </SimCard>

                {/* SQLi */}
                <SimCard
                    title="SQL Injection Sim"
                    icon="💉" color="var(--orange)"
                    description="Sends common SQL injection payloads to login and search endpoints. Tests input sanitization and logging."
                    onRun={runSQLi} running={sqliRunning} label="SQL INJECTION"
                >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 2 }}>
                        Payloads: <span style={{ color: 'var(--orange)' }}>{"' OR 1=1 --"}</span><br />
                        {"' UNION SELECT * FROM users --"}<br />
                        {"'; DROP TABLE logs; --"}
                    </div>
                    {sqliResult && (
                        <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-base)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                            <div style={{ color: 'var(--orange)' }}>Payloads tested: {sqliResult.payloadsTested}</div>
                            <div style={{ color: 'var(--amber)' }}>Risk Score: {sqliResult.riskScore}/100</div>
                        </div>
                    )}
                </SimCard>

                {/* Honeypot */}
                <SimCard
                    title="Honeypot Trigger"
                    icon="🍯" color="var(--amber)"
                    description="Accesses hidden honeypot endpoints (/.env, /wp-admin, /admin/secret) to demonstrate instant detection."
                    onRun={runHoneypot} running={hpRunning} label="HONEYPOT"
                >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 2 }}>
                        Targets: <span style={{ color: 'var(--amber)' }}>/.env</span><br />
                        <span style={{ color: 'var(--amber)' }}>/admin/secret</span><br />
                        <span style={{ color: 'var(--amber)' }}>/wp-admin</span>
                    </div>
                    {hpResult && (
                        <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-base)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                            <div style={{ color: 'var(--red)' }}>Endpoints hit: {hpResult.endpointsHit}</div>
                            <div style={{ color: 'var(--amber)' }}>Risk Score: {hpResult.riskScore}/100</div>
                        </div>
                    )}
                </SimCard>
            </div>

            {/* Terminal log */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Simulation Terminal</span>
                    <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSimLogs([])}>
                        CLEAR
                    </button>
                </div>
                <div style={{
                    background: 'var(--bg-base)', borderRadius: 4, padding: 14,
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    minHeight: 160, maxHeight: 280, overflowY: 'auto',
                }}>
                    {simLogs.length === 0 ? (
                        <span style={{ color: 'var(--text-dim)' }}>// Launch a simulation above to see output here...</span>
                    ) : (
                        simLogs.map((l, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{l.ts}</span>
                                <span style={{ color: l.color }}>{l.msg}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
