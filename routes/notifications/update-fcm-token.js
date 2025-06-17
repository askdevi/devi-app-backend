const express = require('express');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {
            userId,
            fcmToken
        } = req.body;

        // Basic validation
        if (!userId || !fcmToken) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Initialize Firebase Admin
        const { db } = getFirebaseAdmin();

        await db.doc(`users/${userId}`).update({ fcmToken });

        res.json({ message: 'FCM token updated successfully' });
    } catch (error) {
        console.error('Update FCM token error:', error);
        res.status(500).json({ error: error.message || 'Failed to update FCM token' });
    }
});

module.exports = router;
