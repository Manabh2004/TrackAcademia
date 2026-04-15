import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, surface, form, buttons, table } from '../../theme';

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT'];
const ROLES = ['student', 'professor', 'admin'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ role: '', branch: '', year: '' });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    reg_no: '',
    phone: '',
    parent_phone: '',
    year: '1',
    branch: 'CSE',
    section: 'A',
    semester: '1'
  });

  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () =>
    api.get('/admin/users', { params: filter }).then(r => setUsers(r.data));

  useEffect(() => {
    load();
  }, [filter]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ✅ MANUAL CREATE USER (MAIN WORKING FEATURE)
  const createUser = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      // ONLY add student fields if role = student
      if (form.role === 'student') {
        payload.reg_no = form.reg_no;
        payload.phone = form.phone;
        payload.parent_phone = form.parent_phone;
        payload.year = parseInt(form.year);
        payload.branch = form.branch;
        payload.section = form.section;
        payload.semester = parseInt(form.semester);
      }

      await api.post('/auth/create-user', payload);

      setMsg('User created!');
      setShowForm(false);
      load();
    } catch (e) {
      console.error(e);
      setMsg('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  // ✅ ASSIGN CR
  const assignCR = async (id) => {
    await api.patch(`/admin/assign-cr/${id}`);
    setMsg('CR assigned!');
    load();
  };

  // ⚠️ OPTIONAL (ONLY WORKS IF BACKEND IMPLEMENTED)
  const uploadFile = async () => {
    if (!file) {
      setMsg('No file selected');
      return;
    }

    const fd = new FormData();
    fd.append('file', file);

    try {
      await api.post('/admin/bulk-import-students-excel', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMsg('Excel upload success!');
      setFile(null);
      load();
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ color: colors.text }}>User Management</h2>

        <button onClick={() => setShowForm(s => !s)} style={btn}>
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {msg && <p style={{ color: msg.includes('Error') ? colors.danger : colors.success }}>{msg}</p>}

      {/* ✅ MANUAL USER FORM */}
      {showForm && (
        <form onSubmit={createUser} style={card}>
          <h3>Create User</h3>

          <div style={grid2}>
            <input placeholder="Name" value={form.name} onChange={e => set('name', e.target.value)} required style={inp} />
            <input placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} required style={inp} />
            <input type="password" placeholder="Password" value={form.password} onChange={e => set('password', e.target.value)} required style={inp} />

            <select value={form.role} onChange={e => set('role', e.target.value)} style={inp}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>

            {form.role === 'student' && (
              <>
                <input placeholder="Reg No" value={form.reg_no} onChange={e => set('reg_no', e.target.value)} style={inp} />

                <select value={form.year} onChange={e => set('year', e.target.value)} style={inp}>
                  {[1,2,3,4].map(y => <option key={y}>{y}</option>)}
                </select>

                <select value={form.branch} onChange={e => set('branch', e.target.value)} style={inp}>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>

                <select value={form.section} onChange={e => set('section', e.target.value)} style={inp}>
                  {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
                </select>

                <select value={form.semester} onChange={e => set('semester', e.target.value)} style={inp}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s}>{s}</option>)}
                </select>
              </>
            )}
          </div>

          <button type="submit" style={{ ...btn, marginTop: 10 }}>
            Create
          </button>
        </form>
      )}

      {/* ⚠️ OPTIONAL EXCEL UPLOAD */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])} />
        <button onClick={uploadFile} style={{ ...btn, marginLeft: 10 }}>
          Upload Excel
        </button>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select value={filter.role} onChange={e => setFilter(f => ({ ...f, role: e.target.value }))} style={inp}>
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>

        <select value={filter.branch} onChange={e => setFilter(f => ({ ...f, branch: e.target.value }))} style={inp}>
          <option value="">All branches</option>
          {BRANCHES.map(b => <option key={b}>{b}</option>)}
        </select>

        <select value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))} style={inp}>
          <option value="">All years</option>
          {[1,2,3,4].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* USERS TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Name', 'Email', 'Role', 'Reg No', 'Branch', 'CR', 'Action'].map(h => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={td}>{u.name}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>{u.role}</td>
              <td style={td}>{u.reg_no || '-'}</td>
              <td style={td}>{u.branch || '-'}</td>
              <td style={td}>{u.is_cr ? 'Yes' : 'No'}</td>
              <td style={td}>
                {u.role === 'student' && !u.is_cr && (
                  <button onClick={() => assignCR(u.id)} style={btnSmall}>
                    Make CR
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* styles */
const card = { ...surface.card, marginBottom: 20 };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const inp = { ...form.input, padding: 10 };
const btn = { ...buttons.primary, padding: '8px 16px', borderRadius: 8 };
const btnSmall = { ...buttons.success, padding: '6px 12px' };
const th = { ...table.head, padding: 10 };
const td = { ...table.cell, padding: 10 };
