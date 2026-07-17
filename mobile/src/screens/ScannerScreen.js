import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../services/api';
import { addPendingScan, getNetworkStatus, getOfflineStats } from '../services/syncService';

export default function ScannerScreen({ route, navigation }) {
  const { session } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [showResult, setShowResult] = useState<any>(null);
  const [counts, setCounts] = useState({ present: 0, duplicate: 0, error: 0 });
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!permission) requestPermission();
    const interval = setInterval(() => {
      setIsOnline(getNetworkStatus());
      setPendingCount(getOfflineStats().pending);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (!scanning) return;
    setScanning(false);

    if (!isOnline) {
      addPendingScan({ session_id: session.id, barcode_data: data });
      setCounts(c => ({ ...c, present: c.present + 1 }));
      setShowResult({ type: 'offline', name: 'Saved offline' });
      Vibration.vibrate(100);
      setTimeout(() => { setShowResult(null); setScanning(true); }, 1500);
      return;
    }

    try {
      const { data: res } = await api.post('/attendance/scan', {
        session_id: session.id,
        barcode_data: data,
      });
      const student = res.data?.student;
      setCounts(c => ({ ...c, present: c.present + 1 }));
      setShowResult({ type: 'success', name: student?.name, roll: student?.roll_number, floating: res.data?.is_floating });
      Vibration.vibrate(100);
    } catch (e) {
      const code = e.response?.data?.error;
      if (code === 'ALREADY_MARKED') {
        setCounts(c => ({ ...c, duplicate: c.duplicate + 1 }));
        setShowResult({ type: 'duplicate', name: 'Already Marked' });
        Vibration.vibrate([100, 50, 100]);
      } else {
        setCounts(c => ({ ...c, error: c.error + 1 }));
        setShowResult({ type: 'error', name: e.response?.data?.message || 'Invalid QR' });
        Vibration.vibrate(300);
      }
    }

    setTimeout(() => { setShowResult(null); setScanning(true); }, 2000);
  };

  const endSession = async () => {
    Alert.alert('End Session', 'Mark remaining students as absent?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', onPress: async () => {
        try {
          await api.post(`/attendance/session/${session.id}/end`);
          navigation.goBack();
        } catch (e) { Alert.alert('Error', 'Failed to end session'); }
      }}
    ]);
  };

  if (!permission) return <View style={styles.center}><Text>Requesting camera...</Text></View>;
  if (!permission.granted) return (
    <View style={styles.center}>
      <Text style={{ textAlign: 'center', padding: 20 }}>Camera permission is required</Text>
      <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
        <Text style={styles.permBtnText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  const resultColor = showResult?.type === 'success' ? '#059669' : showResult?.type === 'duplicate' ? '#d97706' : showResult?.type === 'offline' ? '#2563eb' : '#dc2626';

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}>
        <View style={styles.overlay}>
          {/* Network indicator */}
          <View style={[styles.netBadge, { backgroundColor: isOnline ? '#d1fae5' : '#fee2e2' }]}>
            <Text style={[styles.netText, { color: isOnline ? '#065f46' : '#991b1b' }]}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}{pendingCount > 0 ? ` • ${pendingCount} pending` : ''}
            </Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.subject}>{session.subject_name}</Text>
            <Text style={styles.section}>{session.section_name} • P{session.start_period}-{session.end_period}</Text>
            {session.room_number ? <Text style={styles.room}>📍 {session.room_number}</Text> : null}
          </View>

          {/* Scan Frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
            <Text style={styles.scanHint}>Point camera at QR code</Text>
          </View>

          {/* Result Toast */}
          {showResult && (
            <View style={[styles.result, { backgroundColor: resultColor }]}>
              <Text style={styles.resultIcon}>{showResult.type === 'success' ? '✅' : showResult.type === 'duplicate' ? '⏰' : showResult.type === 'offline' ? '📥' : '❌'}</Text>
              <Text style={styles.resultName}>{showResult.name}</Text>
              {showResult.roll && <Text style={styles.resultRoll}>{showResult.roll}</Text>}
              {showResult.floating && <Text style={styles.resultFloat}>🔄 Floating Student</Text>}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.counts}>
              <View style={[styles.countBox, { backgroundColor: '#d1fae5' }]}>
                <Text style={[styles.countNum, { color: '#065f46' }]}>{counts.present}</Text>
                <Text style={[styles.countLabel, { color: '#065f46' }]}>Present</Text>
              </View>
              <View style={[styles.countBox, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.countNum, { color: '#92400e' }]}>{counts.duplicate}</Text>
                <Text style={[styles.countLabel, { color: '#92400e' }]}>Dup</Text>
              </View>
              <View style={[styles.countBox, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.countNum, { color: '#991b1b' }]}>{counts.error}</Text>
                <Text style={[styles.countLabel, { color: '#991b1b' }]}>Err</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.listBtn} onPress={() => navigation.navigate('AttendanceList', { session })}>
                <Text style={styles.listBtnText}>📋 List</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ManualAdd', { session })}>
                <Text style={styles.addBtnText}>➕ Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endBtn} onPress={endSession}>
                <Text style={styles.endBtnText}>⏹ End</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  permBtn: { backgroundColor: '#6366f1', marginHorizontal: 40, padding: 16, borderRadius: 12, alignItems: 'center' },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between', padding: 16 },
  netBadge: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 50 },
  netText: { fontSize: 12, fontWeight: '700' },
  header: { alignItems: 'center' },
  subject: { fontSize: 22, fontWeight: '800', color: '#fff' },
  section: { fontSize: 14, color: '#c7d2fe', marginTop: 4 },
  room: { fontSize: 13, color: '#6ee7b7', marginTop: 2, fontWeight: '600' },
  scanFrame: { width: 260, height: 260, alignSelf: 'center', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 10 },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#6366f1', borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanHint: { color: '#94a3b8', fontSize: 12 },
  result: { marginHorizontal: 20, padding: 16, borderRadius: 16, alignItems: 'center' },
  resultIcon: { fontSize: 28, marginBottom: 4 },
  resultName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  resultRoll: { fontSize: 13, color: '#e0e7ff', marginTop: 2 },
  resultFloat: { fontSize: 12, color: '#fef3c7', marginTop: 4, fontWeight: '700' },
  footer: { marginBottom: 30 },
  counts: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 14 },
  countBox: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  countNum: { fontSize: 22, fontWeight: '800' },
  countLabel: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10 },
  listBtn: { flex: 1, backgroundColor: '#6366f1', padding: 14, borderRadius: 12, alignItems: 'center' },
  listBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  addBtn: { flex: 1, backgroundColor: '#10b981', padding: 14, borderRadius: 12, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  endBtn: { flex: 1, backgroundColor: '#dc2626', padding: 14, borderRadius: 12, alignItems: 'center' },
  endBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
