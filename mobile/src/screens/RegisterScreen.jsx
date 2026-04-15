import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import api from '../api';

const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT'];

/* ✅ MOVED OUTSIDE (fixes keyboard issue) */
const Field = ({ label, k, keyboard, secure, placeholder, form, set }) => (
  <View style={s.field}>
    <Text style={s.lbl}>{label}</Text>
    <TextInput
      value={form[k]}
      onChangeText={v => set(k, v)}
      keyboardType={keyboard || 'default'}
      secureTextEntry={!!secure}
      placeholder={placeholder || ''}
      style={s.inp}
      autoCapitalize="none"
    />
  </View>
);

/* ✅ MOVED OUTSIDE (same issue as Field) */
const Pick = ({ label, k, options, form, set }) => (
  <View style={s.field}>
    <Text style={s.lbl}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {options.map(o => (
        <TouchableOpacity
          key={o.v}
          onPress={() => set(k, o.v)}
          style={[s.pill, form[k] === o.v && s.pillActive]}
        >
          <Text style={{ color: form[k] === o.v ? '#fff' : '#1e293b', fontSize: 13 }}>
            {o.l}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    reg_no: '',
    phone: '',
    parent_phone: '',
    year: '1',
    branch: 'CSE',
    section: 'A',
    semester: '1',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.password || !form.reg_no) {
      Alert.alert('Missing fields', 'Please complete the required fields.');
      return;
    }

    try {
      await api.post('/auth/register', {
        ...form,
        year: parseInt(form.year),
        semester: parseInt(form.semester),
      });

      Alert.alert('Success', 'Account created! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.header}>Student Registration</Text>
      <Text style={s.sub}>Professors are added by admin only</Text>

      <Field label="Full Name" k="name" form={form} set={set} />
      <Field label="Email" k="email" keyboard="email-address" form={form} set={set} />
      <Field label="Password" k="password" secure placeholder="Min 6 characters" form={form} set={set} />
      <Field label="Registration Number" k="reg_no" placeholder="e.g. 21CSE045" form={form} set={set} />
      <Field label="Phone" k="phone" keyboard="phone-pad" form={form} set={set} />
      <Field label="Parent's Phone" k="parent_phone" keyboard="phone-pad" form={form} set={set} />

      <Pick label="Year" k="year" form={form} set={set} options={[1,2,3,4].map(y => ({ v: String(y), l: `Year ${y}` }))} />
      <Pick label="Branch" k="branch" form={form} set={set} options={BRANCHES.map(b => ({ v: b, l: b }))} />
      <Pick label="Section" k="section" form={form} set={set} options={['A','B','C','D'].map(s => ({ v: s, l: `Sec ${s}` }))} />
      <Pick label="Semester" k="semester" form={form} set={set} options={[1,2,3,4,5,6,7,8].map(s => ({ v: String(s), l: `Sem ${s}` }))} />

      <TouchableOpacity onPress={submit} style={s.btn}>
        <Text style={s.btnText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', marginTop: 16 }}>
        <Text style={{ color: '#2563eb' }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  header: { fontSize: 26, fontWeight: '800', marginTop: 48, marginBottom: 4 },
  sub: { color: '#64748b', marginBottom: 28, fontSize: 14 },
  field: { marginBottom: 18 },
  lbl: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inp: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 13, fontSize: 15, backgroundColor: '#fff' },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  pillActive: { backgroundColor: '#2563eb' },
  btn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
