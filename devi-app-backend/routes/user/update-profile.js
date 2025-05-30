const express = require('express');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

const router = express.Router();

router.post('/update-profile', async (req, res) => {
    try {
        const {
            userId,
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

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const updateData = {};
        const { db } = getFirebaseAdmin();
        const { FieldValue } = require('firebase-admin').firestore;

        // Collect only provided fields
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (birthDate !== undefined) updateData.birthDate = birthDate;
        if (birthTime !== undefined) updateData.birthTime = birthTime;
        if (birthPlace && birthPlace.latitude !== undefined && birthPlace.longitude !== undefined) {
            updateData.birthPlace = birthPlace;
        }
        if (gender !== undefined) updateData.gender = gender;
        if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;
        if (relationshipStatus !== undefined) updateData.relationshipStatus = relationshipStatus;
        if (occupation !== undefined) updateData.occupation = occupation;

        updateData.updatedAt = FieldValue.serverTimestamp();

        // Update Firestore
        await db.doc(`users/${userId}`).update(updateData);

        res.json({
            message: 'Profile updated successfully',
            status: 200
        });
    } catch (error) {
        console.error('Update Profile API error:', error);
        res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
});

module.exports = router;
