import React from 'react';
import { markAlertRead } from '../api/alerts';

const typeIcon = {
  disease: 'fas fa-virus',
  deficiency: 'fas fa-flask',
  water_stress: 'fas fa-tint'
};

const typeColor = {
  disease: '#c62828',
  deficiency: '#e65100',
  water_stress: '#0277bd'
};

const AlertBanner = ({ alerts, onDismiss }) => {
  const unread = alerts.filter(a => !a.isRead);
  if (unread.length === 0) return null;

  const handleDismiss = async (alert) => {
    try {
      await markAlertRead(alert._id);
      onDismiss(alert._id);
    } catch (e) {
      console.error('Failed to mark alert as read', e);
    }
  };

  return (
    <div className="alert-banner-wrap">
      {unread.slice(0, 3).map(alert => (
        <div
          key={alert._id}
          className="alert-banner"
          style={{ borderLeftColor: typeColor[alert.type] || '#c62828' }}
        >
          <div className="alert-banner-left">
            <i
              className={typeIcon[alert.type] || 'fas fa-exclamation-circle'}
              style={{ color: typeColor[alert.type] || '#c62828' }}
            ></i>
            <span>{alert.message}</span>
          </div>
          <button
            className="alert-dismiss"
            onClick={() => handleDismiss(alert)}
            title="Dismiss alert"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
