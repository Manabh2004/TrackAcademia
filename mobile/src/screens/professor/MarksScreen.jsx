import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import api from '../../api';

const TYPES = ['attendance', 'assignment', 'surprise_test', 'quiz', 'midterm1', 'midterm2', 'external'];

export default function MarksScreen() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [type, setType] = useState('midterm1');
  const [maxMarks, setMaxMarks] = useState('50');
  const [marks, setMarks] = useState({});
  const [semester, setSemester] = useState('1');

  useEffect(() => { api.get('/subjects/my').then(r => setSubjects(r.data)); }, []);
  useEffect(() => {
    if (selected) {
      api.get(`/users/students?subject_id=${selected}`).then(r => {
        setStudents(r.data);
        const m = {};
        r.data.forEach(s => m[s.id] = '');
        setMarks(m);
      });
    }
  }, [selected]);

  const submit = async () => {
    const entries = Object.entries(marks).filter(([, v]) => v !== '');
    for (const [student_id, mark_val] of entries) {
      await api.post('/marks', { student_id: parseInt(student_id), subject_id: parseInt(selected), semester: parseInt(semester), type, marks: parseFloat(mark_val), max_marks: parseFloat(maxMarks) });
    }
    Alert.alert('Saved', 'Marks saved successfully!');
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>Enter Marks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {subjects.map(sub => (
          <TouchableOpacity key={sub.id} onPress={() => setSelected(sub.id)} style={[s.chip, selected === sub.id && s.chipActive]}>
            <Text style={{ color: selected === sub.id ? '#fff' : '#1e293b', fontSize: 13 }}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {TYPES.map(t => (
          <TouchableOpacity key={t} onPress={() => setType(t)} style={[s.chip, type === t && s.chipActive]}>
            <Text style={{ color: type === t ? '#fff' : '#1e293b', fontSize: 12 }}>{t.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <View style={{ flex: 1 }}><Text style={s.lbl}>Max Marks</Text><TextInput value={maxMarks} onChangeText={setMaxMarks} keyboardType="numeric" style={s.inp} /></View>
        <View style={{ flex: 1 }}><Text style={s.lbl}>Semester</Text><TextInput value={semester} onChangeText={setSemester} keyboardType="numeric" style={s.inp} /></View>
      </View>

      {students.map(stu => (
        <View key={stu.id} style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600' }}>{stu.name}</Text>
            <Text style={{ fontSize: 12, color: '#64748b' }}>{stu.reg_no}</Text>
          </View>
          <TextInput value={marks[stu.id] || ''} onChangeText={v => setMarks(m => ({ ...m, [stu.id]: v }))} keyboardType="numeric" style={[s.inp, { width: 70, textAlign: 'center' }]} placeholder={`/${maxMarks}`} />
        </View>
      ))}

      {students.length > 0 && (
        <TouchableOpacity onPress={submit} style={s.submit}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Save Marks</Text></TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginTop: 48, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  chipActive: { backgroundColor: '#2563eb' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 1 },
  lbl: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  inp: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: '#fff' },
  submit: { backgroundColor: '#2563eb', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 16, marginBottom: 40 },
});