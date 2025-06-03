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

        const snapshot = await db
            .collection('userChats')
            .where('userId', '==', userId)
            .get();

        const chats = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    //remove userId from doc.id
                    date: doc.id.replace(userId, ''),
                    messages: data.messages || []
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ chats });
    } catch (error) {
        console.error('Chat History API error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch chat history' });
    }
});

module.exports = router;
