const express = require('express');
const router = express.Router();
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

router.delete('/', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const { db } = getFirebaseAdmin();

        const snapshot = await db.collection('users').doc(userId).get();
        if (!snapshot.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        await db.collection('users').doc(userId).delete();

        await db.collection('userChats').where('userId', '==', userId).get().then(snapshot => {
            snapshot.docs.forEach(doc => doc.ref.delete());
        });

        await db.collection('dailyBlessings').where('userId', '==', userId).get().then(snapshot => {
            snapshot.docs.forEach(doc => doc.ref.delete());
        });

        await db.collection('relationships').where('userId', '==', userId).get().then(snapshot => {
            snapshot.docs.forEach(doc => doc.ref.delete());
        });

        await db.collection('compatibilityReports').where('userId', '==', userId).get().then(snapshot => {
            snapshot.docs.forEach(doc => doc.ref.delete());
        });

        return res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User API error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to initiate deletion',
        });
    }
});

module.exports = router;
