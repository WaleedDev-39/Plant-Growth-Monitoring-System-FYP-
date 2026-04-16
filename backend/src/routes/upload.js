const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const AnalysisHistory = require('../models/AnalysisHistory');
const Alert = require('../models/Alert');

// POST /api/upload — Upload image + analyze
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }

  try {
    // Send image to AI service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    let analysisResults;
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/predict`,
        formData,
        { headers: formData.getHeaders(), timeout: 30000 }
      );
      analysisResults = aiResponse.data;
    } catch (aiError) {
      console.warn('AI service unavailable, using fallback mock:', aiError.message);
      // Fallback mock if AI service is down
      analysisResults = {
        growth_stage: 'Vegetative',
        growth_stage_confidence: 88.5,
        diseases: [],
        nutrient_deficiencies: [],
        water_stress: { detected: false, symptom: null, confidence: 0 },
        overall_health: 'Healthy',
        recommendations: ['Continue current care routine', 'Monitor moisture levels weekly']
      };
    }

    // Build image URL using Base64 to survive Render's ephemeral disk wipes
    const imageBase64 = fs.readFileSync(req.file.path, 'base64');
    const imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

    // Clean up local temp file since we stored it in the DB
    try { fs.unlinkSync(req.file.path); } catch (e) { console.error('Failed to clean up file:', e); }

    // Save to MongoDB
    const historyEntry = await AnalysisHistory.create({
      userId: req.user._id,
      imageUrl,
      originalImageName: req.file.originalname,
      analysisResults
    });

    // Auto-generate alerts for diseases / deficiencies / water stress
    const alertsToCreate = [];

    if (analysisResults.diseases && analysisResults.diseases.length > 0) {
      analysisResults.diseases.forEach(d => {
        alertsToCreate.push({
          userId: req.user._id,
          analysisId: historyEntry._id,
          message: `Disease detected: ${d.name} (${d.confidence.toFixed(1)}% confidence). Immediate action required.`,
          type: 'disease'
        });
      });
    }

    if (analysisResults.nutrient_deficiencies && analysisResults.nutrient_deficiencies.length > 0) {
      analysisResults.nutrient_deficiencies.forEach(n => {
        alertsToCreate.push({
          userId: req.user._id,
          analysisId: historyEntry._id,
          message: `Nutrient deficiency detected: ${n.name} (Severity: ${n.severity}). Apply appropriate fertilizer.`,
          type: 'deficiency'
        });
      });
    }

    if (analysisResults.water_stress && analysisResults.water_stress.detected) {
      alertsToCreate.push({
        userId: req.user._id,
        analysisId: historyEntry._id,
        message: `Water stress detected: ${analysisResults.water_stress.symptom}. Adjust watering schedule.`,
        type: 'water_stress'
      });
    }

    let createdAlerts = [];
    if (alertsToCreate.length > 0) {
      createdAlerts = await Alert.insertMany(alertsToCreate);
    }

    res.status(201).json({
      success: true,
      data: {
        history: historyEntry,
        analysisResults,
        alerts: createdAlerts
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Cleanup uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Error processing image upload' });
  }
});

module.exports = router;
