import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import api from '../services/api';

export default function AttendanceListScreen({ route, navigation }) {
  const { session } = route.params;
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    try {
      const { data } = await api.get(`/attendance/session/${session.id}`);
      setStudents(data.data?.students || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = students.filter(s => s.is_present).length;
  const absentCount = students.filter(s => !s.is_present).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Attendance List</Text>
        <Text style={styles.subtitle}>{session.subject_name} • {session.section_name}</Text>
      </View>

      <View style={styles.stats}>
        <View style={[styles.statBox, { backgroundColor: '#d1fae5' }]}>
          <Text style={[styles.statNum, { color: '#065f46' }]}>{presentCount}</Text>
          <Text style={[styles.statLabel, { color: '#065f46' }]}>Present</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.statNum, { color: '#991b1b' }]}>{absentCount}</Text>
          <Text style={[styles.statLabel, { color: '#991b1b' }]}>Absent</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#e0e7ff' }]}>
          <Text style={[styles.statNum, { color: '#3730a3' }]}>{students.length}</Text>
          <Text style={[styles.statLabel, { color: '#3730a3' }]}>Total</Text>
        </View>
      </View>

      <TextInput style={styles.search} placeholder="Search by name or roll..." value={search} onChangeText={setSearch} />

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, item.is_present && styles.cardPresent]}>
              <View style={[styles.indicator, item.is_present ? styles.indPresent : styles.indAbsent]} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.roll}>{item.roll_number}</Text>
              </View>
              <Text style={styles.status}>{item.is_present ? 'Present' : 'Absent'}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ManualAdd', { session })}>
        <Text style={styles.addBtnText}>+ Add Manually</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { marginTop: 40, marginBottom: 16 },
  back: { color: '#6366f1', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  loading: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  cardPresent: { borderColor: '#d1fae5' },
  indicator: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  indPresent: { backgroundColor: '#10b981' },
  indAbsent: { backgroundColor: '#ef4444' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  roll: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  status: { fontSize: 13, fontWeight: '600', color: '#6366f1' },
  addBtn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
