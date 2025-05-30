const express = require('express');
const { getAstrologicalReading } = require('../../lib/gpt');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const router = express.Router();

router.post('/devi', async (req, res) => {
    try {
        const { prompt, messages, userId, chatStartTime } = req.body;

        if (!prompt || !messages || !userId || !chatStartTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const chatStartTimeDate = new Date(Number(chatStartTime)).toISOString();

        const { db } = getFirebaseAdmin();

        const chatsRef = db.collection('chats');

        let query = chatsRef.where('userId', '==', userId).where('chatStartTime', '==', chatStartTime);

        const querySnapshot = await query.get();

        let chatDocRef;

        if (querySnapshot.empty) {
            chatDocRef = chatsRef.doc();
            await chatDocRef.set({
                userId,
                messages,
                chatStartTime,
                createdAt: chatStartTimeDate,
                lastUpdated: chatStartTimeDate,
                isActive: true,
                endReason: 'auto',
                saveCount: 0,
            });
        } else {
            chatDocRef = querySnapshot.docs[0].ref;
        }

        const gptResponse = await getAstrologicalReading(prompt, messages, userId);

        // Join parts array to make the answer string
        const answer = gptResponse.parts.join('\n');

        // Update the chat document with new user and assistant messages
        await chatDocRef.update({
            messages: FieldValue.arrayUnion(
                {
                    role: 'user',
                    content: prompt,
                    id: Date.now().toString(),
                },
                {
                    role: 'assistant',
                    content: answer,
                    id: Date.now().toString(),
                }
            ),
            lastUpdated: new Date().toISOString(),
            saveCount: FieldValue.increment(1),
        });

        res.json({
            splitResponse: gptResponse.splitResponse,
            parts: gptResponse.parts,
        });
    } catch (error) {
        console.error('Devi API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
