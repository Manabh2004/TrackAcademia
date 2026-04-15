const router = require('express').Router();
const auth = require('../middleware/auth');
const { Mark } = require('../models');

// UPSERT MARK
router.post('/', auth(['professor', 'admin']), async (req, res) => {
  try {
    const {
      student_id,
      subject_id,
      semester,
      type,
      marks,
      max_marks,
    } = req.body;

    await Mark.upsert({
      student_id,
      subject_id,
      semester,
      type,
      marks,
      max_marks,
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET MARKS
router.get('/student/:student_id', auth(), async (req, res) => {
  try {
    const { semester } = req.query;

    const where = {
      student_id: req.params.student_id,
    };

    if (semester) where.semester = semester;

    const marks = await Mark.findAll({ where });

    const grouped = {};

    for (const m of marks) {
      if (!grouped[m.subject_id]) grouped[m.subject_id] = {};

      grouped[m.subject_id][m.type] = {
        marks: m.marks,
        max: m.max_marks,
      };
    }

    res.json({ marks, grouped });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;