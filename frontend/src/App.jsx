import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import LiveLogsPage from './pages/LiveLogsPage';
import RiskPage from './pages/RiskPage';
import SimulatePage from './pages/SimulatePage';
import './index.css';

const MAX_LOGS = 200;
const MAX_ALERTS = 20;

function AppInner() {
    const { user, loading } = useAuth();
    const [page, setPage] = useState('overview');
    const [logs, setLogs] = useState([]);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const [topIPs, setTopIPs] = useState([]);

    // Real-time WebSocket handlers
    const onActivityLog = useCallback((data) => {
        setLogs(prev => [data, ...prev].slice(0, MAX_LOGS));
    }, []);

    const onSecurityAlert = useCallback((data) => {
        setLiveAlerts(prev => [data, ...prev].slice(0, MAX_ALERTS));
        // Also add to logs feed
        setLogs(prev => [{
            eventType: data.type,
            ipAddress: data.ipAddress,
            severity: data.severity,
            riskScore: data.riskScore,
            endpoint: data.description || '',
            timestamp: data.timestamp,
        }, ...prev].slice(0, MAX_LOGS));
    }, []);

    useSocket({
        activity_log: onActivityLog,
        security_alert: onSecurityAlert,
    });

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
                <div className="connecting">
                    <div className="dot online" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>ĐANG KHỞI TẠO HỆ THỐNG...</span>
                </div>
            </div>
        );
    }

    if (!user) return <LoginPage />;

    const renderPage = () => {
        switch (page) {
            case 'overview': return <OverviewPage liveAlerts={liveAlerts} recentLogs={logs} />;
            case 'logs': return <LiveLogsPage logs={logs} />;
            case 'risk': return <RiskPage topIPs={topIPs} />;
            case 'simulate': return <SimulatePage logs={logs} />;
            case 'threats': return (
                <div>
                    <div className="section-title">◎ ACTIVE THREATS</div>
                    <div className="empty-state">Giao diện quản lý Threats — kết nối backend để xem Security Events</div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <Layout
            currentPage={page}
            onNavigate={setPage}
            liveAlerts={liveAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
        >
            {renderPage()}
        </Layout>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppInner />
        </AuthProvider>
    );
}
