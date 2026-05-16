import { useState } from 'react';
import { api } from '../services/api';

const PRESETS = [
    { label: 'Script tag', payload: "<script>alert('XSS hacked!')</script>" },
    { label: 'Img onerror', payload: '<img src=x onerror=alert(document.cookie)>' },
    { label: 'JS protocol', payload: "javascript:alert('stolen: '+document.cookie)" },
    { label: 'SVG payload', payload: '<svg onload=alert(1)>' },
    { label: 'Normal text', payload: 'Hello, this is safe input!' },
];

const HAZARD_PATTERNS = [
    /<script[\s\S]*?<\/script>/gi,
    /<img[^>]+onerror[^>]*>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<svg[\s\S]*?>[\s\S]*?<\/svg>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi,
    /document\.(cookie|location|write)/gi,
    /eval\s*\(/gi,
];

function buildDangerSpans(text) {
    const source = String(text ?? '');
    const matches = [];

    for (const pattern of HAZARD_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(source)) !== null) {
            matches.push({ start: match.index, end: match.index + match[0].length });
            if (match.index === pattern.lastIndex) {
                pattern.lastIndex += 1;
            }
        }
    }

    if (matches.length === 0) {
        return [source];
    }

    matches.sort((a, b) => a.start - b.start || a.end - b.end);
    const merged = [];

    for (const item of matches) {
        const last = merged[merged.length - 1];
        if (!last || item.start > last.end) {
            merged.push({ ...item });
        } else {
            last.end = Math.max(last.end, item.end);
        }
    }

    const parts = [];
    let cursor = 0;

    merged.forEach((segment, index) => {
        if (segment.start > cursor) {
            parts.push(source.slice(cursor, segment.start));
        }

        parts.push({
            key: `danger-${index}-${segment.start}`,
            text: source.slice(segment.start, segment.end),
        });

        cursor = segment.end;
    });

    if (cursor < source.length) {
        parts.push(source.slice(cursor));
    }

    return parts;
}

function renderDangerText(text, strike = false) {
    return buildDangerSpans(text).map((part, index) => {
        if (typeof part === 'string') {
            return <span key={`${index}-${part}`}>{part}</span>;
        }

        return (
            <span
                key={part.key}
                style={{
                    color: 'var(--red)',
                    background: 'var(--red-dim)',
                    padding: '0 2px',
                    borderRadius: 2,
                    textDecoration: strike ? 'line-through' : 'none',
                }}
            >
                {part.text}
            </span>
        );
    });
}

function ResultBlock({ title, result, mode }) {
    const isVulnerable = mode === 'vulnerable';
    const detected = Boolean(result?.detected);
    const blocked = Boolean(result?.blocked);
    const borderColor = isVulnerable ? (detected ? 'var(--red)' : 'var(--border)') : (blocked ? 'var(--green)' : 'var(--border)');
    const glow = isVulnerable ? 'var(--glow-red)' : '0 0 20px #00ff8844';

    return (
        <div className="card" style={{ borderColor, boxShadow: `0 0 0 1px ${borderColor}22, ${glow}` }}>
            <div className="card-header">
                <span className="card-title">{title}</span>
                <span className={`badge ${isVulnerable ? (detected ? 'critical' : 'low') : (blocked ? 'safe' : 'low')}`}>
                    {isVulnerable ? (detected ? '⚠ XSS INJECTED' : '✓ Safe') : (blocked ? '✓ XSS BLOCKED + SANITIZED' : '✓ Safe')}
                </span>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                {isVulnerable ? 'Raw reflection demo' : 'Sanitized reflection + CSP protection'}
            </div>

            {isVulnerable ? (
                <>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
                            Server response (raw):
                        </div>
                        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, minHeight: 88, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {result ? result.rendered : <span style={{ color: 'var(--text-dim)' }}>Waiting for payload...</span>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, marginBottom: 10, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        <span style={{ color: 'var(--text-dim)' }}>Echoed payload:</span>
                        <span style={{ color: result?.detected ? 'var(--red)' : 'var(--text-primary)', wordBreak: 'break-word' }}>{result?.payload || '—'}</span>
                    </div>

                    {detected && (
                        <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 6, background: 'var(--red-dim)', border: '1px solid var(--red)44' }}>
                            Script would execute in real browser!
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
                            Sanitized output:
                        </div>
                        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, minHeight: 88, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {result ? result.rendered : <span style={{ color: 'var(--text-dim)' }}>Waiting for payload...</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                            CSP header applied:
                        </div>
                        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', wordBreak: 'break-word' }}>
                            {result?.cspHeader || "default-src 'self'; script-src 'self'; object-src 'none'"}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
                            Diff: original vs sanitized
                        </div>
                        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div>
                                <span style={{ color: 'var(--text-dim)' }}>Original: </span>
                                <span>{result?.original ? renderDangerText(result.original, true) : '—'}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-dim)' }}>Sanitized: </span>
                                <span style={{ color: 'var(--green)' }}>{result?.rendered || '—'}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function TerminalLine({ entry }) {
    return (
        <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
            <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{entry.ts}</span>
            <span style={{ color: entry.color }}>{entry.msg}</span>
        </div>
    );
}

export default function XSSPage() {
    const [input, setInput] = useState(PRESETS[0].payload);
    const [leftResult, setLeftResult] = useState(null);
    const [rightResult, setRightResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [terminal, setTerminal] = useState([]);

    const pushTerminal = (msg, color = 'var(--text-muted)') => {
        setTerminal((prev) => [{ msg, color, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 60));
    };

    const fireBoth = async () => {
        setLoading(true);
        pushTerminal(`▶ Firing XSS payload against both endpoints`, 'var(--cyan)');

        try {
            const [leftResponse, rightResponse] = await Promise.all([
                api.post('/api/xss/vulnerable', { input, type: 'live' }),
                api.post('/api/xss/protected', { input, type: 'live' }),
            ]);

            setLeftResult(leftResponse.data);
            setRightResult(rightResponse.data);

            pushTerminal(`✓ Vulnerable endpoint responded with detected=${Boolean(leftResponse.data?.detected)}`, leftResponse.data?.detected ? 'var(--red)' : 'var(--green)');
            pushTerminal(`✓ Protected endpoint responded with blocked=${Boolean(rightResponse.data?.blocked)}`, rightResponse.data?.blocked ? 'var(--green)' : 'var(--amber)');
        } catch (error) {
            pushTerminal(`✗ Request failed: ${error.message}`, 'var(--red)');
        } finally {
            setLoading(false);
        }
    };

    const autoSimulate = async () => {
        setLoading(true);
        pushTerminal('🤖 Running automatic XSS simulation with 5 payloads...', 'var(--amber)');

        try {
            const { data } = await api.post('/api/xss/simulate');
            pushTerminal(`✓ Simulation complete — ${data.payloadsTested} payloads tested`, 'var(--green)');
            pushTerminal(`Risk score: ${data.riskScore}/100 | Level: ${data.level}`, 'var(--cyan)');
        } catch (error) {
            pushTerminal(`✗ Auto simulate failed: ${error.message}`, 'var(--red)');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="section-title">⚡ XSS ATTACK PLAYGROUND</div>

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
                Demo môi trường — endpoint VULNERABLE chỉ dùng để minh họa
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">Input Payload</span>
                    <span className="badge low">Live dual-endpoint test</span>
                </div>

                <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    spellCheck={false}
                    style={{
                        width: '100%',
                        minHeight: 80,
                        resize: 'vertical',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-base)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        padding: 12,
                        outline: 'none',
                        marginBottom: 14,
                    }}
                />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            className="btn btn-ghost"
                            onClick={() => setInput(preset.payload)}
                            style={{ padding: '7px 12px', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={fireBoth}
                    disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 18 }}
                >
                    {loading ? '⟳ ĐANG CHẠY...' : '▶ FIRE BOTH ENDPOINTS'}
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                    <ResultBlock
                        title="VULNERABLE ENDPOINT /api/xss/vulnerable"
                        result={leftResult}
                        mode="vulnerable"
                    />

                    <ResultBlock
                        title="PROTECTED ENDPOINT /api/xss/protected"
                        result={rightResult}
                        mode="protected"
                    />
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">XSS Simulation Console</span>
                    <button
                        className="btn btn-ghost"
                        onClick={autoSimulate}
                        disabled={loading}
                        style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                        🤖 AUTO SIMULATE (5 PAYLOADS)
                    </button>
                </div>

                <div style={{
                    background: 'var(--bg-base)',
                    borderRadius: 4,
                    padding: 14,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    minHeight: 160,
                    maxHeight: 280,
                    overflowY: 'auto',
                    border: '1px solid var(--border)',
                }}>
                    {terminal.length === 0 ? (
                        <span style={{ color: 'var(--text-dim)' }}>// Fire a payload or run auto simulate to view the terminal output...</span>
                    ) : (
                        terminal.map((entry, index) => <TerminalLine key={`${entry.ts}-${index}`} entry={entry} />)
                    )}
                </div>
            </div>
        </div>
    );
}