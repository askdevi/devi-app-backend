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

        const collection = db.collection('userChats');
        // doc_id are of format userId+date, date is %Y-%m-%d
        // get doc_ids of today, yesterday, and 2 days ago
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
        const twoDaysAgo = new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0];
        const doc_ids = [userId + twoDaysAgo, userId + yesterday, userId + today];

        const chats = [];

        for (const doc_id of doc_ids) {
            const snapshot = await collection.doc(doc_id).get();
            if (snapshot.exists) {
                const data = snapshot.data();
                for (const message of data.messages) {
                    chats.push(message);
                }
            }
        }

        res.json(chats);
    } catch (error) {
        console.error('Chat History API error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch chat history' });
    }
});

module.exports = router;
