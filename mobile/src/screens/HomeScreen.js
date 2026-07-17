import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { getUser, clearAuth } from '../utils/storage';
import { getNetworkStatus, getOfflineStats, syncPending } from '../services/syncService';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const interval = loadData();
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    (async () => {
      const u = await getUser();
      setUser(u);
      try {
        const { data } = await api.get('/attendance');
        const active = (data.data || []).filter((s) => s.is_active);
        setActiveSessions(active.length);
      } catch (e) { console.error(e); }
      setIsOnline(getNetworkStatus());
      setPendingCount(getOfflineStats().pending);
    })();
    const interval = setInterval(() => {
      setIsOnline(getNetworkStatus());
      setPendingCount(getOfflineStats().pending);
    }, 3000);
    return interval;
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: async () => { await clearAuth(); navigation.replace('Login'); } }
    ]);
  };

  const handleSync = async () => {
    if (!isOnline) return Alert.alert('Offline', 'No internet connection');
    await syncPending();
    setPendingCount(getOfflineStats().pending);
    Alert.alert('Synced', 'All pending scans uploaded');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Scanner'}</Text>
          <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Network Status */}
      <View style={[styles.netCard, { backgroundColor: isOnline ? '#d1fae5' : '#fee2e2' }]}>
        <Text style={[styles.netText, { color: isOnline ? '#065f46' : '#991b1b' }]}>
          {isOnline ? '🟢 Online' : '🔴 Offline — scans will sync later'}
        </Text>
        {pendingCount > 0 && (
          <TouchableOpacity onPress={handleSync}>
            <Text style={[styles.syncBtn, { color: isOnline ? '#059669' : '#94a3b8' }]}>Sync ({pendingCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: '#6366f1' }]}>
          <Text style={styles.statNumber}>{activeSessions}</Text>
          <Text style={styles.statLabel}>Active Sessions</Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Sessions')}>
        <Text style={styles.scanBtnIcon}>📷</Text>
        <Text style={styles.scanBtnText}>Start Scanning</Text>
        <Text style={styles.scanBtnSub}>Select a session and scan QR codes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportBtn} onPress={() => navigation.navigate('Sessions')}>
        <Text style={styles.exportBtnText}>📊 View Attendance</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 40 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  role: { fontSize: 12, color: '#6366f1', fontWeight: '700', marginTop: 2 },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
  netCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 16 },
  netText: { fontSize: 14, fontWeight: '600' },
  syncBtn: { fontWeight: '700', fontSize: 14 },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 20 },
  statNumber: { fontSize: 36, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 14, color: '#c7d2fe', marginTop: 4 },
  scanBtn: { backgroundColor: '#10b981', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 12 },
  scanBtnIcon: { fontSize: 48, marginBottom: 8 },
  scanBtnText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  scanBtnSub: { fontSize: 14, color: '#d1fae5', marginTop: 4 },
  exportBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  exportBtnText: { fontSize: 16, fontWeight: '700', color: '#475569' },
});
