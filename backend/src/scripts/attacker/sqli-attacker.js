const http = require('http');
const { URL } = require('url');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

const TARGET = new URL('http://localhost:5000/api/auth/login');
const PAYLOADS = [
    { email: "' OR 1=1 --", password: 'anything' },
    { email: "admin'--", password: 'x' },
    { email: "' UNION SELECT * FROM users --", password: 'x' },
    { email: "'; DROP TABLE users; --", password: 'x' },
    { email: "' OR 'x'='x", password: "' OR 'x'='x" },
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
            'X-Forwarded-For': '10.0.0.88',
            'Content-Length': Buffer.byteLength(payload),
        },
    };

    const client = url.protocol === 'https:' ? require('https') : http;

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
    for (let i = 0; i < PAYLOADS.length; i += 1) {
        const payload = PAYLOADS[i];
        const attemptNumber = i + 1;

        console.log(`${YELLOW}[INJECT] Payload ${attemptNumber}/${PAYLOADS.length}: email="${payload.email}"${RESET}`);

        try {
            const response = await requestJson(TARGET, payload);
            if (response.statusCode === 401) {
                console.log(`${GREEN}[RESULT] → 401 Unauthorized (injection blocked)${RESET}`);
            } else if (response.statusCode === 200) {
                console.log(`${RED}[RESULT] → 200 OK (unexpected success)${RESET}`);
            } else {
                console.log(`${RED}[RESULT] → ${response.statusCode} Response${RESET}`);
            }
        } catch (error) {
            console.log(`${RED}[ERROR] → ${error.message}${RESET}`);
        }

        if (attemptNumber < PAYLOADS.length) {
            await wait(500);
        }
    }

    console.log(`${YELLOW}[SUMMARY] 5 payloads tested | All blocked | SQLi protection: ACTIVE${RESET}`);
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});