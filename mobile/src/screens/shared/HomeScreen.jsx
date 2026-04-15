import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api';

export default function HomeScreen({ setUser, subjectRoute, user }) {
  const [subjectCount, setSubjectCount] = useState(0);
  const [health, setHealth] = useState('Checking backend...');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      Promise.all([
        api.get(subjectRoute).catch(() => ({ data: [] })),
        api.get('/health').catch(() => null),
      ]).then(([subjectsResponse, healthResponse]) => {
        if (!active) return;
        setSubjectCount(Array.isArray(subjectsResponse?.data) ? subjectsResponse.data.length : 0);
        setHealth(healthResponse?.data?.ok ? 'Backend connected' : 'Backend not reachable');
      });

      return () => {
        active = false;
      };
    }, [subjectRoute])
  );

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>TrackAcademia</Text>
      <Text style={s.subtitle}>Student workspace</Text>

      <View style={s.hero}>
        <Text style={s.heroName}>{user?.name || 'Welcome'}</Text>
        <Text style={s.heroMeta}>{user?.branch || 'General'}{user?.section ? ` - Sec ${user.section}` : ''}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Overview</Text>
        <Text style={s.stat}>Assigned subjects: {subjectCount}</Text>
        <Text style={s.stat}>Connection: {health}</Text>
        <Text style={s.help}>Everything here reflects what professors publish from the website.</Text>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 48, paddingBottom: 36 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e3a8a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 20 },
  hero: { backgroundColor: '#1e3a8a', borderRadius: 18, padding: 20, marginBottom: 16 },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroMeta: { color: '#dbeafe', marginTop: 6, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  stat: { color: '#334155', marginBottom: 8, fontSize: 14 },
  help: { color: '#64748b', fontSize: 13, marginBottom: 12 },
  logoutBtn: { borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff1f2', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutText: { color: '#be123c', fontWeight: '700' },
});
