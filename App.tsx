import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {
  React.useEffect(() => {
  const cleanup = async () => {
    try {
      // Clear old keys
      await AsyncStorage.removeItem('userToken'); // Old key
      await AsyncStorage.removeItem('user');
      console.log('🧹 Cleaned up old AsyncStorage keys');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };
  cleanup();
}, []);

  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </AuthProvider>
  );
}