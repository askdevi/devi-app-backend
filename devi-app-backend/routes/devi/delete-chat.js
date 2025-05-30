const express = require('express');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');
const router = express.Router();

router.delete('/delete-chat', async (req, res) => {
    try {
        const { userId, chatStartTime } = req.query;

        if (!userId || !chatStartTime) {
            return res.status(400).json({ error: 'userId and chatStartTime are required' });
        }

        const { db } = getFirebaseAdmin();

        const snapshot = await db
            .collection('chats')
            .where('userId', '==', userId)
            .where('chatStartTime', '==', chatStartTime)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'No chat found with given userId and chatStartTime' });
        }

        // Delete all matching documents (usually one)
        const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Delete Chat API error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete chat' });
    }
});

module.exports = router;
