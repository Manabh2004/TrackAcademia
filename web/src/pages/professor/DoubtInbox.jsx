import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, surface, form, buttons } from '../../theme';

export default function DoubtInbox() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => { api.get('/subjects/my').then(r => setSubjects(r.data)); }, []);
  useEffect(() => { if (selected) api.get(`/doubts/subject/${selected}`).then(r => setDoubts(r.data)); }, [selected]);

  const answer = async (id) => {
    if (!answers[id]?.trim()) return;
    await api.patch(`/doubts/${id}/answer`, { answer: answers[id] });
    api.get(`/doubts/subject/${selected}`).then(r => setDoubts(r.data));
  };

  const unanswered = doubts.filter(d => !d.is_answered);
  const answered = doubts.filter(d => d.is_answered);

  return (
    <div>
      <h2 style={{ marginBottom: 24, color: colors.text }}>Student Doubts</h2>
      <select value={selected} onChange={e => setSelected(e.target.value)} style={{ ...inp, marginBottom: 24 }}>
        <option value="">Select subject</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.section})</option>)}
      </select>

      {unanswered.length > 0 && <h3 style={{ marginBottom: 12, color: colors.warning }}>Unanswered ({unanswered.length})</h3>}
      {unanswered.map(d => (
        <div key={d.id} style={{ ...card, borderLeft: '4px solid #f59e0b', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>{d.student?.name}</strong>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{d.student?.reg_no} · {new Date(d.createdAt).toLocaleDateString()}</span>
          </div>
          <p style={{ color: colors.text, marginBottom: 12 }}>{d.question}</p>
          <textarea
            placeholder="Type your answer..."
            value={answers[d.id] || ''}
            onChange={e => setAnswers(a => ({ ...a, [d.id]: e.target.value }))}
            rows={3}
            style={{ ...inp, width: '100%', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }}
          />
          <button onClick={() => answer(d.id)} style={btn}>Submit Answer</button>
        </div>
      ))}

      {answered.length > 0 && (
        <>
          <h3 style={{ margin: '24px 0 12px', color: colors.success }}>Answered ({answered.length})</h3>
          {answered.map(d => (
            <div key={d.id} style={{ ...card, borderLeft: '4px solid #86efac', marginBottom: 12, opacity: 0.8 }}>
              <strong style={{ fontSize: 13 }}>{d.student?.name}</strong>
              <p style={{ color: colors.textSoft, margin: '6px 0' }}>{d.question}</p>
              <p style={{ color: '#16a34a', fontSize: 13 }}>↳ {d.answer}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const card = { ...surface.card };
const inp = { ...form.input };
const btn = { ...buttons.primary, padding: '8px 20px' };
