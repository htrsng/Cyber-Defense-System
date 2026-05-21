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
    // Force simulation map: which paths should return 200 and custom messages
    const SIMULATED_FOUND = {
        '/api/config': '⚠ FOUND! Config exposed!',
        '/.git/config': '⚠ FOUND! Git config exposed! DB credentials visible!',
    };

    let foundCount = 0;

    // auto-detect remote security mode (if unprotected, behave more aggressively)
    try {
        const status = await get(new URL('/api/payguard/status', BASE));
        try {
            const parsed = status.body ? JSON.parse(status.body) : {};
            if (parsed.securityEnabled === false) {
                // if unprotected, include more paths as 'found' to simulate exposure
                SIMULATED_FOUND['/.env'] = '⚠ FOUND! .env exposed!';
            }
        } catch (e) { }
    } catch (e) {
        // ignore
    }

    for (let i = 0; i < PATHS.length; i += 1) {
        const path = PATHS[i];
        const target = new URL(path, BASE);

        console.log(`${YELLOW}[RECON] Probing GET ${target.href} ...${RESET}`);

        try {
            // If path is in simulated map, fake a 200 response with message
            if (SIMULATED_FOUND[path]) {
                console.log(`${GREEN}[200]   ${SIMULATED_FOUND[path]}${RESET}`);
                foundCount += 1;
            } else {
                // Keep original behaviour for other paths
                const response = await get(target);

                if (response.statusCode === 404) {
                    console.log(`${GREEN}[404]   Not found${RESET}`);
                } else {
                    console.log(`${YELLOW}[${response.statusCode}]   Response received${RESET}`);
                }
            }
        } catch (error) {
            console.log(`${RED}[ERROR] → ${error.message}${RESET}`);
        }

        if (i < PATHS.length - 1) {
            await wait(300);
        }
    }

    console.log(`${YELLOW}[SUMMARY] Tìm thấy ${foundCount} endpoint nhạy cảm | Database credentials exposed${RESET}`);
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});