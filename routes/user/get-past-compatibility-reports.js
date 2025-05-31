const express = require('express');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const { db } = getFirebaseAdmin();

        const collectionRef = db.collection('compatibilityReports');
        const compatibilityReportRef = collectionRef.doc(userId);
        const compatibilityReportDoc = await compatibilityReportRef.get();

        if (!compatibilityReportDoc.exists) {
            return res.status(200).json([]);
        }

        const compatibilityReport = compatibilityReportDoc.data().compatibilityReports;

        return res.status(200).json(compatibilityReport);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
