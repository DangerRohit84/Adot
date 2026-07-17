import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { getToken } from './src/utils/storage';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SessionsScreen from './src/screens/SessionsScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import AttendanceListScreen from './src/screens/AttendanceListScreen';
import ManualAddScreen from './src/screens/ManualAddScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token);
  };

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Sessions" component={SessionsScreen} />
            <Stack.Screen name="Scanner" component={ScannerScreen} />
            <Stack.Screen name="AttendanceList" component={AttendanceListScreen} />
            <Stack.Screen name="ManualAdd" component={ManualAddScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
