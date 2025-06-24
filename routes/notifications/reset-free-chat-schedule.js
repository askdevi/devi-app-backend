const express = require('express');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { db } = getFirebaseAdmin();
        const snapshot = await db.collection('users').get();

        let batch = db.batch();
        let writeCount = 0;
        const batchSize = 450;

        for (const doc of snapshot.docs) {
            const days = [];
            const hours = [];
            while (days.length < 3) {
                const day = Math.floor(Math.random() * 7);
                if (!days.includes(day)) {
                    days.push(day);
                    hours.push(Math.floor(Math.random() * 4) + 19);
                }
            }
            days.sort((a, b) => a - b);
            const schedule = {
                days: days,
                hours: hours,
            };
            batch.set(db.collection('freeChatSchedule').doc(doc.id), schedule);
            writeCount++;

            // --- 4) commit each 450–500 writes to avoid Firebase limits:
            if (writeCount % batchSize === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }

        // commit any remaining:
        if (writeCount % batchSize !== 0) {
            await batch.commit();
        }

        res.status(200).json({ message: 'Free chat schedule reset successfully', total: writeCount });
    } catch (error) {
        console.error('Reset Free Chat Schedule API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;