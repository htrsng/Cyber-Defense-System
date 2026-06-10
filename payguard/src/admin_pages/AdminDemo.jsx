import React from 'react';

export default function AdminDemo({ resetDemo, toggleSecurity, securityEnabled }) {
    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Demo Control Panel</h1>
            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <h2 style={{ marginTop: 0 }}>Chuẩn bị kịch bản</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    
                    <div style={{ border: '2px dashed #f87171', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                        <h3 style={{ color: '#f87171' }}>1. Unprotected Mode</h3>
                        <p style={{ color: '#9ca3af', fontSize: 14 }}>Tắt WAF. Lệnh sqlmap sẽ bypass login và trừ sạch tiền.</p>
                        <button 
                            onClick={() => { resetDemo(); setTimeout(() => toggleSecurity(false), 500); }}
                            style={{ padding: '12px 24px', background: '#f87171', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
                            Kích hoạt Unprotected
                        </button>
                    </div>

                    <div style={{ border: '2px dashed #34d399', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                        <h3 style={{ color: '#34d399' }}>2. Protected Mode</h3>
                        <p style={{ color: '#9ca3af', fontSize: 14 }}>Bật WAF. Lệnh sqlmap sẽ bị chặn, Tarpit kích hoạt, tiền an toàn.</p>
                        <button 
                            onClick={() => { resetDemo(); setTimeout(() => toggleSecurity(true), 500); }}
                            style={{ padding: '12px 24px', background: '#34d399', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
                            Kích hoạt Protected
                        </button>
                    </div>

                </div>
            </div>
            
            <div className="pg-panel" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <h2 style={{ marginTop: 0 }}>Terminal Command (Copy & Paste)</h2>
                <div style={{ background: '#000', padding: 16, borderRadius: 8, fontFamily: 'monospace', color: '#34d399' }}>
                    sqlmap -u "http://localhost:5000/api/auth/login" --data="email=admin@payguard.vn&password=1" --dbs --batch
                </div>
            </div>
        </div>
    );
}
