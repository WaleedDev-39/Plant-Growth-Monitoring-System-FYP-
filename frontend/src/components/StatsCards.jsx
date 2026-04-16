import React from 'react';

const StatsCards = ({ stats }) => {
  const cardData = [
    {
      title: 'Total Plants',
      value: stats.totalPlants,
      icon: 'fas fa-seedling',
      footer: `+${stats.newPlants} from last week`
    },
    {
      title: 'Healthy Plants',
      value: stats.healthyPlants,
      icon: 'fas fa-heart',
      footer: `${Math.round((stats.healthyPlants / stats.totalPlants) * 100)}% of total plants`
    },
    {
      title: 'Avg. Growth Rate',
      value: `${stats.avgGrowthRate} cm`,
      icon: 'fas fa-chart-line',
      footer: 'Per week'
    },
    {
      title: 'Water Level',
      value: `${stats.waterLevel}%`,
      icon: 'fas fa-tint',
      footer: 'Optimal for most plants'
    }
  ];

  return (
    <div className="dashboard-cards">
      {cardData.map((card, index) => (
        <div key={index} className="card">
          <div className="card-header">
            <h3>{card.title}</h3>
            <i className={card.icon}></i>
          </div>
          <div className="card-value">{card.value}</div>
          <div className="card-footer">{card.footer}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;