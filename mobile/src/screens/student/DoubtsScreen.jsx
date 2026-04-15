import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import api from '../../api';

export default function DoubtsScreen() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [question, setQuestion] = useState('');
  const [doubts, setDoubts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      api.get('/subjects/for-student')
        .then(r => setSubjects(r.data))
        .catch(() => {});

      api.get('/doubts/my')
        .then(r => setDoubts(r.data))
        .catch(() => {});
    }, [])
  );

  const submit = async () => {
    if (!question.trim() || !selected) return;
    await api.post('/doubts', { subject_id: selected, question });
    setQuestion('');
    const refreshed = await api.get('/doubts/my');
    setDoubts(refreshed.data);
    Alert.alert('Submitted', 'Your doubt has been submitted!');
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>Ask a Doubt</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {subjects.map(sub => (
          <TouchableOpacity key={sub.id} onPress={() => setSelected(sub.id)} style={[s.chip, selected === sub.id && s.chipActive]}>
            <Text style={{ color: selected === sub.id ? '#fff' : '#1e293b', fontSize: 13 }}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TextInput value={question} onChangeText={setQuestion} placeholder="Type your doubt here..." multiline numberOfLines={4} style={s.input} />
      <TouchableOpacity style={s.btn} onPress={submit}><Text style={s.btnText}>Submit</Text></TouchableOpacity>
      <Text style={[s.header, { fontSize: 18, marginTop: 24 }]}>My Doubts</Text>
      {doubts.map(d => (
        <View key={d.id} style={s.card}>
          <Text style={{ fontWeight: '600' }}>{d.question}</Text>
          {d.is_answered ? <Text style={{ color: '#16a34a', marginTop: 8 }}>Answer: {d.answer}</Text> : <Text style={{ color: '#f59e0b', marginTop: 4, fontSize: 13 }}>Pending answer...</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16, marginTop: 48 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  chipActive: { backgroundColor: '#2563eb' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top', backgroundColor: '#fff', marginBottom: 12 },
  btn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1 },
});
