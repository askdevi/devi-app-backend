const express = require('express');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');
const router = express.Router();

router.get('/chat-history', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const { db } = getFirebaseAdmin();

        const snapshot = await db
            .collection('chats')
            .where('userId', '==', userId)
            .get();

        const chats = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    createdAt: data.createdAt,
                    lastUpdated: data.updatedAt,
                    chatStartTime: data.chatStartTime,
                    messages: data.messages || []
                };
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json({ chats });
    } catch (error) {
        console.error('Chat History API error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch chat history' });
    }
});

module.exports = router;
