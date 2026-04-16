import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getUserProfile } from '../api/auth';
import { getHistory } from '../api/upload';
import { getAlerts } from '../api/alerts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, healthy: 0, atRisk: 0, unhealthy: 0, alerts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [histRes, alertRes] = await Promise.all([
          getHistory(user._id),
          getAlerts(user._id)
        ]);

        const history = histRes.data.data || [];
        const alerts = alertRes.data.data || [];

        setStats({
          total: history.length,
          healthy: history.filter(h => h.analysisResults?.overall_health === 'Healthy').length,
          atRisk: history.filter(h => h.analysisResults?.overall_health === 'At risk').length,
          unhealthy: history.filter(h => h.analysisResults?.overall_health === 'Unhealthy').length,
          alerts: alerts.filter(a => !a.isRead).length
        });
      } catch (e) { /* silent */ } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div>
      <Header title="Profile" />
      <div className="page-content">
        <div className="profile-layout">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-since">
              <i className="fas fa-calendar-alt"></i> Member since{' '}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long'
              }) : '—'}
            </p>

            <div className="profile-badges">
              <span className="profile-badge"><i className="fas fa-leaf"></i> Plant Monitor</span>
              {stats.total >= 5 && <span className="profile-badge active"><i className="fas fa-star"></i> Active User</span>}
            </div>

            <button className="btn btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>

          {/* Stats Panel */}
          <div className="profile-stats-panel">
            <h3><i className="fas fa-chart-bar"></i> Your Statistics</h3>
            {loading ? (
              <div className="loading-page"><div className="spinner"></div></div>
            ) : (
              <div className="profile-stats-grid">
                <div className="profile-stat-card">
                  <div className="pstat-value">{stats.total}</div>
                  <div className="pstat-label">Total Analyses</div>
                  <i className="fas fa-history pstat-icon"></i>
                </div>
                <div className="profile-stat-card stat-healthy">
                  <div className="pstat-value">{stats.healthy}</div>
                  <div className="pstat-label">Healthy Results</div>
                  <i className="fas fa-check-circle pstat-icon"></i>
                </div>
                <div className="profile-stat-card stat-warning">
                  <div className="pstat-value">{stats.atRisk}</div>
                  <div className="pstat-label">At Risk</div>
                  <i className="fas fa-exclamation-triangle pstat-icon"></i>
                </div>
                <div className="profile-stat-card stat-critical">
                  <div className="pstat-value">{stats.unhealthy}</div>
                  <div className="pstat-label">Unhealthy</div>
                  <i className="fas fa-times-circle pstat-icon"></i>
                </div>
                <div className="profile-stat-card stat-alert">
                  <div className="pstat-value">{stats.alerts}</div>
                  <div className="pstat-label">Unread Alerts</div>
                  <i className="fas fa-bell pstat-icon"></i>
                </div>
              </div>
            )}

            <div className="profile-actions">
              <button className="btn" onClick={() => navigate('/upload')}>
                <i className="fas fa-cloud-upload-alt"></i> New Analysis
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/history')}>
                <i className="fas fa-history"></i> View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
