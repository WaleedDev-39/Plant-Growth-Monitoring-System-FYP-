export const statsData = {
  totalPlants: 24,
  healthyPlants: 18,
  avgGrowthRate: 2.4,
  waterLevel: 78,
  newPlants: 3
};

export const growthData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  values: [12, 15, 18, 22, 25, 28]
};

export const healthData = {
  healthy: 18,
  attention: 4,
  critical: 2
};

export const plantsData = [
  {
    id: 1,
    name: 'Monstera Deliciosa',
    icon: 'fas fa-leaf',
    status: 'healthy',
    plantedDate: '15 Mar 2023',
    height: '28 cm',
    humidity: 65,
    temperature: 22,
    type: 'Tropical',
    light: 'Medium to Bright',
    water: 'Weekly'
  },
  {
    id: 2,
    name: 'Snake Plant',
    icon: 'fas fa-spa',
    status: 'healthy',
    plantedDate: '22 Feb 2023',
    height: '42 cm',
    humidity: 58,
    temperature: 24,
    type: 'Succulent',
    light: 'Low to Bright',
    water: 'Every 2-3 weeks'
  },
  {
    id: 3,
    name: 'Fern',
    icon: 'fas fa-feather-alt',
    status: 'warning',
    plantedDate: '10 Apr 2023',
    height: '15 cm',
    humidity: 42,
    temperature: 21,
    type: 'Fern',
    light: 'Low to Medium',
    water: 'Every 5-7 days'
  },
  {
    id: 4,
    name: 'Succulent',
    icon: 'fas fa-tree',
    status: 'healthy',
    plantedDate: '05 Mar 2023',
    height: '12 cm',
    humidity: 35,
    temperature: 25,
    type: 'Succulent',
    light: 'Bright',
    water: 'Every 3 weeks'
  },
  {
    id: 5,
    name: 'Orchid',
    icon: 'fas fa-feather',
    status: 'critical',
    plantedDate: '18 Jan 2023',
    height: '35 cm',
    humidity: 70,
    temperature: 20,
    type: 'Orchid',
    light: 'Bright indirect',
    water: 'Weekly'
  },
  {
    id: 6,
    name: 'Cactus',
    icon: 'fas fa-mountain',
    status: 'healthy',
    plantedDate: '30 Nov 2022',
    height: '18 cm',
    humidity: 30,
    temperature: 26,
    type: 'Cactus',
    light: 'Direct',
    water: 'Monthly'
  }
];