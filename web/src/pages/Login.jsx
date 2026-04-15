import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useStore } from '../store';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useStore();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);

      // 🔴 BLOCK STUDENTS FROM WEB
      if (data.user.role === 'student') {
        setError('Students must use the mobile app');
        return;
      }

      login(data.user, data.token);
      navigate(`/${data.user.role}`);

    } catch (e) {
      setError(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#f8fafc' }}>TrackAcademia</h1>
        <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 14 }}>
          Academic Management System
        </p>
        <form onSubmit={submit}>
          <label style={lbl}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            style={inp}
            placeholder="your@email.com"
            autoComplete="email"
          />
          <label style={lbl}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
            style={inp}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {error && (
            <div style={{ background: '#3b1219', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#fca5a5', fontSize: 14 }}>
              {error}
            </div>
          )}
          <button type="submit" style={btn}>Login</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          Contact your administrator if you don't have an account.
        </p>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #020617 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
};

const card = {
  background: 'rgba(15, 23, 42, 0.92)',
  borderRadius: 16,
  padding: 40,
  width: '100%',
  maxWidth: 400,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(14px)',
};

const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 };
const inp = {
  display: 'block',
  width: '100%',
  padding: '11px 14px',
  borderRadius: 8,
  border: '1px solid #334155',
  background: '#020617',
  color: '#f8fafc',
  fontSize: 14,
  marginBottom: 20,
  boxSizing: 'border-box',
  outline: 'none',
};
const btn = {
  width: '100%',
  padding: 14,
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 700,
};
