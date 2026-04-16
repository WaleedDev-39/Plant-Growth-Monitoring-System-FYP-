import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import GrowthChart from '../components/GrowthChart';
import HealthChart from '../components/HealthChart';
import PlantCard from '../components/PlantCard';
import AlertBanner from '../components/AlertBanner';
import AnalysisResultCard from '../components/AnalysisResultCard';
import HealthProgressChart from '../components/HealthProgressChart';
import { statsData, growthData, healthData, plantsData } from '../data/sampleData';
import { getHistory } from '../api/upload';
import { getAlerts } from '../api/alerts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  // Build live stats from real history
  const liveStats = history.length > 0 ? {
    totalPlants: history.length,
    healthyPlants: history.filter(h => h.analysisResults?.overall_health === 'Healthy').length,
    avgGrowthRate: 2.4,
    waterLevel: 78,
    newPlants: history.filter(h => {
      const d = new Date(h.createdAt);
      const now = new Date();
      return (now - d) < 7 * 24 * 3600 * 1000;
    }).length
  } : statsData;

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
                  src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.imageUrl}`}
                  alt={item.originalImageName}
                />
                <div className="recent-thumb-label">
                  <span className={`plant-status status-${item.analysisResults?.overall_health === 'Healthy' ? 'healthy' : item.analysisResults?.overall_health === 'At risk' ? 'warning' : 'critical'}`}>
                    {item.analysisResults?.overall_health}
                  </span>
                  <span className="recent-thumb-stage">{item.analysisResults?.growth_stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Plants section (sample data demo) */}
      <div className="plants-section">
        <div className="section-header">
          <h2>My Plants</h2>
          <button className="btn" onClick={() => navigate('/upload')}>
            <i className="fas fa-plus"></i> Add New Plant
          </button>
        </div>
        <div className="plants-grid">
          {plantsData.map(plant => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;