require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Plant Monitoring Backend running at http://localhost:${PORT}`);
  console.log(`📡 AI Service URL: ${process.env.AI_SERVICE_URL}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || 'development'}`);
});
