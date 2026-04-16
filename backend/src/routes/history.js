const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AnalysisHistory = require('../models/AnalysisHistory');

// GET /api/history/:userId — Get all analysis history for a user
router.get('/:userId', protect, async (req, res) => {
  try {
    // Ensure user can only access their own history
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this history' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const historyWithAbsoluteUrls = history.map(item => {
      const obj = item.toObject();
      if (obj.imageUrl && !obj.imageUrl.startsWith('http')) {
        obj.imageUrl = `${baseUrl}${obj.imageUrl}`;
      }
      return obj;
    });

    res.json({ success: true, count: history.length, data: historyWithAbsoluteUrls });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analysis history' });
  }
});

// GET /api/history/item/:id — Get single analysis
router.get('/item/:id', protect, async (req, res) => {
  try {
    const item = await AnalysisHistory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const obj = item.toObject();
    if (obj.imageUrl && !obj.imageUrl.startsWith('http')) {
      obj.imageUrl = `${baseUrl}${obj.imageUrl}`;
    }
    res.json({ success: true, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analysis' });
  }
});

module.exports = router;
