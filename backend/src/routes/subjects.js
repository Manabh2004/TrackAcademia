const router = require('express').Router();
const auth = require('../middleware/auth');
const { Subject, User, ProfessorSubject } = require('../models');

router.get('/my', auth(['professor']), async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{
      model: Subject,
      as: 'subjects_taught',
      through: { attributes: [] },
    }],
  });

  res.json(user?.subjects_taught || []);
});

router.get('/all', auth(['admin']), async (req, res) => {
  const subjects = await Subject.findAll();
  res.json(subjects);
});

router.post('/', auth(['admin']), async (req, res) => {
  const sub = await Subject.create(req.body);
  res.json(sub);
});

router.post('/assign-professor', auth(['admin']), async (req, res) => {
  const professor_id = parseInt(req.body.professor_id, 10);
  const subject_id = parseInt(req.body.subject_id, 10);

  if (!professor_id || !subject_id) {
    return res.status(400).json({ error: 'professor_id and subject_id are required' });
  }

  const professor = await User.findOne({
    where: { id: professor_id, role: 'professor' },
  });

  if (!professor) {
    return res.status(404).json({ error: 'Professor not found' });
  }

  const subject = await Subject.findByPk(subject_id);
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  await ProfessorSubject.findOrCreate({
    where: { professor_id, subject_id },
    defaults: { professor_id, subject_id },
  });

  res.json({ ok: true });
});

router.get('/students', auth(['professor', 'admin']), async (req, res) => {
  const { subject_id } = req.query;
  const subject = await Subject.findByPk(subject_id);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  const students = await User.findAll({ where: { role: 'student', year: subject.year, branch: subject.branch, section: subject.section } });
  res.json(students);
});

router.get('/for-student', auth(['student']), async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      where: {
        year: req.user.year,
        branch: req.user.branch,
        section: req.user.section,
      },
    });

    res.json(subjects);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
