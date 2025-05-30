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

        // Background deletion
        (async () => {
            const snapshot = await db
                .collection('users')
                .where('userId', '==', userId)
                .get();

            if (snapshot.empty) return;

            const deletePromises = snapshot.docs.map(async (doc) => {
                const userDocRef = doc.ref;

                // Delete user doc
                await userDocRef.delete();

                // Delete associated chats
                const chatsSnapshot = await db
                    .collection('chats')
                    .where('userId', '==', userId)
                    .get();
                await Promise.all(chatsSnapshot.docs.map(chatDoc => chatDoc.ref.delete()));

                // Delete dailyBlessings
                const blessingsSnapshot = await db
                    .collection('dailyBlessings')
                    .where('userId', '==', userId)
                    .get();
                await Promise.all(blessingsSnapshot.docs.map(b => b.ref.delete()));

                // Delete relationships
                const relationshipsSnapshot = await db
                    .collection('relationships')
                    .where('userId', '==', userId)
                    .get();
                await Promise.all(relationshipsSnapshot.docs.map(r => r.ref.delete()));
            });

            await Promise.all(deletePromises);
        })();

        // Return response immediately
        return res.json({ message: 'Deletion initiated in background' });
    } catch (error) {
        console.error('Delete User API error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to initiate deletion',
        });
    }
});

module.exports = router;
