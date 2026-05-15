import { useState, useEffect, useRef, useCallback } from "react";
import { simulateAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

// ─── Constants ────────────────────────────────────────────────────────────────
const ATTACKS = {
    brute: {
        id: "brute",
        label: "Brute Force",
        icon: "⚡",
        color: "#ff3d5a",
        glow: "#ff3d5a66",
        packets: 15,
        description: "Thử 15 mật khẩu phổ biến liên tiếp",
        passwords: ["123456", "password", "admin123", "qwerty", "letmein", "welcome", "monkey", "dragon", "master", "666666", "password1", "admin", "root", "toor", "pass123"],
        endpoint: "POST /api/auth/login",
        defenseLabel: "Rate Limiter + IP Block",
        defenseIcon: "🛡",
    },
    sqli: {
        id: "sqli",
        label: "SQL Injection",
        icon: "💉",
        color: "#ff7a1a",
        glow: "#ff7a1a66",
        packets: 5,
        description: "Chèn SQL độc hại vào form đăng nhập",
        passwords: ["' OR 1=1 --", "admin'--", "' UNION SELECT *", "'; DROP TABLE;--", "' OR 'x'='x"],
        endpoint: "POST /api/auth/login",
        defenseLabel: "Input Sanitization + ORM",
        defenseIcon: "🔒",
    },
    recon: {
        id: "recon",
        label: "Reconnaissance",
        icon: "🔍",
        color: "#ffb300",
        glow: "#ffb30066",
        packets: 8,
        description: "Dò tìm file nhạy cảm trên server",
        passwords: ["/.env", "/admin/secret", "/wp-admin", "/admin/backup", "/phpmyadmin", "/api/config", "/.git/config", "/admin/passwd"],
        endpoint: "GET /[path]",
        defenseLabel: "Honeypot + Instant Flag",
        defenseIcon: "🍯",
    },
};

const PACKET_COLORS = { brute: "#ff3d5a", sqli: "#ff7a1a", recon: "#ffb300" };

// ─── Particle system ──────────────────────────────────────────────────────────
function useAnimFrame(cb) {
    const rafRef = useRef();
    const cbRef = useRef(cb);
    cbRef.current = cb;
    useEffect(() => {
        const loop = () => { cbRef.current(); rafRef.current = requestAnimationFrame(loop); };
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AttackVisualizerPage() {
    const { user } = useAuth();
    const canvasRef = useRef(null);
    const stateRef = useRef({ particles: [], blocked: false, phase: "idle", attackType: null, tick: 0 });
    const [phase, setPhase] = useState("idle");      // idle | running | blocked | defended
    const [attackType, setAttackType] = useState("brute");
    const [log, setLog] = useState([]);
    const [stats, setStats] = useState({ attempts: 0, blocked: 0, riskScore: 0 });
    const [currentPayload, setCurrentPayload] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customPayloads, setCustomPayloads] = useState([]);
    const [useCustom, setUseCustom] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [history, setHistory] = useState([]);
    const [showComparison, setShowComparison] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState(null);
    const [backendConnected, setBackendConnected] = useState(false);
    const timeoutRefs = useRef([]);

    // Check backend connection on mount
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/health`, {
                    method: 'GET',
                    timeout: 5000
                });
                setBackendConnected(response.ok);
            } catch (err) {
                console.warn('Backend health check failed:', err);
                setBackendConnected(false);
            }
        };

        checkBackend();
        const interval = setInterval(checkBackend, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const attack = ATTACKS[attackType];

    // ── Canvas renderer ──────────────────────────────────────────────────────
    useAnimFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const W = canvas.width, H = canvas.height;
        const s = stateRef.current;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = "rgba(0,212,255,0.04)";
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        s.tick++;

        // Update + draw particles
        s.particles = s.particles.filter(p => p.life > 0);
        for (const p of s.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 1;
            p.vy += 0.05; // gravity

            const alpha = Math.max(0, p.life / p.maxLife);
            if (alpha < 0.02) continue; // Skip drawing very faint particles

            const radius = Math.max(0.5, p.r * alpha); // Ensure minimum radius
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
            ctx.fill();

            // Trail
            if (p.trail) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 8, p.y - p.vy * 8);
                ctx.strokeStyle = p.color + Math.floor(alpha * 120).toString(16).padStart(2, "0");
                ctx.lineWidth = Math.max(0.5, p.r * 0.6);
                ctx.stroke();
            }
        }

        // Pulsing server node
        const sx = W * 0.72, sy = H * 0.5;
        const pulse = Math.sin(s.tick * 0.04) * 4;
        const serverColor = s.phase === "blocked" ? "#ff3d5a" : s.phase === "defended" ? "#00ff88" : "#00d4ff";

        ctx.beginPath();
        ctx.arc(sx, sy, 28 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = serverColor + "44";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, 22, 0, Math.PI * 2);
        ctx.fillStyle = "#0d1117";
        ctx.fill();
        ctx.strokeStyle = serverColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Server icon
        ctx.fillStyle = serverColor;
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⬡", sx, sy);

        // Attacker node
        const ax = W * 0.18, ay = H * 0.5;
        const aColor = s.phase === "idle" ? "#2d4a66" : PACKET_COLORS[s.attackType] || "#ff3d5a";

        ctx.beginPath();
        ctx.arc(ax, ay, 22, 0, Math.PI * 2);
        ctx.fillStyle = "#0d1117";
        ctx.fill();
        ctx.strokeStyle = aColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = aColor;
        ctx.font = "16px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("☠", ax, ay);

        // Shield (firewall) node — middle
        const fx = W * 0.5, fy = H * 0.5;
        const fColor = s.phase === "blocked" || s.phase === "defended" ? "#00ff88" : "#1e2d3d";

        ctx.beginPath();
        // hexagon shield
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = fx + 20 * Math.cos(angle);
            const hy = fy + 20 * Math.sin(angle);
            i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fillStyle = "#0d1117";
        ctx.fill();
        ctx.strokeStyle = fColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = fColor;
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🛡", fx, fy);

        // Labels
        ctx.font = "bold 11px 'Share Tech Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#5a7a99";

        ctx.fillText("ATTACKER", ax, ay + 36);
        ctx.fillStyle = aColor === "#2d4a66" ? "#2d4a66" : "#e2eaf4";
        ctx.fillText(s.attackType ? `[${s.attackType.toUpperCase()}]` : "[IDLE]", ax, ay + 50);

        ctx.fillStyle = "#5a7a99";
        ctx.fillText("FIREWALL", fx, fy + 36);

        ctx.fillStyle = "#5a7a99";
        ctx.fillText("SERVER", sx, sy + 36);
        ctx.fillStyle = serverColor;
        ctx.fillText(s.phase === "blocked" ? "[UNDER ATTACK]" : s.phase === "defended" ? "[PROTECTED]" : "[ONLINE]", sx, sy + 50);
    });

    // ── Spawn packet ──────────────────────────────────────────────────────────
    const spawnPacket = useCallback((blocked = false) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const W = canvas.width, H = canvas.height;
        const s = stateRef.current;
        const color = PACKET_COLORS[s.attackType] || "#ff3d5a";

        const ax = W * 0.18, ay = H * 0.5;
        const fx = W * 0.5, fy = H * 0.5;
        const sx = W * 0.72, sy = H * 0.5;

        // Packets from attacker to firewall
        for (let i = 0; i < 6; i++) {
            const t = i / 6;
            s.particles.push({
                x: ax + (fx - ax) * t + (Math.random() - 0.5) * 20,
                y: ay + (Math.random() - 0.5) * 30,
                vx: (fx - ax) / 40 + Math.random() * 0.5,
                vy: (Math.random() - 0.5) * 1.5,
                r: 3 + Math.random() * 2,
                color,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                trail: true,
            });
        }

        if (!blocked) {
            // Packets reach server
            setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                    s.particles.push({
                        x: fx + (sx - fx) * (Math.random() * 0.3),
                        y: fy + (Math.random() - 0.5) * 20,
                        vx: (sx - fx) / 35,
                        vy: (Math.random() - 0.5) * 1,
                        r: 2.5,
                        color,
                        life: 25,
                        maxLife: 25,
                        trail: true,
                    });
                }
            }, 300);
        } else {
            // Blocked — scatter particles at firewall
            setTimeout(() => {
                for (let i = 0; i < 12; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    s.particles.push({
                        x: fx,
                        y: fy,
                        vx: Math.cos(angle) * (2 + Math.random() * 3),
                        vy: Math.sin(angle) * (2 + Math.random() * 3) - 1,
                        r: 2 + Math.random() * 2,
                        color: "#00ff88",
                        life: 40,
                        maxLife: 40,
                        trail: false,
                    });
                }
            }, 200);
        }
    }, []);

    // ── Run attack with backend integration ─────────────────────────────────────────
    const runAttack = useCallback(async () => {
        if (stateRef.current.phase === "running" || user?.role !== "admin") {
            if (user?.role !== "admin") {
                setError("⚠️ Simulation requires admin role");
                return;
            }
            return;
        }

        // Clear previous timeouts
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];

        const atk = ATTACKS[attackType];
        stateRef.current.phase = "running";
        stateRef.current.attackType = attackType;
        stateRef.current.blocked = false;
        setPhase("running");
        setLog([]);
        setStats({ attempts: 0, blocked: 0, riskScore: 0 });
        setIsLoading(true);
        setError(null);

        const pushLog = (msg, type = "info") => {
            setLog(prev => [{ msg, type, ts: new Date().toLocaleTimeString("en", { hour12: false }) }, ...prev].slice(0, 20));
        };

        const payloads = useCustom && customPayloads.length > 0 ? customPayloads : atk.passwords;

        pushLog(`Initiating ${atk.label} attack...`, "warn");
        pushLog(`Target: ${atk.endpoint}`, "info");
        pushLog(`Total attempts: ${payloads.length}`, "info");

        const attackRecord = { attackType, timestamp: new Date(), payloads: [], duration: 0 };
        const startTime = Date.now();

        // Call backend API based on attack type
        try {
            if (attackType === "brute") {
                const backendRes = await simulateAPI.bruteForce({
                    iterations: payloads.length,
                    customPayloads: useCustom ? payloads : undefined
                });
                pushLog(`✓ Backend response: ${backendRes.data.message}`, "success");
                if (backendRes.data.results) {
                    attackRecord.payloads = backendRes.data.results;
                }
            } else if (attackType === "sqli") {
                const backendRes = await simulateAPI.sqli({
                    customPayloads: useCustom ? payloads : undefined
                });
                pushLog(`✓ Backend response: ${backendRes.data.message}`, "success");
                if (backendRes.data.results) {
                    attackRecord.payloads = backendRes.data.results;
                }
            }
        } catch (err) {
            let errMsg = "❌ Backend error";

            if (err.response?.status === 403) {
                errMsg = "❌ Permission denied - admin only";
            } else if (err.response?.status === 500) {
                errMsg = `❌ Server error: ${err.response.data?.details || err.response.data?.error || err.message}`;
            } else if (err.response?.status) {
                errMsg = `❌ Error (${err.response.status}): ${err.response.data?.error || err.message}`;
            } else if (err.message) {
                errMsg = `❌ ${err.message}`;
            }

            pushLog(errMsg, "fail");
            setError(errMsg);
            stateRef.current.phase = "idle";
            setPhase("idle");
            setIsLoading(false);
            console.error("Backend API error:", err);
            return;
        }

        // Simulate visual attack sequence
        payloads.forEach((payload, i) => {
            const delay = Math.max(100, (600 / speed)); // speed affects timing
            const isLast = i === payloads.length - 1;
            const blocked = i >= 4; // block after 5 attempts

            const t = setTimeout(() => {
                if (isPaused) {
                    // Re-queue if paused
                    timeoutRefs.current.push(setTimeout(() => {
                        if (!isPaused) return;
                    }, 100));
                    return;
                }

                setCurrentPayload(payload);
                setStats(prev => ({
                    attempts: i + 1,
                    blocked: blocked ? prev.blocked + 1 : prev.blocked,
                    riskScore: Math.min(95, Math.floor(((i + 1) / payloads.length) * (attackType === "recon" ? 95 : 65))),
                }));

                spawnPacket(blocked && i > 4);

                if (attackType === "brute") {
                    pushLog(`Attempt ${i + 1}/${payloads.length}: "${payload}" → ${blocked && i > 4 ? "BLOCKED" : "FAILED (401)"}`, blocked && i > 4 ? "blocked" : "fail");
                } else if (attackType === "sqli") {
                    pushLog(`[INJECT] ${payload} → ${blocked && i > 4 ? "BLOCKED" : "401 Unauthorized"}`, blocked && i > 4 ? "blocked" : "fail");
                } else {
                    pushLog(`[RECON] GET ${payload} → 404 (logged!)`, i >= 2 ? "warn" : "fail");
                }

                if (isLast) {
                    const endT = setTimeout(() => {
                        stateRef.current.phase = "defended";
                        setPhase("defended");
                        pushLog(`🛡 Attack neutralized — IP flagged as ${attackType === "recon" ? "CRITICAL" : "HIGH"} risk`, "success");
                        pushLog(`Risk Score: ${attackType === "recon" ? 95 : 60}/100 — all packets blocked`, "success");

                        attackRecord.duration = Date.now() - startTime;
                        attackRecord.success = true;
                        setHistory(prev => [attackRecord, ...prev].slice(0, 10));
                        setIsLoading(false);
                    }, 800);
                    timeoutRefs.current.push(endT);
                }
            }, delay * i);
            timeoutRefs.current.push(t);
        });
    }, [attackType, spawnPacket, speed, useCustom, customPayloads, user?.role, isPaused]);

    const reset = useCallback(() => {
        timeoutRefs.current.forEach(clearTimeout);
        stateRef.current = { particles: [], blocked: false, phase: "idle", attackType: null, tick: 0 };
        setPhase("idle");
        setLog([]);
        setStats({ attempts: 0, blocked: 0, riskScore: 0 });
        setCurrentPayload("");
        setIsLoading(false);
        setIsPaused(false);
    }, []);

    const exportReport = useCallback(() => {
        if (history.length === 0) {
            alert("No attack history to export");
            return;
        }

        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalAttacks: history.length,
                byType: history.reduce((acc, h) => { acc[h.attackType] = (acc[h.attackType] || 0) + 1; return acc; }, {}),
                avgDuration: Math.round(history.reduce((sum, h) => sum + h.duration, 0) / history.length),
            },
            attacks: history.map(h => ({
                type: h.attackType,
                timestamp: h.timestamp,
                duration: h.duration,
                payloadsUsed: h.payloads.length,
            })),
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attack-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [history]);

    const riskColor = (s) => s >= 80 ? "#ff3d5a" : s >= 60 ? "#ff7a1a" : s >= 35 ? "#ffb300" : s >= 15 ? "#00d4ff" : "#00ff88";

    return (
        <div style={{
            minHeight: "100vh", background: "var(--bg-base)",
            fontFamily: "var(--font-mono)",
            padding: "24px", color: "var(--text-primary)",
        }}>
            {/* Backend connection status */}
            <div style={{
                marginBottom: 16, padding: "10px 16px", borderRadius: 6,
                background: backendConnected ? "#00ff8811" : "#ff3d5a11",
                border: `1px solid ${backendConnected ? "#00ff8833" : "#ff3d5a33"}`,
                display: "flex", alignItems: "center", gap: 12, fontSize: 12,
            }}>
                <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: backendConnected ? "#00ff88" : "#ff3d5a",
                    animation: backendConnected ? "pulse 2s infinite" : "none",
                    flexShrink: 0,
                }} />
                <span style={{ color: backendConnected ? "#00ff88" : "#ff3d5a" }}>
                    {backendConnected ? "✓ Backend Connected" : "✗ Backend Offline - Please start: docker compose up -d"}
                </span>
            </div>

            {error && (
                <div style={{
                    background: "#ff3d5a22", border: "1px solid #ff3d5a44",
                    borderRadius: 6, padding: "12px 16px", marginBottom: 16, color: "#ff3d5a",
                    fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#ff3d5a", cursor: "pointer" }}>✕</button>
                </div>
            )}

            {/* Header with controls */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontSize: 22, fontFamily: "var(--font-head)", fontWeight: 700, letterSpacing: "0.1em", color: "var(--cyan)" }}>
                        ⚔ ATTACK VISUALIZER v2.0
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", marginTop: 2 }}>
                        BACKEND-INTEGRATED CYBER ATTACK SIMULATION & DEFENSE
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {["brute", "sqli", "recon"].map(id => (
                        <button key={id} onClick={() => { reset(); setAttackType(id); }}
                            style={{
                                padding: "8px 18px", borderRadius: 4, cursor: "pointer",
                                fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13,
                                letterSpacing: "0.06em", transition: "all 0.15s",
                                background: attackType === id ? `${ATTACKS[id].color}22` : "transparent",
                                color: attackType === id ? ATTACKS[id].color : "var(--text-muted)",
                                border: `1px solid ${attackType === id ? ATTACKS[id].color + "66" : "var(--border)"}`,
                            }}>
                            {ATTACKS[id].icon} {ATTACKS[id].label.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Attack description */}
            <div style={{
                padding: "10px 16px", marginBottom: 20,
                background: `${ATTACKS[attackType].color}11`, border: `1px solid ${ATTACKS[attackType].color}33`,
                borderRadius: 6, fontSize: 12, color: ATTACKS[attackType].color,
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <span>{ATTACKS[attackType].icon} <strong>{ATTACKS[attackType].label}:</strong> {ATTACKS[attackType].description}</span>
                <span style={{ color: "var(--text-muted)" }}>Endpoint: <span style={{ color: "var(--cyan)" }}>{ATTACKS[attackType].endpoint}</span></span>
            </div>

            {/* Main grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 24 }}>

                {/* Canvas + Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{
                        background: "var(--bg-base)", border: "1px solid var(--border)",
                        borderRadius: 10, overflow: "hidden", position: "relative",
                    }}>
                        <canvas ref={canvasRef} width={680} height={280}
                            style={{ display: "block", width: "100%", height: "auto", background: "var(--bg-alt)" }} />

                        {phase === "defended" && (
                            <div style={{
                                position: "absolute", top: 12, right: 12,
                                background: "#00ff8822", border: "1px solid #00ff8844",
                                borderRadius: 4, padding: "4px 10px",
                                fontSize: 11, color: "#00ff88", letterSpacing: "0.08em",
                            }}>
                                ✓ ATTACK NEUTRALIZED
                            </div>
                        )}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                        {[
                            { label: "ATTEMPTS", value: `${stats.attempts}/${ATTACKS[attackType].packets}`, color: ATTACKS[attackType].color },
                            { label: "BLOCKED", value: stats.blocked, color: "#00ff88" },
                            { label: "RISK SCORE", value: stats.riskScore, color: riskColor(stats.riskScore) },
                            { label: "DEFENSE", value: phase === "defended" ? "ACTIVE" : "READY", color: phase === "defended" ? "#00ff88" : "var(--text-muted)" },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: "var(--bg-base)", border: "1px solid var(--border)",
                                borderRadius: 8, padding: "14px 16px", textAlign: "center",
                            }}>
                                <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: 6 }}>{s.label}</div>
                                <div style={{ fontSize: 22, fontFamily: "var(--font-head)", fontWeight: 700, color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Current payload */}
                    {currentPayload && phase === "running" && (
                        <div style={{
                            background: "var(--bg-base)", border: `1px solid ${ATTACKS[attackType].color}44`,
                            borderRadius: 6, padding: "10px 16px",
                            display: "flex", alignItems: "center", gap: 12,
                        }}>
                            <span style={{ color: "var(--text-dim)", fontSize: 11 }}>CURRENT PAYLOAD</span>
                            <code style={{ color: ATTACKS[attackType].color, fontSize: 13, flex: 1 }}>{currentPayload}</code>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: ATTACKS[attackType].color, animation: "pulse 0.8s infinite", flexShrink: 0 }} />
                        </div>
                    )}

                    {/* Defense mechanism */}
                    <div style={{
                        background: "var(--bg-base)", border: `1px solid ${phase === "defended" ? "#00ff8844" : "var(--border)"}`,
                        borderRadius: 8, padding: "14px 16px",
                        display: "flex", alignItems: "center", gap: 16,
                        transition: "border-color 0.3s",
                    }}>
                        <span style={{ fontSize: 24 }}>{ATTACKS[attackType].defenseIcon}</span>
                        <div>
                            <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)" }}>DEFENSE MECHANISM</div>
                            <div style={{ fontSize: 14, color: phase === "defended" ? "#00ff88" : "var(--text-muted)", marginTop: 2 }}>
                                {ATTACKS[attackType].defenseLabel}
                            </div>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                            <span style={{
                                padding: "4px 12px", borderRadius: 3, fontSize: 11,
                                fontFamily: "var(--font-head)", fontWeight: 700, letterSpacing: "0.08em",
                                background: phase === "defended" ? "#00ff8822" : "var(--bg-alt)",
                                color: phase === "defended" ? "#00ff88" : "var(--text-muted)",
                                border: `1px solid ${phase === "defended" ? "#00ff8844" : "var(--border)"}`,
                            }}>
                                {phase === "defended" ? "✓ TRIGGERED" : "STANDBY"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right panel — log + controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Launch button */}
                    <button onClick={phase === "running" ? () => setIsPaused(!isPaused) : phase === "defended" ? reset : runAttack}
                        disabled={isLoading && phase !== "running"}
                        style={{
                            padding: "14px", borderRadius: 6, cursor: (isLoading && phase !== "running") ? "not-allowed" : "pointer",
                            fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15,
                            letterSpacing: "0.08em", transition: "all 0.2s",
                            background: phase === "defended" ? "#00ff8822" : phase === "running" ? "var(--bg-alt)" : `${ATTACKS[attackType].color}22`,
                            color: phase === "defended" ? "#00ff88" : phase === "running" ? (isPaused ? "#ffb300" : "var(--text-muted)") : ATTACKS[attackType].color,
                            border: `1px solid ${phase === "defended" ? "#00ff8844" : phase === "running" ? "var(--border)" : ATTACKS[attackType].color + "66"}`,
                            opacity: (isLoading && phase !== "running") ? 0.6 : 1,
                        }}>
                        {phase === "running" ? (isPaused ? "▶ RESUME" : "⏸ PAUSE") : phase === "defended" ? "↺ RESET" : `⚡ LAUNCH ${ATTACKS[attackType].label.toUpperCase()}`}
                    </button>

                    {/* Speed control */}
                    {phase === "running" && (
                        <div style={{
                            background: "var(--bg-base)", border: "1px solid var(--border)",
                            borderRadius: 6, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12,
                        }}>
                            <span style={{ fontSize: 10, color: "var(--text-dim)", whiteSpace: "nowrap" }}>SPEED</span>
                            <input type="range" min="0.5" max="3" step="0.5" value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                style={{ flex: 1, cursor: "pointer" }} />
                            <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 700 }}>{speed}x</span>
                        </div>
                    )}

                    {/* Attack log terminal */}
                    <div style={{
                        background: "var(--bg-alt)", border: "1px solid var(--border)",
                        borderRadius: 8, flex: 1, overflow: "hidden",
                        display: "flex", flexDirection: "column",
                    }}>
                        <div style={{
                            padding: "8px 14px", borderBottom: "1px solid var(--border)",
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: phase === "running" ? ATTACKS[attackType].color : "var(--text-dim)" }} />
                            <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--text-dim)" }}>ATTACK LOG</span>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto", padding: "10px 0", maxHeight: 380 }}>
                            {log.length === 0 ? (
                                <div style={{ padding: "20px 14px", color: "var(--text-dim)", fontSize: 12 }}>
                                    // Select attack type and launch...
                                </div>
                            ) : (
                                log.map((l, i) => (
                                    <div key={i} style={{
                                        padding: "4px 14px", fontSize: 11,
                                        color: l.type === "success" ? "#00ff88" : l.type === "blocked" ? "#00ff88" : l.type === "warn" ? "#ffb300" : l.type === "fail" ? "#ff3d5a" : "var(--text-muted)",
                                        borderLeft: `2px solid ${l.type === "success" ? "#00ff8844" : l.type === "fail" || l.type === "blocked" ? ATTACKS[attackType].color + "44" : "transparent"}`,
                                        marginLeft: 2,
                                    }}>
                                        <span style={{ color: "var(--text-dim)", marginRight: 8 }}>{l.ts}</span>
                                        {l.msg}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Attack flow diagram */}
                    <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: 10 }}>ATTACK CHAIN</div>
                        {[
                            { step: "1. RECON", desc: "Dò endpoint nhạy cảm", done: attackType === "recon" && phase === "defended" },
                            { step: "2. CREDENTIAL", desc: "Tấn công đăng nhập", done: attackType === "brute" && phase === "defended" },
                            { step: "3. INJECTION", desc: "Bypass xác thực", done: attackType === "sqli" && phase === "defended" },
                        ].map((s, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
                                opacity: s.done ? 1 : 0.4,
                            }}>
                                <div style={{
                                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                                    background: s.done ? "#00ff8822" : "var(--bg-alt)",
                                    border: `1px solid ${s.done ? "#00ff88" : "var(--text-dim)"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 9, color: s.done ? "#00ff88" : "var(--text-dim)",
                                }}>
                                    {s.done ? "✓" : i + 1}
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: s.done ? "#00ff88" : "var(--text-muted)" }}>{s.step}</div>
                                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom section — Custom payloads, History, Comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

                {/* Custom Payloads Editor */}
                <div style={{
                    background: "var(--bg-base)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12,
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", fontWeight: 700 }}>CUSTOM PAYLOADS</span>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} />
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Use Custom</span>
                        </label>
                    </div>
                    <textarea
                        placeholder="Enter payloads (one per line)..."
                        value={customPayloads.join('\n')}
                        onChange={(e) => setCustomPayloads(e.target.value.split('\n').filter(p => p.trim()))}
                        style={{
                            flex: 1, background: "var(--bg-alt)", border: "1px solid var(--border)",
                            borderRadius: 4, padding: "8px 12px", color: "var(--text-primary)",
                            fontFamily: "var(--font-mono)", fontSize: 10, resize: "none",
                            minHeight: 120, maxHeight: 200,
                        }} />
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                        {customPayloads.length} payload(s) ready
                    </div>
                </div>

                {/* Attack History */}
                <div style={{
                    background: "var(--bg-base)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12,
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", fontWeight: 700 }}>ATTACK HISTORY</span>
                        <button onClick={exportReport} disabled={history.length === 0}
                            style={{
                                background: "transparent", border: "1px solid var(--border)", borderRadius: 4,
                                padding: "4px 8px", fontSize: 9, cursor: history.length > 0 ? "pointer" : "not-allowed",
                                color: history.length > 0 ? "var(--cyan)" : "var(--text-dim)",
                                opacity: history.length > 0 ? 1 : 0.5,
                            }}>
                            ⬇ EXPORT
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                        {history.length === 0 ? (
                            <div style={{ color: "var(--text-dim)", fontSize: 10, paddingTop: 10 }}>No attacks recorded yet</div>
                        ) : (
                            history.map((h, i) => (
                                <div key={i} style={{
                                    background: "var(--bg-alt)", border: `1px solid ${ATTACKS[h.attackType].color}33`,
                                    borderRadius: 4, padding: "8px 10px", cursor: "pointer",
                                    transition: "all 0.2s",
                                    opacity: selectedForCompare === i ? 1 : 0.7,
                                    border: selectedForCompare === i ? `1px solid ${ATTACKS[h.attackType].color}66` : undefined,
                                }}
                                    onClick={() => setSelectedForCompare(selectedForCompare === i ? null : i)}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                        <span style={{ fontSize: 10, color: ATTACKS[h.attackType].color, fontWeight: 700 }}>
                                            {ATTACKS[h.attackType].icon} {ATTACKS[h.attackType].label}
                                        </span>
                                        <span style={{ fontSize: 9, color: "var(--text-dim)" }}>{h.duration}ms</span>
                                    </div>
                                    <div style={{ fontSize: 8, color: "var(--text-dim)" }}>
                                        {h.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Comparison Stats */}
                <div style={{
                    background: "var(--bg-base)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12,
                }}>
                    <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", fontWeight: 700, marginBottom: 6 }}>STATS & METRICS</span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, fontSize: 10 }}>
                        <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 4, padding: "8px 10px" }}>
                            <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>Total Attacks</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--cyan)" }}>{history.length}</div>
                        </div>
                        {history.length > 0 && (
                            <>
                                <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 4, padding: "8px 10px" }}>
                                    <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>Avg Duration</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: "#ffb300" }}>
                                        {Math.round(history.reduce((sum, h) => sum + h.duration, 0) / history.length)}ms
                                    </div>
                                </div>
                                <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 4, padding: "8px 10px" }}>
                                    <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>Success Rate</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: "#00ff88" }}>
                                        {Math.round((history.filter(h => h.success).length / history.length) * 100)}%
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: var(--bg-base); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
      `}</style>
        </div>
    );
}
