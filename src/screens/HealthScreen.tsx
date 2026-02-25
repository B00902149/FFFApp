// src/screens/HealthScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { initHealthConnect, requestHealthPermissions, fetchHealthData } from '../services/healthConnect';

type HealthData = {
  steps: number;
  heartRate: number | null;
  weight: string | null;
  sleep: string | null;
  calories: number;
};

const TILES = [
  { key: 'weight', label: 'WEIGHT', icon: '⚖️' },
  { key: 'sleep', label: 'SLEEP', icon: '🌙' },
  { key: 'heartRate', label: 'BPM', icon: '❤️', suffix: 'bpm' },
  { key: 'steps', label: 'ACTIVITY', icon: '👟', suffix: 'steps' },
  { key: 'calories', label: 'CALORIES', icon: '🔥', suffix: 'kcal' },
];

export default function HealthScreen() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupHealthConnect();
  }, []);

  const setupHealthConnect = async () => {
    try {
      const initialized = await initHealthConnect();
      if (!initialized) {
        Alert.alert('Health Connect not available', 'Please install Health Connect from the Play Store.');
        setLoading(false);
        return;
      }
      await requestHealthPermissions();
      const healthData = await fetchHealthData();
      setData(healthData);
    } catch (error) {
      console.error('Health Connect error:', error);
      Alert.alert('Error', 'Could not load health data.');
    } finally {
      setLoading(false);
    }
  };

  const getValue = (key: string) => {
    if (!data) return '--';
    const val = data[key as keyof HealthData];
    const tile = TILES.find(t => t.key === key);
    if (val === null || val === undefined || val === 0) return '--';
    return tile?.suffix ? `${val} ${tile.suffix}` : String(val);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading health data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MY HEALTH</Text>
      <View style={styles.grid}>
        {TILES.map(tile => (
          <TouchableOpacity key={tile.key} style={styles.tile}>
            <Text style={styles.tileIcon}>{tile.icon}</Text>
            <Text style={styles.tileValue}>{getValue(tile.key)}</Text>
            <Text style={styles.tileLabel}>{tile.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.refreshButton} onPress={setupHealthConnect}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1628' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    backgroundColor: '#1a3a6b',
    borderRadius: 16,
    width: '48%',
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  tileIcon: { fontSize: 28, marginBottom: 8 },
  tileValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  tileLabel: { color: '#8ab4f8', fontSize: 12, marginTop: 4, letterSpacing: 1 },
  loadingText: { color: '#fff', marginTop: 12 },
  refreshButton: {
    backgroundColor: '#007BFF', borderRadius: 12, padding: 14,
    alignItems: 'center', margin: 16,
  },
  refreshText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});