const express = require('express');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');
const { getBirthChart } = require('../../lib/astrology/birthchart');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {
            userId,
            phoneNumber,
            firstName,
            lastName,
            birthDate,
            birthTime,
            birthPlace,
            gender,
            preferredLanguage,
            relationshipStatus,
            occupation
        } = req.body;

        // Basic validation
        if (
            !userId ||
            !phoneNumber ||
            !firstName ||
            !lastName ||
            !birthDate ||
            !birthTime ||
            !birthPlace ||
            !birthPlace.latitude ||
            !birthPlace.longitude ||
            !birthPlace.name
        ) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate birth chart
        const birthChartDetails = await getBirthChart({
            date: birthDate,
            time: birthTime,
            location: {
                latitude: birthPlace.latitude,
                longitude: birthPlace.longitude
            }
        });

        // Initialize Firebase Admin
        const { db } = getFirebaseAdmin();
        const { FieldValue } = require('firebase-admin').firestore;

        // Prepare user data
        const userData = {
            userId,
            phoneNumber,
            firstName,
            lastName,
            birthDate,
            birthTime,
            birthPlace,
            gender: gender || null,
            preferredLanguage: preferredLanguage || null,
            relationshipStatus: relationshipStatus || null,
            occupation: occupation || null,
            birthChart: birthChartDetails,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            startedFreeMinutes: 0
        };

        // Write to Firestore
        await db.doc(`users/${userId}`).set(userData);

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Register API error:', error);
        res.status(500).json({ error: error.message || 'Failed to register user' });
    }
});

module.exports = router;
