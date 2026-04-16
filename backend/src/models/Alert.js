const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['disease', 'deficiency', 'water_stress'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnalysisHistory'
  }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
