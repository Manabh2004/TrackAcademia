const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { User } = require('../models');

// Admin creates any user (professor, student, or another admin)
router.post('/create-user', auth(['admin']), async (req, res) => {
  try {
    const {
      name, email, password, role,
      reg_no, phone, parent_phone,
      year, branch, section, semester
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password and role are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email,
      password: hash,
      role,
      reg_no: reg_no || null,
      phone: phone || null,
      parent_phone: parent_phone || null,
      year: year ? parseInt(year) : null,
      branch: branch || null,
      section: section || null,
      semester: semester ? parseInt(semester) : null,
    });

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Student self-registration
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      reg_no,
      phone,
      parent_phone,
      year,
      branch,
      section,
      semester,
    } = req.body;

    if (!name || !email || !password || !reg_no) {
      return res.status(400).json({
        error: 'name, email, password and reg_no are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingRegNo = await User.findOne({
      where: { reg_no },
    });

    if (existingRegNo) {
      return res.status(400).json({ error: 'Registration number already used' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hash,
      role: 'student',
      reg_no,
      phone: phone || null,
      parent_phone: parent_phone || null,
      year: year ? parseInt(year, 10) : null,
      branch: branch || null,
      section: section || null,
      semester: semester ? parseInt(semester, 10) : null,
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Login — works for all roles
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'No account found with that email' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        year: user.year,
        branch: user.branch,
        section: user.section,
        is_cr: user.is_cr,
        semester: user.semester,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        is_cr: user.is_cr,
        year: user.year,
        branch: user.branch,
        section: user.section,
        semester: user.semester,
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/fcm-token', auth(), async (req, res) => {
  await User.update({ fcm_token: req.body.token }, { where: { id: req.user.id } });
  res.json({ ok: true });
});

router.get('/me', auth(), async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
  res.json(user);
});

module.exports = router;
