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

        console.log(birthDate, birthTime, birthPlace);

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

        const days = [];
        const hours = [];
        while (days.length < 3) {
            const day = Math.floor(Math.random() * 7);
            if (!days.includes(day)) {
                days.push(day);
                hours.push(Math.floor(Math.random() * 4) + 19);
            }
        }
        days.sort((a, b) => a - b);
        const schedule = {
            days: days,
            hours: hours,
        };
        await db.collection('freeChatSchedule').doc(userId).set(schedule);

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Register API error:', error);
        res.status(500).json({ error: error.message || 'Failed to register user' });
    }
});

module.exports = router;
