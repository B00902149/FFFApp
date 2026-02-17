import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { ScreenHeader } from '../components/ScreenHeader';

export const HealthScreen = ({ navigation }: any) => {
  const metrics = [
    { title: 'Weight', value: '70', unit: 'kg', icon: '⚖️' },
    { title: 'Sleep', value: '7.5', unit: 'hrs', icon: '😴' },
    { title: 'Heart Rate', value: '72', unit: 'bpm', icon: '❤️' },
    { title: 'Activity', value: '8500', unit: 'steps', icon: '🚶' },
    { title: 'Upper Body', value: '85', unit: '%', icon: '💪' },
    { title: 'Nutrition', value: '1850', unit: 'cal', icon: '🍎' }
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="My Health" 
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Prayer Section */}
        <TouchableOpacity style={styles.faithCard}>
          <View style={styles.faithHeader}>
            <Text style={styles.faithIcon}>🙏</Text>
            <Text style={styles.faithTitle}>Daily Prayer & Meditation</Text>
          </View>
          <Text style={styles.faithText}>
            Take a moment to center your mind and strengthen your spirit
          </Text>
        </TouchableOpacity>

        {/* Metrics Grid */}
        <View style={styles.grid}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricIcon}>{metric.icon}</Text>
              <Text style={styles.metricTitle}>{metric.title}</Text>
              <View style={styles.metricValue}>
                <Text style={styles.valueNumber}>{metric.value}</Text>
                <Text style={styles.valueUnit}>{metric.unit}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.lightGray
  },
  content: {
    flex: 1
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100
  },
  // ... rest of styles
  faithCard: {
    backgroundColor: colors.accent.blue + '15',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  faithHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  faithIcon: {
    fontSize: 24,
    marginRight: spacing.sm
  },
  faithTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary
  },
  faithText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center'
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: spacing.sm
  },
  metricTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  valueNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  valueUnit: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4
  }
});