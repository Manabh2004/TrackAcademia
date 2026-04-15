import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, surface, form, buttons } from '../../theme';

export default function AdminAnnouncements() {
  const [anns, setAnns] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', scope: 'college' });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/admin/announcements').then(r => setAnns(r.data));
  useEffect(() => { load(); }, []);

  const post = async e => {
    e.preventDefault();
    try {
      await api.post('/admin/announcement', form);
      setMsg('Posted!');
      setForm({ title: '', body: '', scope: 'college' });
      load();
    } catch { setMsg('Error posting'); }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ marginBottom: 24, color: colors.text }}>Announcements</h2>
      <div style={card}>
        <h3 style={{ marginBottom: 16, color: colors.text }}>Post New Announcement</h3>
        <form onSubmit={post}>
          <div style={field}><label style={lbl}>Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required style={inp} /></div>
          <div style={field}><label style={lbl}>Body</label><textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required rows={4} style={{ ...inp, resize: 'vertical' }} /></div>
          <button type="submit" style={btn}>Post</button>
          {msg && <span style={{ marginLeft: 12, color: msg.includes('Error') ? colors.danger : colors.success }}>{msg}</span>}
        </form>
      </div>
      <h3 style={{ margin: '24px 0 12px', color: colors.text }}>Past Announcements</h3>
      {anns.map(a => (
        <div key={a.id} style={{ ...card, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{a.title}</strong>
            <span style={{ fontSize: 12, color: colors.textMuted }}>{new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
          <p style={{ marginTop: 8, color: colors.textSoft, lineHeight: 1.6 }}>{a.body}</p>
        </div>
      ))}
    </div>
  );
}

const card = { ...surface.card };
const field = { display: 'flex', flexDirection: 'column', marginBottom: 16 };
const lbl = { ...form.label };
const inp = { ...form.input };
const btn = { ...buttons.primary, padding: '10px 24px' };
