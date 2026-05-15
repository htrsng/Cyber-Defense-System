import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eventsAPI } from '../services/api';
import '../styles/ThreatsPage.css';

const TYPE_LABELS = {
    BRUTE_FORCE: '⚡ Brute Force',
    SQL_INJECTION: '💉 SQL Injection',
    HONEYPOT_ACCESS: '🍯 Honeypot Access',
    RATE_LIMIT_ABUSE: '⊘ Rate Limit Abuse',
    ANOMALY: '◎ Anomaly',
};

const SEVERITY_COLORS = {
    critical: '#ff3333',
    high: '#ff9900',
    medium: '#ffcc00',
    low: '#66cc66',
    info: '#3366ff',
};

export function ThreatsPage({ liveAlerts = [] }) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [showResolved, setShowResolved] = useState(false);
    const [expandedEvents, setExpandedEvents] = useState(new Set());

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await eventsAPI.getAll({
                resolved: showResolved ? undefined : false,
                type: filter !== 'ALL' ? filter : undefined
            });
            setEvents(response.data.events || []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filter, showResolved, liveAlerts]);

    const handleResolve = async (id) => {
        try {
            await eventsAPI.resolve(id);
            setEvents(prev => prev.map(e =>
                e._id === id ? { ...e, resolved: true, resolvedAt: new Date() } : e
            ));
        } catch (error) {
            console.error('Failed to resolve event:', error);
        }
    };

    const toggleExpandEvent = (id) => {
        setExpandedEvents(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${hours}:${minutes}:${seconds} ${day}/${month}`;
    };

    const getRiskScoreColor = (score) => {
        if (score >= 80) return '#ff3333';
        if (score >= 60) return '#ff9900';
        if (score >= 40) return '#ffcc00';
        return '#66cc66';
    };

    return (
        <div className="threats-page">
            <div className="threats-header">
                <h1>◎ SECURITY EVENTS</h1>
                <p>Monitored security threats and detected anomalies</p>
            </div>

            <div className="threats-controls">
                <div className="filter-buttons">
                    {['ALL', 'BRUTE_FORCE', 'SQL_INJECTION', 'HONEYPOT_ACCESS', 'ANOMALY'].map(type => (
                        <button
                            key={type}
                            className={`filter-btn ${filter === type ? 'active' : ''}`}
                            onClick={() => setFilter(type)}
                        >
                            {type === 'ALL' ? 'All Types' : TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>

                <div className="toggle-resolved">
                    <label>
                        <input
                            type="checkbox"
                            checked={showResolved}
                            onChange={(e) => setShowResolved(e.target.checked)}
                        />
                        Show Resolved
                    </label>
                </div>
            </div>

            <div className="threats-content">
                {loading && <div className="loading">Loading events...</div>}

                {!loading && events.length === 0 && (
                    <div className="empty-state">
                        <p>No security events found</p>
                    </div>
                )}

                {!loading && events.length > 0 && (
                    <div className="events-list">
                        {events.map(event => (
                            <div
                                key={event._id}
                                className="event-card"
                                style={{ borderLeftColor: SEVERITY_COLORS[event.severity] }}
                            >
                                <div className="event-header">
                                    <div className="event-type-badge" style={{ backgroundColor: SEVERITY_COLORS[event.severity] }}>
                                        {TYPE_LABELS[event.type] || event.type}
                                    </div>

                                    <div className="event-meta">
                                        <span className="ip-tag">{event.ipAddress}</span>
                                        <span className="timestamp">{formatDate(event.createdAt)}</span>
                                    </div>

                                    <div className="risk-score-circle" style={{ backgroundColor: getRiskScoreColor(event.riskScore) }}>
                                        {event.riskScore}
                                    </div>
                                </div>

                                <div className="event-body">
                                    <p className="event-description">{event.description}</p>

                                    {event.evidence && Object.keys(event.evidence).length > 0 && (
                                        <div className="evidence-section">
                                            <button
                                                className="evidence-toggle"
                                                onClick={() => toggleExpandEvent(event._id)}
                                            >
                                                {expandedEvents.has(event._id) ? '▼' : '▶'} Evidence Details
                                            </button>
                                            {expandedEvents.has(event._id) && (
                                                <div className="evidence-details">
                                                    <pre>{JSON.stringify(event.evidence, null, 2)}</pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="event-footer">
                                    {event.resolved ? (
                                        <span className="resolved-badge">✓ RESOLVED</span>
                                    ) : isAdmin ? (
                                        <button
                                            className="resolve-btn"
                                            onClick={() => handleResolve(event._id)}
                                        >
                                            ✓ RESOLVE
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>⊘ Admin resolution required</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
