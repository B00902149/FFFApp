import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export const ProgressChartsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weightData, setWeightData] = useState<any[]>([]);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // For now, generate sample data
      const sampleData = generateSampleWeightData();
      setWeightData(sampleData);
      
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
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
  
  // Add padding to range for better visualization
  const paddedMax = maxWeight + (range * 0.1);
  const paddedMin = minWeight - (range * 0.1);
  const paddedRange = paddedMax - paddedMin;
  
  const chartHeight = 180; // Reduced slightly
  const chartWidth = screenWidth - (spacing.lg * 2) - 50; // More space for y-axis
  const horizontalPadding = 10; // Add padding on sides
  const usableWidth = chartWidth - (horizontalPadding * 2);
  const pointWidth = usableWidth / (weightData.length - 1);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Weight Progress</Text>
        <Text style={styles.chartRange}>
          {minWeight.toFixed(1)}kg - {maxWeight.toFixed(1)}kg
        </Text>
      </View>

      <View style={styles.chart}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{paddedMax.toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{((paddedMax + paddedMin) / 2).toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{paddedMin.toFixed(1)}</Text>
        </View>

        {/* Chart area with boundary */}
        <View style={[styles.chartArea, { width: chartWidth }]}>
          {/* Background grid lines */}
          <View style={[styles.gridLines, { height: chartHeight }]}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>

          {/* Data points container with clipping */}
          <View style={[styles.pointsContainer, { height: chartHeight }]}>
            {weightData.map((point, index) => {
              // Calculate position with padding
              const normalizedY = (point.weight - paddedMin) / paddedRange;
              const y = chartHeight - (normalizedY * chartHeight);
              const x = horizontalPadding + (index * pointWidth);

              // Strict bounds checking
              if (x < 0 || x > chartWidth || y < 0 || y > chartHeight) {
                return null;
              }

              return (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: Math.max(0, Math.min(chartWidth - 8, x - 4)),
                    top: Math.max(0, Math.min(chartHeight - 8, y - 4)),
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.accent.blue,
                    shadowColor: colors.accent.blue,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.5,
                    shadowRadius: 2,
                    elevation: 2
                  }}
                />
              );
            })}
          </View>

          {/* X-axis labels - show fewer to prevent overlap */}
          <View style={styles.xAxis}>
            {weightData.map((point, index) => {
              // Show first, middle, last, and every 7th day
              const showLabel = index === 0 || 
                               index === Math.floor(weightData.length / 2) || 
                               index === weightData.length - 1 ||
                               index % 7 === 0;
              
              if (showLabel) {
                return (
                  <Text key={index} style={styles.xAxisLabel}>
                    {point.date}
                  </Text>
                );
              }
              return null;
            })}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={styles.statValue}>{weightData[weightData.length - 1].weight}kg</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Change</Text>
          <Text style={[
            styles.statValue,
            { color: (weightData[weightData.length - 1].weight - weightData[0].weight) < 0 ? colors.accent.green : colors.accent.red }
          ]}>
            {(weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)}kg
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>
            {(weightData.reduce((sum, d) => sum + d.weight, 0) / weightData.length).toFixed(1)}kg
          </Text>
        </View>
      </View>
    </View>
  );
};

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Progress Charts</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.white} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with visible back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Progress Charts</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderWeightChart()}

        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>📊 Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            • Calorie Trends{'\n'}
            • Workout Volume{'\n'}
            • Body Measurements{'\n'}
            • Personal Records
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary.dark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.blue,  // More visible
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.white,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.white
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    padding: spacing.lg
  },
  chartContainer: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary
  },
  chartRange: {
    fontSize: 14,
    color: colors.text.secondary
  },
  chart: {
    flexDirection: 'row'
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 200,
    marginRight: spacing.sm,
    width: 35
  },
  yAxisLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'right'
  },
  chartArea: {
  flex: 1,
  overflow: 'hidden',  // Critical: clip overflow
  backgroundColor: '#FAFAFA', // Subtle background to see bounds
  borderRadius: 4
},
gridLines: {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  justifyContent: 'space-between',
  paddingVertical: 0
},
gridLine: {
  height: 1,
  backgroundColor: colors.background.lightGray,
  opacity: 0.3
},
pointsContainer: {
  position: 'relative',
  overflow: 'hidden'  // Double clip for safety
},
xAxis: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: spacing.sm,
  paddingHorizontal: 10
},
xAxisLabel: {
  fontSize: 9,
  color: colors.text.secondary
},
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background.lightGray,
    padding: spacing.md,
    borderRadius: borderRadius.small,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  comingSoonCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
    marginBottom: spacing.sm
  },
  comingSoonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24
  },
  bottomSpacer: {
    height: 40
  }
});