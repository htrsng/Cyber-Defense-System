import React, { useState } from 'react';
import './AttackerConsolePage.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AttackerConsolePage() {
    const [running, setRunning] = useState(false);
    const [log, setLog] = useState([]);
    const [ip, setIp] = useState('');

    const pushLog = (msg, type = 'info') => {
        setLog(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
    };

    const runAttack = async (type) => {
        if (running) return;
        setRunning(true);
        setLog([]); // Clear previous logs
        pushLog(`Khởi chạy tấn công: ${type}...`, 'warning');

        try {
            let res;
            if (type === 'BRUTE_FORCE') {
                res = await axios.post(`${API_URL}/api/simulate/brute-force`, { iterations: 15 });
                pushLog(`Thực hiện ${res.data.attempts} lần thử đăng nhập.`, 'info');
            } else if (type === 'SQL_INJECTION') {
                res = await axios.post(`${API_URL}/api/simulate/sqli`, {});
                pushLog(`Thử nghiệm ${res.data.payloadsTested} payloads độc hại.`, 'info');
            } else if (type === 'HONEYPOT') {
                res = await axios.post(`${API_URL}/api/simulate/honeypot`, {});
                pushLog(`Truy cập ${res.data.endpointsHit} thư mục nhạy cảm.`, 'info');
            }

            const blocked = res.data.blocked || res.data.level === 'critical';
            if (blocked) {
                pushLog(`⛔ TẤN CÔNG THẤT BẠI. IP đã bị block!`, 'error');
                pushLog(`Risk Score hiện tại: ${res.data.finalRiskScore || res.data.riskScore}/100`, 'error');
            } else {
                pushLog(`⚠ Hoàn thành. Risk Score: ${res.data.finalRiskScore || res.data.riskScore}/100`, 'warning');
            }
        } catch (error) {
            pushLog(`Lỗi kết nối đến mục tiêu: ${error.message}`, 'error');
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="attacker-console">
            <header className="ac-header">
                <div className="ac-logo">⚔️ CYBERDEF ATTACKER</div>
                <div className="ac-subtitle">Live Demo Console</div>
            </header>

            <main className="ac-main">
                <div className="ac-target-info">
                    Mục tiêu: <strong>{API_URL}</strong><br />
                    Tình trạng: <span className="text-green">Online</span>
                </div>

                <div className="ac-actions">
                    <button className="ac-btn brute-force" onClick={() => runAttack('BRUTE_FORCE')} disabled={running}>
                        <span className="icon">🔑</span>
                        <span className="text">BRUTE FORCE LOGIN</span>
                    </button>
                    
                    <button className="ac-btn sql-injection" onClick={() => runAttack('SQL_INJECTION')} disabled={running}>
                        <span className="icon">💉</span>
                        <span className="text">SQL INJECTION</span>
                    </button>
                    
                    <button className="ac-btn honeypot" onClick={() => runAttack('HONEYPOT')} disabled={running}>
                        <span className="icon">🍯</span>
                        <span className="text">RECONNAISSANCE</span>
                    </button>
                </div>

                <div className="ac-terminal">
                    <div className="ac-terminal-header">
                        <span>Terminal Output</span>
                        {running && <span className="ac-spinner"></span>}
                    </div>
                    <div className="ac-terminal-body">
                        {log.length === 0 ? (
                            <div className="ac-log-empty">Waiting for command...</div>
                        ) : (
                            log.map((l, i) => (
                                <div key={i} className={`ac-log-line ${l.type}`}>
                                    <span className="ac-log-time">[{l.time}]</span> {l.msg}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
