import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import LiveLogsPage from './pages/LiveLogsPage';
import RiskPage from './pages/RiskPage';
import SimulatePage from './pages/SimulatePage';
import XSSPage from './pages/XSSPage';
import TwoFactorPage from './pages/TwoFactorPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsPage from './pages/ReportsPage';
import ThreatsPage from './pages/ThreatsPage';
import AttackVisualizerPage from './pages/AttackVisualizerPage';

import TenantsPage from './pages/TenantsPage';
import SecurityRulesPage from './pages/SecurityRulesPage';
import PricingPage from './pages/PricingPage';
import FraudAnalyticsPage from './pages/FraudAnalyticsPage';
import IntegrationPage from './pages/IntegrationPage';

import './index.css';

import AttackerConsolePage from './pages/AttackerConsolePage';

const MAX_LOGS = 200;
const MAX_ALERTS = 20;

function AppInner() {
    const { user, loading } = useAuth();
    const [page, setPage] = useState('overview');
    const [logs, setLogs] = useState([]);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const [topIPs, setTopIPs] = useState([]);
    const [tarpitEvents, setTarpitEvents] = useState([]);

    // Check if we are on the public attacker console page
    if (window.location.pathname === '/attack') {
        return <AttackerConsolePage />;
    }

    // Real-time WebSocket handlers
    const onActivityLog = useCallback((data) => {
        const selectedId = localStorage.getItem('selectedWebsiteId');
        if (selectedId && data.websiteId && data.websiteId !== selectedId) return;
        setLogs(prev => [data, ...prev].slice(0, MAX_LOGS));
    }, []);

    const onSecurityAlert = useCallback((data) => {
        const selectedId = localStorage.getItem('selectedWebsiteId');
        if (selectedId && data.websiteId && data.websiteId !== selectedId) return;
        
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

    const onTarpitActive = useCallback((data) => {
        setTarpitEvents(prev => [data, ...prev].slice(0, 10));
    }, []);

    useSocket({
        activity_log: onActivityLog,
        security_alert: onSecurityAlert,
        tarpit_active: onTarpitActive,
    });

    const [showLogin, setShowLogin] = useState(false);

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

    if (!user) {
        if (showLogin) {
            return <LoginPage onBack={() => setShowLogin(false)} />;
        }
        return <LandingPage onLoginClick={() => setShowLogin(true)} />;
    }

    const renderPage = () => {
        switch (page) {
            case 'overview': return <OverviewPage liveAlerts={liveAlerts} recentLogs={logs} tarpitEvents={tarpitEvents} />;
            case 'logs': return <LiveLogsPage logs={logs} />;
            case 'risk': return <RiskPage topIPs={topIPs} />;
            case 'simulate': return <SimulatePage logs={logs} />;
            case 'xss': return <XSSPage liveAlerts={liveAlerts} />;
            case 'twofactor': return <TwoFactorPage />;
            case 'notifications': return <NotificationsPage />;
            case 'reports': return <ReportsPage />;
            case 'threats': return <ThreatsPage liveAlerts={liveAlerts} />;
            case 'visualizer': return <AttackVisualizerPage />;
            case 'tenants': return <TenantsPage />;
            case 'rules': return <SecurityRulesPage />;
            case 'pricing': return <PricingPage />;
            case 'fraud': return <FraudAnalyticsPage />;
            case 'integration': return <IntegrationPage />;
            default: return null;
        }
    };

    return (
        <Layout
            currentPage={page}
            onNavigate={setPage}
            liveAlerts={liveAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
            tarpitCount={tarpitEvents.length}
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
