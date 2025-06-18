const express = require('express');
const axios = require('axios');
const router = express.Router();

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;

router.post('/', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        if(phoneNumber ==='910000000000'){
            return res.json({
                success: true,
                message: 'OTP sent successfully',
                requestId: '910000000000'
            });
        }

        const options = {
            method: 'POST',
            url: 'https://control.msg91.com/api/v5/otp',
            params: {
                template_id: '684aacd4d6fc05492b412d73',
                mobile: phoneNumber,
                authkey: MSG91_AUTH_KEY || '',
                otp_expiry: '60' // OTP expires in 60 minutes
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.request(options);

        if (response.data.type === 'success') {
            return res.json({
                success: true,
                message: 'OTP sent successfully',
                requestId: response.data.request_id
            });
        } else {
            throw new Error(response.data.message || 'Failed to send OTP');
        }

    } catch (error) {
        console.error('Error sending OTP:', error.message);
        return res.status(500).json({
            error: error.message || 'Failed to send OTP'
        });
    }
});

module.exports = router;
