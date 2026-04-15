const router = require('express').Router();
const auth = require('../middleware/auth');
const { Doubt, User } = require('../models');

router.post('/', auth(['student']), async (req, res) => {
  try {
    const doubt = await Doubt.create({
      ...req.body,
      student_id: req.user.id,
    });
    res.json(doubt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/subject/:subject_id', auth(['professor', 'admin']), async (req, res) => {
  try {
    const doubts = await Doubt.findAll({
      where: { subject_id: req.params.subject_id },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'reg_no'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(doubts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/answer', auth(['professor', 'admin']), async (req, res) => {
  try {
    await Doubt.update(
      {
        answer: req.body.answer,
        answered_by: req.user.id,
        is_answered: true,
      },
      { where: { id: req.params.id } }
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/my', auth(['student']), async (req, res) => {
  try {
    const doubts = await Doubt.findAll({
      where: { student_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.json(doubts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;