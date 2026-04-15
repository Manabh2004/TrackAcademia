import { useState, useEffect } from 'react';
import api from '../../api';
import { useStore } from '../../store';
import { colors, surface, form, buttons } from '../../theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TimetableView() {
  const { user } = useStore();
  const [subjects, setSubjects] = useState([]);
  const [slots, setSlots] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showOverride, setShowOverride] = useState(null);
  const [form, setForm] = useState({ subject_id: '', day: 'Mon', start_time: '09:00', end_time: '10:00', room: '', is_lab: false, year: user?.year || 1, branch: user?.branch || 'CSE', section: 'A' });
  const [overrideForm, setOverrideForm] = useState({ action: 'cancel', date: '', new_day: 'Mon', new_start_time: '', new_end_time: '', new_room: '', note: '' });
  const [msg, setMsg] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSection, setFilterSection] = useState('');

  useEffect(() => { api.get('/subjects/my').then(r => setSubjects(r.data)); }, []);

  const loadSlots = () => {
    const params = new URLSearchParams({ year: filterYear, branch: filterBranch, section: filterSection });
    api.get(`/timetable?${params}`).then(r => setSlots(r.data.slots));
  };

  useEffect(() => { if (filterYear && filterBranch && filterSection) loadSlots(); }, [filterYear, filterBranch, filterSection]);

  const addSlot = async e => {
    e.preventDefault();
    try {
      await api.post('/timetable/slot', { ...form, year: parseInt(form.year), is_lab: !!form.is_lab });
      setMsg('Slot added!');
      setShowAdd(false);
      loadSlots();
    } catch (e) { setMsg('Error: ' + e.response?.data?.error); }
  };

  const addOverride = async e => {
    e.preventDefault();
    try {
      await api.post('/timetable/override', { ...overrideForm, original_slot_id: showOverride, subject_id: slots.find(s => s.id === showOverride)?.subject_id });
      setMsg('Override saved and students notified!');
      setShowOverride(null);
      loadSlots();
    } catch (e) { setMsg('Error: ' + e.response?.data?.error); }
  };

  const deleteSlot = async id => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await api.delete(`/timetable/slot/${id}`);
      loadSlots();
    } catch (e) { setMsg('Error: ' + e.response?.data?.error); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: colors.text }}>Timetable</h2>
        <button onClick={() => setShowAdd(s => !s)} style={btn}>{showAdd ? 'Cancel' : '+ Add Slot'}</button>
      </div>

      {msg && <p style={{ color: msg.includes('Error') ? colors.danger : colors.success, marginBottom: 12 }}>{msg}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={inp}>
          <option value="">Year</option>
          {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} style={inp}>
          <option value="">Branch</option>
          {['CSE','ECE','ME','CE','EEE','IT'].map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={inp}>
          <option value="">Section</option>
          {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {showAdd && (
        <form onSubmit={addSlot} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Add Timetable Slot</h3>
          <div style={grid3}>
            <div style={field}><label style={lbl}>Subject</label>
              <select value={form.subject_id} onChange={e => set('subject_id', e.target.value)} required style={inp}>
                <option value="">Select</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={field}><label style={lbl}>Day</label>
              <select value={form.day} onChange={e => set('day', e.target.value)} style={inp}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={field}><label style={lbl}>Start Time</label><input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} required style={inp} /></div>
            <div style={field}><label style={lbl}>End Time</label><input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} required style={inp} /></div>
            <div style={field}><label style={lbl}>Room</label><input value={form.room} onChange={e => set('room', e.target.value)} style={inp} placeholder="e.g. A101" /></div>
            <div style={field}><label style={lbl}>Year</label>
              <select value={form.year} onChange={e => set('year', e.target.value)} style={inp}>{[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}</select>
            </div>
            <div style={field}><label style={lbl}>Branch</label>
              <select value={form.branch} onChange={e => set('branch', e.target.value)} style={inp}>{['CSE','ECE','ME','CE','EEE','IT'].map(b => <option key={b} value={b}>{b}</option>)}</select>
            </div>
            <div style={field}><label style={lbl}>Section</label>
              <select value={form.section} onChange={e => set('section', e.target.value)} style={inp}>{['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <div style={field}><label style={lbl}>Lab (3 slots)?</label>
              <input type="checkbox" checked={form.is_lab} onChange={e => set('is_lab', e.target.checked)} style={{ marginTop: 10 }} />
            </div>
          </div>
          <button type="submit" style={{ ...btn, marginTop: 12 }}>Add Slot</button>
        </form>
      )}

      {showOverride !== null && (
        <form onSubmit={addOverride} style={{ ...card, marginBottom: 24, border: '2px solid #f59e0b' }}>
          <h3 style={{ marginBottom: 16 }}>Modify Slot</h3>
          <div style={grid3}>
            <div style={field}><label style={lbl}>Action</label>
              <select value={overrideForm.action} onChange={e => setOverrideForm(f => ({ ...f, action: e.target.value }))} style={inp}>
                <option value="cancel">Cancel class</option>
                <option value="reschedule">Reschedule</option>
                <option value="extra">Add extra class</option>
              </select>
            </div>
            <div style={field}><label style={lbl}>Date</label><input type="date" value={overrideForm.date} onChange={e => setOverrideForm(f => ({ ...f, date: e.target.value }))} required style={inp} /></div>
            {overrideForm.action !== 'cancel' && <>
              <div style={field}><label style={lbl}>New Day</label>
                <select value={overrideForm.new_day} onChange={e => setOverrideForm(f => ({ ...f, new_day: e.target.value }))} style={inp}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select>
              </div>
              <div style={field}><label style={lbl}>New Start</label><input type="time" value={overrideForm.new_start_time} onChange={e => setOverrideForm(f => ({ ...f, new_start_time: e.target.value }))} style={inp} /></div>
              <div style={field}><label style={lbl}>New End</label><input type="time" value={overrideForm.new_end_time} onChange={e => setOverrideForm(f => ({ ...f, new_end_time: e.target.value }))} style={inp} /></div>
              <div style={field}><label style={lbl}>New Room</label><input value={overrideForm.new_room} onChange={e => setOverrideForm(f => ({ ...f, new_room: e.target.value }))} style={inp} /></div>
            </>}
            <div style={field}><label style={lbl}>Note to students</label><input value={overrideForm.note} onChange={e => setOverrideForm(f => ({ ...f, note: e.target.value }))} style={inp} placeholder="Optional note" /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" style={btn}>Save & Notify</button>
            <button type="button" onClick={() => setShowOverride(null)} style={{ ...btn, background: '#64748b' }}>Cancel</button>
          </div>
        </form>
      )}

      {DAYS.map(day => {
        const daySlots = slots.filter(s => s.day === day);
        if (daySlots.length === 0) return null;
        return (
          <div key={day} style={{ marginBottom: 16 }}>
            <h3 style={{ color: '#64748b', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{day}</h3>
            {daySlots.map(slot => (
              <div key={slot.id} style={{ ...card, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <strong>{slot.Subject?.name || 'Subject'}</strong>{slot.is_lab ? <span style={{ marginLeft: 6, fontSize: 12, background: '#fef9c3', padding: '1px 6px', borderRadius: 4 }}>Lab</span> : null}
                  <span style={{ color: '#64748b', marginLeft: 12, fontSize: 13 }}>{slot.start_time} – {slot.end_time}</span>
                  {slot.room && <span style={{ color: '#94a3b8', marginLeft: 8, fontSize: 13 }}>· {slot.room}</span>}
                </div>
                <button onClick={() => setShowOverride(slot.id)} style={{ ...btn, padding: '6px 12px', background: '#f59e0b', marginRight: 8 }}>Modify</button>
                <button onClick={() => deleteSlot(slot.id)} style={{ ...btn, padding: '6px 12px', background: '#ef4444' }}>Delete</button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

const card = { ...surface.card };
const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 };
const field = { display: 'flex', flexDirection: 'column' };
const lbl = { ...form.label };
const inp = { ...form.input };
const btn = { ...buttons.primary };
