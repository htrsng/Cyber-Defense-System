const http = require('http');
const https = require('https');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

const BASE_URL = new URL(process.env.PAYGUARD_BASE_URL || 'http://localhost:5000');
const LOGIN_PATH = '/api/auth/login';
const TRANSFER_PATH = '/api/payguard/transfer';
const ATTEMPTS = Number(process.env.PAYGUARD_ATTEMPTS || 20);
const TEST_IP = process.env.PAYGUARD_TEST_IP || '10.0.0.77';
const EMAIL = process.env.PAYGUARD_EMAIL || 'tranghuyen20051312@gmail.com';
const PASSWORD = process.env.PAYGUARD_PASSWORD || 'Admin@123';
const TO_ACCOUNT = process.env.PAYGUARD_TO_ACCOUNT || 'PAY-00000000';
const TRANSFER_AMOUNT = Number(process.env.PAYGUARD_TRANSFER_AMOUNT || 500000);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulation mode: when true, the bot will not contact the real API
// Default: if PAYGUARD_SIMULATE env is set use it; otherwise read remote status endpoint
let SIMULATE = typeof process.env.PAYGUARD_SIMULATE !== 'undefined' ? process.env.PAYGUARD_SIMULATE !== 'false' : null;

async function fetchSecurityEnabled() {
    try {
        const url = new URL('/api/payguard/status', BASE_URL);
        const res = await requestJson(url, 'GET');
        if (res && res.body) {
            const parsed = typeof res.body === 'string' ? JSON.parse(res.body || '{}') : res.body;
            return parsed.securityEnabled === true;
        }
    } catch (e) {
        // ignore
    }
    return null;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getClient(url) {
    return url.protocol === 'https:' ? https : http;
}

function requestJson(url, method, body, headers = {}) {
    const payload = body ? JSON.stringify(body) : '';
    const client = getClient(url);

    const options = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search || ''}`,
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': TEST_IP,
            'X-Real-IP': TEST_IP,
            ...headers,
        },
    };

    if (payload) {
        options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsedBody = data;

                try {
                    parsedBody = data ? JSON.parse(data) : {};
                } catch {
                    // Keep raw body when it is not JSON.
                }

                resolve({
                    statusCode: res.statusCode,
                    body: parsedBody,
                });
            });
        });

        req.on('error', reject);

        if (payload) {
            req.write(payload);
        }

        req.end();
    });
}

async function login() {
    const loginUrl = new URL(LOGIN_PATH, BASE_URL);
    const response = await requestJson(loginUrl, 'POST', {
        email: EMAIL,
        password: PASSWORD,
    });

    if (response.statusCode !== 200 || !response.body?.token) {
        throw new Error(`Login failed with status ${response.statusCode}`);
    }

    return response.body.token;
}

async function main() {
    console.log(`${CYAN}╔════════════════════════════════════╗${RESET}`);
    console.log(`${CYAN}║  🤖 PAYGUARD TRANSFER BOT          ║${RESET}`);
    console.log(`${CYAN}║  Target : ${TEST_IP.padEnd(26)}║${RESET}`);
    console.log(`${CYAN}║  Endpoint: ${TRANSFER_PATH.padEnd(25)}║${RESET}`);
    console.log(`${CYAN}╚════════════════════════════════════╝${RESET}`);
    console.log('');

    // Determine simulation behavior
    if (SIMULATE === null) {
        const remoteSec = await fetchSecurityEnabled();
        // simulate when remote security is enabled; perform real transfers when unprotected
        SIMULATE = remoteSec === true;
    }

    let successful = 0;
    let blocked = 0;
    let totalStolen = 0;

    const t0 = Date.now();

    if (SIMULATE) {
        console.log(`${YELLOW}[BOT] Khởi động transfer bot — mục tiêu: ${TRANSFER_PATH}${RESET}`);

        for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
            // simulate elapsed time between 180ms and 210ms
            const elapsed = randomInt(180, 210);

            successful += 1;
            totalStolen += TRANSFER_AMOUNT;

            console.log(`${GREEN}[BOT] Transfer #${attempt}  → ${TRANSFER_AMOUNT.toLocaleString('vi-VN')}đ  → Thành công (${elapsed}ms)${RESET}`);

            // Pace so total time approximates 4 seconds for 20 attempts
            if (attempt < ATTEMPTS) {
                // small wait to simulate throughput; average ~200ms
                await wait(Math.max(10, elapsed - 170));
            }
        }

        const totalElapsed = Math.round((Date.now() - t0) / 1000);
        console.log('');
        console.log(`${YELLOW}════════════════════════════════════${RESET}`);
        console.log(`${CYAN}📊 TỔNG KẾT${RESET}`);
        console.log(`${GREEN}   ✓ Thành công  : ${successful} lần${RESET}`);
        console.log(`${RED}   ✗ Bị chặn    : ${blocked} lần${RESET}`);
        console.log(`${RED}   💸 Đã mất    : ${totalStolen.toLocaleString('vi-VN')}đ${RESET}`);
        console.log(`${YELLOW}   ⏱ Thời gian  : ${totalElapsed} giây${RESET}`);
        console.log(`${YELLOW}════════════════════════════════════${RESET}`);
        console.log(`${RED}[!] Tài khoản đã bị rút sạch trong ${totalElapsed} giây!${RESET}`);
        return;
    }

    // Real mode: perform login then transfers
    const token = await login();
    const authHeader = { Authorization: `Bearer ${token}` };

    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
        const startedAt = Date.now();

        try {
            const transferUrl = new URL(TRANSFER_PATH, BASE_URL);
            const response = await requestJson(transferUrl, 'POST', {
                amount: TRANSFER_AMOUNT,
                toAccount: TO_ACCOUNT,
                description: `Bot transfer ${attempt}`,
                metadata: {
                    attacker: true,
                    attempt,
                },
            }, authHeader);

            const elapsed = Date.now() - startedAt;

            if (response.statusCode === 429) {
                blocked += 1;
                const riskInfo = response.body?.riskScore ? ` | Risk: ${response.body.riskScore} ${(response.body.riskScore >= 80 ? 'CRITICAL' : response.body.riskScore >= 60 ? 'HIGH' : response.body.riskScore >= 35 ? 'MEDIUM' : 'LOW')}` : '';
                const reason = response.body?.reasons?.[0] ? ` | Lý do: ${response.body.reasons[0]}` : '';
                if (elapsed > 2000) {
                    console.log(`${YELLOW}[BOT] Attempt ${String(attempt).padStart(2)} → ${String(elapsed + 'ms').padStart(7)}  ⏱ TARPIT   —${riskInfo}${RESET}`);
                } else {
                    console.log(`${RED}[BOT] Attempt ${String(attempt).padStart(2)} → ${String(elapsed + 'ms').padStart(7)}  ✗ BLOCKED  —${riskInfo}${reason}${RESET}`);
                }
                continue;
            }

            if (response.statusCode >= 200 && response.statusCode < 300) {
                successful += 1;
                totalStolen += TRANSFER_AMOUNT;
                const curBal = 10000000 - totalStolen;
                console.log(`${GREEN}[BOT] Attempt ${String(attempt).padStart(2)} → ${String(elapsed + 'ms').padStart(7)}  ✓ SUCCESS   — Ch.tiền ${TRANSFER_AMOUNT.toLocaleString('vi-VN')}đ | Còn: ${curBal.toLocaleString('vi-VN')}đ${RESET}`);
            } else {
                blocked += 1;
                console.log(`${RED}[BOT] Attempt ${String(attempt).padStart(2)} → ${String(elapsed + 'ms').padStart(7)}  ✗ BLOCKED  — HTTP ${response.statusCode}${RESET}`);
            }
        } catch (error) {
            const elapsed = Date.now() - startedAt;
            blocked += 1;
            console.log(`${RED}[BOT] Attempt ${String(attempt).padStart(2)} → ${String(elapsed + 'ms').padStart(7)}  ✗ ERROR    — ${error.message}${RESET}`);
        }

        if (attempt < ATTEMPTS) {
            await wait(150);
        }
    }

    const totalElapsed2 = Math.round((Date.now() - t0) / 1000);
    const protectedAmt = (ATTEMPTS - successful) * TRANSFER_AMOUNT;
    console.log('');
    console.log(`${YELLOW}════════════════════════════════════${RESET}`);
    console.log(`${CYAN}📊 TỔNG KẾT${RESET}`);
    console.log(`${GREEN}   ✓ Thành công  : ${successful} lần${RESET}`);
    console.log(`${RED}   ✗ Bị chặn    : ${blocked} lần${RESET}`);
    console.log(`${RED}   💸 Đã mất    : ${totalStolen.toLocaleString('vi-VN')}đ${RESET}`);
    if (protectedAmt > 0) {
        console.log(`${GREEN}   🛡 Đã bảo vệ  : ${protectedAmt.toLocaleString('vi-VN')}đ${RESET}`);
    }
    console.log(`${YELLOW}   ⏱ Thời gian  : ${totalElapsed2} giây${RESET}`);
    console.log(`${YELLOW}════════════════════════════════════${RESET}`);
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});