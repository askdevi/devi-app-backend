const express = require('express');
const router = express.Router();
const { getDailyBlessings } = require('../../lib/getDailyBlessings');

router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const blessingsData = await getDailyBlessings(userId);

        // Remove userId before sending to client
        const { userId: _, ...blessingsWithoutUserId } = blessingsData;

        return res.json(blessingsWithoutUserId);
    } catch (error) {
        console.error('Daily Blessings API Error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        return res.status(500).json({
            error: 'Failed to retrieve daily blessings',
            details: error.message
        });
    }
});

module.exports = router;
