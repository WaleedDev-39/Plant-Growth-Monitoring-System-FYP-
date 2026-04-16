import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getAlerts, markAlertRead, markAllAlertsRead } from '../api/alerts';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const typeIcon = {
  disease: 'fas fa-virus',
  deficiency: 'fas fa-flask',
  water_stress: 'fas fa-tint'
};

const typeLabel = {
  disease: 'Disease',
  deficiency: 'Deficiency',
  water_stress: 'Water Stress'
};

const typeColor = {
  disease: '#c62828',
  deficiency: '#e65100',
  water_stress: '#0277bd'
};

const AlertsPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await getAlerts(user._id);
      setAlerts(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAlerts();
  }, [user]);

  const handleMarkRead = async (alertId) => {
    try {
      await markAlertRead(alertId);
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, isRead: true } : a));
    } catch (e) {
      toast.error('Failed to mark alert as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsRead(user._id);
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      toast.success('All alerts marked as read');
    } catch (e) {
      toast.error('Failed to update alerts');
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  if (loading) {
    return (
      <div>
        <Header title="Alerts" />
        <div className="page-content loading-page">
          <div className="spinner-large"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Alerts" />
      <div className="page-content">
        <div className="alerts-page-header">
          <div>
            <h2>Plant Health Alerts</h2>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount} unread</span>}
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-outline" onClick={handleMarkAllRead}>
              <i className="fas fa-check-double"></i> Mark All Read
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bell-slash"></i>
            <h3>No alerts</h3>
            <p>You're all clear! No disease, deficiency, or water stress issues detected yet.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map(alert => (
              <div
                key={alert._id}
                className={`alert-item ${alert.isRead ? 'alert-read' : 'alert-unread'}`}
                style={{ borderLeftColor: typeColor[alert.type] || '#c62828' }}
              >
                <div className="alert-icon-wrap" style={{ color: typeColor[alert.type] }}>
                  <i className={typeIcon[alert.type] || 'fas fa-exclamation-circle'}></i>
                </div>
                <div className="alert-content">
                  <div className="alert-type-label" style={{ color: typeColor[alert.type] }}>
                    {typeLabel[alert.type] || 'Alert'}
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  <p className="alert-time">
                    {new Date(alert.createdAt).toLocaleString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                {!alert.isRead && (
                  <button
                    className="alert-mark-btn"
                    onClick={() => handleMarkRead(alert._id)}
                    title="Mark as read"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                )}
                {alert.isRead && <span className="alert-read-indicator"><i className="fas fa-check-double"></i></span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
