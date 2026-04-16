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

    const history = await AnalysisHistory
      .find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({ success: true, count: history.length, data: history });
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
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analysis' });
  }
});

module.exports = router;
