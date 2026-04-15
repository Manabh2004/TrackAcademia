import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import api from '../../api';

export default function DoubtsScreen() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => { api.get('/subjects/my').then(r => setSubjects(r.data)); }, []);
  useEffect(() => { if (selected) api.get(`/doubts/subject/${selected}`).then(r => setDoubts(r.data)); }, [selected]);

  const submit = async id => {
    if (!answers[id]?.trim()) return;
    await api.patch(`/doubts/${id}/answer`, { answer: answers[id] });
    setAnswers(a => ({ ...a, [id]: '' }));
    api.get(`/doubts/subject/${selected}`).then(r => setDoubts(r.data));
    Alert.alert('Answered!');
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>Student Doubts</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {subjects.map(sub => (
          <TouchableOpacity key={sub.id} onPress={() => setSelected(sub.id)} style={[s.chip, selected === sub.id && s.chipActive]}>
            <Text style={{ color: selected === sub.id ? '#fff' : '#1e293b', fontSize: 13 }}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {doubts.filter(d => !d.is_answered).map(d => (
        <View key={d.id} style={[s.card, { borderLeftColor: '#f59e0b' }]}>
          <Text style={s.studentName}>{d.student?.name} <Text style={{ color: '#94a3b8', fontWeight: '400', fontSize: 12 }}>({d.student?.reg_no})</Text></Text>
          <Text style={s.question}>{d.question}</Text>
          <TextInput value={answers[d.id] || ''} onChangeText={t => setAnswers(a => ({ ...a, [d.id]: t }))} placeholder="Type answer..." multiline style={s.input} />
          <TouchableOpacity onPress={() => submit(d.id)} style={s.btn}><Text style={{ color: '#fff', fontWeight: '700' }}>Answer</Text></TouchableOpacity>
        </View>
      ))}

      {doubts.filter(d => d.is_answered).map(d => (
        <View key={d.id} style={[s.card, { borderLeftColor: '#86efac', opacity: 0.7 }]}>
          <Text style={s.studentName}>{d.student?.name}</Text>
          <Text style={s.question}>{d.question}</Text>
          <Text style={{ color: '#16a34a', fontSize: 13, marginTop: 4 }}>↳ {d.answer}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginTop: 48, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  chipActive: { backgroundColor: '#2563eb' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, borderLeftWidth: 4, elevation: 1 },
  studentName: { fontWeight: '700', fontSize: 14, marginBottom: 4 },
  question: { color: '#475569', fontSize: 14, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, minHeight: 70, textAlignVertical: 'top', fontSize: 14, marginBottom: 8 },
  btn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
});