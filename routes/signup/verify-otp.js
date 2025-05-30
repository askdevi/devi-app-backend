const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;

router.get('/', async (req, res) => {
    try {
        const phoneNumber = req.query.phoneNumber;
        const otp = req.query.otp;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ error: 'Phone number and OTP are required' });
        }

        // Verify OTP using MSG91
        const otpResponse = await axios.get('https://control.msg91.com/api/v5/otp/verify', {
            params: { otp, mobile: phoneNumber },
            headers: {
                authkey: MSG91_AUTH_KEY || ''
            }
        });

        const otpData = otpResponse.data;
        if (otpData.type !== 'success') {
            throw new Error(otpData.message || 'Invalid OTP');
        }

        // Firebase Admin
        const { auth, db } = getFirebaseAdmin();
        const phoneNumberWithPlus = `+${phoneNumber}`;
        let userRecord;
        let exists = true;

        try {
            userRecord = await auth.getUserByPhoneNumber(phoneNumberWithPlus);
        } catch (err) {
            // User not found, create one
            userRecord = await auth.createUser({
                phoneNumber: phoneNumberWithPlus,
                displayName: `User ${phoneNumber}`
            });
        }

        // Check if user exists in `users` Firestore collection
        const usersRef = db.collection('users');
        const userSnapshot = await usersRef.where('userId', '==', userRecord.uid).get();

        if (userSnapshot.empty) {
            exists = false;
        }

        // Create Firebase custom token
        const customToken = await auth.createCustomToken(userRecord.uid);

        return res.json({
            message: 'OTP verified successfully',
            userId: userRecord.uid,
            // customToken, // Uncomment if needed on client
            exists
        });
    } catch (error) {
        console.error('OTP Verification Error:', error.message);
        return res.status(500).json({ error: error.message || 'Failed to verify OTP' });
    }
});

module.exports = router;
