const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const {
  SyllabusModule,
  SyllabusTopic,
} = require('../models');

const { parseSyllabus } = require('../services/ai');

const upload = multer({ dest: 'uploads/' });


// ==========================
// 🔥 PARSE (AI + FALLBACK)
// ==========================
router.post('/parse', auth(['professor', 'admin']), upload.single('pdf'), async (req, res) => {
  try {
    const { subject_id } = req.body;

    let rawText = '';

    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      const parsed = await pdfParse(buffer);
      rawText = parsed.text;
    } else {
      rawText = req.body.raw_text || '';
    }

    let structured;

    try {
      // 🔥 TRY AI
      structured = await parseSyllabus(rawText);
    } catch (err) {
      // 🔴 FALLBACK (VERY IMPORTANT)
      const lines = rawText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      structured = {
        modules: [
          {
            module_no: 1,
            title: 'Module 1',
            topics: lines,
          },
        ],
      };
    }

    for (const mod of structured.modules) {
      const dbMod = await SyllabusModule.create({
        subject_id,
        module_no: mod.module_no,
        title: mod.title,
      });

      for (const topic of mod.topics) {
        await SyllabusTopic.create({
          module_id: dbMod.id,
          title: topic,
        });
      }
    }

    res.json({ ok: true });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ==========================
// 🔥 MANUAL ADD (NEW)
// ==========================
router.post('/manual', auth(['professor', 'admin']), async (req, res) => {
  try {
    const { subject_id, module_title, topics } = req.body;

    if (!subject_id || !module_title) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const count = await SyllabusModule.count({
      where: { subject_id },
    });

    const module = await SyllabusModule.create({
      subject_id,
      module_no: count + 1,
      title: module_title,
    });

    if (topics && topics.length) {
      for (const t of topics) {
        await SyllabusTopic.create({
          module_id: module.id,
          title: t,
        });
      }
    }

    res.json({ ok: true });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ==========================
// GET SYLLABUS
// ==========================
router.get('/:subject_id', auth(), async (req, res) => {
  try {
    const modules = await SyllabusModule.findAll({
      where: { subject_id: req.params.subject_id },
      include: [{ model: SyllabusTopic, as: 'topics' }],
      order: [['module_no', 'ASC']],
    });

    res.json(modules);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ==========================
// 🔥 TOPIC TICK
// ==========================
router.patch('/topic/:topic_id', auth(['professor', 'admin', 'student']), async (req, res) => {
  try {
    if (req.user.role === 'student' && !req.user.is_cr) {
      return res.status(403).json({ error: 'Only CR allowed' });
    }

    const topic = await SyllabusTopic.findByPk(req.params.topic_id);

    if (!topic) return res.status(404).json({ error: 'Not found' });

    await topic.update(req.body);

    // 🔥 AUTO COMPLETE MODULE
    const topics = await SyllabusTopic.findAll({
      where: { module_id: topic.module_id },
    });

    const allDone = topics.every(t => t.is_completed);

    await SyllabusModule.update(
      { is_completed: allDone },
      { where: { id: topic.module_id } }
    );

    res.json({ ok: true });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ==========================
// 🔥 MODULE TICK
// ==========================
router.patch('/module/:module_id', auth(['professor', 'admin', 'student']), async (req, res) => {
  try {
    if (req.user.role === 'student' && !req.user.is_cr) {
      return res.status(403).json({ error: 'Only CR allowed' });
    }

    const module = await SyllabusModule.findByPk(req.params.module_id, {
      include: [{ model: SyllabusTopic, as: 'topics' }],
    });

    if (!module) {
      return res.status(404).json({ error: 'Not found' });
    }

    const isCompleted = !!req.body.is_completed;
    const completed_on =
      req.body.completed_on ||
      new Date().toISOString().split('T')[0];

    const completed_class_no =
      req.body.completed_class_no || null;

    await module.update({ is_completed: isCompleted });

    await SyllabusTopic.update(
      {
        is_completed: isCompleted,
        completed_on: isCompleted ? completed_on : null,
        completed_class_no: isCompleted ? completed_class_no : null,
      },
      { where: { module_id: module.id } }
    );

    res.json({ ok: true });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports = router;