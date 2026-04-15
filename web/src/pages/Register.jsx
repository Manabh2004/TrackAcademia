import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', reg_no: '', phone: '', parent_phone: '', year: '1', branch: 'CSE', section: 'A', semester: '1' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { ...form, year: parseInt(form.year), semester: parseInt(form.semester) });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed');
    }
  };

  if (success) return <div style={wrap}><div style={card}><h2 style={{ color: '#16a34a' }}>Registered! Redirecting to login...</h2></div></div>;

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ marginBottom: 8 }}>Student Registration</h2>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Professors and admins are added by admin only. <Link to="/login">Already have an account?</Link></p>
        <form onSubmit={submit}>
          <div style={row2}>
            <div style={field}>
              <label style={lbl}>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required style={inp} placeholder="Your full name" />
            </div>
            <div style={field}>
              <label style={lbl}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required style={inp} placeholder="college@email.com" />
            </div>
          </div>
          <div style={row2}>
            <div style={field}>
              <label style={lbl}>Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required style={inp} placeholder="Min 6 characters" />
            </div>
            <div style={field}>
              <label style={lbl}>Registration Number</label>
              <input value={form.reg_no} onChange={e => set('reg_no', e.target.value)} required style={inp} placeholder="e.g. 21CSE045" />
            </div>
          </div>
          <div style={row2}>
            <div style={field}>
              <label style={lbl}>Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} style={inp} placeholder="Your phone number" />
            </div>
            <div style={field}>
              <label style={lbl}>Parent's Phone</label>
              <input value={form.parent_phone} onChange={e => set('parent_phone', e.target.value)} style={inp} placeholder="Parent's phone number" />
            </div>
          </div>
          <div style={row3}>
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
                {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            <div style={field}>
              <label style={lbl}>Semester</label>
              <select value={form.semester} onChange={e => set('semester', e.target.value)} style={inp}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
          </div>
          {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}
          <button type="submit" style={btnPrimary}>Create Account</button>
        </form>
      </div>
    </div>
  );
}

const wrap = { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 };
const card = { background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 700, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' };
const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 };
const row3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 };
const field = { display: 'flex', flexDirection: 'column' };
const lbl = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inp = { padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' };
const btnPrimary = { width: '100%', padding: 14, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600 };