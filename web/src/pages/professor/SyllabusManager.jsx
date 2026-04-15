import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, surface, form, buttons } from '../../theme';

export default function SyllabusManager() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [modules, setModules] = useState([]);

  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // 🔥 manual input states
  const [manualModule, setManualModule] = useState('');
  const [manualTopics, setManualTopics] = useState('');

  useEffect(() => {
    api.get('/subjects/my').then(r => setSubjects(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedSubject) loadSyllabus();
  }, [selectedSubject]);

  const loadSyllabus = () =>
    api.get(`/syllabus/${selectedSubject}`).then(r => setModules(r.data));

  // 🔥 AI PARSE
  const parseSyllabus = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append('subject_id', selectedSubject);

    if (file) fd.append('pdf', file);
    else fd.append('raw_text', rawText);

    try {
      await api.post('/syllabus/parse', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('Syllabus parsed and saved!');
      setFile(null);
      setRawText('');
      loadSyllabus();
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.error || e.message));
    }

    setLoading(false);
  };

  // 🔥 MANUAL ADD
  const addManualSyllabus = async () => {
    if (!manualModule.trim()) {
      setMsg('Module title required');
      return;
    }

    try {
      const topicsArray = manualTopics
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      await api.post('/syllabus/manual', {
        subject_id: selectedSubject,
        module_title: manualModule,
        topics: topicsArray,
      });

      setMsg('Manual syllabus added!');
      setManualModule('');
      setManualTopics('');
      loadSyllabus();
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  // 🔥 TICK TOPIC
  const tickTopic = async (topicId, is_completed, class_no) => {
    await api.patch(`/syllabus/topic/${topicId}`, {
      is_completed,
      completed_on: new Date().toISOString().split('T')[0],
      completed_class_no: class_no,
    });
    loadSyllabus();
  };

  return (
    <div>
      <h2 style={{ color: colors.text }}>Syllabus Manager</h2>

      {/* SUBJECT SELECT */}
      <select
        value={selectedSubject}
        onChange={e => setSelectedSubject(e.target.value)}
        style={{ ...form.input, borderRadius: 8, marginBottom: 24 }}
      >
        <option value="">Select subject</option>
        {subjects.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* EMPTY STATE */}
      {subjects.length === 0 && (
        <p style={{ color: colors.textSoft }}>
          No subjects assigned yet.
        </p>
      )}

      {/* AI UPLOAD */}
      {selectedSubject && modules.length === 0 && (
        <div style={{ ...surface.card, marginBottom: 24 }}>
          <h3 style={{ color: colors.text }}>Upload Syllabus (AI)</h3>

          <input
            type="file"
            accept=".pdf"
            onChange={e => setFile(e.target.files[0])}
            style={{ marginBottom: 12 }}
          />

          <p style={{ color: colors.textSoft }}>Or paste raw text:</p>

          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            rows={6}
            style={{ ...form.input, width: '100%', minHeight: 160 }}
          />

          <button
            onClick={parseSyllabus}
            disabled={loading}
            style={{ ...buttons.primary, marginTop: 12 }}
          >
            {loading ? 'Parsing...' : 'Parse with AI'}
          </button>
        </div>
      )}

      {/* 🔥 MANUAL ENTRY */}
      {selectedSubject && (
        <div style={{ ...surface.card, marginBottom: 24 }}>
          <h3 style={{ color: colors.text }}>Manual Entry</h3>

          <input
            placeholder="Module Title (e.g. Module 1: DBMS Basics)"
            value={manualModule}
            onChange={e => setManualModule(e.target.value)}
            style={{ ...form.input, marginBottom: 10 }}
          />

          <textarea
            placeholder={`Enter topics (one per line)\nExample:\nIntroduction\nER Model\nRelational Model`}
            value={manualTopics}
            onChange={e => setManualTopics(e.target.value)}
            rows={6}
            style={{ ...form.input, width: '100%', minHeight: 120 }}
          />

          <button
            onClick={addManualSyllabus}
            style={{ ...buttons.primary, marginTop: 10 }}
          >
            Add Module
          </button>
        </div>
      )}

      {/* MODULE LIST */}
      {modules.map(mod => (
        <div
          key={mod.id}
          style={{
            ...surface.card,
            marginBottom: 16,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: mod.is_completed
                ? colors.successSoft
                : 'rgba(15, 23, 42, 0.96)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <input
              type="checkbox"
              checked={mod.is_completed}
              onChange={async e => {
                await api.patch(`/syllabus/module/${mod.id}`, {
                  is_completed: e.target.checked,
                });
                loadSyllabus();
              }}
            />

            <strong style={{ color: colors.text }}>
              Module {mod.module_no}: {mod.title}
            </strong>

            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: colors.textSoft,
              }}
            >
              {mod.topics?.filter(t => t.is_completed).length}/
              {mod.topics?.length} topics
            </span>
          </div>

          <div style={{ padding: '8px 16px' }}>
            {mod.topics?.map(topic => (
              <div
                key={topic.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(36, 50, 77, 0.7)',
                }}
              >
                <input
                  type="checkbox"
                  checked={topic.is_completed}
                  onChange={e =>
                    tickTopic(
                      topic.id,
                      e.target.checked,
                      mod.module_no
                    )
                  }
                />

                <span
                  style={{
                    textDecoration: topic.is_completed
                      ? 'line-through'
                      : 'none',
                    color: topic.is_completed
                      ? colors.textMuted
                      : colors.text,
                    flex: 1,
                  }}
                >
                  {topic.title}
                </span>

                {topic.is_completed && (
                  <span
                    style={{
                      fontSize: 11,
                      color: colors.textSoft,
                    }}
                  >
                    {topic.completed_on}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* MESSAGE */}
      {msg && (
        <p
          style={{
            color: msg.includes('Error')
              ? colors.danger
              : colors.success,
            marginTop: 12,
          }}
        >
          {msg}
        </p>
      )}
    </div>
  );
}