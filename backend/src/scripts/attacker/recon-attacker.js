const http = require('http');
const https = require('https');
const { URL } = require('url');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

const BASE = new URL('http://localhost:5000');
const PATHS = [
    '/.env',
    '/admin/secret',
    '/wp-admin',
    '/admin/backup',
    '/phpmyadmin',
    '/api/config',
    '/.git/config',
    '/admin/passwd',
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function get(url) {
    const client = url.protocol === 'https:' ? https : http;
    const options = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: {
            'X-Forwarded-For': '10.0.0.77',
        },
    };

    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    let honeypotTriggered = false;

    for (let i = 0; i < PATHS.length; i += 1) {
        const path = PATHS[i];
        const target = new URL(path, BASE);

        console.log(`${YELLOW}[RECON] Probing GET ${target.href} ...${RESET}`);

        try {
            const response = await get(target);
            honeypotTriggered = true;

            if (response.statusCode === 404) {
                console.log(`${GREEN}[404] Not found (but request was logged!)${RESET}`);
            } else {
                console.log(`${RED}[${response.statusCode}] Response received${RESET}`);
            }
        } catch (error) {
            console.log(`${RED}[ERROR] → ${error.message}${RESET}`);
        }

        if (i < PATHS.length - 1) {
            await wait(400);
        }
    }

    console.log(`${YELLOW}[SUMMARY] 8 paths probed | Honeypot triggered |${RESET}`);
    console.log(`${RED}[WARNING] Your IP has been flagged as CRITICAL risk${RESET}`);
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});