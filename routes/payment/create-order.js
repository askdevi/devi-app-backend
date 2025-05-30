const express = require('express');
const Razorpay = require('razorpay');

const router = express.Router();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
        "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required"
    );
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const TEST_MODE = process.env.NODE_ENV === 'development';

router.post('/', async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        if (TEST_MODE) {
            return res.json({
                orderId: `test_order_${Math.random().toString(36).substring(7)}`
            });
        }

        const order = await razorpay.orders.create({
            amount: amount * 100, // amount in paise
            currency: "INR",
            receipt: "receipt#_" + Math.random().toString(36).substring(7),
        });

        console.log("Order created:", order);

        res.json({ orderId: order.id });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Error creating order" });
    }
});

module.exports = router;
