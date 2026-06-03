import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getHistory } from '../api/upload';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory(user._id);
        setHistory(res.data.data || []);
      } catch (e) {
        console.error('Failed to fetch analytics data', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div>
        <Header title="Analytics" />
        <div className="page-content loading-page" style={{ textAlign: 'center', padding: '80px' }}>
          <div className="spinner-large"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div>
        <Header title="Analytics" />
        <div className="page-content">
          <div className="empty-state">
            <i className="fas fa-chart-line"></i>
            <h3>No data yet</h3>
            <p>Upload plant images to generate analytics and insights about your plants' health over time.</p>
            <button className="btn" onClick={() => navigate('/upload')}>
              <i className="fas fa-cloud-upload-alt"></i> Upload First Plant
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Compute stats ──────────────────────────────────────────────────────────
  const total = history.length;
  const healthCounts = {
    Healthy: history.filter(h => h.analysisResults?.overall_health === 'Healthy').length,
    'At risk': history.filter(h => h.analysisResults?.overall_health === 'At risk').length,
    Unhealthy: history.filter(h => h.analysisResults?.overall_health === 'Unhealthy').length,
  };

  const stageCounts = {};
  history.forEach(h => {
    const s = h.analysisResults?.growth_stage || 'Unknown';
    stageCounts[s] = (stageCounts[s] || 0) + 1;
  });

  const diseaseCounts = {};
  history.forEach(h => {
    (h.analysisResults?.diseases || []).forEach(d => {
      diseaseCounts[d.name] = (diseaseCounts[d.name] || 0) + 1;
    });
  });

  const deficiencyCounts = {};
  history.forEach(h => {
    (h.analysisResults?.nutrient_deficiencies || []).forEach(n => {
      deficiencyCounts[n.name] = (deficiencyCounts[n.name] || 0) + 1;
    });
  });

  const totalDiseaseOccurrences = Object.values(diseaseCounts).reduce((a, b) => a + b, 0);
  const totalDeficiencyOccurrences = Object.values(deficiencyCounts).reduce((a, b) => a + b, 0);
  const waterStressCount = history.filter(h => h.analysisResults?.water_stress?.detected).length;

  // Analyses per week (last 6 weeks)
  const now = new Date();
  const weekBuckets = [];
  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7 - 6);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    const label = `W${6 - i}`;
    const count = history.filter(h => {
      const d = new Date(h.createdAt);
      return d >= weekStart && d <= weekEnd;
    }).length;
    weekBuckets.push({ label, count });
  }
  const maxWeek = Math.max(...weekBuckets.map(w => w.count), 1);

  // ── Helper renderers ───────────────────────────────────────────────────────

  const BarChart = ({ data, max, colorFn }) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', paddingTop: '8px' }}>
      {data.map(({ label, count }, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: '#555', fontWeight: '600' }}>{count}</span>
          <div style={{
            width: '100%', borderRadius: '6px 6px 0 0',
            background: colorFn ? colorFn(i) : '#2e7d32',
            height: `${Math.max((count / max) * 100, count > 0 ? 8 : 0)}px`,
            transition: 'height 0.4s ease',
            minHeight: count > 0 ? '6px' : '0'
          }} />
          <span style={{ fontSize: '10px', color: '#888', textAlign: 'center', lineHeight: '1.2' }}>{label}</span>
        </div>
      ))}
    </div>
  );

  const DonutSegment = ({ pct, color, offset }) => {
    const r = 36;
    const circ = 2 * Math.PI * r;
    return (
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="14"
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeDashoffset={-offset * circ}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px', transition: 'stroke-dasharray 0.6s ease' }}
      />
    );
  };

  const healthPcts = {
    Healthy: healthCounts.Healthy / total,
    'At risk': healthCounts['At risk'] / total,
    Unhealthy: healthCounts.Unhealthy / total,
  };
  const healthColors = { Healthy: '#2e7d32', 'At risk': '#e65100', Unhealthy: '#c62828' };

  const Card = ({ children, style }) => (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0',
      ...style
    }}>
      {children}
    </div>
  );

  const SectionTitle = ({ icon, text }) => (
    <p style={{ fontSize: '13px', fontWeight: '700', color: '#555', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      <i className={icon} style={{ marginRight: '6px', color: '#2e7d32' }}></i>{text}
    </p>
  );

  const RankRow = ({ label, count, total, color }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
          <span style={{ color: '#333', fontWeight: '500' }}>{label}</span>
          <span style={{ color: '#888' }}>{count}×</span>
        </div>
        <div style={{ background: '#f0f0f0', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color || '#2e7d32', borderRadius: '6px', transition: 'width 0.5s ease' }} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header title="Analytics" />
      <div className="page-content">

        {/* Summary stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: 'fas fa-leaf', label: 'Total Analyses', value: total, color: '#2e7d32', bg: '#e8f5e9' },
            { icon: 'fas fa-check-circle', label: 'Healthy', value: healthCounts.Healthy, color: '#2e7d32', bg: '#e8f5e9' },
            { icon: 'fas fa-exclamation-triangle', label: 'At Risk', value: healthCounts['At risk'], color: '#e65100', bg: '#fff3e0' },
            { icon: 'fas fa-times-circle', label: 'Unhealthy', value: healthCounts.Unhealthy, color: '#c62828', bg: '#ffebee' },
            { icon: 'fas fa-virus', label: 'Disease Cases', value: totalDiseaseOccurrences, color: '#7b1fa2', bg: '#f3e5f5' },
            { icon: 'fas fa-tint', label: 'Water Stress', value: waterStressCount, color: '#1565c0', bg: '#e3f2fd' },
          ].map((s, i) => (
            <Card key={i} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={s.icon} style={{ color: s.color, fontSize: '16px' }}></i>
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>

          {/* Health Donut Chart */}
          <Card>
            <SectionTitle icon="fas fa-heart" text="Health Breakdown" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <svg viewBox="0 0 100 100" style={{ width: '110px', flexShrink: 0 }}>
                <circle cx="50" cy="50" r="36" fill="none" stroke="#f0f0f0" strokeWidth="14" />
                {total > 0 && (() => {
                  let offset = 0;
                  return Object.entries(healthPcts).map(([key, pct]) => {
                    const el = <DonutSegment key={key} pct={pct} color={healthColors[key]} offset={offset} />;
                    offset += pct;
                    return el;
                  });
                })()}
                <text x="50" y="46" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a1a1a">{total}</text>
                <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#888">total</text>
              </svg>
              <div style={{ flex: 1 }}>
                {Object.entries(healthCounts).map(([key, count]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: healthColors[key], flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#444', flex: 1 }}>{key}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: healthColors[key] }}>{count}</span>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Growth Stage Distribution */}
          <Card>
            <SectionTitle icon="fas fa-seedling" text="Growth Stage Distribution" />
            {Object.keys(stageCounts).length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '13px' }}>No data available</p>
            ) : (
              <BarChart
                data={Object.entries(stageCounts).map(([label, count]) => ({ label, count }))}
                max={Math.max(...Object.values(stageCounts), 1)}
                colorFn={i => ['#2e7d32', '#43a047', '#66bb6a', '#a5d6a7', '#c8e6c9'][i % 5]}
              />
            )}
          </Card>

          {/* Activity over time */}
          <Card>
            <SectionTitle icon="fas fa-chart-bar" text="Analyses Over 6 Weeks" />
            <BarChart
              data={weekBuckets}
              max={maxWeek}
              colorFn={() => '#2e7d32'}
            />
          </Card>

          {/* Disease frequency */}
          <Card>
            <SectionTitle icon="fas fa-virus" text="Most Common Diseases" />
            {Object.keys(diseaseCounts).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '28px', color: '#2e7d32', marginBottom: '8px', display: 'block' }}></i>
                <p style={{ color: '#666', fontSize: '13px' }}>No diseases detected in any analysis! 🎉</p>
              </div>
            ) : (
              Object.entries(diseaseCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => (
                  <RankRow key={name} label={name} count={count} total={totalDiseaseOccurrences} color="#c62828" />
                ))
            )}
          </Card>

          {/* Nutrient deficiency frequency */}
          <Card>
            <SectionTitle icon="fas fa-flask" text="Common Deficiencies" />
            {Object.keys(deficiencyCounts).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '28px', color: '#2e7d32', marginBottom: '8px', display: 'block' }}></i>
                <p style={{ color: '#666', fontSize: '13px' }}>No deficiencies detected! 🌱</p>
              </div>
            ) : (
              Object.entries(deficiencyCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => (
                  <RankRow key={name} label={name} count={count} total={totalDeficiencyOccurrences} color="#e65100" />
                ))
            )}
          </Card>

          {/* Health rate KPI */}
          <Card>
            <SectionTitle icon="fas fa-trophy" text="Overall Health Score" />
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              {(() => {
                const score = total > 0
                  ? Math.round((healthCounts.Healthy * 100 + healthCounts['At risk'] * 50) / total)
                  : 0;
                const color = score >= 75 ? '#2e7d32' : score >= 40 ? '#e65100' : '#c62828';
                const label = score >= 75 ? 'Excellent' : score >= 40 ? 'Fair' : 'Needs Attention';
                return (
                  <>
                    <div style={{ fontSize: '52px', fontWeight: '900', color, lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>out of 100</div>
                    <div style={{
                      marginTop: '12px', display: 'inline-block',
                      padding: '4px 16px', borderRadius: '20px',
                      background: color + '20', color, fontWeight: '700', fontSize: '13px'
                    }}>{label}</div>
                    <div style={{ marginTop: '16px', background: '#f0f0f0', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '8px', transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>
                      Based on {total} plant {total === 1 ? 'analysis' : 'analyses'}
                    </p>
                  </>
                );
              })()}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
