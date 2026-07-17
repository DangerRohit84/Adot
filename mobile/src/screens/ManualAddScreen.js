import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

export default function ManualAddScreen({ route, navigation }) {
  const { session } = route.params;
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchStudents = async (q) => {
    setSearch(q);
    if (q.length < 2) { setStudents([]); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/session/${session.id}`);
      const all = data.data?.students || [];
      const filtered = all.filter((s) =>
        !s.is_present && (
          s.name?.toLowerCase().includes(q.toLowerCase()) ||
          s.roll_number?.toLowerCase().includes(q.toLowerCase())
        )
      );
      setStudents(filtered);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const markPresent = async (studentId) => {
    try {
      await api.post('/attendance/manual', {
        session_id: session.id,
        student_id: studentId,
        status: 'present',
      });
      Alert.alert('Done', 'Student marked present');
      setStudents(students.filter(s => s.id !== studentId));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Student Manually</Text>
        <Text style={styles.subtitle}>Search by name or roll number</Text>
      </View>

      <TextInput style={styles.search} placeholder="Search student..." value={search} onChangeText={searchStudents} autoCapitalize="none" />

      {loading && <Text style={styles.loading}>Searching...</Text>}

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.roll}>{item.roll_number} • {item.section_name}</Text>
            </View>
            <TouchableOpacity style={styles.markBtn} onPress={() => markPresent(item.id)}>
              <Text style={styles.markBtnText}>Mark Present</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!loading && search.length >= 2 ? <Text style={styles.empty}>No absent students found</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  back: { color: '#6366f1', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  loading: { textAlign: 'center', color: '#94a3b8', marginVertical: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  roll: { fontSize: 13, color: '#6366f1', marginTop: 2 },
  markBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  markBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 },
});
