const express = require('express');
const Razorpay = require('razorpay');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

const router = express.Router();

const TEST_MODE = process.env.NODE_ENV === 'development';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('❌ Missing Razorpay API keys in environment variables');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/', async (req, res) => {
    try {
        console.log('🔄 Starting payment verification process...');
        const {
            razorpay_payment_id,
            userId,
            timeDuration,
            amountPaid,
        } = req.body;

        console.log(`📝 Received payment details:
      - Payment ID: ${razorpay_payment_id}
      - User ID: ${userId}
      - Time Duration: ${timeDuration}
      - Amount: ${amountPaid}`);

        if (
            !razorpay_payment_id ||
            !userId ||
            !amountPaid ||
            !timeDuration
        ) {
            console.error('❌ Missing required fields in request body');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log(`💰 Verifying payment: ${razorpay_payment_id} for user ${userId}`);

        // In test mode, skip Razorpay verification
        if (!TEST_MODE) {
            try {
                console.log('🔍 Fetching payment details from Razorpay...');
                const payment = await razorpay.payments.fetch(razorpay_payment_id);
                console.log(`📊 Razorpay payment status: ${payment?.status}`);

                if (!payment || payment.status !== 'captured') {
                    console.error('❌ Payment verification failed at Razorpay.');
                    return res.status(400).json({ error: 'Payment verification failed' });
                }
            } catch (err) {
                console.error('❌ Error fetching payment from Razorpay:', err);
                return res.status(500).json({ error: 'Error verifying payment' });
            }
            console.log('✅ Payment verified successfully!');
        } else {
            console.log('🧪 Test mode: Skipping Razorpay verification');
        }

        const { db } = getFirebaseAdmin();

        console.log('🔍 Checking for duplicate payment...');
        const paymentRef = db.collection('paymentCollection').doc(razorpay_payment_id);
        const paymentSnap = await paymentRef.get();

        if (paymentSnap.exists) {
            console.warn('⚠️ Duplicate payment detected, skipping time package update.');
            return res.json({ success: true, message: 'Payment already processed' });
        }
        console.log('✅ No duplicate payment found');

        console.log(`🔍 Fetching user details for ID: ${userId}...`);
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            console.error('❌ User not found in database');
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('✅ User details fetched successfully');

        const userData = userSnap.data();

        if (!userData) {
            console.error('❌ User data is empty');
            return res.status(404).json({ error: 'User data is empty' });
        }

        // Handle time-based purchase
        // if (timeDuration) {
        console.log(`⏰ Processing time-based purchase for duration: ${timeDuration}`);
        const now = new Date();
        const currentEndTime = userData?.timeEnd?.toDate
            ? userData.timeEnd.toDate()
            : userData.timeEnd || now;
        const startTime = currentEndTime > now ? currentEndTime : now;

        let durationInHours = 0;
        switch (timeDuration) {
            case '10 Minutes':
                durationInHours = 0.16666666666666667;
                break;
            case '1 Hour':
                durationInHours = 1;
                break;
            case '1 Day':
                durationInHours = 24;
                break;
            case '1 Week':
                durationInHours = 168;
                break;
            default:
                durationInHours = 0;
        }

        const endTime = new Date(startTime.getTime() + durationInHours * 60 * 60 * 1000);
        console.log(`📅 Updating user time package:
        - Start Time: ${startTime}
        - End Time: ${endTime}`);

        await userRef.update({
            timeStart: startTime,
            timeEnd: endTime,
        });

        console.log('✅ Time package updated successfully');
        // }

        // Log the transaction
        console.log('📝 Logging transaction details...');
        await paymentRef.set({
            userId,
            firstName: userData?.firstName || 'N/A',
            lastName: userData?.lastName || 'N/A',
            phoneNumber: userData?.phoneNumber || 'N/A',
            razorpayPaymentId: razorpay_payment_id,
            amountPaid,
            timeDuration: timeDuration || null,
            timestamp: new Date(),
        });
        console.log('✅ Transaction logged successfully');

        console.log('🎉 Payment verification process completed successfully');
        res.json({ success: true, message: 'Payment verified successfully', timeEnd: endTime });
    } catch (error) {
        console.error('❌ Error processing payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
