import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import api from '../../api';

export default function SyllabusScreen() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modules, setModules] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { api.get('/subjects/my').then(r => setSubjects(r.data)); }, []);

  const load = id => {
    setSelected(id);
    api.get(`/syllabus/${id}`).then(r => setModules(r.data));
  };

  const tick = async (topicId, currentVal) => {
    await api.patch(`/syllabus/topic/${topicId}`, {
      is_completed: !currentVal,
      completed_on: new Date().toISOString().split('T')[0],
    });
    load(selected);
  };

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

      {modules.length === 0 && selected && (
        <View style={s.emptyCard}>
          <Text style={{ color: '#64748b', textAlign: 'center' }}>No syllabus uploaded yet.{'\n'}Use the web app to upload and parse the syllabus PDF.</Text>
        </View>
      )}

      {modules.map(mod => {
        const done = mod.topics?.filter(t => t.is_completed).length || 0;
        const total = mod.topics?.length || 0;
        return (
          <View key={mod.id} style={s.card}>
            <TouchableOpacity onPress={() => setExpanded(e => ({ ...e, [mod.id]: !e[mod.id] }))} style={s.modHeader}>
              <Text style={s.modTitle}>Module {mod.module_no}: {mod.title}</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>{done}/{total} ▼</Text>
            </TouchableOpacity>
            {expanded[mod.id] && mod.topics?.map(topic => (
              <TouchableOpacity key={topic.id} onPress={() => tick(topic.id, topic.is_completed)} style={[s.topicRow, topic.is_completed && { backgroundColor: '#f0fdf4' }]}>
                <Text style={{ fontSize: 20, marginRight: 10, color: topic.is_completed ? '#16a34a' : '#cbd5e1' }}>{topic.is_completed ? '✓' : '○'}</Text>
                <Text style={{ flex: 1, color: topic.is_completed ? '#94a3b8' : '#1e293b', textDecorationLine: topic.is_completed ? 'line-through' : 'none' }}>{topic.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginTop: 48, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  chipActive: { backgroundColor: '#2563eb' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 1 },
  modHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  modTitle: { fontWeight: '700', fontSize: 14, flex: 1 },
  topicRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingLeft: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center' },
});