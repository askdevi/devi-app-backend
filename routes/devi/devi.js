const express = require('express');
const { getAstrologicalReading } = require('../../lib/gpt');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');
const { firestore } = require('firebase-admin');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { prompts, userId } = req.body;

        if (!prompts || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const prompt = prompts.map(p => p.content).join('\n');

        const assistant_timestamp = Date.now().toString();

        const { db } = getFirebaseAdmin();

        const userDoc = db.collection('users').doc(userId);
        const chatsRef = db.collection('userChats');

        const querySnapshot = await chatsRef.where('userId', '==', userId).get();

        const messages = [];

        querySnapshot.forEach(doc => {
            messages.push(...doc.data().messages);
        });

        const gptResponse = await getAstrologicalReading(prompt, messages, userId);

        const userData = await userDoc.get();
        const startedFreeMinutes = userData.data().startedFreeMinutes || 0;
        if (startedFreeMinutes == 0) {
            await userDoc.update({
                welcomeMessageCount: 0,
                startedFreeMinutes: 1,
                timeEnd: new Date(Date.now() + 3 * 60 * 1000)
            });
        }
        else {
            await userDoc.update({
                welcomeMessageCount: 0,
            });
        }

        const messages_to_be_added = []

        // add the prompts
        prompts.forEach(p => {
            messages_to_be_added.push({
                id: p.id,
                role: 'user',
                content: p.content,
            });
        });

        // add the gpt response
        gptResponse.parts.forEach(p => {
            messages_to_be_added.push({
                id: assistant_timestamp,
                role: 'assistant',
                content: p,
            });
        });

        const today_date = new Date().toISOString().split('T')[0];
        const doc_id = userId + today_date;
        const user_ref = chatsRef.doc(doc_id);

        //past day doc_id = userId + yesterday's date in format YYYY-MM-DD
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
        const yesterday_date = yesterday.toISOString().split('T')[0];
        const user_ref_past_day = chatsRef.doc(userId + yesterday_date);

        const user_ref_data = await user_ref.get();
        const user_ref_past_day_data = await user_ref_past_day.get();

        const batch = db.batch();

        if (user_ref_data.exists) {
            const user_ref_data_dict = user_ref_data.data();
            const msg_list = user_ref_data_dict.messages;
            const to_remove = [];
            const messageExists = msg_list.some(msg => msg.id === messages_to_be_added[0].id);
            if (messageExists) {
                for (const message of msg_list) {
                    if (message["role"] == "assistant" && message["id"] >= messages_to_be_added[0]["id"]) {
                        to_remove.push(message)
                    }
                }
                for (const message of to_remove) {
                    batch.update(user_ref, {
                        messages: firestore.FieldValue.arrayRemove(message)
                    });
                }
            }
            for (const message of messages_to_be_added) {
                batch.update(user_ref, {
                    messages: firestore.FieldValue.arrayUnion(message)
                });
            }
        }
        else {
            if (user_ref_past_day_data.exists) {
                const user_ref_past_day_data_dict = user_ref_past_day_data.data();
                const msg_list = user_ref_past_day_data_dict.messages;
                const to_remove = [];
                // Check if the first message to be added already exists by comparing IDs
                const pastMessageExists = msg_list.some(msg => msg.id === messages_to_be_added[0].id);
                if (pastMessageExists) {
                    for (const message of msg_list) {
                        if (message["id"] >= messages_to_be_added[0]["id"]) {
                            to_remove.push(message)
                        }
                    }
                    for (const message of to_remove) {
                        batch.update(user_ref_past_day, {
                            messages: firestore.FieldValue.arrayRemove(message)
                        });
                    }
                }
            }
            batch.set(user_ref, {
                userId,
                messages: messages_to_be_added,
                date: new Date().toISOString().split('T')[0]
            });
        }

        await batch.commit();

        res.json({
            response: gptResponse.parts,
            id: assistant_timestamp
        });
    } catch (error) {
        console.error('Devi API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
