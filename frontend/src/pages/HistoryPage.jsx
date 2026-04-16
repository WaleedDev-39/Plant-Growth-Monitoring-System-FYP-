import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AnalysisResultCard from '../components/AnalysisResultCard';
import { getHistory } from '../api/upload';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory(user._id);
        setHistory(res.data.data || []);
      } catch (e) {
        console.error('Failed to fetch history', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  const healthClass = (h) => {
    if (h === 'Healthy') return 'status-healthy';
    if (h === 'At risk') return 'status-warning';
    return 'status-critical';
  };

  if (loading) {
    return (
      <div>
        <Header title="Analysis History" />
        <div className="page-content loading-page">
          <div className="spinner-large"></div>
          <p>Loading your analysis history...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Analysis History" />
      <div className="page-content">
        {history.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-history"></i>
            <h3>No analysis history yet</h3>
            <p>Upload your first plant image to start tracking growth and health over time.</p>
          </div>
        ) : (
          <div className="history-layout">
            {/* Left: thumbnail grid */}
            <div className="history-grid-panel">
              <div className="section-header">
                <h2>All Analyses <span className="count-badge">{history.length}</span></h2>
              </div>
              <div className="history-grid">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className={`history-thumb ${selected?._id === item._id ? 'selected' : ''}`}
                    onClick={() => setSelected(item)}
                  >
                    <div className="history-img-wrap">
                      <img
                        src={(item.imageUrl?.startsWith('http') || item.imageUrl?.startsWith('data:')) ? item.imageUrl : `${BACKEND_URL}${item.imageUrl}`}
                        alt={item.originalImageName}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/68x52/e8f5e9/2e7d32?text=NA'; }}
                      />
                      <span className={`plant-status ${healthClass(item.analysisResults?.overall_health)}`}>
                        {item.analysisResults?.overall_health}
                      </span>
                    </div>
                    <div className="history-thumb-info">
                      <p className="thumb-name">{item.originalImageName}</p>
                      <p className="thumb-stage">{item.analysisResults?.growth_stage}</p>
                      <p className="thumb-date">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: detail panel */}
            <div className="history-detail-panel">
              {selected ? (
                <AnalysisResultCard
                  result={selected.analysisResults}
                  imageName={selected.originalImageName}
                  imageUrl={selected.imageUrl}
                />
              ) : (
                <div className="results-placeholder">
                  <div className="placeholder-icon">
                    <i className="fas fa-hand-point-left"></i>
                  </div>
                  <h3>Select an analysis</h3>
                  <p>Click any card on the left to view the full analysis details.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
