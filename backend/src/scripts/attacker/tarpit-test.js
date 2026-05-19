const http = require('http');
const https = require('https');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

const TARGET = new URL('http://localhost:5000/api/auth/login');
const ATTEMPTS = 8;
const TEST_IP = process.env.TARPIT_TEST_IP || '10.0.0.99';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function requestJson(url, body) {
    const payload = JSON.stringify(body);
    const client = url.protocol === 'https:' ? https : http;

    const options = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': TEST_IP,
            'X-Real-IP': TEST_IP,
            'Content-Length': Buffer.byteLength(payload),
        },
    };

    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function main() {
    console.log(`${CYAN}TARPIT ATTACK DEMO${RESET}`);

    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
        const startedAt = Date.now();

        try {
            const response = await requestJson(TARGET, {
                email: 'tranghuyen20051312@gmail.com',
                password: 'wrong-password',
            });
            const elapsed = Date.now() - startedAt;
            const tarpitActive = elapsed >= 3000;

            if (response.statusCode === 429) {
                console.log(`${YELLOW}[ATTEMPT ${attempt}] POST /api/auth/login → 429 (${elapsed}ms) — BLOCKED${RESET}`);
                break;
            }

            const statusColor = response.statusCode === 200 ? GREEN : RED;
            console.log(`${statusColor}[ATTEMPT ${attempt}] POST /api/auth/login → ${response.statusCode} (${elapsed}ms)${tarpitActive ? ' — TARPIT ACTIVE' : ' — no tarpit'}${RESET}`);
        } catch (error) {
            const elapsed = Date.now() - startedAt;
            console.log(`${RED}[ATTEMPT ${attempt}] POST /api/auth/login → ERROR (${elapsed}ms) — ${error.message}${RESET}`);
        }

        if (attempt < ATTEMPTS) {
            await wait(250);
        }
    }

    console.log(`${YELLOW}Done. Watch the dashboard for tarpit_active events and delayed responses from ${TEST_IP}.${RESET}`);
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});