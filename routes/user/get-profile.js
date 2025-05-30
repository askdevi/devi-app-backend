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

        const docRef = db.doc(`users/${userId}`);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = docSnap.data();

        if (!userData) {
            return res.status(404).json({ error: 'User data not found' });
        }

        // Filter out sensitive/unwanted fields
        const filteredUserData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            birthDate: userData.birthDate,
            birthTime: userData.birthTime,
            gender: userData.gender,
            preferredLanguage: userData.preferredLanguage,
            relationshipStatus: userData.relationshipStatus,
            occupation: userData.occupation,
            birthPlace: userData.birthPlace,
            timeEnd: userData.timeEnd ? userData.timeEnd.toDate() : new Date()
        };

        res.json({
            message: 'Profile fetched successfully',
            user: filteredUserData
        });
    } catch (error) {
        console.error('Get Profile API error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
});

module.exports = router;
