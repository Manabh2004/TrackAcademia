import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, surface, form, buttons, table } from '../../theme';

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT'];

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', year: '1', branch: 'CSE', section: 'A', semester: '1' });
  const [assignForm, setAssignForm] = useState({ professor_id: '', subject_id: '' });
  const [msg, setMsg] = useState('');

  const load = () => Promise.all([
    api.get('/subjects/all').then(r => setSubjects(r.data)),
    api.get('/admin/users?role=professor').then(r => setProfessors(r.data)),
  ]);

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createSubject = async e => {
    e.preventDefault();
    try {
      await api.post('/subjects', { ...form, year: parseInt(form.year), semester: parseInt(form.semester) });
      setMsg('Subject created!');
      load();
    } catch (e) { setMsg('Error: ' + e.response?.data?.error); }
  };

  const assignProf = async e => {
    e.preventDefault();
    try {
      await api.post('/subjects/assign-professor', assignForm);
      setMsg('Professor assigned!');
    } catch (e) { setMsg('Error: ' + e.response?.data?.error); }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24, color: colors.text }}>Subject Management</h2>
      {msg && <p style={{ color: msg.includes('Error') ? colors.danger : colors.success, marginBottom: 12 }}>{msg}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={card}>
          <h3 style={{ marginBottom: 16 }}>Create Subject</h3>
          <form onSubmit={createSubject}>
            {[['name', 'Subject Name', 'text'], ['code', 'Subject Code', 'text']].map(([k, label, type]) => (
              <div key={k} style={field}>
                <label style={lbl}>{label}</label>
                <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} required={k === 'name'} style={inp} />
              </div>
            ))}
            <div style={grid2}>
              <div style={field}>
                <label style={lbl}>Year</label>
                <select value={form.year} onChange={e => set('year', e.target.value)} style={inp}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div style={field}>
                <label style={lbl}>Branch</label>
                <select value={form.branch} onChange={e => set('branch', e.target.value)} style={inp}>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={field}>
                <label style={lbl}>Section</label>
                <select value={form.section} onChange={e => set('section', e.target.value)} style={inp}>
                  {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={field}>
                <label style={lbl}>Semester</label>
                <select value={form.semester} onChange={e => set('semester', e.target.value)} style={inp}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={{ ...btn, marginTop: 12 }}>Create Subject</button>
          </form>
        </div>

        <div style={card}>
          <h3 style={{ marginBottom: 16 }}>Assign Professor to Subject</h3>
          <form onSubmit={assignProf}>
            <div style={field}>
              <label style={lbl}>Professor</label>
              <select value={assignForm.professor_id} onChange={e => setAssignForm(f => ({ ...f, professor_id: e.target.value }))} required style={inp}>
                <option value="">Select professor</option>
                {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={field}>
              <label style={lbl}>Subject</label>
              <select value={assignForm.subject_id} onChange={e => setAssignForm(f => ({ ...f, subject_id: e.target.value }))} required style={inp}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} — {s.branch} Y{s.year} {s.section}</option>)}
              </select>
            </div>
            <button type="submit" style={{ ...btn, marginTop: 12 }}>Assign</button>
          </form>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginBottom: 16 }}>All Subjects</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Name', 'Code', 'Year', 'Branch', 'Section', 'Semester'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id}>
                <td style={td}>{s.name}</td>
                <td style={td}>{s.code}</td>
                <td style={td}>Year {s.year}</td>
                <td style={td}>{s.branch}</td>
                <td style={td}>{s.section}</td>
                <td style={td}>Sem {s.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const card = { ...surface.card };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const field = { display: 'flex', flexDirection: 'column', marginBottom: 12 };
const lbl = { ...form.label };
const inp = { ...form.input };
const btn = { ...buttons.primary };
const th = { ...table.head };
const td = { ...table.cell };
