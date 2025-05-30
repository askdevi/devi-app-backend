const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/send-otp', require('./routes/signup/send-otp'));
app.use('/api/verify-otp', require('./routes/signup/verify-otp'));

app.use('/api/register', require('./routes/user/register'));
app.use('/api/update-profile', require('./routes/user/update-profile'));
app.use('/api/get-profile', require('./routes/user/get-profile'));
app.use('/api/delete-user', require('./routes/user/delete-user'));
app.use('/api/daily-blessings', require('./routes/user/daily-blessings'));

app.use('/api/devi', require('./routes/devi/devi'));
app.use('/api/delete-chat', require('./routes/devi/delete-chat'));
app.use('/api/chat-history', require('./routes/devi/chat-history'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
