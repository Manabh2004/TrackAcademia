import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import api from '../../api';

export default function AttendanceScreen() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      api.get('/subjects/for-student')
        .then(r => {
          setSubjects(r.data);
          if (selected) {
            return api.get(`/attendance/my/${selected}`).then(response => setData(response.data));
          }
        })
        .catch(() => {});
    }, [selected])
  );

  const load = async subjectId => {
    setSelected(subjectId);
    setLoading(true);

    try {
      const r = await api.get(`/attendance/my/${subjectId}`);
      setData(r.data);
    } catch {
      setData(null);
    }

    setLoading(false);
  };

  // 🔥 LOGOUT
  return (
    <ScrollView style={s.container}>
      {/* 🔥 HEADER */}
      <View>
        <Text style={s.header}>My Attendance</Text>
      </View>

      {/* 🔴 EMPTY SUBJECTS */}
      {subjects.length === 0 && (
        <Text style={s.empty}>No subjects available</Text>
      )}

      {/* SUBJECT SELECT */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {subjects.map(sub => (
          <TouchableOpacity
            key={sub.id}
            onPress={() => load(sub.id)}
            style={[s.chip, selected === sub.id && s.chipActive]}
          >
            <Text style={{ color: selected === sub.id ? '#fff' : '#1e293b', fontSize: 13 }}>
              {sub.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🔴 NO DATA SELECTED */}
      {!selected && subjects.length > 0 && (
        <Text style={s.empty}>Select a subject to view attendance</Text>
      )}

      {/* 🔴 LOADING */}
      {loading && <Text style={s.empty}>Loading...</Text>}

      {/* 🔴 NO RECORDS */}
      {selected && !loading && !data && (
        <Text style={s.empty}>No attendance data found</Text>
      )}

      {/* ✅ DATA */}
      {data && (
        <View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{data.percentage}%</Text>
            <Text style={s.statLabel}>Attendance</Text>
            <Text style={s.statSub}>
              {data.attended} / {data.total} classes
            </Text>
          </View>

          {data.sessions.map(sess => {
            const rec = data.records.find(r => r.session_id === sess.id);
            const present = rec?.is_present;

            return (
              <View
                key={sess.id}
                style={[
                  s.row,
                  { backgroundColor: present ? '#f0fdf4' : '#fff1f2' },
                ]}
              >
                <Text style={{ flex: 1 }}>
                  Class {sess.class_no} — {sess.date}
                </Text>
                <Text
                  style={{
                    color: present ? '#16a34a' : '#dc2626',
                    fontWeight: '600',
                  }}
                >
                  {present ? 'P' : 'A'}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 48,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#2563eb',
  },
  statCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  statNum: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  statSub: {
    fontSize: 14,
    color: '#94a3b8',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#64748b',
  },
});
