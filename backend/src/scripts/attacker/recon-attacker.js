const http = require('http');
const https = require('https');
const { URL } = require('url');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

const BASE = new URL('http://localhost:5000');
const PATHS = [
    '/phpmyadmin',
    '/admin/backup',
    '/wp-admin',
    '/.env',
    '/api/admin/users'
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getFormattedTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

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

async function fetchSecurityEnabled() {
    try {
        const statusRes = await get(new URL('http://localhost:5000/api/payguard/status'));
        if (statusRes && statusRes.body) {
            const parsed = typeof statusRes.body === 'string' ? JSON.parse(statusRes.body || '{}') : statusRes.body;
            return parsed.securityEnabled === true;
        }
    } catch (e) {
        return false;
    }
    return false;
}

async function main() {
    console.log(`\n${BOLD}${RED}🔴 KỊCH BẢN 3: "Honeypot bắt hacker" — Attacker tự lộ mặt${RESET}\n`);
    console.log(`Nhân vật: Hacker ẩn danh · Đang scan hệ thống PayGuard\n`);

    console.log(`${YELLOW}Diễn biến:${RESET}\n`);
    console.log(`${getFormattedTime()}  Hacker dùng tool tự động scan PayGuard`);
    console.log(`          Tìm endpoint yếu để khai thác\n`);
    await wait(1000);

    const isProtected = await fetchSecurityEnabled();

    for (let i = 0; i < PATHS.length; i += 1) {
        const path = PATHS[i];
        const target = new URL(path, BASE);

        // send actual request
        await get(target);

        if (isProtected) {
            console.log(`${getFormattedTime()}  GET ${path.padEnd(20)} → ${YELLOW}[CyberDef: HONEYPOT]${RESET}`);
        } else {
            console.log(`${getFormattedTime()}  GET ${path.padEnd(20)} → [404 Not Found]`);
        }
        await wait(600);
    }

    console.log(`\n          Hacker không biết đây là bẫy.`);
    console.log(`          Hệ thống PayGuard thật không hề tồn tại ở những path này.\n`);
    await wait(1500);

    if (isProtected) {
        console.log(`${getFormattedTime()}  ${CYAN}🍯 CyberDef ghi nhận:${RESET}`);
        console.log(`          → IP 10.0.0.77 đã truy cập 5 honeypot endpoints`);
        console.log(`          → Đây chắc chắn là attacker, không phải user thật`);
        console.log(`          → IP bị ban vĩnh viễn`);
        console.log(`          → Alert: "Reconnaissance attack detected"\n`);
        await wait(2000);

        console.log(`${getFormattedTime()}  Hacker tiếp tục scan — không nhận được phản hồi gì`);
        console.log(`          Mọi request tiếp theo đều bị drop silently\n`);
        console.log(`          Hacker không biết đã bị phát hiện và blacklist.`);
        console.log(`          Họ nghĩ PayGuard đang offline.\n`);
        await wait(1000);

        console.log(`${BOLD}"Honeypot không chặn hacker — nó bẫy hacker.`);
        console.log(`Chúng tôi không cần biết hacker là ai.`);
        console.log(`Chúng tôi chỉ cần biết: ai truy cập /phpmyadmin — đó không phải khách hàng.`);
        console.log(`Và IP đó sẽ không bao giờ chạm được đến PayGuard nữa."${RESET}\n`);
    } else {
        console.log(`${getFormattedTime()}  Hacker tiếp tục scan...`);
        console.log(`          Không có Honeypot để phát hiện ý đồ xấu sớm.`);
        console.log(`          Hacker có thể thoải mái thử hàng ngàn endpoint khác cho đến khi tìm ra lỗ hổng.\n`);
    }
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});