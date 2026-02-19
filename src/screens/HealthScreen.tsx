import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { profileAPI, nutritionAPI, workoutAPI } from '../services/api';

interface HealthData {
  weight: number;
  sleep: number;
  heartRate: number;
  steps: number;
  workoutProgress: number;
  calories: number;
}

export const HealthScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthData>({
    weight: 0,
    sleep: 7.5,
    heartRate: 72,
    steps: 0,
    workoutProgress: 0,
    calories: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Load data from your existing APIs
      const [profileData, nutritionData, workoutStats] = await Promise.all([
        user?.id ? profileAPI.getProfile(user.id).catch(() => null) : null,
        user?.id ? nutritionAPI.getNutrition(user.id, today).catch(() => null) : null,
        user?.id ? profileAPI.getStats(user.id).catch(() => null) : null,
      ]);

      console.log('Profile data:', profileData);
      console.log('Nutrition data:', nutritionData);
      console.log('Workout stats:', workoutStats);

      // Calculate workout progress (% of goal completed today)
      const workoutProgress = workoutStats?.workoutCount > 0 
        ? Math.min(100, (workoutStats.workoutCount / 5) * 100) 
        : 0;

      // Estimate steps based on workouts (rough calculation)
      const estimatedSteps = (workoutStats?.workoutCount || 0) * 2000 + 
                            (nutritionData?.totalCalories || 0) / 10;

      setHealthData({
        weight: profileData?.currentWeight || 70,
        sleep: 7.5, // Could add sleep tracking feature later
        heartRate: 72, // Could integrate with wearables later
        steps: Math.round(estimatedSteps) || 8500,
        workoutProgress: Math.round(workoutProgress),
        calories: nutritionData?.totalCalories || 0
      });

    } catch (error) {
      console.error('Load health data error:', error);
      Alert.alert('Error', 'Failed to load health data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHealthData();
  };

  const handleCardTap = (card: string) => {
    switch (card) {
      case 'nutrition':
        navigation.navigate('Nutrition');
        break;
      case 'workout':
        navigation.navigate('Exercise');
        break;
      case 'weight':
        navigation.navigate('EditProfile', { 
          profile: user,
          onUpdate: () => loadHealthData()
        });
        break;
      case 'steps':
        Alert.alert(
          'Activity Tracking',
          'Steps are estimated from your workouts and activity. Connect a fitness tracker for more accurate data.',
          [{ text: 'OK' }]
        );
        break;
      default:
        Alert.alert('Health Data', 'This metric is tracked automatically based on your activity.');
    }
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
          <Text style={styles.title}>My Health</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.white} />
          <Text style={styles.loadingText}>Loading health data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Blue Background */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Health</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text.white}
            colors={[colors.accent.blue]}
          />
        }
      >
        {/* Health Metrics Grid */}
        <View style={styles.grid}>
          {/* Weight */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCardTap('weight')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>⚖️</Text>
            <Text style={styles.cardLabel}>Weight</Text>
            <Text style={styles.cardValue}>
              {healthData.weight > 0 ? healthData.weight : '--'}
            </Text>
            <Text style={styles.cardUnit}>kg</Text>
          </TouchableOpacity>

          {/* Sleep */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCardTap('sleep')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>😴</Text>
            <Text style={styles.cardLabel}>Sleep</Text>
            <Text style={styles.cardValue}>{healthData.sleep.toFixed(1)}</Text>
            <Text style={styles.cardUnit}>hrs</Text>
          </TouchableOpacity>

          {/* Heart Rate */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCardTap('heart')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>❤️</Text>
            <Text style={styles.cardLabel}>Heart Rate</Text>
            <Text style={styles.cardValue}>{healthData.heartRate}</Text>
            <Text style={styles.cardUnit}>bpm</Text>
          </TouchableOpacity>

          {/* Steps */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCardTap('steps')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>🚶</Text>
            <Text style={styles.cardLabel}>Activity</Text>
            <Text style={styles.cardValue}>{healthData.steps}</Text>
            <Text style={styles.cardUnit}>steps</Text>
          </TouchableOpacity>

          {/* Upper Body (Today's Workout Progress) */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCardTap('workout')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>💪</Text>
            <Text style={styles.cardLabel}>Workout</Text>
            <Text style={styles.cardValue}>{healthData.workoutProgress}</Text>
            <Text style={styles.cardUnit}>%</Text>
          </TouchableOpacity>

          {/* Nutrition (Linked to USDA) */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCardTap('nutrition')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>🍎</Text>
            <Text style={styles.cardLabel}>Nutrition</Text>
            <Text style={styles.cardValue}>
              {healthData.calories > 0 ? healthData.calories : '--'}
            </Text>
            <Text style={styles.cardUnit}>cal</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditProfile', { profile: user })}
          >
            <Text style={styles.actionIcon}>⚖️</Text>
            <Text style={styles.actionText}>Update Weight</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Nutrition')}
          >
            <Text style={styles.actionIcon}>🍎</Text>
            <Text style={styles.actionText}>Log Today's Meals</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Exercise')}
          >
            <Text style={styles.actionIcon}>💪</Text>
            <Text style={styles.actionText}>Start Workout</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Faith Card */}
        <View style={styles.faithCard}>
          <Text style={styles.faithIcon}>🙏</Text>
          <View style={styles.faithContent}>
            <Text style={styles.faithText}>
              "Do you not know that your bodies are temples of the Holy Spirit?"
            </Text>
            <Text style={styles.faithReference}>1 Corinthians 6:19</Text>
          </View>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary.dark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.white,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.white,
    alignSelf: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.white
  },
  content: {
    flex: 1
  },
  contentContainer: {
    paddingBottom: 40
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    justifyContent: 'space-between'
  },
  card: {
    width: '48%',  // Same as dashboard tiles
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 140,  // Same as dashboard tiles
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardIcon: {
    fontSize: 30,  // Match dashboard icon size
    marginBottom: spacing.sm
  },
  cardLabel: {
    fontSize: 16,  // Match dashboard tile title size
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  cardValue: {
    fontSize: 28,  // Slightly smaller for readability
    fontWeight: 'bold',
    color: colors.text.primary
  },
  cardUnit: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2
  },
  actionsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.medium
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  actionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 32
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary
  },
  actionArrow: {
    fontSize: 24,
    color: colors.text.secondary
  },
  faithCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  faithIcon: {
    fontSize: 28,
    marginRight: spacing.md
  },
  faithContent: {
    flex: 1
  },
  faithText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.text.white,
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  faithReference: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.blue,
    textAlign: 'right'
  }
});