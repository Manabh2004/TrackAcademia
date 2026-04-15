const router = require('express').Router();
const auth = require('../middleware/auth');
const { User, Subject } = require('../models');

router.get('/students', auth(['professor', 'admin', 'student']), async (req, res) => {
  try {
    const { subject_id } = req.query;
    if (subject_id) {
      const subject = await Subject.findByPk(subject_id);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });
      const students = await User.findAll({
        where: { role: 'student', year: subject.year, branch: subject.branch, section: subject.section },
        attributes: { exclude: ['password'] },
        order: [['name', 'ASC']],
      });
      return res.json(students);
    }
    const students = await User.findAll({ where: { role: 'student' }, attributes: { exclude: ['password'] } });
    res.json(students);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;