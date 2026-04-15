import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TimetableScreen() {
  const [mySlots, setMySlots] = useState([]);

  useEffect(() => {
    api.get('/subjects/my').then(async r => {
      const subjectIds = r.data.map(s => s.id);
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      const allSlots = await Promise.all(
        r.data.map(sub => api.get(`/timetable?year=${sub.year}&branch=${sub.branch}&section=${sub.section}`).then(res => res.data.slots))
      );
      const flat = allSlots.flat().filter(s => subjectIds.includes(s.subject_id));
      setMySlots(flat);
    });
  }, []);

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>My Schedule</Text>
      <Text style={{ color: '#64748b', marginBottom: 16 }}>All your classes across sections</Text>
      {DAYS.map(day => {
        const daySlots = mySlots.filter(s => s.day === day);
        if (!daySlots.length) return null;
        return (
          <View key={day} style={{ marginBottom: 16 }}>
            <Text style={s.dayLabel}>{day}</Text>
            {daySlots.map(slot => (
              <View key={slot.id} style={s.slot}>
                <Text style={s.subject}>{slot.Subject?.name}</Text>
                <Text style={s.detail}>{slot.start_time} – {slot.end_time} · Room {slot.room}</Text>
                <Text style={s.section}>Y{slot.year} {slot.branch} Sec-{slot.section}{slot.is_lab ? ' [Lab]' : ''}</Text>
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
  header: { fontSize: 22, fontWeight: '700', marginTop: 48, marginBottom: 4 },
  dayLabel: { fontWeight: '700', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  slot: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, elevation: 1 },
  subject: { fontWeight: '700', fontSize: 15, color: '#1e293b' },
  detail: { color: '#64748b', fontSize: 13, marginTop: 4 },
  section: { color: '#2563eb', fontSize: 12, marginTop: 4, fontWeight: '600' },
});