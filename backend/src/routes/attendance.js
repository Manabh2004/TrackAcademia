const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  AttendanceSession,
  AttendanceRecord,
  User,
  Subject,
  InstituteConfig,
  ClassLog,
} = require('../models');
const { sendNotification } = require('../services/firebase');
const { parseAttendanceSheet } = require('../services/ai');
const { Op } = require('sequelize');

// CREATE SESSION + LOG + NOTIFICATIONS
router.post('/session', auth(['professor', 'admin']), async (req, res) => {
  try {
    const {
      subject_id,
      date,
      present_ids,
      absent_ids,
      topics_covered = [],
      notes = '',
    } = req.body;

    // next class number
    const lastSession = await AttendanceSession.findOne({
      where: { subject_id },
      order: [['class_no', 'DESC']],
    });

    const class_no = (lastSession?.class_no || 0) + 1;

    const session = await AttendanceSession.create({
      subject_id,
      date,
      class_no,
      total_students: present_ids.length + absent_ids.length,
      present_count: present_ids.length,
    });

    // records
    const records = [
      ...present_ids.map(id => ({
        session_id: session.id,
        student_id: id,
        is_present: true,
      })),
      ...absent_ids.map(id => ({
        session_id: session.id,
        student_id: id,
        is_present: false,
      })),
    ];

    await AttendanceRecord.bulkCreate(records);

    // 🔥 CLASS LOG (critical feature)
    await ClassLog.create({
      subject_id,
      session_id: session.id,
      date,
      topics: topics_covered,
      notes,
    });

    // ABSENT NOTIFICATIONS
    const absentStudents = await User.findAll({
      where: { id: { [Op.in]: absent_ids } },
    });

    const subject = await Subject.findByPk(subject_id);

    const studentTokens = absentStudents.map(s => s.fcm_token).filter(Boolean);

    await sendNotification(
      studentTokens,
      'Attendance Alert',
      `Absent in ${subject?.name} on ${date}`
    );

    // 🔥 PARENT NOTIFICATIONS
    const parentIds = absentStudents.map(s => s.parent_id).filter(Boolean);

    if (parentIds.length > 0) {
      const parents = await User.findAll({
        where: { id: { [Op.in]: parentIds } },
      });

      const parentTokens = parents.map(p => p.fcm_token).filter(Boolean);

      await sendNotification(
        parentTokens,
        'Child Attendance Alert',
        `Your child was absent in ${subject?.name} on ${date}`
      );
    }

    // LOW ATTENDANCE CHECK
    const configRow = await InstituteConfig.findOne({
      where: { key: 'min_attendance_percent' },
    });

    const minPercent = parseFloat(configRow?.value || '75');

    const allSessions = await AttendanceSession.findAll({
      where: { subject_id },
      attributes: ['id'],
    });

    const sessionIds = allSessions.map(s => s.id);

    for (const student of absentStudents) {
      const total = sessionIds.length;

      const present = await AttendanceRecord.count({
        where: {
          student_id: student.id,
          is_present: true,
          session_id: { [Op.in]: sessionIds },
        },
      });

      const pct = total ? (present / total) * 100 : 100;

      if (pct < minPercent && student.fcm_token) {
        await sendNotification(
          [student.fcm_token],
          'Low Attendance Warning',
          `${pct.toFixed(1)}% attendance in ${subject?.name}`
        );
      }
    }

    res.json({ session, class_no });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// OCR
router.post('/ocr', auth(['professor', 'admin']), async (req, res) => {
  try {
    const { image_base64, year, branch, section } = req.body;

    const students = await User.findAll({
      where: { year, branch, section },
      attributes: ['id', 'name', 'reg_no'],
    });

    const result = await parseAttendanceSheet(
      image_base64,
      students.map(s => ({
        id: s.id,
        name: s.name,
        reg_no: s.reg_no,
      }))
    );

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// MASTER SHEET
router.get('/sheet/:subject_id', auth(), async (req, res) => {
  try {
    const sessions = await AttendanceSession.findAll({
      where: { subject_id: req.params.subject_id },
      include: [{ model: AttendanceRecord, as: 'records' }],
      order: [['class_no', 'ASC']],
    });

    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// STUDENT VIEW
router.get('/my/:subject_id', auth(['student']), async (req, res) => {
  try {
    const sessions = await AttendanceSession.findAll({
      where: { subject_id: req.params.subject_id },
      order: [['class_no', 'ASC']],
    });

    const records = await AttendanceRecord.findAll({
      where: {
        student_id: req.user.id,
        session_id: { [Op.in]: sessions.map(s => s.id) },
      },
    });

    const total = sessions.length;
    const attended = records.filter(r => r.is_present).length;

    res.json({
      sessions,
      records,
      total,
      attended,
      percentage: total ? ((attended / total) * 100).toFixed(1) : 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
