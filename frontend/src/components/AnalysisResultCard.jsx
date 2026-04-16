import React from 'react';

const healthColors = {
  'Healthy': { bg: '#e8f5e9', color: '#2e7d32', icon: 'fas fa-check-circle' },
  'At risk': { bg: '#fff3e0', color: '#e65100', icon: 'fas fa-exclamation-triangle' },
  'Unhealthy': { bg: '#ffebee', color: '#c62828', icon: 'fas fa-times-circle' }
};

const severityColor = { mild: '#ff9800', moderate: '#e65100', severe: '#c62828' };

const AnalysisResultCard = ({ result, imageName, imageUrl, backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000' }) => {
  if (!result) return null;

  const health = healthColors[result.overall_health] || healthColors['Healthy'];

  return (
    <div className="analysis-card">
      <div className="analysis-header">
        <div className="analysis-title">
          <i className="fas fa-leaf"></i>
          <h3>Analysis Results</h3>
          {imageName && <span className="image-name">{imageName}</span>}
        </div>
        <div className="health-badge" style={{ background: health.bg, color: health.color }}>
          <i className={health.icon}></i>
          {result.overall_health}
        </div>
      </div>

      {imageUrl && (
        <div className="result-image-thumb">
          <img
            src={imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`}
            alt="Analyzed plant"
          />
        </div>
      )}

      <div className="analysis-grid">
        {/* Growth Stage */}
        <div className="analysis-block">
          <div className="block-label"><i className="fas fa-seedling"></i> Growth Stage</div>
          <div className="block-value">{result.growth_stage}</div>
          <div className="confidence-bar-wrap">
            <div className="confidence-bar" style={{ width: `${result.growth_stage_confidence}%` }}></div>
            <span>{result.growth_stage_confidence?.toFixed(1)}%</span>
          </div>
        </div>

        {/* Diseases */}
        <div className="analysis-block">
          <div className="block-label"><i className="fas fa-virus"></i> Diseases Detected</div>
          {result.diseases && result.diseases.length > 0 ? (
            result.diseases.map((d, i) => (
              <div key={i} className="tag tag-disease">
                {d.name}
                <span className="tag-conf">{d.confidence?.toFixed(1)}%</span>
              </div>
            ))
          ) : (
            <div className="tag tag-ok"><i className="fas fa-check"></i> None detected</div>
          )}
        </div>

        {/* Nutrient Deficiencies */}
        <div className="analysis-block">
          <div className="block-label"><i className="fas fa-flask"></i> Nutrient Deficiencies</div>
          {result.nutrient_deficiencies && result.nutrient_deficiencies.length > 0 ? (
            result.nutrient_deficiencies.map((n, i) => (
              <div key={i} className="tag tag-nutrient" style={{ borderColor: severityColor[n.severity] }}>
                {n.name}
                <span className="tag-severity" style={{ color: severityColor[n.severity] }}>
                  {n.severity}
                </span>
              </div>
            ))
          ) : (
            <div className="tag tag-ok"><i className="fas fa-check"></i> None detected</div>
          )}
        </div>

        {/* Water Stress */}
        <div className="analysis-block">
          <div className="block-label"><i className="fas fa-tint"></i> Water Stress</div>
          {result.water_stress?.detected ? (
            <div className="tag tag-water">
              {result.water_stress.symptom}
              <span className="tag-conf">{result.water_stress.confidence?.toFixed(1)}%</span>
            </div>
          ) : (
            <div className="tag tag-ok"><i className="fas fa-check"></i> No stress detected</div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="recommendations">
          <div className="block-label"><i className="fas fa-lightbulb"></i> Recommendations</div>
          <ul className="rec-list">
            {result.recommendations.map((rec, i) => (
              <li key={i}><i className="fas fa-arrow-right"></i> {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisResultCard;
