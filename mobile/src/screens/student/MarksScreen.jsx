import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api';

export default function MarksScreen() {
  const [marks, setMarks] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const u = JSON.parse(await AsyncStorage.getItem('user'));
        const [m, s] = await Promise.all([
          api.get(`/marks/student/${u.id}?semester=${u.semester || 1}`),
          api.get('/subjects/for-student'),
        ]);
        setMarks(m.data);
        setSubjects(s.data);
      };

      load().catch(() => {});
    }, [])
  );

  const getSubjectName = id => subjects.find(s => s.id === id)?.name || `Subject ${id}`;

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>My Marks</Text>
      {marks && Object.entries(marks.grouped).map(([subjId, types]) => (
        <View key={subjId} style={s.card}>
          <Text style={s.subjectTitle}>{getSubjectName(parseInt(subjId))}</Text>
          {Object.entries(types).map(([type, val]) => (
            <View key={type} style={s.row}>
              <Text style={s.type}>{type.replace(/_/g, ' ')}</Text>
              <Text style={s.mark}>{val.marks} / {val.max}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16, marginTop: 48 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  subjectTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#1e293b' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  type: { textTransform: 'capitalize', color: '#64748b' },
  mark: { fontWeight: '600', color: '#1e293b' },
});
