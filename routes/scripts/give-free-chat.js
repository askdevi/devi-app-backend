const express = require('express');
const router = express.Router();
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

router.post('/', async (req, res) => {
    try {
        const { db } = getFirebaseAdmin();
        const users = await db.collection('users').get();
        // for all users if they have startedFreeMinutes, do nothing but if they don't have startedFreeMinutes, add startedFreeMinutes and set it to 0
        users.forEach(async (user) => {
            const userData = user.data();
            if (!userData.startedFreeMinutes) {
                await db.collection('users').doc(user.id).update({
                    startedFreeMinutes: 0
                });
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Script ran successfully'
        });
    } catch (err) {
        console.error('Error running script:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'Failed to run script'
        });
    }
});

module.exports = router;
