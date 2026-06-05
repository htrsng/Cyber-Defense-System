const axios = require('axios');
const { spawnSync } = require('child_process');
const path = require('path');

const BACKEND_DIR = path.resolve(__dirname, '..', '..');
const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || 'admin@cyberdef.io';
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';
const DRY_RUN = process.argv.includes('--dry-run');

const ATTACKS = [
    { name: 'Reconnaissance', script: 'attack:recon' },
    { name: 'Brute Force', script: 'attack:brute' },
    { name: 'SQL Injection', script: 'attack:sqli' },
    { name: 'XSS', script: 'attack:xss' },
    { name: 'Tarpit', script: 'attack:tarpit' },
    { name: 'PayGuard transfer', script: 'attack:transfer' },
];

const http = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    validateStatus: () => true,
});

function npmCommand() {
    return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function printPhase(title) {
    console.log(`\n=== ${title} ===`);
}

function printCommand(command) {
    console.log(command);
}

async function loginAdmin() {
    const response = await http.post('/api/auth/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (response.status !== 200 || !response.data?.token) {
        throw new Error(`Login failed: HTTP ${response.status}`);
    }

    return response.data.token;
}

async function resetDemoState() {
    const response = await http.post('/api/demo/reset-public');
    if (response.status < 200 || response.status >= 300) {
        throw new Error(`Reset failed: HTTP ${response.status}`);
    }
}

async function setSecurity(enabled, token) {
    const response = await http.post(
        '/api/demo/toggle-security',
        { enabled },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status < 200 || response.status >= 300) {
        throw new Error(`Toggle security failed: HTTP ${response.status}`);
    }
}

function runAttack(script) {
    const result = spawnSync(npmCommand(), ['run', script], {
        cwd: BACKEND_DIR,
        stdio: 'inherit',
        shell: false,
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        console.log(`[WARN] ${script} exited with code ${result.status}`);
    }
}

async function runPhase(title, enabled, includeReset = true) {
    printPhase(title);

    if (includeReset) {
        printCommand('curl -X POST http://localhost:5000/api/demo/reset-public');
        if (!DRY_RUN) {
            await resetDemoState();
        }
    }

    if (enabled) {
        printCommand('curl -X POST http://localhost:5000/api/auth/login');
        printCommand('curl -X POST http://localhost:5000/api/demo/toggle-security -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d \'{"enabled":true}\'');
        if (!DRY_RUN) {
            const token = await loginAdmin();
            await setSecurity(true, token);
        }
    }

    for (const attack of ATTACKS) {
        printCommand(`npm run ${attack.script}    # ${attack.name}`);
        if (!DRY_RUN) {
            runAttack(attack.script);
        }
    }
}

async function main() {
    console.log('CyberDef before/after security demo');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Mode: ${DRY_RUN ? 'dry-run' : 'live'}`);

    if (DRY_RUN) {
        printPhase('Before security');
        printCommand('curl -X POST http://localhost:5000/api/demo/reset-public');
        ATTACKS.forEach((attack) => printCommand(`npm run ${attack.script}    # ${attack.name}`));

        printPhase('After security');
        printCommand('curl -X POST http://localhost:5000/api/demo/reset-public');
        printCommand('curl -X POST http://localhost:5000/api/auth/login');
        printCommand('curl -X POST http://localhost:5000/api/demo/toggle-security -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d \'{"enabled":true}\'');
        ATTACKS.forEach((attack) => printCommand(`npm run ${attack.script}    # ${attack.name}`));
        return;
    }

    await runPhase('Before security', false, true);
    await runPhase('After security', true, true);
}

main().catch((error) => {
    console.error(`[FATAL] ${error.message}`);
    process.exit(1);
});