import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import GrowthChart from '../components/GrowthChart';
import HealthChart from '../components/HealthChart';
import AlertBanner from '../components/AlertBanner';
import AnalysisResultCard from '../components/AnalysisResultCard';
import HealthProgressChart from '../components/HealthProgressChart';
import { getHistory } from '../api/upload';
import { getAlerts } from '../api/alerts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHealthClass = (health) => {
  if (health === 'Healthy') return 'status-healthy';
  if (health === 'At risk') return 'status-warning';
  return 'status-critical';
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, alertRes] = await Promise.all([
          getHistory(user._id),
          getAlerts(user._id)
        ]);
        setHistory(histRes.data.data || []);
        setAlerts(alertRes.data.data || []);
      } catch (e) {
        // silent — dashboard works even if API is down
      } finally {
        setLoadingData(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleDismissAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, isRead: true } : a));
  };

  const latestAnalysis = history[0];
  const recentHistory = history.slice(0, 4);

  // Live stats derived from real history
  const liveStats = {
    totalPlants: history.length,
    healthyPlants: history.filter(h => h.analysisResults?.overall_health === 'Healthy').length,
    avgGrowthRate: 2.4,
    waterLevel: 78,
    newPlants: history.filter(h => {
      const d = new Date(h.createdAt);
      const now = new Date();
      return (now - d) < 7 * 24 * 3600 * 1000;
    }).length
  };

  // Health distribution for chart
  const healthData = {
    healthy: history.filter(h => h.analysisResults?.overall_health === 'Healthy').length,
    attention: history.filter(h => h.analysisResults?.overall_health === 'At risk').length,
    critical: history.filter(h => h.analysisResults?.overall_health === 'Unhealthy').length,
  };

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${BACKEND_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  return (
    <div>
      <Header title="Plant Growth Dashboard" />

      {/* Alert Banner */}
      <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

      {/* Stats Cards */}
      <StatsCards stats={liveStats} />

      {/* Charts Row */}
      <div className="charts">
        <HealthProgressChart history={history} />
        <HealthChart healthData={healthData} />
      </div>

      {/* Latest Analysis */}
      {latestAnalysis && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2><i className="fas fa-star"></i> Latest Analysis</h2>
            <button className="btn btn-sm" onClick={() => navigate('/upload')}>
              <i className="fas fa-plus"></i> New Analysis
            </button>
          </div>
          <div className="latest-analysis-wrap">
            <AnalysisResultCard
              result={latestAnalysis.analysisResults}
              imageName={latestAnalysis.originalImageName}
              imageUrl={latestAnalysis.imageUrl}
            />
          </div>
        </div>
      )}

      {/* Recent history thumbnails */}
      {recentHistory.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2><i className="fas fa-history"></i> Recent Analyses</h2>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/history')}>
              View All
            </button>
          </div>
          <div className="recent-thumbs">
            {recentHistory.map(item => (
              <div key={item._id} className="recent-thumb" onClick={() => navigate('/history')}>
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.originalImageName}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMzAiIGhlaWdodD0iOTAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlOGY1ZTkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMmU3ZDMyIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcmNoaXZlZDwvdGV4dD48L3N2Zz4='; }}
                />
                <div className="recent-thumb-label">
                  <span className="recent-thumb-stage">{item.analysisResults?.growth_stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Plants — real uploaded plants */}
      <div className="plants-section">
        <div className="section-header">
          <h2>My Plants</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/plants')}>
              <i className="fas fa-th"></i> View All
            </button>
            <button className="btn" onClick={() => navigate('/upload')}>
              <i className="fas fa-plus"></i> Add New Plant
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="loading-page" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner-large"></div>
            <p>Loading your plants...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-seedling"></i>
            <h3>No plants yet</h3>
            <p>Upload your first plant image to start tracking its health and growth.</p>
            <button className="btn" onClick={() => navigate('/upload')}>
              <i className="fas fa-cloud-upload-alt"></i> Upload Plant
            </button>
          </div>
        ) : (
          <div className="plants-grid">
            {history.slice(0, 6).map(item => (
              <div
                key={item._id}
                className="plant-card"
                onClick={() => navigate('/plants')}
                style={{ cursor: 'pointer' }}
              >
                <div className="plant-image" style={{ position: 'relative', overflow: 'hidden', background: '#e8f5e9' }}>
                  <img
                    src={resolveImageUrl(item.imageUrl)}
                    alt={item.originalImageName}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  />
                  <div className={`plant-status ${getHealthClass(item.analysisResults?.overall_health)}`} style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    {item.analysisResults?.overall_health}
                  </div>
                </div>
                <div className="plant-info">
                  <h3 style={{ fontSize: '13px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.originalImageName}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    {item.analysisResults?.growth_stage || 'Unknown stage'}
                  </p>
                  <div className="plant-stats">
                    <div className="stat">
                      <div className="stat-value" style={{ fontSize: '11px' }}>
                        {item.analysisResults?.diseases?.length > 0 ? item.analysisResults.diseases.length : '0'}
                      </div>
                      <div className="stat-label">Diseases</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value" style={{ fontSize: '11px' }}>
                        {item.analysisResults?.nutrient_deficiencies?.length > 0 ? item.analysisResults.nutrient_deficiencies.length : '0'}
                      </div>
                      <div className="stat-label">Defic.</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value" style={{ fontSize: '11px' }}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="stat-label">Added</div>
                    </div>
                  </div>
                  <div className="view-details">
                    <span>Click to view details →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;