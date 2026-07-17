import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
const localIp = debuggerHost?.split(':')[0] ?? '10.0.2.2';

export const API_BASE_URL = `http://${localIp}:5000/api`;
export const APP_NAME = 'Attendance Scanner';
