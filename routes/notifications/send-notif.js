const express = require('express');
const { getUsersWithTokens } = require('../../lib/userService');
const { getMessaging } = require('firebase-admin/messaging');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const users = await getUsersWithTokens();
    if (!users.length) {
      return res.status(200).json({ message: 'No tokens registered.' });
    }

    const BATCH_SIZE = 300;  // FCM allows up to 500, keep some room
    let successCount = 0, failureCount = 0;

    const messaging = getMessaging();

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const chunk = users.slice(i, i + BATCH_SIZE);

      const messages = [];
      for (const user of chunk) {
        messages.push({
          token: user.token,
          notification: {
            title: "🔔 Update Available on Play Store!",
            body: "A new version of the app is here with improvements and bug fixes. Update now on the Play Store! 🚀",
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