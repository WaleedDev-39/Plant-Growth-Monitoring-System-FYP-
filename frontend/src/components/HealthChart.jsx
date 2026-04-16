import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const HealthChart = ({ healthData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  const data = {
    labels: ['Healthy', 'Needs Attention', 'Critical'],
    datasets: [
      {
        data: [healthData.healthy, healthData.attention, healthData.critical],
        backgroundColor: [
          '#4caf50',
          '#ff9800',
          '#f44336'
        ],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Plant Health Distribution</h3>
      </div>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default HealthChart;