const { ProfessorSubject } = require('../models');

module.exports = async function (req, res, next) {
  try {
    const subject_id =
      req.body.subject_id ||
      req.query.subject_id ||
      req.params.subject_id;

    if (!subject_id) return next();

    if (req.user.role !== 'professor') return next();

    const ps = await ProfessorSubject.findOne({
      where: {
        professor_id: req.user.id,
        subject_id,
      },
    });

    if (!ps) {
      return res.status(403).json({ error: 'Not your subject' });
    }

    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};