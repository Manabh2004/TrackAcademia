const router = require('express').Router();
const auth = require('../middleware/auth');
const XLSX = require('xlsx');
const { AttendanceSession, AttendanceRecord, User } = require('../models');
const { Op } = require('sequelize');

// Generate end-of-semester record sheet
router.get('/semester-sheet/:subject_id', auth(['professor', 'admin']), async (req, res) => {
  try {
    const sessions = await AttendanceSession.findAll({
      where: { subject_id: req.params.subject_id },
      order: [['class_no', 'ASC']],
    });
    
    const students = await User.findAll({ where: { role: 'student', year: req.query.year, branch: req.query.branch, section: req.query.section } });
    
    const wb = XLSX.utils.book_new();
    const headers = ['Reg No', 'Name', ...sessions.map(s => `${s.class_no} (${s.date})`), 'Total', '% Attended'];
    const rows = [];
    
    for (const student of students) {
      const records = await AttendanceRecord.findAll({
        where: { student_id: student.id, session_id: { [Op.in]: sessions.map(s => s.id) } },
      });
      const row = [student.reg_no, student.name];
      let attended = 0;
      for (const sess of sessions) {
        const rec = records.find(r => r.session_id === sess.id);
        const present = rec?.is_present ? 1 : 0;
        attended += present;
        row.push(present ? 'P' : 'A');
      }
      row.push(attended, sessions.length > 0 ? ((attended / sessions.length) * 100).toFixed(1) + '%' : '0%');
      rows.push(row);
    }
    
    // Add totals row at bottom
    const totalsRow = ['', 'Students Present'];
    for (const sess of sessions) {
      totalsRow.push(sess.present_count);
    }
    rows.push(totalsRow);
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_record.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;