const express = require('express');
const messages_english = require('../../data/free_chat_english');
const messages_hindi = require('../../data/free_chat_hindi');
const { getUsersWithNoFreeTime } = require('../../lib/userService');
const { getMessaging } = require('firebase-admin/messaging');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const users = await getUsersWithNoFreeTime();
        if (!users.length) {
            return res.status(200).json({ message: 'No tokens registered.' });
        }

        const BATCH_SIZE = 300;
        let successCount = 0, failureCount = 0;

        const messaging = getMessaging();

        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const chunk = users.slice(i, i + BATCH_SIZE);

            const messages = [];
            for (const user of chunk) {
                const index = Math.floor(Math.random() * messages_english.length);
                messages.push({
                    token: user.token,
                    notification: {
                        title: user.preferredLanguage === 'hinglish' ? messages_hindi[index].title : messages_english[index].title,
                        body: user.preferredLanguage === 'hinglish' ? messages_hindi[index].body : messages_english[index].body,
                    },
                    android: { priority: 'high' },
                    apns: { headers: { 'apns-priority': '10' } },
                });
            }

            // Send messages in parallel using Promise.all
            const sendPromises = messages.map(message =>
                messaging.send(message)
                    .then(() => ({ success: true }))
                    .catch(error => {
                        console.error('Error sending message:', error);
                        return { success: false };
                    })
            );

            const results = await Promise.all(sendPromises);
            const batchSuccessCount = results.filter(r => r.success).length;
            const batchFailureCount = results.length - batchSuccessCount;

            successCount += batchSuccessCount;
            failureCount += batchFailureCount;
        }

        return res.json({ successCount, failureCount });
    } catch (err) {
        console.error('Error in free_chat_notif:', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;