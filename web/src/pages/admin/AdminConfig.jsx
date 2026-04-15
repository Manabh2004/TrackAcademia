import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, surface, form, buttons } from '../../theme';

const DEFAULT_CONFIG = {
  min_attendance_percent: '75',
  total_internal_marks: '50',
  total_external_marks: '100',
  marks_attendance: '5',
  marks_assignment: '5',
  marks_surprise_test: '5',
  marks_quiz: '5',
  marks_midterm1: '15',
  marks_midterm2: '15',
  institute_name: 'My Institute',
  academic_year: '2024-25',
  alert_check_after_n_classes: '5',
};

/* ✅ MOVED OUTSIDE */
function Section({ title, keys, config, set }) {
  return (
    <div style={section}>
      <h3 style={sectionTitle}>{title}</h3>
      <div style={grid2}>
        {keys.map(([key, label]) => (
          <div key={key} style={field}>
            <label style={lbl}>{label}</label>
            <input
              value={config[key] || ''}
              onChange={e => set(key, e.target.value)}
              style={inp}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api
      .get('/admin/config')
      .then(r => setConfig(c => ({ ...c, ...r.data })))
      .catch(() => {});
  }, []);

  const save = async () => {
    try {
      await api.post('/admin/config', config);
      setMsg('Saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Error saving');
    }
  };

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }));

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ marginBottom: 8 }}>Institute Configuration</h2>
      <p style={{ color: colors.textSoft, marginBottom: 32 }}>
        These settings apply globally to the entire application.
      </p>

      <Section
        title="General"
        keys={[
          ['institute_name', 'Institute Name'],
          ['academic_year', 'Academic Year'],
        ]}
        config={config}
        set={set}
      />

      <Section
        title="Attendance"
        keys={[
          ['min_attendance_percent', 'Minimum Attendance %'],
          ['alert_check_after_n_classes', 'Check alert after N classes'],
        ]}
        config={config}
        set={set}
      />

      <Section
        title="Marks Breakdown (Internal)"
        keys={[
          ['total_internal_marks', 'Total Internal Marks'],
          ['total_external_marks', 'Total External Marks'],
          ['marks_attendance', 'Attendance Marks'],
          ['marks_assignment', 'Assignment Marks'],
          ['marks_surprise_test', 'Surprise Test Marks'],
          ['marks_quiz', 'Quiz Marks'],
          ['marks_midterm1', 'Midterm 1 Marks'],
          ['marks_midterm2', 'Midterm 2 Marks'],
        ]}
        config={config}
        set={set}
      />

      <button onClick={save} style={btn}>
        Save Configuration
      </button>

      {msg && (
        <span style={{ marginLeft: 16, color: msg === 'Saved!' ? colors.success : colors.danger }}>
          {msg}
        </span>
      )}
    </div>
  );
}

/* styles */
const section = {
  ...surface.card,
  marginBottom: 24,
};

const sectionTitle = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 16,
  color: colors.text,
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
};

const field = {
  display: 'flex',
  flexDirection: 'column',
};

const lbl = {
  fontSize: 13,
  fontWeight: 600,
  ...form.label,
};

const inp = {
  ...form.input,
};

const btn = {
  ...buttons.primary,
  padding: '12px 32px',
  fontSize: 15,
};
