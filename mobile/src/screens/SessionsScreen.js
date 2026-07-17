import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

export default function SessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    try {
      const { data } = await api.get('/attendance');
      setSessions(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const activeSessions = sessions.filter(s => s.is_active);
  const pastSessions = sessions.filter(s => !s.is_active);

  const renderSession = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_active && styles.cardInactive]}
      onPress={() => item.is_active && navigation.navigate('Scanner', { session: item })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeDone]}>
          <Text style={styles.badgeText}>{item.is_active ? 'Active' : 'Done'}</Text>
        </View>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.subject}>{item.subject_name || 'Session'}</Text>
      <Text style={styles.section}>{item.section_name}</Text>
      {item.room_number ? <Text style={styles.room}>📍 {item.room_number}</Text> : null}
      <Text style={styles.time}>Period {item.start_period}-{item.end_period} • {item.start_time}-{item.end_time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sessions</Text>
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : activeSessions.length === 0 && pastSessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No sessions yet</Text>
        </View>
      ) : (
        <FlatList
          data={[...activeSessions, ...pastSessions]}
          renderItem={renderSession}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 20, marginTop: 40 },
  loading: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeActive: { backgroundColor: '#d1fae5' },
  badgeDone: { backgroundColor: '#e2e8f0' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#065f46' },
  date: { fontSize: 12, color: '#94a3b8' },
  subject: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  section: { fontSize: 14, color: '#6366f1', fontWeight: '600', marginTop: 2 },
  room: { fontSize: 13, color: '#059669', fontWeight: '600', marginTop: 2 },
  time: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 64, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#94a3b8' },
});
