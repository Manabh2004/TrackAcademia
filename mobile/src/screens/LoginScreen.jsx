import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export default function LoginScreen({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (data.user.role !== 'student') {
        Alert.alert('Use The Website', 'Professor and admin accounts should continue using the web app. The mobile app is now student-only.');
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (e) {
      if (!e.response) {
        Alert.alert(
          'Cannot Reach Backend',
          'The app could not reach your backend server on the current hotspot connection.'
        );
      } else {
        Alert.alert('Login Failed', e.response?.data?.error || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>TrackAcademia</Text>
      <Text style={s.sub}>Academic Management System</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={s.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={s.input}
        secureTextEntry
      />
      <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={login} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <Text style={s.note}>Student accounts are created by the admin on the website.</Text>
      <Text style={s.note}>Professors and admins should continue using the web app.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: '#f1f5f9' },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 4, textAlign: 'center', color: '#1e3a8a' },
  sub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16 },
  btn: { backgroundColor: '#1e3a8a', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  note: { textAlign: 'center', marginTop: 14, fontSize: 12, color: '#64748b' },
});
