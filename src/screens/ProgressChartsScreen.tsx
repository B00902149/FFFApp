import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

export const ProgressChartsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weightData, setWeightData] = useState<any[]>([]);

  useEffect(() => { loadProgressData(); }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setWeightData(generateSampleWeightData());
    } catch (error) {
      console.error('Load progress error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleWeightData = () => {
    const data = [];
    const today = new Date();
    let currentWeight = 75;
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      currentWeight += (Math.random() - 0.5) * 0.5;
      data.push({
        date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        weight: Math.round(currentWeight * 10) / 10
      });
    }
    return data;
  };

  const renderWeightChart = () => {
    if (weightData.length === 0) return null;

    const maxWeight = Math.max(...weightData.map(d => d.weight));
    const minWeight = Math.min(...weightData.map(d => d.weight));
    const range = maxWeight - minWeight || 1;
    const paddedMax = maxWeight + range * 0.15;
    const paddedMin = minWeight - range * 0.15;
    const paddedRange = paddedMax - paddedMin;

    const chartHeight = 160;
    const chartWidth = screenWidth - 80;
    const pointWidth = chartWidth / (weightData.length - 1);

    const current = weightData[weightData.length - 1].weight;
    const start = weightData[0].weight;
    const change = current - start;
    const avg = weightData.reduce((s, d) => s + d.weight, 0) / weightData.length;

    return (
      <View style={styles.card}>
        <Text style={styles.cardLabel}>WEIGHT PROGRESS</Text>

        {/* Chart */}
        <View style={styles.chartRow}>
          {/* Y Axis */}
          <View style={[styles.yAxis, { height: chartHeight }]}>
            <Text style={styles.axisLabel}>{paddedMax.toFixed(1)}</Text>
            <Text style={styles.axisLabel}>{((paddedMax + paddedMin) / 2).toFixed(1)}</Text>
            <Text style={styles.axisLabel}>{paddedMin.toFixed(1)}</Text>
          </View>

          {/* Chart Area */}
          <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
            {/* Grid lines */}
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.gridLine, { top: (chartHeight / 3) * i }]} />
            ))}

            {/* Points */}
            {weightData.map((point, index) => {
              const normalizedY = (point.weight - paddedMin) / paddedRange;
              const y = chartHeight - normalizedY * chartHeight;
              const x = index * pointWidth;
              const isLast = index === weightData.length - 1;
              return (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: Math.max(0, Math.min(chartWidth - 8, x - 4)),
                    top: Math.max(0, Math.min(chartHeight - 8, y - 4)),
                    width: isLast ? 12 : 7,
                    height: isLast ? 12 : 7,
                    borderRadius: isLast ? 6 : 3.5,
                    backgroundColor: isLast ? '#fff' : '#4A9EFF',
                    borderWidth: isLast ? 2 : 0,
                    borderColor: '#4A9EFF',
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* X axis labels */}
        <View style={styles.xAxis}>
          {['30d ago', '3 weeks', '2 weeks', '1 week', 'Today'].map(label => (
            <Text key={label} style={styles.axisLabel}>{label}</Text>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Current',  value: `${current.toFixed(1)}kg`, color: '#4A9EFF' },
            { label: 'Change',   value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}kg`, color: change < 0 ? '#26de81' : '#FF6B6B' },
            { label: 'Average',  value: `${avg.toFixed(1)}kg`, color: '#FFD700' },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              {i < 2 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A9EFF" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PROGRESS</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {renderWeightChart()}

        {/* Coming Soon */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>COMING SOON</Text>
          {[
            { icon: '🔥', label: 'Calorie Trends' },
            { icon: '🏋️', label: 'Workout Volume' },
            { icon: '📏', label: 'Body Measurements' },
            { icon: '🏆', label: 'Personal Records' },
          ].map(item => (
            <View key={item.label} style={styles.comingRow}>
              <Text style={styles.comingIcon}>{item.icon}</Text>
              <Text style={styles.comingLabel}>{item.label}</Text>
              <View style={styles.comingSoon}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1628' },
  loadingText: { color: '#8ab4f8', marginTop: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0d1f3c', borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  backBtn: { width: 60 },
  backText: { color: '#4A9EFF', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 2 },

  content: { padding: 16 },

  card: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, borderTopColor: '#4A9EFF', elevation: 4,
  },
  cardLabel: { color: '#5a7fa8', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 16 },

  // Chart
  chartRow: { flexDirection: 'row', marginBottom: 8 },
  yAxis: { width: 38, justifyContent: 'space-between', paddingRight: 6 },
  axisLabel: { color: '#2a4a7f', fontSize: 9, fontWeight: '600', textAlign: 'right' },
  chartArea: {
    flex: 1, backgroundColor: '#0a1628',
    borderRadius: 8, overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute', left: 0, right: 0,
    height: 1, backgroundColor: '#1a3a6b',
  },
  xAxis: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingLeft: 44, marginBottom: 16,
  },

  // Stats
  statsRow: { flexDirection: 'row', backgroundColor: '#0a1628', borderRadius: 12, padding: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: '#5a7fa8', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  statDivider: { width: 1, backgroundColor: '#1a3a6b', marginHorizontal: 8 },

  // Coming soon
  comingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  comingIcon: { fontSize: 22, marginRight: 14 },
  comingLabel: { flex: 1, color: '#8ab4f8', fontSize: 14, fontWeight: '600' },
  comingSoon: { backgroundColor: '#1a3a6b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  comingSoonText: { color: '#4A9EFF', fontSize: 11, fontWeight: '700' },
});