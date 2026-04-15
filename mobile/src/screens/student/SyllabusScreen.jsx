import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import api from '../../api';

export default function SyllabusScreen() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modules, setModules] = useState([]);
  const [expanded, setExpanded] = useState({});

  useFocusEffect(
    useCallback(() => {
      api.get('/subjects/for-student')
        .then(r => {
          setSubjects(r.data);
          if (selected) return api.get(`/syllabus/${selected}`).then(response => setModules(response.data));
        })
        .catch(() => {});
    }, [selected])
  );

  const load = id => {
    setSelected(id);
    api.get(`/syllabus/${id}`).then(r => setModules(r.data));
  };

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>Syllabus</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {subjects.map(sub => (
          <TouchableOpacity key={sub.id} onPress={() => load(sub.id)} style={[s.chip, selected === sub.id && s.chipActive]}>
            <Text style={{ color: selected === sub.id ? '#fff' : '#1e293b', fontSize: 13 }}>{sub.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {modules.map(mod => {
        const done = mod.topics?.filter(t => t.is_completed).length;
        const total = mod.topics?.length;
        return (
          <View key={mod.id} style={s.card}>
            <TouchableOpacity onPress={() => toggle(mod.id)} style={s.modHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.modTitle}>Module {mod.module_no}: {mod.title}</Text>
                <Text style={s.modSub}>{done}/{total} topics covered</Text>
              </View>
              <Text style={{ fontSize: 18, color: '#94a3b8' }}>{expanded[mod.id] ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <View style={s.progress}>
              <View style={[s.progressFill, { width: total ? `${(done / total) * 100}%` : '0%' }]} />
            </View>
            {expanded[mod.id] && mod.topics?.map(topic => (
              <View key={topic.id} style={[s.topicRow, topic.is_completed && s.topicDone]}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>{topic.is_completed ? '✓' : '○'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: topic.is_completed ? '#64748b' : '#1e293b', textDecorationLine: topic.is_completed ? 'line-through' : 'none' }}>{topic.title}</Text>
                  {topic.is_completed && <Text style={{ fontSize: 11, color: '#94a3b8' }}>Covered on {topic.completed_on}</Text>}
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16, marginTop: 48 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  chipActive: { backgroundColor: '#2563eb' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 1 },
  modHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  modTitle: { fontWeight: '700', fontSize: 14, color: '#1e293b' },
  modSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  progress: { height: 4, backgroundColor: '#e2e8f0', marginHorizontal: 14, borderRadius: 2, marginBottom: 4 },
  progressFill: { height: 4, backgroundColor: '#2563eb', borderRadius: 2 },
  topicRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, paddingLeft: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  topicDone: { backgroundColor: '#f8fafc' },
});
