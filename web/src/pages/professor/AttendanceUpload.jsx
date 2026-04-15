import { useState, useEffect } from 'react';
import api from '../../api';
import { colors, surface, form, buttons, table } from '../../theme';

export default function AttendanceUpload() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState('list'); // list | absentees | image
  const [absenteeInput, setAbsenteeInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [sheet, setSheet] = useState([]);
  const [sheetLoading, setSheetLoading] = useState(false);

  useEffect(() => {
    api.get('/subjects/my').then(r => setSubjects(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    api.get(`/users/students?subject_id=${selectedSubject}`).then(r => {
      setStudents(r.data);
      const init = {};
      r.data.forEach(s => init[s.id] = true);
      setAttendance(init);
    });
  }, [selectedSubject]);

  const toggleStudent = id => setAttendance(a => ({ ...a, [id]: !a[id] }));

  const handleOCR = async () => {
    if (!imageFile) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async e => {
      const base64 = e.target.result.split(',')[1];
      try {
        const r = await api.post('/attendance/ocr', { image_base64: base64, subject_id: selectedSubject });
        setOcrResult(r.data);
        // Pre-fill attendance based on OCR
        const newAtt = {};
        students.forEach(s => {
          newAtt[s.id] = r.data.present_reg_nos.includes(s.reg_no);
        });
        setAttendance(newAtt);
      } catch { setMsg('OCR failed, please fill manually'); }
      setLoading(false);
    };
    reader.readAsDataURL(imageFile);
  };

  const submit = async () => {
    const present_ids = Object.entries(attendance).filter(([, v]) => v).map(([k]) => parseInt(k));
    const absent_ids = Object.entries(attendance).filter(([, v]) => !v).map(([k]) => parseInt(k));
    try {
      await api.post('/attendance/session', { subject_id: selectedSubject, date, present_ids, absent_ids });
      setMsg('Attendance submitted!');
      loadSheet();
    } catch (e) {
      setMsg('Error: ' + e.response?.data?.error);
    }
  };

  const loadSheet = async () => {
    if (!selectedSubject) return;
    setSheetLoading(true);
    try {
      const { data } = await api.get(`/attendance/sheet/${selectedSubject}`);
      setSheet(data);
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.error || 'Failed to load attendance sheet'));
    } finally {
      setSheetLoading(false);
    }
  };

  const downloadSheet = async () => {
    if (!selectedSubject) return;
    const selected = subjects.find(s => String(s.id) === String(selectedSubject));

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        year: String(selected?.year ?? ''),
        branch: selected?.branch ?? '',
        section: selected?.section ?? '',
      });

      const url = `${
        import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      }/reports/semester-sheet/${selectedSubject}?${params}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Download failed');
      }

      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `attendance_subject_${selectedSubject}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  };

  const sessionStudentCount = students.length || 0;

  return (
    <div>
      <h2 style={{ color: colors.text }}>Upload Attendance</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={sel}>
          <option value="">Select subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.section})</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={sel} />
        <select value={mode} onChange={e => setMode(e.target.value)} style={sel}>
          <option value="list">Tick list</option>
          <option value="absentees">Enter absentees</option>
          <option value="image">Upload image (OCR)</option>
        </select>
      </div>

      {mode === 'list' && students.length > 0 && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => { const a = {}; students.forEach(s => a[s.id] = true); setAttendance(a); }} style={btn2}>All Present</button>
            <button onClick={() => { const a = {}; students.forEach(s => a[s.id] = false); setAttendance(a); }} style={{ ...btn2, marginLeft: 8 }}>All Absent</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', ...surface.card }}>
            <thead><tr>{['Reg No', 'Name', 'Present'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} style={{ background: attendance[s.id] ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
                  <td style={td}>{s.reg_no}</td>
                  <td style={td}>{s.name}</td>
                  <td style={td}><input type="checkbox" checked={!!attendance[s.id]} onChange={() => toggleStudent(s.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'absentees' && (
        <div>
          <p>Enter last 3 digits of reg no of absentees, comma-separated:</p>
          <input value={absenteeInput} onChange={e => setAbsenteeInput(e.target.value)} placeholder="e.g. 012, 045, 103" style={{ ...sel, width: '100%' }} />
          <button style={{ ...btn2, marginTop: 8 }} onClick={() => {
            const digits = absenteeInput.split(',').map(d => d.trim());
            const newAtt = {};
            students.forEach(s => {
              const last3 = s.reg_no?.slice(-3);
              newAtt[s.id] = !digits.includes(last3);
            });
            setAttendance(newAtt);
          }}>Apply</button>
        </div>
      )}

      {mode === 'image' && (
        <div>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
          <button onClick={handleOCR} style={{ ...btn2, marginLeft: 8 }} disabled={loading}>
            {loading ? 'Processing...' : 'Parse with AI'}
          </button>
          {ocrResult && <pre style={{ ...surface.mutedCard, fontSize: 12, overflowX: 'auto' }}>{JSON.stringify(ocrResult, null, 2)}</pre>}
        </div>
      )}

      {selectedSubject && students.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <p style={{ color: colors.textSoft }}>Present: {Object.values(attendance).filter(Boolean).length} / {students.length}</p>
          <button onClick={submit} style={btnPrimary}>Submit Attendance</button>
          <button onClick={loadSheet} style={{ ...btn2, marginLeft: 10 }}>
            {sheetLoading ? 'Loading Sheet...' : 'Show Attendance Sheet'}
          </button>
          <button onClick={downloadSheet} style={{ ...buttons.secondary, marginLeft: 10 }}>
            Download Spreadsheet
          </button>
        </div>
      )}

      {sheet.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ color: colors.text, marginBottom: 12 }}>Master Attendance Sheet</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', ...surface.card }}>
              <thead>
                <tr>
                  <th style={th}>Reg No</th>
                  <th style={th}>Name</th>
                  {sheet.map(session => (
                    (() => {
                      const totalStudents = session.records?.length ?? 0;
                      const presentStudents = session.records?.filter(record => record.is_present).length ?? 0;

                      return (
                        <th key={session.id} style={th}>
                          <div>C{session.class_no}</div>
                          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>{session.date}</div>
                          <div style={{ fontSize: 11, color: colors.textSoft, marginTop: 6 }}>
                            {presentStudents}/{totalStudents}
                          </div>
                        </th>
                      );
                    })()
                  ))}
                  <th style={th}>Attended</th>
                  <th style={th}>%</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const records = sheet.map(session =>
                    session.records?.find(record => record.student_id === student.id)
                  );
                  const attended = records.filter(record => record?.is_present).length;
                  const percentage = sheet.length ? ((attended / sheet.length) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={student.id}>
                      <td style={td}>{student.reg_no}</td>
                      <td style={td}>{student.name}</td>
                      {records.map((record, index) => (
                        <td
                          key={`${student.id}-${sheet[index].id}`}
                          style={{
                            ...td,
                            textAlign: 'center',
                            color: record?.is_present ? colors.success : colors.danger,
                            fontWeight: 700,
                          }}
                        >
                          {record?.is_present ? 'P' : 'A'}
                        </td>
                      ))}
                      <td style={td}>{attended}</td>
                      <td style={td}>{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {msg && <p style={{ color: msg.includes('Error') ? colors.danger : colors.success, marginTop: 12 }}>{msg}</p>}
    </div>
  );
}

const sel = { ...form.input, borderRadius: 8 };
const btn2 = { ...buttons.secondary, padding: '6px 14px', borderRadius: 8 };
const th = { ...table.head };
const td = { ...table.cell };
const btnPrimary = { ...buttons.primary, padding: '10px 24px', fontSize: 15 };
