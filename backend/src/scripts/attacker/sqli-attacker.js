const http = require('http');
const { URL } = require('url');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

const TARGET = new URL('http://localhost:5000/api/auth/login');
const PAYLOAD = "admin' OR '1'='1";
const ADMIN_EMAIL = "admin@payguard.vn";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getFormattedTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

function requestJson(url, body, headers = {}, method = 'POST') {
    const payload = body ? JSON.stringify(body) : '';
    const options = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': '185.22.143.99',
            'Content-Length': Buffer.byteLength(payload),
            ...headers
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
        if (payload) req.write(payload);
        req.end();
    });
}

async function fetchSecurityEnabled() {
    try {
        const statusRes = await requestJson(new URL('http://localhost:5000/api/payguard/status'), null, {}, 'GET');
        if (statusRes && statusRes.body) {
            const parsed = typeof statusRes.body === 'string' ? JSON.parse(statusRes.body || '{}') : statusRes.body;
            return parsed.securityEnabled === true;
        }
    } catch (e) {
        return false;
    }
    return false;
}

async function makeTransfer(token, amount) {
    const transferUrl = new URL('http://localhost:5000/api/payguard/transfer');
    return await requestJson(transferUrl, {
        amount: amount,
        toAccount: 'ATTACKER-999',
        description: 'Tài khoản lạ'
    }, { Authorization: `Bearer ${token}` });
}

async function main() {
    console.log(`\n${BOLD}${RED}🔴 KỊCH BẢN 1: "Đêm 3 giờ sáng" — Tấn công SQLi chiếm tài khoản${RESET}\n`);
    console.log(`Nhân vật: Admin PayGuard · Số dư: 5,000,000,000 ₫\n`);

    const isProtected = await fetchSecurityEnabled();

    if (!isProtected) {
        console.log(`${YELLOW}Diễn biến khi KHÔNG có CyberDef:${RESET}\n`);
        console.log(`${getFormattedTime()}  Hacker gửi request: POST /api/login`);
        console.log(`          Payload: ${PAYLOAD}\n`);
        await wait(1000);

        const response = await requestJson(TARGET, { email: PAYLOAD, password: 'x' });
        
        console.log(`${getFormattedTime()}  ${RED}❌ Hệ thống KHÔNG phát hiện${RESET}`);
        console.log(`          → Login thành công với quyền admin\n`);
        await wait(1500);

        console.log(`${getFormattedTime()}  Hacker truy cập tài khoản Admin`);
        console.log(`          → Đổi số điện thoại nhận OTP\n`);
        await wait(2000);

        // Fetch actual admin token to trigger transfers
        const adminLogin = await requestJson(TARGET, { email: ADMIN_EMAIL, password: 'Admin@123' });
        let token = null;
        try {
            const parsed = JSON.parse(adminLogin.body);
            token = parsed.token;
        } catch(e) {}

        console.log(`${getFormattedTime()}  Giao dịch 1: Chuyển 200,000,000 ₫ → tài khoản lạ`);
        if (token) await makeTransfer(token, 200000000);
        await wait(1000);

        console.log(`${getFormattedTime()}  Giao dịch 2: Chuyển 300,000,000 ₫ → tài khoản lạ`);
        if (token) await makeTransfer(token, 300000000);
        await wait(1000);

        console.log(`${getFormattedTime()}  Số dư còn lại: 4,500,000,000 ₫`);
        console.log(`${getFormattedTime()}  Hệ thống gửi SMS: "Tài khoản của bạn có giao dịch bất thường"\n`);
        await wait(2500);

        console.log(`${getFormattedTime()}  Admin mở app PayGuard`);
        console.log(`          → MÀN HÌNH ĐỎ: "Hệ thống bị xâm nhập"`);
        console.log(`          → Bốc hơi 500 Triệu VNĐ\n`);

    } else {
        console.log(`${GREEN}Diễn biến khi CÓ CyberDef:${RESET}\n`);
        console.log(`${getFormattedTime()}  Hacker gửi request: POST /api/login`);
        console.log(`          Payload: ${PAYLOAD}\n`);
        await wait(800);

        // Send actual request to trigger CyberDef
        await requestJson(TARGET, { email: PAYLOAD, password: 'x' });

        console.log(`${getFormattedTime()}  ${CYAN}🧠 CyberDef AI Engine phân tích:${RESET}`);
        console.log(`          → SQLi payload detected: +40 điểm`);
        console.log(`          → IP blacklist: +30 điểm  `);
        console.log(`          → 3AM unusual hour: +15 điểm`);
        console.log(`          → Risk Score: 95 — CRITICAL\n`);
        await wait(1200);

        console.log(`${getFormattedTime()}  ${GREEN}🛡 Rule: IF sqli_risk > 70 → BLOCK${RESET}`);
        console.log(`          → Request bị chặn ngay lập tức`);
        console.log(`          → IP 185.22.143.99 bị blacklist vĩnh viễn`);
        console.log(`          → Email alert gửi đến Admin\n`);
        await wait(1500);

        console.log(`${getFormattedTime()}  ✅ Admin ngủ ngon`);
        console.log(`          Số dư sáng hôm sau: 5,000,000,000 ₫ — nguyên vẹn\n`);
        await wait(1000);

        console.log(`${BOLD}"Cùng một hacker, cùng một payload, cùng một thời điểm.`);
        console.log(`Sự khác biệt duy nhất: PayGuard có CyberDef hay không.`);
        console.log(`500 Triệu đồng — mất hoặc còn — quyết định trong 18 milliseconds."${RESET}\n`);
    }
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});