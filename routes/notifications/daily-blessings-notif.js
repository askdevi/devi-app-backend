// src/routes/notifications.js
const express = require('express');
const moment = require('moment-timezone');
const messages_english = require('../../data/daily_blessings_english');
const messages_hindi = require('../../data/daily_blessings_hindi');
const { getUsersWithTokens } = require('../../lib/userService');
const { getMessaging } = require('firebase-admin/messaging');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // 1. Pick today's blessing
    const today = moment().tz('Asia/Kolkata').date();

    // 2. Fetch users + tokens
    const users = await getUsersWithTokens();
    if (!users.length) {
      return res.status(200).json({ message: 'No tokens registered.' });
    }

    const BATCH_SIZE = 300;  // FCM allows up to 500, keep some room
    let successCount = 0, failureCount = 0;

    const messaging = getMessaging();

    // 3. Chunk & send
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const chunk = users.slice(i, i + BATCH_SIZE);

      // Build per-recipient payloads & token array
      const tokens = chunk.map(u => u.token);
      const messages = chunk.map(u => ({
        token: u.token,
        // if u.preferredLanguage is hindi, use messages_hindi, else use messages_english
        notification: {
          title: u.preferredLanguage === 'hinglish' ? messages_hindi[today - 1].title.replace('{name}', u.firstName) : messages_english[today - 1].title.replace('{name}', u.firstName),
          body: u.preferredLanguage === 'hinglish' ? messages_hindi[today - 1].body : messages_english[today - 1].body,
        },
        android: { priority: 'high' },
        apns: { headers: { 'apns-priority': '10' } },
      }));

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

      // (Optionally) prune invalid tokens here by iterating over response.responses
      // and deleting from Firestore if response.responses[i].error.code === 'messaging/invalid-registration-token'
    }

    return res.json({ successCount, failureCount });
  } catch (err) {
    console.error('Error in daily_notifications:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;