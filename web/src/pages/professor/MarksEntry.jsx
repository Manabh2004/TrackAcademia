import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, form, buttons, table } from '../../theme';

const MARK_TYPES = ['attendance', 'assignment', 'surprise_test', 'quiz', 'midterm1', 'midterm2', 'external'];

export default function MarksEntry() {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [type, setType] = useState('midterm1');
  const [maxMarks, setMaxMarks] = useState(50);
  const [marks, setMarks] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get('/subjects/my').then(r => setSubjects(r.data)); }, []);
  useEffect(() => { if (subject) api.get(`/users/students?subject_id=${subject}`).then(r => { setStudents(r.data); const m = {}; r.data.forEach(s => m[s.id] = ''); setMarks(m); }); }, [subject]);

  const submit = async () => {
    const semester = parseInt(prompt('Enter semester number:') || '1');
    for (const [student_id, mark_val] of Object.entries(marks)) {
      if (mark_val === '') continue;
      await api.post('/marks', { student_id: parseInt(student_id), subject_id: parseInt(subject), semester, type, marks: parseFloat(mark_val), max_marks: parseFloat(maxMarks) });
    }
    setMsg('Marks saved!');
  };

  return (
    <div>
      <h2 style={{ color: colors.text }}>Marks Entry</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={subject} onChange={e => setSubject(e.target.value)} style={sel}>
          <option value="">Select subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} style={sel}>
          {MARK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} placeholder="Max marks" style={{ ...sel, width: 100 }} />
      </div>
      {students.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Reg No', 'Name', `Marks /${maxMarks}`].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td style={td}>{s.reg_no}</td>
                <td style={td}>{s.name}</td>
                <td style={td}><input type="number" value={marks[s.id] || ''} onChange={e => setMarks(m => ({ ...m, [s.id]: e.target.value }))} style={{ width: 80, padding: 4, borderRadius: 4, border: '1px solid #ddd' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {students.length > 0 && <button onClick={submit} style={{ ...buttons.primary, marginTop: 16 }}>Save Marks</button>}
      {msg && <p style={{ color: colors.success }}>{msg}</p>}
    </div>
  );
}
const sel = { ...form.input, borderRadius: 8 };
const th = { ...table.head };
const td = { ...table.cell };
