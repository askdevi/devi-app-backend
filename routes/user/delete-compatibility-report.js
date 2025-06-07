const express = require('express');
const router = express.Router();
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

router.delete('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        const index = req.query.index;

        if (!userId || !index) {
            return res.status(400).json({ error: 'userId and index are required' });
        }

        const { db } = getFirebaseAdmin();

        const snapshot = await db.collection('compatibilityReports').doc(userId).get();
        if (!snapshot.exists) {
            return res.status(404).json({ error: 'Compatibility report not found' });
        }

        const reports = snapshot.data().compatibilityReports.filter((_, i) => i != index);

        await db.collection('compatibilityReports').doc(userId).update({
            compatibilityReports: reports
        });

        return res.status(200).json({ message: 'Compatibility report deleted successfully' });
    } catch (error) {
        console.error('Delete Compatibility Report API error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to initiate deletion',
        });
    }
});

module.exports = router;