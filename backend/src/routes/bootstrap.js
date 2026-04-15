const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');

router.post('/admin', async (req, res) => {
  try {
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      return res.status(403).json({ error: 'Bootstrap admin route is disabled after the first user is created' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
      role: 'admin',
    });

    return res.status(201).json({
      ok: true,
      message: 'Initial admin created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
