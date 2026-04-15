import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, surface } from '../../theme';

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, professors: 0, students: 0, subjects: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/admin/users?role=student'),
      api.get('/admin/users?role=professor'),
      api.get('/subjects/all'),
    ]).then(([stu, prof, sub]) => {
      setStats({ students: stu.data.length, professors: prof.data.length, subjects: sub.data.length });
    }).catch(() => {});
  }, []);

  const cards = [
    ['Students', stats.students, 'rgba(59,130,246,0.14)', '#60a5fa'],
    ['Professors', stats.professors, 'rgba(34,197,94,0.14)', '#4ade80'],
    ['Subjects', stats.subjects, 'rgba(168,85,247,0.16)', '#c084fc'],
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 8, color: colors.text }}>Overview</h2>
      <p style={{ color: colors.textSoft, marginBottom: 32 }}>System-wide statistics</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {cards.map(([label, val, bg, color]) => (
          <div key={label} style={{ ...surface.card, background: bg, textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 16, color, fontWeight: 600, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
