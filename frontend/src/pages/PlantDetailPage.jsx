import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { plantsData } from '../data/sampleData';
import '../App.css';

const PlantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState('7days');
  
  // Find the plant by ID
  const plant = plantsData.find(p => p.id === parseInt(id));
  
  if (!plant) {
    return (
      <div className="plant-detail">
        <Header title="Plant Not Found" />
        <div className="page-content">
          <p>Plant not found. Please go back to the dashboard.</p>
          <button className="btn" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // Stages data for each plant
  const stagesData = {
    1: {
      '7 days': {
        image: '🌱',
        height: '12 cm',
        leaves: '4 leaves',
        status: 'Germinating',
        notes: 'Seed successfully germinated, showing first true leaves',
        humidity: '75%',
        temperature: '24°C',
        light: '8 hours/day'
      },
      '30 days': {
        image: '🌿',
        height: '22 cm',
        leaves: '8 leaves',
        status: 'Growing Strong',
        notes: 'Steady growth, new leaves appearing weekly',
        humidity: '70%',
        temperature: '23°C',
        light: '10 hours/day'
      },
      '3 months': {
        image: '🪴',
        height: '28 cm',
        leaves: '15 leaves',
        status: 'Mature',
        notes: 'Plant has reached mature size, fenestrations visible',
        humidity: '65%',
        temperature: '22°C',
        light: '12 hours/day'
      }
    },
    2: {
      '7 days': {
        image: '🌵',
        height: '35 cm',
        leaves: 'N/A',
        status: 'Stable',
        notes: 'Succulent showing steady growth',
        humidity: '40%',
        temperature: '25°C',
        light: '6 hours/day'
      },
      '30 days': {
        image: '🌵',
        height: '38 cm',
        leaves: 'N/A',
        status: 'Growing',
        notes: 'Noticeable height increase',
        humidity: '35%',
        temperature: '26°C',
        light: '6 hours/day'
      },
      '3 months': {
        image: '🌵',
        height: '42 cm',
        leaves: 'N/A',
        status: 'Healthy',
        notes: 'Reached optimal size for current pot',
        humidity: '30%',
        temperature: '26°C',
        light: '6 hours/day'
      }
    },
    3: {
      '7 days': {
        image: '🍃',
        height: '8 cm',
        leaves: '12 fronds',
        status: 'Establishing',
        notes: 'New fronds unfurling',
        humidity: '85%',
        temperature: '20°C',
        light: '4 hours/day'
      },
      '30 days': {
        image: '🍃',
        height: '12 cm',
        leaves: '18 fronds',
        status: 'Thriving',
        notes: 'Lush growth, requires frequent misting',
        humidity: '80%',
        temperature: '21°C',
        light: '5 hours/day'
      },
      '3 months': {
        image: '🍃',
        height: '15 cm',
        leaves: '25 fronds',
        status: 'Full',
        notes: 'Beautiful full fern, requires careful watering',
        humidity: '75%',
        temperature: '21°C',
        light: '5 hours/day'
      }
    }
  };
  
  const currentStage = stagesData[plant.id]?.[activeStage] || stagesData[plant.id]?.['7days'];
  
  return (
    <div className="plant-detail">
      <Header title={`${plant.name} - Growth Details`} />
      
      <div className="page-content">
        <button className="btn back-btn" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
        
        <div className="plant-overview">
          <div className="plant-header">
            <div className="plant-icon-large">
              <i className={plant.icon}></i>
            </div>
            <div className="plant-info-summary">
              <h1>{plant.name}</h1>
              <div className={`plant-status-large ${plant.status === 'healthy' ? 'status-healthy' : 
                plant.status === 'warning' ? 'status-warning' : 'status-critical'}`}>
                {plant.status === 'healthy' ? 'Healthy' : 
                 plant.status === 'warning' ? 'Needs Attention' : 'Critical'}
              </div>
              <p><strong>Planted:</strong> {plant.plantedDate}</p>
              <p><strong>Current Height:</strong> {plant.height}</p>
            </div>
          </div>
          
          {/* Stage Selector */}
          <div className="stage-selector">
            <h3>Growth Stages</h3>
            <div className="stage-buttons">
              <button 
                className={`stage-btn ${activeStage === '7days' ? 'active' : ''}`}
                onClick={() => setActiveStage('7days')}
              >
                <i className="fas fa-calendar-week"></i> 7 Days
              </button>
              <button 
                className={`stage-btn ${activeStage === '30days' ? 'active' : ''}`}
                onClick={() => setActiveStage('30days')}
              >
                <i className="fas fa-calendar-alt"></i> 30 Days
              </button>
              <button 
                className={`stage-btn ${activeStage === '3months' ? 'active' : ''}`}
                onClick={() => setActiveStage('3months')}
              >
                <i className="fas fa-calendar"></i> 3 Months
              </button>
            </div>
          </div>
          
          {/* Stage Details */}
          <div className="stage-details">
            <div className="stage-visual">
              <div className="plant-stage-image">
                <span style={{fontSize: '100px'}}>{stagesData.image}</span>
                
              </div>
              <h3>After {activeStage === '7days' ? '7 Days' : activeStage === '30days' ? '30 Days' : '3 Months'}</h3>
            </div>
            
            <div className="stage-info-grid">
              <div className="info-card">
                <h4>Growth Status</h4>
                <div className="info-value">{stagesData.status}</div>
              </div>
              <div className="info-card">
                <h4>Height</h4>
                <div className="info-value">{stagesData.height}</div>
              </div>
              <div className="info-card">
                <h4>Leaves/Fronds</h4>
                <div className="info-value">{stagesData.leaves}</div>
              </div>
              <div className="info-card">
                <h4>Humidity</h4>
                <div className="info-value">{stagesData.humidity}</div>
              </div>
              <div className="info-card">
                <h4>Temperature</h4>
                <div className="info-value">{stagesData.temperature}</div>
              </div>
              <div className="info-card">
                <h4>Light Exposure</h4>
                <div className="info-value">{stagesData.light}</div>
              </div>
            </div>
            
            <div className="stage-notes">
              <h4>Growth Notes</h4>
              <p>{stagesData.notes}</p>
            </div>
          </div>
          
          {/* Growth Timeline */}
          <div className="growth-timeline">
            <h3>Growth Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-date">Day 1</div>
                <div className="timeline-content">
                  <h4>Planted</h4>
                  <p>Initial planting in prepared soil</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">Day 3</div>
                <div className="timeline-content">
                  <h4>First Signs</h4>
                  <p>First signs of germination</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">Week 1</div>
                <div className="timeline-content">
                  <h4>Early Growth</h4>
                  <p>First true leaves visible</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">Month 1</div>
                <div className="timeline-content">
                  <h4>Rapid Growth</h4>
                  <p>Steady weekly growth observed</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">Month 3</div>
                <div className="timeline-content">
                  <h4>Maturity</h4>
                  <p>Reached mature size and characteristics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetailPage;