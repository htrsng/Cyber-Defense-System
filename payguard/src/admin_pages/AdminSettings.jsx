import React from 'react';

export default function AdminSettings() {
    return (
        <div style={{ display: 'grid', gap: 24, maxWidth: 800 }}>
            <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>System Settings</h1>
            
            <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <h2 style={{ marginTop: 0, fontSize: 18, borderBottom: '1px solid #374151', paddingBottom: 16 }}>CyberDef Integration</h2>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #374151' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Auto-Block High Risk Transactions</div>
                        <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Automatically block transfers with risk score &gt; 80</div>
                    </div>
                    <div style={{ width: 44, height: 24, background: '#10b981', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, right: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #374151' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Enforce 2FA for Admins</div>
                        <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Require authenticator app for admin panel access</div>
                    </div>
                    <div style={{ width: 44, height: 24, background: '#10b981', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, right: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Maintenance Mode</div>
                        <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Disable all customer logins temporarily</div>
                    </div>
                    <div style={{ width: 44, height: 24, background: '#374151', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                    </div>
                </div>
            </div>

            <div className="pg-panel pg-shadow-md" style={{ background: '#1f2937', borderColor: '#374151' }}>
                <h2 style={{ marginTop: 0, fontSize: 18, borderBottom: '1px solid #374151', paddingBottom: 16 }}>API Keys</h2>
                
                <div style={{ padding: '16px 0' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>CyberDef Platform API Key</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input type="password" value="sk_live_cyberdef_9876543210abcdef" readOnly style={{ flex: 1, padding: '10px 16px', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#9ca3af', fontFamily: 'monospace' }} />
                        <button style={{ padding: '10px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Reveal</button>
                        <button style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Rotate Key</button>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>Last rotated: 45 days ago</div>
                </div>
            </div>
        </div>
    );
}
