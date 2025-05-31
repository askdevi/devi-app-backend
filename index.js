const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.use('/api/send-otp', require('./routes/signup/send-otp'));
app.use('/api/verify-otp', require('./routes/signup/verify-otp'));

app.use('/api/register', require('./routes/user/register'));
app.use('/api/update-profile', require('./routes/user/update-profile'));
app.use('/api/get-profile', require('./routes/user/get-profile'));
app.use('/api/delete-user', require('./routes/user/delete-user'));
app.use('/api/daily-blessings', require('./routes/user/daily-blessings'));
app.use('/api/get-compatibility-report', require('./routes/user/get-compatibility-report'));
app.use('/api/get-past-compatibility-reports', require('./routes/user/get-past-compatibility-reports'));

app.use('/api/devi', require('./routes/devi/devi'));
app.use('/api/delete-chat', require('./routes/devi/delete-chat'));
app.use('/api/chat-history', require('./routes/devi/chat-history'));

app.use('/api/create-order', require('./routes/payment/create-order'));
app.use('/api/verify-payment', require('./routes/payment/verify-payment'));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
