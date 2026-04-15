import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe', '#ffedd5'];

export default function TimetableScreen() {
  const [slots, setSlots] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('user').then(u => {
        if (!u) return;
        const parsed = JSON.parse(u);
        setUser(parsed);
        api.get(`/timetable?year=${parsed.year}&branch=${parsed.branch}&section=${parsed.section}`)
          .then(r => { setSlots(r.data.slots); setOverrides(r.data.overrides); })
          .catch(() => {});
      });
    }, [])
  );

  const today = new Date().toISOString().split('T')[0];
  const todayDay = DAYS[new Date().getDay() - 1];

  const getSlotForDay = day => {
    const daySlots = slots.filter(s => s.day === day);
    return daySlots.map(slot => {
      const override = overrides.find(o => o.original_slot_id === slot.id && o.date === today);
      if (override?.action === 'cancel') return { ...slot, cancelled: true };
      return slot;
    });
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.header}>Timetable</Text>
      {DAYS.map((day, i) => {
        const daySlots = getSlotForDay(day);
        return (
          <View key={day} style={[s.dayBlock, day === todayDay && s.todayBlock]}>
            <Text style={[s.dayLabel, day === todayDay && s.todayLabel]}>{day}{day === todayDay ? ' (Today)' : ''}</Text>
            {daySlots.length === 0 ? <Text style={s.noClass}>No classes</Text> : daySlots.map(slot => (
              <View key={slot.id} style={[s.slot, { backgroundColor: slot.cancelled ? '#fee2e2' : COLORS[i % COLORS.length] }, slot.cancelled && { opacity: 0.6 }]}>
                <Text style={s.slotSubject}>{slot.Subject?.name || 'Subject'}{slot.cancelled ? ' (CANCELLED)' : ''}</Text>
                <Text style={s.slotTime}>{slot.start_time} – {slot.end_time}{slot.is_lab ? ' [Lab]' : ''}</Text>
                <Text style={s.slotRoom}>Room: {slot.room}</Text>
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
  dayBlock: { marginBottom: 16 },
  todayBlock: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 8 },
  dayLabel: { fontWeight: '700', fontSize: 14, color: '#64748b', marginBottom: 8 },
  todayLabel: { color: '#2563eb' },
  noClass: { color: '#94a3b8', fontSize: 13, paddingLeft: 4 },
  slot: { borderRadius: 10, padding: 12, marginBottom: 8 },
  slotSubject: { fontWeight: '700', fontSize: 14, color: '#1e293b' },
  slotTime: { fontSize: 13, color: '#475569', marginTop: 2 },
  slotRoom: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
