import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const healthScore = (health) => {
  switch (health) {
    case 'Healthy': return 100;
    case 'At risk': return 55;
    case 'Unhealthy': return 20;
    default: return 70;
  }
};

const HealthProgressChart = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3><i className="fas fa-chart-line"></i> Health Progress</h3>
        </div>
        <div className="chart-empty">
          <i className="fas fa-seedling"></i>
          <p>Upload your first plant image to see health trends</p>
        </div>
      </div>
    );
  }

  const data = [...history]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-10)
    .map((h, i) => ({
      name: new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      health: healthScore(h.analysisResults?.overall_health),
      confidence: Math.round(h.analysisResults?.growth_stage_confidence || 0)
    }));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3><i className="fas fa-chart-line"></i> Health Progress</h3>
        <span className="chart-subtitle">Last {data.length} analyses</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, name) => [
              `${value}${name === 'health' ? '/100' : '%'}`,
              name === 'health' ? 'Health Score' : 'Stage Confidence'
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="health"
            stroke="#2e7d32"
            strokeWidth={2.5}
            dot={{ fill: '#2e7d32', r: 4 }}
            activeDot={{ r: 6 }}
            name="health"
          />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="#ff9800"
            strokeWidth={2}
            dot={{ fill: '#ff9800', r: 3 }}
            name="confidence"
            strokeDasharray="5 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthProgressChart;
