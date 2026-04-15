const bcrypt = require('bcryptjs');
const {
  User,
  Subject,
  ProfessorSubject,
  SyllabusModule,
  SyllabusTopic,
  AttendanceSession,
  AttendanceRecord,
  Mark,
  TimetableSlot,
  Doubt,
  InstituteConfig,
} = require('../models');

async function createUser(data) {
  const password = await bcrypt.hash(data.password, 10);
  return User.create({ ...data, password });
}

async function ensureBootstrapData() {
  const existingUsers = await User.count();
  const existingSubjects = await Subject.count();

  if (existingUsers > 0 || existingSubjects > 0) return;

  await createUser({
    name: 'TrackAcademia Admin',
    email: 'admin@trackacademia.app',
    password: 'admin123',
    role: 'admin',
  });

  const professor = await createUser({
    name: 'Dr. Priya Sharma',
    email: 'professor@trackacademia.app',
    password: 'professor123',
    role: 'professor',
    phone: '9876543210',
  });

  const studentOne = await createUser({
    name: 'Arjun Rao',
    email: 'student@trackacademia.app',
    password: 'student123',
    role: 'student',
    reg_no: '22CSE001',
    phone: '9123456780',
    parent_phone: '9000000001',
    year: 2,
    branch: 'CSE',
    section: 'A',
    semester: 3,
  });

  const studentTwo = await createUser({
    name: 'Meera Iyer',
    email: 'student2@trackacademia.app',
    password: 'student123',
    role: 'student',
    reg_no: '22CSE002',
    phone: '9123456781',
    parent_phone: '9000000002',
    year: 2,
    branch: 'CSE',
    section: 'A',
    semester: 3,
  });

  await InstituteConfig.create({ key: 'min_attendance_percent', value: '75' });

  const subjects = await Subject.bulkCreate([
    {
      name: 'Data Structures',
      code: 'CS201',
      year: 2,
      branch: 'CSE',
      section: 'A',
      semester: 3,
    },
    {
      name: 'Database Management Systems',
      code: 'CS203',
      year: 2,
      branch: 'CSE',
      section: 'A',
      semester: 3,
    },
    {
      name: 'Discrete Mathematics',
      code: 'MA205',
      year: 2,
      branch: 'CSE',
      section: 'A',
      semester: 3,
    },
  ]);

  await ProfessorSubject.bulkCreate(
    subjects.map(subject => ({
      professor_id: professor.id,
      subject_id: subject.id,
    }))
  );

  const dsSubject = subjects[0];
  const dbmsSubject = subjects[1];
  const mathSubject = subjects[2];

  const moduleOne = await SyllabusModule.create({
    subject_id: dsSubject.id,
    module_no: 1,
    title: 'Arrays, Linked Lists, and Stacks',
    is_completed: true,
  });

  const moduleTwo = await SyllabusModule.create({
    subject_id: dsSubject.id,
    module_no: 2,
    title: 'Trees and Graphs',
  });

  await SyllabusTopic.bulkCreate([
    {
      module_id: moduleOne.id,
      title: 'Array operations and complexity',
      is_completed: true,
      completed_on: '2026-04-01',
      completed_class_no: 1,
    },
    {
      module_id: moduleOne.id,
      title: 'Singly and doubly linked lists',
      is_completed: true,
      completed_on: '2026-04-03',
      completed_class_no: 2,
    },
    {
      module_id: moduleOne.id,
      title: 'Stack applications',
      is_completed: true,
      completed_on: '2026-04-05',
      completed_class_no: 3,
    },
    {
      module_id: moduleTwo.id,
      title: 'Binary trees and traversals',
      is_completed: true,
      completed_on: '2026-04-08',
      completed_class_no: 4,
    },
    {
      module_id: moduleTwo.id,
      title: 'Introduction to graphs',
      is_completed: false,
    },
  ]);

  const sessionOne = await AttendanceSession.create({
    subject_id: dsSubject.id,
    class_no: 1,
    date: '2026-04-01',
    total_students: 2,
    present_count: 2,
  });

  const sessionTwo = await AttendanceSession.create({
    subject_id: dsSubject.id,
    class_no: 2,
    date: '2026-04-03',
    total_students: 2,
    present_count: 1,
  });

  const sessionThree = await AttendanceSession.create({
    subject_id: dsSubject.id,
    class_no: 3,
    date: '2026-04-05',
    total_students: 2,
    present_count: 2,
  });

  await AttendanceRecord.bulkCreate([
    { session_id: sessionOne.id, student_id: studentOne.id, is_present: true },
    { session_id: sessionOne.id, student_id: studentTwo.id, is_present: true },
    { session_id: sessionTwo.id, student_id: studentOne.id, is_present: false },
    { session_id: sessionTwo.id, student_id: studentTwo.id, is_present: true },
    { session_id: sessionThree.id, student_id: studentOne.id, is_present: true },
    { session_id: sessionThree.id, student_id: studentTwo.id, is_present: true },
  ]);

  await Mark.bulkCreate([
    {
      student_id: studentOne.id,
      subject_id: dsSubject.id,
      semester: 3,
      type: 'midterm1',
      marks: 41,
      max_marks: 50,
    },
    {
      student_id: studentOne.id,
      subject_id: dbmsSubject.id,
      semester: 3,
      type: 'quiz',
      marks: 18,
      max_marks: 20,
    },
    {
      student_id: studentOne.id,
      subject_id: mathSubject.id,
      semester: 3,
      type: 'assignment',
      marks: 9,
      max_marks: 10,
    },
    {
      student_id: studentTwo.id,
      subject_id: dsSubject.id,
      semester: 3,
      type: 'midterm1',
      marks: 44,
      max_marks: 50,
    },
  ]);

  await TimetableSlot.bulkCreate([
    {
      subject_id: dsSubject.id,
      day: 'Mon',
      start_time: '09:00:00',
      end_time: '09:50:00',
      room: 'A-201',
      year: 2,
      branch: 'CSE',
      section: 'A',
    },
    {
      subject_id: dbmsSubject.id,
      day: 'Tue',
      start_time: '10:00:00',
      end_time: '10:50:00',
      room: 'A-204',
      year: 2,
      branch: 'CSE',
      section: 'A',
    },
    {
      subject_id: mathSubject.id,
      day: 'Wed',
      start_time: '11:00:00',
      end_time: '11:50:00',
      room: 'A-103',
      year: 2,
      branch: 'CSE',
      section: 'A',
    },
    {
      subject_id: dsSubject.id,
      day: 'Thu',
      start_time: '14:00:00',
      end_time: '15:40:00',
      room: 'Lab-2',
      is_lab: true,
      year: 2,
      branch: 'CSE',
      section: 'A',
    },
  ]);

  await Doubt.bulkCreate([
    {
      subject_id: dsSubject.id,
      student_id: studentOne.id,
      question: 'Can you explain how tree traversals differ in output order?',
      answer: 'Preorder visits root first, inorder visits root between subtrees, and postorder visits root last.',
      answered_by: professor.id,
      is_answered: true,
    },
    {
      subject_id: dbmsSubject.id,
      student_id: studentOne.id,
      question: 'Will normalization to 3NF be part of the next quiz?',
      is_answered: false,
    },
  ]);

  console.log(
    'Bootstrap data created. Demo logins: admin@trackacademia.app / admin123, professor@trackacademia.app / professor123, student@trackacademia.app / student123'
  );
}

module.exports = { ensureBootstrapData };
