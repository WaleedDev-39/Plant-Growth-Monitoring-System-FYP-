import React from 'react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ComparisonView = ({ current, previous }) => {
  if (!current && !previous) return null;

  const imgSrc = (url) => (url?.startsWith('http') || url?.startsWith('data:')) ? url : `${BACKEND_URL}${url}`;
  const fmtDate = (d) => new Date(d).toLocaleString();

  return (
    <div className="comparison-view">
      <h3 className="comparison-title"><i className="fas fa-columns"></i> Image Comparison</h3>
      <div className="comparison-grid">
        <div className="comparison-item">
          <div className="comparison-label">
            <i className="fas fa-clock"></i> Previous Analysis
          </div>
          {previous ? (
            <>
              <img src={imgSrc(previous.imageUrl)} alt="Previous" className="comparison-img" />
              <div className="comparison-meta">
                <span className={`health-pill health-${previous.analysisResults?.overall_health?.replace(' ', '-').toLowerCase()}`}>
                  {previous.analysisResults?.overall_health}
                </span>
                <span className="comparison-date">{fmtDate(previous.createdAt)}</span>
              </div>
            </>
          ) : (
            <div className="comparison-empty">
              <i className="fas fa-image"></i>
              <p>No previous analysis</p>
            </div>
          )}
        </div>

        <div className="comparison-divider">
          <div className="comparison-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>

        <div className="comparison-item">
          <div className="comparison-label current">
            <i className="fas fa-star"></i> Current Analysis
          </div>
          {current ? (
            <>
              <img src={imgSrc(current.imageUrl)} alt="Current" className="comparison-img" />
              <div className="comparison-meta">
                <span className={`health-pill health-${current.analysisResults?.overall_health?.replace(' ', '-').toLowerCase()}`}>
                  {current.analysisResults?.overall_health}
                </span>
                <span className="comparison-date">{fmtDate(current.createdAt)}</span>
              </div>
            </>
          ) : (
            <div className="comparison-empty">
              <i className="fas fa-image"></i>
              <p>No current analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
