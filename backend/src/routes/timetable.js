const router = require('express').Router();
const auth = require('../middleware/auth');
const { TimetableSlot, TimetableOverride, User, Subject } = require('../models');
const { sendNotification } = require('../services/firebase');
const { Op } = require('sequelize');

// Get timetable
router.get('/', auth(), async (req, res) => {
  try {
    const { year, branch, section } = req.query;

    const slots = await TimetableSlot.findAll({
      where: { year, branch, section },
      include: [{ model: Subject }],
    });

    const overrides = await TimetableOverride.findAll({
      where: {
        date: {
          [Op.gte]: new Date().toISOString().split('T')[0],
        },
      },
    });

    res.json({ slots, overrides });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create slot
router.post('/slot', auth(['admin', 'professor']), async (req, res) => {
  try {
    const slot = await TimetableSlot.create(req.body);
    res.json(slot);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Create override (FIXED)
router.post('/override', auth(['professor', 'admin']), async (req, res) => {
  try {
    const override = await TimetableOverride.create(req.body);

    const slot = await TimetableSlot.findByPk(req.body.original_slot_id);

    if (slot) {
      const students = await User.findAll({
        where: {
          year: slot.year,
          branch: slot.branch,
          section: slot.section,
          role: 'student',
        },
      });

      const tokens = students.map(s => s.fcm_token).filter(Boolean);

      // ✅ SAFE SUBJECT FETCH
      let subject = null;
      if (slot.subject_id) {
        subject = await Subject.findByPk(slot.subject_id);
      }

      const actionText =
        req.body.action === 'cancel'
          ? 'cancelled'
          : req.body.action === 'reschedule'
          ? 'rescheduled'
          : 'extra class added';

      await sendNotification(
        tokens,
        'Timetable Update',
        `${subject?.name || 'A class'} on ${req.body.date} has been ${actionText}. ${req.body.note || ''}`,
        { type: 'timetable' }
      );
    }

    res.json(override);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete slot
router.delete('/slot/:id', auth(['professor', 'admin']), async (req, res) => {
  try {
    const slot = await TimetableSlot.findByPk(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Not found' });

    if (req.user.role === 'professor') {
      const ps = await require('../models').ProfessorSubject.findOne({
        where: { professor_id: req.user.id, subject_id: slot.subject_id },
      });
      if (!ps) return res.status(403).json({ error: 'Not your subject' });
    }

    await slot.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;