const express = require('express');
const router = express.Router();
const { getDailyBlessings } = require('../../lib/getDailyBlessings');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

router.get('/daily-blessings', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const { db } = getFirebaseAdmin();
        const blessingsRef = db.collection('dailyBlessings');

        const blessingsSnapshot = await blessingsRef
            .where('userId', '==', userId)
            .get();

        let blessingsData;

        if (blessingsSnapshot.empty) {
            // If no blessings exist, generate and store
            blessingsData = await getDailyBlessings(userId);
            await blessingsRef.add({ ...blessingsData });
        } else {
            const doc = blessingsSnapshot.docs[0];
            const data = doc.data();
            const today = new Date().toDateString();

            if (data.date === today) {
                blessingsData = data;
            } else {
                // If blessings are outdated, generate and update
                blessingsData = await getDailyBlessings(userId);
                await blessingsRef.doc(doc.id).update({ ...blessingsData });
            }
        }

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
