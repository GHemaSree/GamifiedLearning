require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const { protect } = require('./middleware/auth.middleware');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('TrailForge API is running');
});

app.use('/auth', authRoutes);

app.get('/auth/me', protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.use('/trails', require('./routes/trail.routes'));
app.use('/modules', require('./routes/module.routes'));
app.use('/quiz', require('./routes/quiz.routes'));
app.use('/progress', require('./routes/progress.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});