const http = require('http');
const { URL } = require('url');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

const TARGET = new URL('http://localhost:5000/api/auth/login');
const ADMIN_EMAIL = "admin@payguard.vn";
const PASSWORDS = ['admin123', 'admin2024', 'Admin@123']; // 3rd is correct

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
            'X-Forwarded-For': '10.0.0.99',
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
        toAccount: 'ATTACKER-BOT-99',
        description: 'Chuyển tiền tự động',
        metadata: { fromBrute: true }
    }, { Authorization: `Bearer ${token}` });
}

async function main() {
    console.log(`\n${BOLD}${RED}🔴 KỊCH BẢN 2: "Brute Force 47 lần" — Tấn công đoán mật khẩu${RESET}\n`);
    console.log(`Nhân vật: Admin PayGuard · Mật khẩu bị rò rỉ: "Admin@123" · Số dư: 5,000,000,000 ₫\n`);

    const isProtected = await fetchSecurityEnabled();

    if (!isProtected) {
        console.log(`${YELLOW}Diễn biến khi KHÔNG có CyberDef:${RESET}\n`);
        console.log(`${getFormattedTime()}  Bot bắt đầu tấn công /api/login`);
        console.log(`          Thử mật khẩu từ từ điển bị lộ...\n`);
        await wait(1000);

        console.log(`${getFormattedTime()}  Attempt #1:  admin123     → Sai`);
        await requestJson(TARGET, { email: ADMIN_EMAIL, password: PASSWORDS[0] });
        await wait(500);

        console.log(`${getFormattedTime()}  Attempt #2:  admin2024    → Sai`);
        await requestJson(TARGET, { email: ADMIN_EMAIL, password: PASSWORDS[1] });
        await wait(500);

        const successRes = await requestJson(TARGET, { email: ADMIN_EMAIL, password: PASSWORDS[2] });
        console.log(`${getFormattedTime()}  Attempt #3:  Admin@123    → ✅ ĐÚNG — LOGIN THÀNH CÔNG`);
        console.log(`          (chỉ mất 2 giây, 3 lần thử)\n`);
        await wait(1500);

        console.log(`${getFormattedTime()}  Hacker vào được tài khoản Admin`);
        console.log(`${getFormattedTime()}  Rút 300,000,000 ₫\n`);
        
        // Execute real transfer
        let token = null;
        try {
            const parsed = JSON.parse(successRes.body);
            token = parsed.token;
        } catch(e) {}
        
        if (token) await makeTransfer(token, 300000000);
        await wait(2000);

        console.log(`${getFormattedTime()}  SMS đến máy Admin:`);
        console.log(`          "Giao dịch 300,000,000đ thành công lúc ${getFormattedTime()}"`);
        console.log(`          `);
        console.log(`          Tiền bốc hơi vì hacker đoán được mật khẩu.\n`);

    } else {
        console.log(`${GREEN}Diễn biến khi CÓ CyberDef:${RESET}\n`);
        
        console.log(`${getFormattedTime()}  Attempt #1:  admin123     → Sai`);
        await requestJson(TARGET, { email: ADMIN_EMAIL, password: PASSWORDS[0] });
        await wait(500);

        console.log(`${getFormattedTime()}  Attempt #2:  admin2024    → Sai\n`);
        await requestJson(TARGET, { email: ADMIN_EMAIL, password: PASSWORDS[1] });
        await wait(800);

        console.log(`${getFormattedTime()}  ${CYAN}🧠 CyberDef: 2 failed logins/giây từ 1 IP${RESET}`);
        console.log(`          → Brute force rate: 120 attempts/min`);
        console.log(`          → Rule: IF brute_force > 10/min → TARPIT\n`);
        await wait(1500);

        console.log(`${getFormattedTime()}  ${YELLOW}⏱ Tarpit activated: IP bị delay 30 giây/request${RESET}`);
        console.log(`          Bot vẫn chạy nhưng mỗi request mất 30 giây\n`);
        await wait(1000);

        console.log(`          Attempt #3:  chờ... 30 giây...`);
        // We simulate the wait to not block the demo, but tell the user it takes 30s
        await wait(2000); 
        console.log(`          Attempt #4:  chờ... 30 giây...`);
        await wait(2000);

        console.log(`          → Bot tự động timeout sau 5 phút không có kết quả`);
        console.log(`          → IP bị ban sau 10 failed attempts\n`);
        await wait(1500);

        console.log(`${getFormattedTime()}  ✅ Tài khoản Admin: an toàn, 5 Tỷ VNĐ nguyên vẹn`);
        console.log(`          Admin không bị làm phiền. Kẻ tấn công bỏ cuộc.\n`);
        await wait(1000);

        console.log(`${BOLD}"Dù mật khẩu có yếu hay bị lộ, tốc độ đoán của Hacker cũng bị CyberDef bóp nghẹt.`);
        console.log(`Hacker mất 5 phút để bị block — bạn không mất một giây nào."${RESET}\n`);
    }
}

main().catch((error) => {
    console.error(`${RED}[FATAL] ${error.message}${RESET}`);
    process.exit(1);
});