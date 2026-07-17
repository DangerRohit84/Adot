import NetInfo from '@react-native-community/netinfo';
import { getToken } from '../utils/storage';
import api from './api';

let isOnline = true;
let pendingScans = [];

NetInfo.addEventListener(state => {
  isOnline = state.isConnected ?? false;
  if (isOnline && pendingScans.length > 0) syncPending();
});

export const getNetworkStatus = () => isOnline;

export const addPendingScan = (scan) => {
  pendingScans.push({ ...scan, timestamp: new Date().toISOString(), synced: false });
};

export const getPendingCount = () => pendingScans.filter(s => !s.synced).length;

export const syncPending = async () => {
  if (!isOnline || pendingScans.length === 0) return;
  const token = await getToken();
  if (!token) return;

  const unsynced = pendingScans.filter(s => !s.synced);
  for (const scan of unsynced) {
    try {
      await api.post('/attendance/scan', {
        session_id: scan.session_id,
        barcode_data: scan.barcode_data,
      });
      scan.synced = true;
    } catch (e) { /* keep in queue */ }
  }
  pendingScans = pendingScans.filter(s => !s.synced);
};

export const getOfflineStats = () => ({
  online: isOnline,
  pending: pendingScans.filter(s => !s.synced).length,
  synced: pendingScans.filter(s => s.synced).length,
});
