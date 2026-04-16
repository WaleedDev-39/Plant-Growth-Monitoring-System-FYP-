import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AnalysisResultCard from '../components/AnalysisResultCard';
import { getHistory, deleteHistoryItem } from '../api/upload';
import toast from 'react-hot-toast';
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis permanently?')) return;
    try {
      await deleteHistoryItem(id);
      toast.success('Analysis deleted successfully');
      setHistory(prev => prev.filter(item => item._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete analysis');
    }
  };

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
                        src={(item.imageUrl?.startsWith('http') || item.imageUrl?.startsWith('data:')) ? item.imageUrl : `${BACKEND_URL.replace(/\/$/, '')}/${item.imageUrl.replace(/^\//, '')}`}
                        alt={item.originalImageName}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2OCIgaGVpZ2h0PSI1MiI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U4ZjVlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMyZTdkMzIiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5BPC90ZXh0Pjwvc3ZnPg=='; }}
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
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(selected._id); }} 
                      className="btn btn-sm" 
                      style={{ backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2' }}
                    >
                      <i className="fas fa-trash-alt"></i> Delete Analysis
                    </button>
                  </div>
                  <AnalysisResultCard
                    result={selected.analysisResults}
                    imageName={selected.originalImageName}
                    imageUrl={selected.imageUrl}
                  />
                </div>
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
