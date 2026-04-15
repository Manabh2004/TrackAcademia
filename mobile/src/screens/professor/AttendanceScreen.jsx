import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import api from '../../api';

export default function AttendanceScreen() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/subjects/my').then(r => setSubjects(r.data)); }, []);

  const selectSubject = id => {
    setSelected(id);
    api.get(`/users/students?subject_id=${id}`).then(r => {
      setStudents(r.data);
      const init = {};
      r.data.forEach(s => init[s.id] = true);
      setAttendance(init);
    });
  };

  const toggle = id => setAttendance(a => ({ ...a, [id]: !a[id] }));
  const allPresent = () => { const a = {}; students.forEach(s => a[s.id] = true); setAttendance(a); };
  const allAbsent = () => { const a = {}; students.forEach(s => a[s.id] = false); setAttendance(a); };

  const submit = async () => {
    const present_ids = Object.entries(attendance).filter(([,v]) => v).map(([k]) => parseInt(k));
    const absent_ids = Object.entries(attendance).filter(([,v]) => !v).map(([k]) => parseInt(k));
    setLoading(true);
    try {
      await api.post('/attendance/session', { subject_id: selected, date, present_ids, absent_ids });
      Alert.alert('Success', 'Attendance submitted!');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>Upload Attendance</Text>
      <Text style={s.date}>Date: {date}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {subjects.map(sub => (
          <TouchableOpacity key={sub.id} onPress={() => selectSubject(sub.id)} style={[s.chip, selected === sub.id && s.chipActive]}>
            <Text style={{ color: selected === sub.id ? '#fff' : '#1e293b', fontSize: 13 }}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {students.length > 0 && (
        <>
          <View style={s.actions}>
            <TouchableOpacity onPress={allPresent} style={s.actionBtn}><Text style={s.actionText}>All Present</Text></TouchableOpacity>
            <TouchableOpacity onPress={allAbsent} style={[s.actionBtn, { backgroundColor: '#fee2e2' }]}><Text style={[s.actionText, { color: '#dc2626' }]}>All Absent</Text></TouchableOpacity>
            <Text style={{ marginLeft: 'auto', color: '#64748b', fontSize: 13 }}>{Object.values(attendance).filter(Boolean).length}/{students.length}</Text>
          </View>
          {students.map(stu => (
            <View key={stu.id} style={[s.row, { backgroundColor: attendance[stu.id] ? '#f0fdf4' : '#fff1f2' }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.stuName}>{stu.name}</Text>
                <Text style={s.stuReg}>{stu.reg_no}</Text>
              </View>
              <Switch value={!!attendance[stu.id]} onValueChange={() => toggle(stu.id)} trackColor={{ false: '#fca5a5', true: '#86efac' }} thumbColor={attendance[stu.id] ? '#16a34a' : '#dc2626'} />
            </View>
          ))}
          <TouchableOpacity onPress={submit} style={s.submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Submit Attendance</Text>}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginTop: 48, marginBottom: 4 },
  date: { color: '#64748b', marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  chipActive: { backgroundColor: '#2563eb' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  actionBtn: { backgroundColor: '#f0fdf4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  actionText: { color: '#16a34a', fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 8 },
  stuName: { fontWeight: '600', fontSize: 14 },
  stuReg: { fontSize: 12, color: '#64748b', marginTop: 2 },
  submit: { backgroundColor: '#2563eb', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 16, marginBottom: 40 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});