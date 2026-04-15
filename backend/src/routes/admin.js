const router = require('express').Router();
const auth = require('../middleware/auth');
const { InstituteConfig, Announcement, User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const multer = require('multer');
const XLSX = require('xlsx');

const upload = multer({ dest: 'uploads/' });

/* ================= CONFIG ================= */

router.get('/config', auth(['admin']), async (req, res) => {
  const configs = await InstituteConfig.findAll();
  const obj = {};
  configs.forEach(c => obj[c.key] = c.value);
  res.json(obj);
});

router.post('/config', auth(['admin']), async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await InstituteConfig.upsert({ key, value: String(value) });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ================= USERS ================= */

router.get('/users', auth(['admin']), async (req, res) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.branch) where.branch = req.query.branch;
    if (req.query.year) where.year = parseInt(req.query.year);

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });

    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/assign-cr/:student_id', auth(['admin', 'professor']), async (req, res) => {
  await User.update(
    { is_cr: true },
    { where: { id: req.params.student_id, role: 'student' } }
  );
  res.json({ ok: true });
});

/* ================= ANNOUNCEMENTS ================= */

router.post('/announcement', auth(['admin', 'professor']), async (req, res) => {
  const ann = await Announcement.create({
    ...req.body,
    created_by: req.user.id
  });
  res.json(ann);
});

router.get('/announcements', auth(), async (req, res) => {
  const anns = await Announcement.findAll({
    where: { scope: 'college' },
    order: [['createdAt', 'DESC']]
  });
  res.json(anns);
});

/* ================= BULK IMPORT (EXCEL) ================= */

router.post(
  '/bulk-import-students-excel',
  auth(['admin']),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const defaultPassword = await bcrypt.hash('changeme123', 10);

      const created = [];
      const failed = [];

      for (const row of data) {
        try {
          const user = await User.create({
            name: row.name,
            email: String(row.email).toLowerCase(),
            reg_no: row.reg_no,
            year: parseInt(row.year),
            branch: row.branch,
            section: row.section,
            semester: parseInt(row.semester),
            password: defaultPassword,
            role: 'student'
          });

          created.push(user.id);
        } catch (e) {
          failed.push({ email: row.email, error: e.message });
        }
      }

      res.json({
        created: created.length,
        failed
      });

    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

module.exports = router;