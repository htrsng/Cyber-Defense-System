/**
 * Demo script — chạy để xem Risk Scorer hoạt động
 * node src/demo-risk-scorer.js
 *
 * Giả lập các scenario khác nhau và in kết quả ra terminal
 */

// Mock Redis và ActivityLog để chạy standalone (không cần DB)
const mockRedisData = {};
const mockLogs = {};

// Override modules với mock
jest = null; // tắt jest nếu có

// ─── Inline mock scorer để demo ──────────────────────────────────────────────

const RULES = [
    { id: 'BRUTE_FORCE_MODERATE', label: 'Multiple failed logins (≥5 in 10 min)', weight: 40 },
    { id: 'BRUTE_FORCE_AGGRESSIVE', label: 'Aggressive brute force (≥10 failed logins)', weight: 20 },
    { id: 'HONEYPOT_ACCESS', label: 'Accessed honeypot endpoint (reconnaissance)', weight: 35 },
    { id: 'RATE_LIMIT_ABUSE', label: 'Repeatedly triggered rate limiter', weight: 20 },
    { id: 'SQLI_ATTEMPT', label: 'SQL injection payload detected', weight: 30 },
    { id: 'SUSPICIOUS_HOUR', label: 'Activity during unusual hours (2am–5am)', weight: 10 },
    { id: 'ENDPOINT_SCANNING', label: 'Accessed many different endpoints (scanning)', weight: 15 },
];

function scoreToLevel(score) {
    if (score >= 80) return 'CRITICAL 🔴';
    if (score >= 60) return 'HIGH     🟠';
    if (score >= 35) return 'MEDIUM   🟡';
    if (score >= 15) return 'LOW      🔵';
    return 'SAFE     🟢';
}

function simulateScore(triggeredRuleIds, label) {
    const triggered = RULES.filter(r => triggeredRuleIds.includes(r.id));
    const score = Math.min(100, triggered.reduce((s, r) => s + r.weight, 0));
    const level = scoreToLevel(score);

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📍 Scenario: ${label}`);
    console.log(`${'─'.repeat(60)}`);
    console.log(`   Score  : ${score}/100`);
    console.log(`   Level  : ${level}`);
    if (triggered.length === 0) {
        console.log(`   Reasons: (none — no suspicious activity)`);
    } else {
        triggered.forEach((r, i) => {
            console.log(`   Reason ${i + 1}: ${r.label} (+${r.weight})`);
        });
    }
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

console.log('\n🤖 AI RISK SCORER — DEMO');
console.log('════════════════════════════════════════════════════════════');

simulateScore(
    [],
    'Normal user (fresh IP, no activity)'
);

simulateScore(
    ['BRUTE_FORCE_MODERATE'],
    'Moderate brute force (5 failed logins in 10 min)'
);

simulateScore(
    ['BRUTE_FORCE_MODERATE', 'BRUTE_FORCE_AGGRESSIVE'],
    'Aggressive brute force (10+ failed logins)'
);

simulateScore(
    ['HONEYPOT_ACCESS'],
    'Attacker accessed /.env honeypot'
);

simulateScore(
    ['BRUTE_FORCE_MODERATE', 'RATE_LIMIT_ABUSE', 'SUSPICIOUS_HOUR'],
    'Automated attack tool at 3am'
);

simulateScore(
    ['HONEYPOT_ACCESS', 'SQLI_ATTEMPT', 'ENDPOINT_SCANNING'],
    'Advanced attacker: SQLi + honeypot + scanning'
);

simulateScore(
    ['BRUTE_FORCE_MODERATE', 'BRUTE_FORCE_AGGRESSIVE', 'HONEYPOT_ACCESS', 'SQLI_ATTEMPT', 'RATE_LIMIT_ABUSE'],
    'Full attack scenario (all major threats)'
);

console.log(`\n${'═'.repeat(60)}`);
console.log('✅ Risk scorer ready — rules are explainable & extensible');
console.log(`${'═'.repeat(60)}\n`);
