import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlantCard = ({ plant }) => {
  const navigate = useNavigate();
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'warning':
        return 'status-warning';
      case 'critical':
        return 'status-critical';
      default:
        return 'status-healthy';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Needs Water';
      case 'critical':
        return 'Critical';
      default:
        return 'Healthy';
    }
  };

  const handlePlantClick = () => {
    navigate(`/plant/${plant.id}`);
  };

  return (
    <div className="plant-card" onClick={handlePlantClick}>
      <div className="plant-image">
        <i className={plant.icon}></i>
        <div className={`plant-status ${getStatusClass(plant.status)}`}>
          {getStatusText(plant.status)}
        </div>
      </div>
      <div className="plant-info">
        <h3>{plant.name}</h3>
        <p>Planted: {plant.plantedDate}</p>
        <div className="plant-stats">
          <div className="stat">
            <div className="stat-value">{plant.height}</div>
            <div className="stat-label">Height</div>
          </div>
          <div className="stat">
            <div className="stat-value">{plant.humidity}%</div>
            <div className="stat-label">Humidity</div>
          </div>
          <div className="stat">
            <div className="stat-value">{plant.temperature}°C</div>
            <div className="stat-label">Temp</div>
          </div>
        </div>
        <div className="view-details">
          <span>Click to view growth stages →</span>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;