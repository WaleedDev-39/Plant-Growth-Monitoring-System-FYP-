import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getHistory, deleteHistoryItem } from '../api/upload';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HEALTH_FILTERS = ['All', 'Healthy', 'At risk', 'Unhealthy'];

const healthClass = (h) => {
  if (h === 'Healthy') return 'status-healthy';
  if (h === 'At risk') return 'status-warning';
  return 'status-critical';
};

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${BACKEND_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThmNWU5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzJlN2QzMiIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+MiTwvdGV4dD48L3N2Zz4=';

const PlantsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory(user._id);
        setHistory(res.data.data || []);
      } catch (e) {
        toast.error('Failed to load plants');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this plant analysis permanently?')) return;
    try {
      await deleteHistoryItem(id);
      toast.success('Plant deleted');
      setHistory(prev => prev.filter(item => item._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = history.filter(item => {
    const matchesFilter = filter === 'All' || item.analysisResults?.overall_health === filter;
    const matchesSearch = !search || item.originalImageName?.toLowerCase().includes(search.toLowerCase())
      || item.analysisResults?.growth_stage?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    All: history.length,
    Healthy: history.filter(h => h.analysisResults?.overall_health === 'Healthy').length,
    'At risk': history.filter(h => h.analysisResults?.overall_health === 'At risk').length,
    Unhealthy: history.filter(h => h.analysisResults?.overall_health === 'Unhealthy').length,
  };

  return (
    <div>
      <Header title="My Plants" />
      <div className="page-content">

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e', fontSize: '13px' }}></i>
            <input
              type="text"
              placeholder="Search by name or growth stage..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e0e0e0',
                borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {HEALTH_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                  border: '1.5px solid',
                  borderColor: filter === f ? '#2e7d32' : '#e0e0e0',
                  background: filter === f ? '#2e7d32' : '#fff',
                  color: filter === f ? '#fff' : '#555',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {f} <span style={{ opacity: 0.75, fontSize: '11px' }}>({counts[f]})</span>
              </button>
            ))}
          </div>

          <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => navigate('/upload')}>
            <i className="fas fa-plus"></i> Add Plant
          </button>
        </div>

        {loading ? (
          <div className="loading-page" style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner-large"></div>
            <p>Loading your plants...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-seedling"></i>
            <h3>No plants yet</h3>
            <p>Upload your first plant image to start monitoring its health and growth.</p>
            <button className="btn" onClick={() => navigate('/upload')}>
              <i className="fas fa-cloud-upload-alt"></i> Upload Your First Plant
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-filter"></i>
            <h3>No plants match your filter</h3>
            <p>Try changing the health filter or search term.</p>
            <button className="btn btn-outline" onClick={() => { setFilter('All'); setSearch(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {filtered.map(item => {
              const health = item.analysisResults?.overall_health || 'Unknown';
              const hasDiseases = item.analysisResults?.diseases?.length > 0;
              const hasDeficiencies = item.analysisResults?.nutrient_deficiencies?.length > 0;
              const hasWaterStress = item.analysisResults?.water_stress?.detected;

              return (
                <div
                  key={item._id}
                  onClick={() => setSelected(item)}
                  style={{
                    background: '#fff', borderRadius: '16px', overflow: 'hidden',
                    boxShadow: selected?._id === item._id
                      ? '0 0 0 2px #2e7d32, 0 8px 24px rgba(46,125,50,0.15)'
                      : '0 2px 12px rgba(0,0,0,0.08)',
                    cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #f0f0f0'
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: '160px', background: '#e8f5e9', overflow: 'hidden' }}>
                    <img
                      src={resolveImageUrl(item.imageUrl) || PLACEHOLDER}
                      alt={item.originalImageName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                    />
                    {/* Health badge overlay */}
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px',
                      padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                      backdropFilter: 'blur(4px)',
                      background: health === 'Healthy' ? 'rgba(46,125,50,0.9)' : health === 'At risk' ? 'rgba(230,81,0,0.9)' : 'rgba(198,40,40,0.9)',
                      color: '#fff'
                    }}>
                      {health}
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={e => handleDelete(item._id, e)}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(255,255,255,0.9)', border: 'none',
                        borderRadius: '8px', padding: '4px 8px', cursor: 'pointer',
                        color: '#c62828', fontSize: '12px', opacity: 0,
                        transition: 'opacity 0.2s'
                      }}
                      className="plant-delete-btn"
                      title="Delete this analysis"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a1a1a' }}>
                      {item.originalImageName}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                      <i className="fas fa-seedling" style={{ marginRight: '4px', color: '#2e7d32' }}></i>
                      {item.analysisResults?.growth_stage || '—'}
                    </p>

                    {/* Issue tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                      {hasDiseases && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '8px', background: '#ffebee', color: '#c62828', fontWeight: '600' }}>
                          <i className="fas fa-virus" style={{ marginRight: '3px' }}></i>
                          {item.analysisResults.diseases.length} disease{item.analysisResults.diseases.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {hasDeficiencies && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '8px', background: '#fff3e0', color: '#e65100', fontWeight: '600' }}>
                          <i className="fas fa-flask" style={{ marginRight: '3px' }}></i>
                          {item.analysisResults.nutrient_deficiencies.length} defic.
                        </span>
                      )}
                      {hasWaterStress && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '8px', background: '#e3f2fd', color: '#1565c0', fontWeight: '600' }}>
                          <i className="fas fa-tint" style={{ marginRight: '3px' }}></i>
                          Water stress
                        </span>
                      )}
                      {!hasDiseases && !hasDeficiencies && !hasWaterStress && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '8px', background: '#e8f5e9', color: '#2e7d32', fontWeight: '600' }}>
                          <i className="fas fa-check" style={{ marginRight: '3px' }}></i>
                          No issues
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '11px', color: '#9e9e9e' }}>
                      <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Slide-in detail panel */}
        {selected && (
          <div
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100vw',
              background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              zIndex: 1000, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>
                <i className="fas fa-leaf" style={{ color: '#2e7d32', marginRight: '8px' }}></i>
                Plant Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}
              >
                <i className="fas fa-times"></i> Close
              </button>
            </div>

            {/* Image */}
            <img
              src={resolveImageUrl(selected.imageUrl) || PLACEHOLDER}
              alt={selected.originalImageName}
              style={{ width: '100%', borderRadius: '12px', maxHeight: '220px', objectFit: 'cover' }}
              onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
            />

            {/* Health */}
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: selected.analysisResults?.overall_health === 'Healthy' ? '#e8f5e9' : selected.analysisResults?.overall_health === 'At risk' ? '#fff3e0' : '#ffebee',
              color: selected.analysisResults?.overall_health === 'Healthy' ? '#2e7d32' : selected.analysisResults?.overall_health === 'At risk' ? '#e65100' : '#c62828'
            }}>
              <strong>{selected.analysisResults?.overall_health}</strong> — {selected.analysisResults?.growth_stage}
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                Confidence: {selected.analysisResults?.growth_stage_confidence?.toFixed(1)}%
              </div>
            </div>

            {/* Diseases */}
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fas fa-virus" style={{ marginRight: '5px' }}></i>Diseases
              </p>
              {selected.analysisResults?.diseases?.length > 0 ? selected.analysisResults.diseases.map((d, i) => (
                <div key={i} className="tag tag-disease" style={{ marginBottom: '4px' }}>
                  {d.name} <span className="tag-conf">{Number(d.confidence).toFixed(1)}%</span>
                </div>
              )) : <div className="tag tag-ok"><i className="fas fa-check"></i> None detected</div>}
            </div>

            {/* Nutrient Deficiencies */}
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fas fa-flask" style={{ marginRight: '5px' }}></i>Nutrient Deficiencies
              </p>
              {selected.analysisResults?.nutrient_deficiencies?.length > 0 ? selected.analysisResults.nutrient_deficiencies.map((n, i) => (
                <div key={i} className="tag tag-nutrient" style={{ marginBottom: '4px' }}>
                  {n.name} <span className="tag-severity">{n.severity}</span>
                </div>
              )) : <div className="tag tag-ok"><i className="fas fa-check"></i> None detected</div>}
            </div>

            {/* Water Stress */}
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fas fa-tint" style={{ marginRight: '5px' }}></i>Water Stress
              </p>
              {selected.analysisResults?.water_stress?.detected
                ? <div className="tag tag-water">{selected.analysisResults.water_stress.symptom} <span className="tag-conf">{Number(selected.analysisResults.water_stress.confidence).toFixed(1)}%</span></div>
                : <div className="tag tag-ok"><i className="fas fa-check"></i> No stress detected</div>
              }
            </div>

            {/* Recommendations */}
            {selected.analysisResults?.recommendations?.length > 0 && (
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <i className="fas fa-lightbulb" style={{ marginRight: '5px' }}></i>Recommendations
                </p>
                <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '13px', color: '#444', lineHeight: '1.8' }}>
                  {selected.analysisResults.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Date */}
            <p style={{ fontSize: '12px', color: '#9e9e9e', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
              <i className="fas fa-calendar" style={{ marginRight: '5px' }}></i>
              Analyzed on {new Date(selected.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={e => handleDelete(selected._id, e)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ffcdd2', background: '#ffebee', color: '#c62828', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                <i className="fas fa-trash-alt"></i> Delete
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="btn"
                style={{ flex: 1 }}
              >
                <i className="fas fa-redo"></i> Analyze Again
              </button>
            </div>
          </div>
        )}

        {/* Overlay when detail panel is open */}
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999, backdropFilter: 'blur(2px)' }}
          />
        )}
      </div>

      <style>{`
        .plant-card-wrap:hover .plant-delete-btn { opacity: 1 !important; }
        div[style*="cursor: pointer"]:hover .plant-delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default PlantsPage;
