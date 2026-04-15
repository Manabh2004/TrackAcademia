require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');
const { ensureBootstrapData } = require('./services/bootstrap');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/syllabus', require('./routes/syllabus'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/doubts', require('./routes/doubts'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/users', require('./routes/users'));

app.get('/api/setup', async (req, res) => {
  if (req.query.secret !== 'SETUP_SECRET_DELETE_ME') {
    return res.status(403).json({ error: 'no' });
  }

  try {
    const hash = await bcrypt.hash('admin123', 10);
    await User.upsert({
      name: 'Super Admin',
      email: 'admin@trackacademia.com',
      password: hash,
      role: 'admin',
    });

    res.json({ ok: true, email: 'admin@trackacademia.com', password: 'admin123' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(async () => {
  console.log('DB synced');
  await ensureBootstrapData();
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}).catch(e => {
  console.error('DB sync error:', e);
});
