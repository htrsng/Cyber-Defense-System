import { useEffect, useState } from 'react';
import { riskAPI } from '../services/api';

const STORAGE_KEY = 'cyberdef_reports_history';

const REPORT_CONTENTS = [
    {
        icon: '📊',
        title: 'Executive Summary',
        text: 'Total events, critical count, severity breakdown',
    },
    {
        icon: '🔍',
        title: 'Top Risk IPs',
        text: 'Top 8 IPs with risk scores and event counts',
    },
    {
        icon: '⚠',
        title: 'Security Events',
        text: 'All detected threats with evidence',
    },
    {
        icon: '📋',
        title: 'Activity Log',
        text: 'Last 20 activity entries with timestamps',
    },
];

function loadReports() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveReports(reports) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [selectedRange, setSelectedRange] = useState(24);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        setReports(loadReports());
        riskAPI.getStats().then(r => setStats(r.data)).catch(() => { });
    }, []);

    const handleExportPDF = async () => {
        setGenerating(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports/security?hours=${selectedRange}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (!response.ok) throw new Error('Failed to generate report');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cyberdef-report-${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            const nextReports = [
                {
                    id: `${Date.now()}`,
                    generatedAt: new Date().toISOString(),
                    rangeHours: selectedRange,
                    fileName: a.download,
                },
                ...reports,
            ].slice(0, 12);

            setReports(nextReports);
            saveReports(nextReports);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setGenerating(false);
        }
    };

    const rangeLabel = selectedRange === 168 ? '7 days' : `${selectedRange}h`;

    return (
        <div>
            <div className="section-title" style={{ marginBottom: 20 }}>
                ◈ REPORTS
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">📄 GENERATE SECURITY REPORT</span>
                    <span className="badge safe">PDF EXPORT</span>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                        <select
                            value={selectedRange}
                            onChange={e => setSelectedRange(Number(e.target.value))}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '10px 12px',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 13,
                                outline: 'none',
                            }}
                        >
                            <option value={24}>Last 24h</option>
                            <option value={48}>Last 48h</option>
                            <option value={168}>Last 7 days</option>
                        </select>

                        <button className="btn btn-primary" onClick={handleExportPDF} disabled={generating} style={{ padding: '12px 18px' }}>
                            {generating ? '⟳ GENERATING...' : '↓ DOWNLOAD PDF REPORT'}
                        </button>
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        Report will include: Events summary, Top risk IPs, Security events, Activity logs, Recommendations
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">WHAT'S IN THE REPORT</span>
                    <span className="badge">{rangeLabel.toUpperCase()}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
                    {REPORT_CONTENTS.map(item => (
                        <div key={item.title} className="card" style={{ marginBottom: 0, background: 'var(--bg-base)' }}>
                            <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                            <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, marginBottom: 8 }}>{item.title}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {item.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">CURRENT DATA SNAPSHOT</span>
                    <span className="badge critical">LIVE STATS</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    {[
                        { label: 'Total Events', value: stats?.last24h?.totalEvents ?? '—' },
                        { label: 'Critical Events', value: stats?.last24h?.criticalEvents ?? '—' },
                        { label: 'Unresolved Threats', value: stats?.unresolvedThreats ?? '—' },
                        { label: 'Top Event Types', value: stats?.topEventTypes?.length ?? '—' },
                    ].map(item => (
                        <div key={item.label} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{item.label}</div>
                            <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, color: 'var(--text-primary)' }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">GENERATED REPORTS</span>
                    <span className="badge">LOCAL STORAGE</span>
                </div>

                {reports.length === 0 ? (
                    <div className="empty-state">Chưa có report nào được tạo. Chọn phạm vi thời gian và bấm download để lưu report đầu tiên.</div>
                ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                        {reports.map(report => (
                            <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, marginBottom: 4 }}>{report.fileName}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                                        Generated {new Date(report.generatedAt).toLocaleString()} · Range {report.rangeHours}h
                                    </div>
                                </div>
                                <span className="badge safe">PDF</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}