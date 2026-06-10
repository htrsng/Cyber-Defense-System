import { useState } from 'react';

export default function IntegrationPage() {
    const [copied, setCopied] = useState(false);

    const apiKey = "cd_live_9a8b7c6d5e4f3g2h1";

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const expressCode = `// 1. Cài đặt SDK
// npm install @cyberdef/shield

const express = require('express');
const { CyberDef } = require('@cyberdef/shield');

const app = express();

// 2. Mount Middleware vào hệ thống
app.use(CyberDef.protect({
    apiKey: '${apiKey}',
    mode: 'BLOCK', // hoặc 'MONITOR_ONLY'
    threatIntelligence: true
}));

// Các API của hệ thống hoạt động bình thường
app.post('/api/transactions/transfer', (req, res) => {
    res.json({ success: true, message: 'Clean traffic allowed' });
});

app.listen(8080, () => console.log('Server protected by CyberDef'));`;

    const dockerCode = `# Sử dụng CyberDef Edge Proxy
FROM cyberdef/edge-proxy:latest

ENV CYBERDEF_API_KEY=${apiKey}
ENV UPSTREAM_URL=http://your-internal-service:8080
ENV PROTECTION_MODE=BLOCK

EXPOSE 80 443`;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 8 }}>Tích hợp CyberDef</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Tích hợp giải pháp bảo mật với ứng dụng của bạn chỉ trong 3 phút, không gây gián đoạn dịch vụ (Zero Downtime).</p>
            </div>

            {/* API KEY SECTION */}
            <div className="card" style={{ marginBottom: 32, border: '1px solid var(--border-cyan)', background: 'rgba(0, 212, 255, 0.05)' }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Live API Key</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <code style={{ flex: 1, background: 'var(--bg-base)', padding: '12px 16px', borderRadius: 6, fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                        {apiKey}
                    </code>
                    <button 
                        className={`btn ${copied ? 'btn-ghost' : 'btn-primary'}`} 
                        onClick={handleCopy}
                        style={{ width: 120, padding: '12px', background: copied ? 'var(--color-green)' : 'var(--color-cyan)', color: '#000', border: 'none' }}
                    >
                        {copied ? '✓ COPIED' : 'COPY KEY'}
                    </button>
                </div>
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                    * Sử dụng khóa này để xác thực ứng dụng của bạn với hệ thống phân tích AI của CyberDef. Tuyệt đối không chia sẻ khóa công khai.
                </p>
            </div>

            {/* INTEGRATION METHODS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Node.js Middleware */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 4 }}>Node.js / Express Middleware</h3>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tích hợp trực tiếp vào code Backend</div>
                        </div>
                        <span className="badge badge-plan free">RECOMMENDED</span>
                    </div>
                    <div style={{ padding: 24, background: '#0a0e14' }}>
                        <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e5e7eb', overflowX: 'auto', lineHeight: 1.5 }}>
                            <code dangerouslySetInnerHTML={{ __html: expressCode.replace(/\/\/.*/g, match => `<span style="color: #6b7280">${match}</span>`).replace(/require/g, '<span style="color: #c678dd">require</span>').replace(/const|let|var/g, '<span style="color: #c678dd">const</span>').replace(/=>/g, '<span style="color: #c678dd">=></span>').replace(/'([^']+)'/g, '<span style="color: #98c379">\'$1\'</span>') }} />
                        </pre>
                    </div>
                </div>

                {/* Docker Edge Proxy */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 4 }}>Docker Edge Proxy</h3>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Bảo vệ như một Reverse Proxy độc lập</div>
                    </div>
                    <div style={{ padding: 24, background: '#0a0e14', height: '100%' }}>
                        <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e5e7eb', overflowX: 'auto', lineHeight: 1.5 }}>
                            <code dangerouslySetInnerHTML={{ __html: dockerCode.replace(/#.*/g, match => `<span style="color: #6b7280">${match}</span>`).replace(/FROM|ENV|EXPOSE/g, match => `<span style="color: #61afef">${match}</span>`) }} />
                        </pre>
                        <div style={{ marginTop: 32, padding: 16, background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 6, fontSize: 13, color: 'var(--color-amber)' }}>
                            <strong>💡 Lưu ý:</strong> Phương pháp này phù hợp cho các hệ thống dùng Microservices, Kubernetes hoặc các ngôn ngữ không phải Node.js (Java, Python, Go).
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
