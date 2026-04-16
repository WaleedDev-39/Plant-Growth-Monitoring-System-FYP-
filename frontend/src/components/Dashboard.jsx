import React from 'react';
import Header from './Header';
import StatsCards from './StatsCards';
import GrowthChart from './GrowthChart';
import HealthChart from './HealthChart';
import PlantCard from './PlantCard';
import { statsData, growthData, healthData, plantsData } from '../data/sampleData';

const Dashboard = () => {
  return (
    <div>
      <Header title="Plant Growth Dashboard" />
      
      <StatsCards stats={statsData} />
      
      <div className="charts">
        <GrowthChart growthData={growthData} />
        <HealthChart healthData={healthData} />
      </div>
      
      <div className="plants-section">
        <div className="section-header">
          <h2>My Plants</h2>
          <button className="btn">
            <i className="fas fa-plus"></i> Add New Plant
          </button>
        </div>
        <div className="plants-grid">
          {plantsData.map(plant => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;