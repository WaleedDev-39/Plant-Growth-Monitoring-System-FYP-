const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  originalImageName: {
    type: String,
    required: true
  },
  analysisResults: {
    growth_stage: String,
    growth_stage_confidence: Number,
    diseases: [{ name: String, confidence: Number }],
    nutrient_deficiencies: [{ name: String, severity: String }],
    water_stress: {
      detected: Boolean,
      symptom: String,
      confidence: Number
    },
    overall_health: String,
    recommendations: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('AnalysisHistory', analysisHistorySchema);
