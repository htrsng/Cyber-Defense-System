import { useState, useEffect } from 'react';
import { api, eventsAPI } from '../services/api';

const SEVERITY_COLORS = {
    critical: '#ff3d5a',
    high: '#ff7a1a',
    medium: '#ffb300',
    low: '#00d4ff',
    info: '#2d4a66',
};

export default function NotificationsPage() {
    const [emailConfig, setEmailConfig] = useState(null);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportResult, setReportResult] = useState(null);
    const [configLoading, setConfigLoading] = useState(true);
    const [alertsLoading, setAlertsLoading] = useState(true);

    // Fetch email configuration
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/api/admin/email-config');
                setEmailConfig(data);
            } catch (err) {
                console.error('Failed to fetch email config:', err);
                setEmailConfig({ configured: false });
            } finally {
                setConfigLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // Fetch recent critical alerts
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const { data } = await eventsAPI.getAll({ severity: 'critical', limit: 10 });
                // API returns { events, count } — normalize to array
                const items = Array.isArray(data) ? data : (data.events || []);
                setRecentAlerts(items);
            } catch (err) {
                console.error('Failed to fetch alerts:', err);
                setRecentAlerts([]);
            } finally {
                setAlertsLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    // Send test email
    const handleTestEmail = async () => {
        setTestLoading(true);
        setTestResult(null);
        try {
            const { data } = await api.post('/api/admin/test-email');
            setTestResult({ success: true, message: '✓ Check your inbox!' });
        } catch (err) {
            setTestResult({ success: false, message: `✗ ${err.response?.data?.details || err.message}` });
        } finally {
            setTestLoading(false);
        }
    };

    // Send daily report
    const handleDailyReport = async () => {
        setReportLoading(true);
        setReportResult(null);
        try {
            const { data } = await api.post('/api/admin/daily-report');
            setReportResult({ success: true, message: '✓ Report sent to your email' });
        } catch (err) {
            setReportResult({ success: false, message: `✗ ${err.response?.data?.details || err.message}` });
        } finally {
            setReportLoading(false);
        }
    };

    const getMidnightTime = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const hours = Math.floor((tomorrow - now) / (1000 * 60 * 60));
        const mins = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    if (configLoading || alertsLoading) {
        return (
            <div style={{ padding: 20, textAlign: 'center' }}>
                <div className="connecting">
                    <div className="dot online" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>ĐANG TẢI DỮ LIỆU...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="section-title">◉ EMAIL ALERTS & NOTIFICATIONS</div>

            {/* ── SECTION 1: Email Config Status ── */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">Email Configuration Status</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: '0.1em' }}>
                                STATUS
                            </div>
                            <div className={`badge ${emailConfig?.configured ? '' : 'critical'}`} style={{
                                background: emailConfig?.configured ? '#00ff8844' : '#ff3d5a22',
                                color: emailConfig?.configured ? '#00ff88' : '#ff3d5a',
                                borderColor: emailConfig?.configured ? '#00ff8844' : '#ff3d5a44',
                            }}>
                                {emailConfig?.configured ? '✓ EMAIL ACTIVE' : '✗ NOT CONFIGURED'}
                            </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: '0.1em' }}>
                                FROM
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan)' }}>
                                {emailConfig?.from || '—'}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: '0.1em' }}>
                                TO
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>
                                {emailConfig?.to || '—'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleTestEmail}
                            disabled={testLoading || !emailConfig?.configured}
                            style={{ flex: 1 }}
                        >
                            {testLoading ? '📧 SENDING...' : '📧 SEND TEST EMAIL'}
                        </button>
                        {testResult && (
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                color: testResult.success ? '#00ff88' : '#ff3d5a',
                                padding: '10px 12px',
                                background: testResult.success ? '#00ff8811' : '#ff3d5a11',
                                border: `1px solid ${testResult.success ? '#00ff8844' : '#ff3d5a44'}`,
                                borderRadius: 'var(--radius)',
                            }}>
                                {testResult.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── SECTION 2: Recent Critical Alerts ── */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">Recent Critical Alerts Sent</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                        {recentAlerts.length} ALERTS
                    </span>
                </div>

                {recentAlerts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        No critical alerts yet — stay vigilant!
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{
                                    padding: '12px',
                                    textAlign: 'left',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    color: 'var(--text-dim)',
                                    fontWeight: 'normal',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}>
                                    Time
                                </th>
                                <th style={{
                                    padding: '12px',
                                    textAlign: 'left',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    color: 'var(--text-dim)',
                                    fontWeight: 'normal',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}>
                                    Type
                                </th>
                                <th style={{
                                    padding: '12px',
                                    textAlign: 'left',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    color: 'var(--text-dim)',
                                    fontWeight: 'normal',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}>
                                    IP
                                </th>
                                <th style={{
                                    padding: '12px',
                                    textAlign: 'left',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    color: 'var(--text-dim)',
                                    fontWeight: 'normal',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}>
                                    Risk Score
                                </th>
                                <th style={{
                                    padding: '12px',
                                    textAlign: 'left',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    color: 'var(--text-dim)',
                                    fontWeight: 'normal',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}>
                                    Email Sent
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentAlerts.map((alert, idx) => (
                                <tr key={idx} style={{
                                    borderBottom: idx < recentAlerts.length - 1 ? '1px solid var(--border)' : 'none',
                                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                }}>
                                    <td style={{
                                        padding: '12px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 12,
                                        color: 'var(--text-muted)',
                                    }}>
                                        {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString('vi-VN') : '—'}
                                    </td>
                                    <td style={{
                                        padding: '12px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 12,
                                        color: 'var(--text-primary)',
                                    }}>
                                        {alert.type?.replace(/_/g, ' ')}
                                    </td>
                                    <td style={{
                                        padding: '12px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 12,
                                        color: 'var(--cyan)',
                                    }}>
                                        {alert.ipAddress}
                                    </td>
                                    <td style={{
                                        padding: '12px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 12,
                                        color: SEVERITY_COLORS[alert.severity] || 'var(--text-primary)',
                                        fontWeight: 'bold',
                                    }}>
                                        {alert.riskScore}/100
                                    </td>
                                    <td style={{
                                        padding: '12px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 12,
                                        color: emailConfig?.configured ? '#00ff88' : 'var(--text-dim)',
                                    }}>
                                        {emailConfig?.configured ? '✓ YES' : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── SECTION 3: Daily Report ── */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Daily Security Report</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
                    <div>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: '0.1em' }}>
                                NEXT REPORT
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--amber)' }}>
                                Tomorrow at 00:00
                            </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                            <div>Automated report sent daily with:</div>
                            <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px solid var(--border)' }}>
                                • Total events count<br />
                                • Critical events<br />
                                • Top threat IPs<br />
                                • Unresolved threats
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleDailyReport}
                            disabled={reportLoading || !emailConfig?.configured}
                            style={{ flex: 1 }}
                        >
                            {reportLoading ? '📊 GENERATING...' : '📊 GENERATE NOW'}
                        </button>
                        {reportResult && (
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                color: reportResult.success ? '#00ff88' : '#ff3d5a',
                                padding: '10px 12px',
                                background: reportResult.success ? '#00ff8811' : '#ff3d5a11',
                                border: `1px solid ${reportResult.success ? '#00ff8844' : '#ff3d5a44'}`,
                                borderRadius: 'var(--radius)',
                            }}>
                                {reportResult.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
