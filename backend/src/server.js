//server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const { protect } = require('./middleware/auth.middleware');

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const admins = [
      { name: 'TrailForge Admin', email: 'admin@trailforge.com', password: 'AdminPassword123' },
      { name: 'Gmail Admin', email: 'admin@gmail.com', password: 'AdminPassword123' }
    ];

    for (const adminData of admins) {
      let user = await User.findOne({ email: adminData.email });
      if (!user) {
        await User.create({
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
          role: 'admin',
        });
        console.log(`Seeded admin: ${adminData.email} / ${adminData.password}`);
      } else {
        user.role = 'admin';
        user.password = adminData.password; // Schema pre-save hook will hash it
        await user.save();
        console.log(`Reset/Verified admin: ${adminData.email}`);
      }
    }
  } catch (err) {
    console.error('Error seeding default admin users:', err.message);
  }
};

connectDB().then(() => {
  seedAdmin();
});

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

app.use('/topics', require('./routes/topics.routes'));
app.use('/trails', require('./routes/trail.routes'));
app.use('/modules', require('./routes/module.routes'));
app.use('/quiz', require('./routes/quiz.routes'));
app.use('/progress', require('./routes/progress.routes'));
app.use('/profile', require('./routes/profile.routes'));
app.use('/recommendations', require('./routes/recommendations.routes'));
app.use('/achievements', require('./routes/achievements.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});