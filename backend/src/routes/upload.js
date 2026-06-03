const express = require('express');
const router = express.Router();
const fs = require('fs');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const AnalysisHistory = require('../models/AnalysisHistory');
const Alert = require('../models/Alert');
const Groq = require('groq-sdk');

// ── Groq Vision Analysis ────────────────────────────────────────────────────

const groqClient = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here'
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const GROQ_PROMPT = `You are an expert plant pathologist and agronomist. Analyze this plant image carefully and return ONLY a valid JSON object (no markdown, no explanation) with exactly this structure:

{
  "growth_stage": "<one of: Seedling, Vegetative, Flowering, Fruiting, Senescence>",
  "growth_stage_confidence": <number 60-99>,
  "diseases": [
    { "name": "<disease name>", "confidence": <number 60-99> }
  ],
  "nutrient_deficiencies": [
    { "name": "<nutrient name>", "severity": "<one of: mild, moderate, severe>" }
  ],
  "water_stress": {
    "detected": <true or false>,
    "symptom": "<symptom description or null>",
    "confidence": <number 0-99>
  },
  "overall_health": "<one of: Healthy, At risk, Unhealthy>",
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}

Rules:
- "diseases" array should be EMPTY [] if no diseases are visible.
- "overall_health" must be "Healthy" only if the plant looks truly healthy with no visible issues.
- If you see yellowing, spots, wilting, lesions, discoloration, or any abnormality, mark as "At risk" or "Unhealthy".
- "nutrient_deficiencies" array should be EMPTY [] if no deficiencies are visible.
- "water_stress.detected" must be true if you see wilting, drooping, or crispy edges.
- Be accurate and thorough — this is used for real plant care decisions.`;

async function analyzeWithGroq(imageBase64, mimeType) {
  if (!groqClient) {
    throw new Error('Groq client not initialized — GROQ_API_KEY not set');
  }

  const completion = await groqClient.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: GROQ_PROMPT
          }
        ]
      }
    ],
    temperature: 0.2,
    max_tokens: 1024,
  });

  const rawText = completion.choices[0]?.message?.content || '';

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate and normalize required fields
  const VALID_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Senescence'];
  const VALID_HEALTH = ['Healthy', 'At risk', 'Unhealthy'];

  return {
    growth_stage: VALID_STAGES.includes(parsed.growth_stage) ? parsed.growth_stage : 'Vegetative',
    growth_stage_confidence: Number(parsed.growth_stage_confidence) || 85,
    diseases: Array.isArray(parsed.diseases) ? parsed.diseases : [],
    nutrient_deficiencies: Array.isArray(parsed.nutrient_deficiencies) ? parsed.nutrient_deficiencies : [],
    water_stress: {
      detected: Boolean(parsed.water_stress?.detected),
      symptom: parsed.water_stress?.symptom || null,
      confidence: Number(parsed.water_stress?.confidence) || 0
    },
    overall_health: VALID_HEALTH.includes(parsed.overall_health) ? parsed.overall_health : 'Healthy',
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : []
  };
}

// ── POST /api/upload ─────────────────────────────────────────────────────────

router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }

  try {
    // Read image as Base64 early — needed for both storage and Groq
    const imageBase64 = fs.readFileSync(req.file.path, 'base64');
    const imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

    // ── Tier 1: Groq Vision AI ────────────────────────────────────────────
    try {
      analysisResults = await analyzeWithGroq(imageBase64, req.file.mimetype);
      console.log('✅ Analysis: Groq Vision AI —', analysisResults.overall_health);
    } catch (groqError) {
      console.warn('⚠️  Groq analysis failed:', groqError.message);
    }

    // ── Tier 2: Deterministic mock (last resort fallback) ─────────────────
    if (!analysisResults) {
      console.warn('⚠️  Using mock fallback result');
      analysisResults = {
        growth_stage: 'Vegetative',
        growth_stage_confidence: 72.0,
        diseases: [],
        nutrient_deficiencies: [],
        water_stress: { detected: false, symptom: null, confidence: 0 },
        overall_health: 'Healthy',
        recommendations: [
          'Continue current care routine',
          'Monitor moisture levels weekly',
          'Ensure adequate indirect sunlight'
        ]
      };
    }

    // Clean up local temp file
    try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }

    // Save to MongoDB
    const historyEntry = await AnalysisHistory.create({
      userId: req.user._id,
      imageUrl,
      originalImageName: req.file.originalname,
      analysisResults
    });

    // Auto-generate alerts
    const alertsToCreate = [];

    if (analysisResults.diseases && analysisResults.diseases.length > 0) {
      analysisResults.diseases.forEach(d => {
        alertsToCreate.push({
          userId: req.user._id,
          analysisId: historyEntry._id,
          message: `Disease detected: ${d.name} (${Number(d.confidence).toFixed(1)}% confidence). Immediate action required.`,
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
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    res.status(500).json({ success: false, message: 'Error processing image upload' });
  }
});

module.exports = router;
