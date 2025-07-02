const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const dotenv = require('dotenv');

const cron = require('node-cron');
const moment = require('moment-timezone');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use(requestLogger);

cron.schedule('30 9 * * *', async () => {
  const now = moment().tz('Asia/Kolkata');
  console.log(`💡 Running daily job at (IST): ${now.format()}`);

  try {
    const resp = await fetch(`https://devi-app.onrender.com/api/daily-blessings-notif`, {
      method: 'POST',
    });
    console.log('Job response:', await resp.text());
  } catch (err) {
    console.error('Error in daily job:', err);
  }
}, {
  timezone: 'Asia/Kolkata',
});

// schedule reset-free-chat-schedule job to run every sunday at 12:00 AM
cron.schedule('0 0 * * 0', async () => {
  console.log('Running reset-free-chat-schedule job at (IST):', moment().tz('Asia/Kolkata').format());
  try {
    const resp = await fetch(`https://devi-app.onrender.com/api/reset-free-chat-schedule`, {
      method: 'POST',
    });
    console.log('Job response:', await resp.text());
  } catch (err) {
    console.error('Error in reset-free-chat-schedule job:', err);
  }
}, {
  timezone: 'Asia/Kolkata',
});

// schedule free-chat-notif job to run every day at 7pm, 8pm, 9pm, 10pm
cron.schedule('0 19,20,21,22 * * *', async () => {
  console.log('Running free-chat-notif job at (IST):', moment().tz('Asia/Kolkata').format());
  try {
    const resp = await fetch(`https://devi-app.onrender.com/api/free-chat-notif`, {
      method: 'POST',
    });
    console.log('Job response:', await resp.text());
  } catch (err) {
    console.error('Error in free-chat-notif job:', err);
  }
}, {
  timezone: 'Asia/Kolkata',
});

// Routes for signup
app.use('/api/send-otp', require('./routes/signup/send-otp'));
app.use('/api/verify-otp', require('./routes/signup/verify-otp'));

// Routes for user
app.use('/api/register', require('./routes/user/register'));
app.use('/api/update-profile', require('./routes/user/update-profile'));
app.use('/api/get-profile', require('./routes/user/get-profile'));
app.use('/api/delete-user', require('./routes/user/delete-user'));
app.use('/api/daily-blessings', require('./routes/user/daily-blessings'));
app.use('/api/get-compatibility-report', require('./routes/user/get-compatibility-report'));
app.use('/api/get-past-compatibility-reports', require('./routes/user/get-past-compatibility-reports'));
app.use('/api/delete-compatibility-report', require('./routes/user/delete-compatibility-report'));

// Routes for devi
app.use('/api/devi', require('./routes/devi/devi'));
app.use('/api/delete-chat', require('./routes/devi/delete-chat'));
app.use('/api/chat-history', require('./routes/devi/chat-history'));
app.use('/api/latest-chat-history', require('./routes/devi/latest-chat-history'));

// Routes for payment
app.use('/api/create-order', require('./routes/payment/create-order'));
app.use('/api/verify-pay', require('./routes/payment/verify-pay'));
app.use('/api/verify-payment', require('./routes/payment/verify-pay'));

// Routes for notifications
app.use('/api/update-fcm-token', require('./routes/notifications/update-fcm-token'));
app.use('/api/daily-blessings-notif', require('./routes/notifications/daily-blessings-notif'));
app.use('/api/free-chat-notif', require('./routes/notifications/free-chat-notif'));
app.use('/api/reset-free-chat-schedule', require('./routes/notifications/reset-free-chat-schedule'));
app.use('/api/send-notif', require('./routes/notifications/send-notif'));

// Routes for scripts
app.use('/api/give-free-chat', require('./routes/scripts/give-free-chat'));

// Catch-all middleware for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'No API Found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
