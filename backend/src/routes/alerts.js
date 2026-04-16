const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Alert = require('../models/Alert');

// GET /api/alerts/:userId — Get alerts for a user
router.get('/:userId', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const alerts = await Alert
      .find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-__v');

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ success: false, message: 'Error fetching alerts' });
  }
});

// PUT /api/alerts/:alertId/read — Mark alert as read
router.put('/:alertId/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    if (alert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    alert.isRead = true;
    await alert.save();

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating alert' });
  }
});

// PUT /api/alerts/mark-all-read/:userId
router.put('/mark-all-read/:userId', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Alert.updateMany({ userId: req.params.userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating alerts' });
  }
});

module.exports = router;
