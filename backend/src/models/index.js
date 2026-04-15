const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// ─── User ─────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },

  role: {
    type: DataTypes.ENUM('admin', 'professor', 'student', 'parent'),
    allowNull: false
  },

  // student info
  reg_no: { type: DataTypes.STRING, unique: true },
  phone: DataTypes.STRING,
  parent_phone: DataTypes.STRING,
  year: DataTypes.INTEGER,
  branch: DataTypes.STRING,
  section: DataTypes.STRING,
  semester: DataTypes.INTEGER,
  is_cr: { type: DataTypes.BOOLEAN, defaultValue: false },

  // 🔥 parent link
  parent_id: { type: DataTypes.INTEGER },

  fcm_token: DataTypes.TEXT,
});

// ─── Institute Config ─────────────────────────────────────────
const InstituteConfig = sequelize.define('InstituteConfig', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key: { type: DataTypes.STRING, unique: true },
  value: DataTypes.TEXT,
});

// ─── Subject ──────────────────────────────────────────────────
const Subject = sequelize.define('Subject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: DataTypes.STRING,
  year: DataTypes.INTEGER,
  branch: DataTypes.STRING,
  section: DataTypes.STRING,
  semester: DataTypes.INTEGER,
});

// ─── ProfessorSubject ─────────────────────────────────────────
const ProfessorSubject = sequelize.define('ProfessorSubject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

User.belongsToMany(Subject, {
  through: ProfessorSubject,
  foreignKey: 'professor_id',
  otherKey: 'subject_id',
  as: 'subjects_taught',
});

Subject.belongsToMany(User, {
  through: ProfessorSubject,
  foreignKey: 'subject_id',
  otherKey: 'professor_id',
  as: 'professors',
});

// ─── Syllabus ─────────────────────────────────────────────────
const SyllabusModule = sequelize.define('SyllabusModule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: { type: DataTypes.INTEGER },
  module_no: DataTypes.INTEGER,
  title: DataTypes.STRING,
  is_completed: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const SyllabusTopic = sequelize.define('SyllabusTopic', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  module_id: { type: DataTypes.INTEGER },
  title: DataTypes.TEXT,
  is_completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  completed_on: DataTypes.DATEONLY,
  completed_class_no: DataTypes.INTEGER,
});

// relations
SyllabusModule.hasMany(SyllabusTopic, {
  foreignKey: 'module_id',
  as: 'topics',
});

SyllabusTopic.belongsTo(SyllabusModule, {
  foreignKey: 'module_id',
});

Subject.hasMany(SyllabusModule, {
  foreignKey: 'subject_id',
  as: 'modules',
});

SyllabusModule.belongsTo(Subject, {
  foreignKey: 'subject_id',
  as: 'subject',
});

// ─── Attendance ───────────────────────────────────────────────
const AttendanceSession = sequelize.define('AttendanceSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: { type: DataTypes.INTEGER, allowNull: false },
  class_no: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  total_students: DataTypes.INTEGER,
  present_count: DataTypes.INTEGER,
}, {
  indexes: [
    {
      unique: true,
      fields: ['subject_id', 'class_no'], // prevent duplicate class numbers
    },
  ],
});

const AttendanceRecord = sequelize.define('AttendanceRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  session_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  is_present: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  indexes: [
    {
      unique: true,
      fields: ['session_id', 'student_id'], // 🔥 prevent duplicate attendance
    },
  ],
});

AttendanceSession.hasMany(AttendanceRecord, {
  foreignKey: 'session_id',
  as: 'records',
});

AttendanceSession.belongsTo(Subject, {
  foreignKey: 'subject_id',
  as: 'subject',
});

AttendanceRecord.belongsTo(AttendanceSession, {
  foreignKey: 'session_id',
  as: 'session',
});

AttendanceRecord.belongsTo(User, {
  foreignKey: 'student_id',
  as: 'student',
});

Subject.hasMany(AttendanceSession, {
  foreignKey: 'subject_id',
  as: 'sessions',
});

// ─── Class Log (CORE FEATURE) ─────────────────────────────────
const ClassLog = sequelize.define('ClassLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: DataTypes.INTEGER,
  session_id: DataTypes.INTEGER,
  date: DataTypes.DATEONLY,
  topics: DataTypes.JSON,
  notes: DataTypes.TEXT,
});

// ─── Study Material ───────────────────────────────────────────
const StudyMaterial = sequelize.define('StudyMaterial', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: DataTypes.INTEGER,
  title: DataTypes.STRING,
  type: DataTypes.ENUM('notes', 'video_link', 'assignment', 'other'),
  file_path: DataTypes.STRING,
  url: DataTypes.STRING,
  module_id: DataTypes.INTEGER,
  notify_students: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// ─── Assignment ───────────────────────────────────────────────
const Assignment = sequelize.define('Assignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: DataTypes.INTEGER,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  due_date: DataTypes.DATEONLY,
  file_path: DataTypes.STRING,
  max_marks: DataTypes.INTEGER,
});

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assignment_id: DataTypes.INTEGER,
  student_id: DataTypes.INTEGER,
  file_path: DataTypes.STRING,
  marks: DataTypes.FLOAT,
  submitted_at: DataTypes.DATE,
});

// ─── Marks ────────────────────────────────────────────────────
const Mark = sequelize.define('Mark', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: DataTypes.INTEGER,
  subject_id: DataTypes.INTEGER,
  semester: DataTypes.INTEGER,
  type: DataTypes.ENUM(
    'attendance',
    'assignment',
    'surprise_test',
    'quiz',
    'midterm1',
    'midterm2',
    'external'
  ),
  marks: DataTypes.FLOAT,
  max_marks: DataTypes.FLOAT,
});

// ─── Timetable ────────────────────────────────────────────────
const TimetableSlot = sequelize.define('TimetableSlot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: DataTypes.INTEGER,
  day: DataTypes.ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
  start_time: DataTypes.TIME,
  end_time: DataTypes.TIME,
  room: DataTypes.STRING,
  is_lab: { type: DataTypes.BOOLEAN, defaultValue: false },
  year: DataTypes.INTEGER,
  branch: DataTypes.STRING,
  section: DataTypes.STRING,
});

const TimetableOverride = sequelize.define('TimetableOverride', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  original_slot_id: DataTypes.INTEGER,
  date: DataTypes.DATEONLY,
  action: DataTypes.ENUM('cancel', 'reschedule', 'extra'),
  new_day: DataTypes.ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
  new_start_time: DataTypes.TIME,
  new_end_time: DataTypes.TIME,
  new_room: DataTypes.STRING,
  subject_id: DataTypes.INTEGER,
  note: DataTypes.STRING,
});

// relations
TimetableSlot.belongsTo(Subject, { foreignKey: 'subject_id' });

// ─── Doubts ───────────────────────────────────────────────────
const Doubt = sequelize.define('Doubt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: DataTypes.INTEGER,
  student_id: DataTypes.INTEGER,
  question: DataTypes.TEXT,
  answer: DataTypes.TEXT,
  answered_by: DataTypes.INTEGER,
  is_answered: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// relations
Doubt.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Doubt.belongsTo(User, { foreignKey: 'answered_by', as: 'answeredBy' });
Doubt.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// ─── Announcements ────────────────────────────────────────────
const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: DataTypes.STRING,
  body: DataTypes.TEXT,
  scope: DataTypes.ENUM('college', 'subject'),
  subject_id: DataTypes.INTEGER,
  created_by: DataTypes.INTEGER,
});

// ─── EXPORT ───────────────────────────────────────────────────
module.exports = {
  sequelize,
  User,
  InstituteConfig,
  Subject,
  ProfessorSubject,
  SyllabusModule,
  SyllabusTopic,
  AttendanceSession,
  AttendanceRecord,
  ClassLog,
  StudyMaterial,
  Assignment,
  AssignmentSubmission,
  Mark,
  TimetableSlot,
  TimetableOverride,
  Doubt,
  Announcement,
};
