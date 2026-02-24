import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../services/api';

export const ExerciseScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const predefinedWorkouts = [
    {
      id: 1,
      title: 'Upper Body Strength',
      description: 'Chest, shoulders, and triceps',
      emoji: '💪',
      exercises: [
        {
          name: 'Bench Press',
          sets: [
            { reps: 10, weight: 60, completed: false },
            { reps: 10, weight: 60, completed: false },
            { reps: 8, weight: 65, completed: false },
            { reps: 8, weight: 65, completed: false }
          ]
        },
        {
          name: 'Overhead Press',
          sets: [
            { reps: 10, weight: 40, completed: false },
            { reps: 10, weight: 40, completed: false },
            { reps: 10, weight: 40, completed: false }
          ]
        },
        {
          name: 'Incline Dumbbell Press',
          sets: [
            { reps: 12, weight: 20, completed: false },
            { reps: 12, weight: 20, completed: false },
            { reps: 12, weight: 20, completed: false }
          ]
        },
        {
          name: 'Tricep Dips',
          sets: [
            { reps: 12, weight: 0, completed: false },
            { reps: 12, weight: 0, completed: false },
            { reps: 10, weight: 0, completed: false }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Lower Body Power',
      description: 'Squats, deadlifts, and leg work',
      emoji: '🦵',
      exercises: [
        {
          name: 'Barbell Squats',
          sets: [
            { reps: 8, weight: 80, completed: false },
            { reps: 8, weight: 80, completed: false },
            { reps: 8, weight: 80, completed: false },
            { reps: 6, weight: 85, completed: false }
          ]
        },
        {
          name: 'Romanian Deadlifts',
          sets: [
            { reps: 10, weight: 60, completed: false },
            { reps: 10, weight: 60, completed: false },
            { reps: 10, weight: 60, completed: false }
          ]
        },
        {
          name: 'Leg Press',
          sets: [
            { reps: 12, weight: 100, completed: false },
            { reps: 12, weight: 100, completed: false },
            { reps: 12, weight: 100, completed: false }
          ]
        },
        {
          name: 'Leg Curls',
          sets: [
            { reps: 12, weight: 30, completed: false },
            { reps: 12, weight: 30, completed: false },
            { reps: 12, weight: 30, completed: false }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Back & Biceps',
      description: 'Pull exercises and arms',
      emoji: '🏋️',
      exercises: [
        {
          name: 'Pull-ups',
          sets: [
            { reps: 8, weight: 0, completed: false },
            { reps: 8, weight: 0, completed: false },
            { reps: 6, weight: 0, completed: false }
          ]
        },
        {
          name: 'Barbell Rows',
          sets: [
            { reps: 10, weight: 50, completed: false },
            { reps: 10, weight: 50, completed: false },
            { reps: 10, weight: 50, completed: false }
          ]
        },
        {
          name: 'Lat Pulldown',
          sets: [
            { reps: 12, weight: 45, completed: false },
            { reps: 12, weight: 45, completed: false },
            { reps: 12, weight: 45, completed: false }
          ]
        },
        {
          name: 'Bicep Curls',
          sets: [
            { reps: 12, weight: 15, completed: false },
            { reps: 12, weight: 15, completed: false },
            { reps: 10, weight: 17.5, completed: false }
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'Full Body HIIT',
      description: 'High intensity conditioning',
      emoji: '🔥',
      exercises: [
        {
          name: 'Burpees',
          sets: [
            { reps: 15, weight: 0, completed: false },
            { reps: 15, weight: 0, completed: false },
            { reps: 15, weight: 0, completed: false }
          ]
        },
        {
          name: 'Push-ups',
          sets: [
            { reps: 20, weight: 0, completed: false },
            { reps: 20, weight: 0, completed: false },
            { reps: 15, weight: 0, completed: false }
          ]
        },
        {
          name: 'Mountain Climbers',
          sets: [
            { reps: 30, weight: 0, completed: false },
            { reps: 30, weight: 0, completed: false },
            { reps: 30, weight: 0, completed: false }
          ]
        },
        {
          name: 'Jump Squats',
          sets: [
            { reps: 15, weight: 0, completed: false },
            { reps: 15, weight: 0, completed: false },
            { reps: 15, weight: 0, completed: false }
          ]
        }
      ]
    }
  ];

  const handleStartWorkout = async (workout: any) => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'Please login to start a workout');
        return;
      }

      setLoading(true);

      // Create workout in database
      const newWorkout = {
        userId: user.id,
        title: workout.title,
        exercises: workout.exercises
      };

      console.log('Creating workout:', newWorkout);

      const createdWorkout = await workoutAPI.createWorkout(newWorkout);
      
      setLoading(false);

      // Navigate to progress screen
      navigation.navigate('ExerciseProgress', { 
        workout: createdWorkout
      });
    } catch (error) {
      console.error('Failed to start workout:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Workouts</Text>
        
        <TouchableOpacity 
          style={styles.templatesButton}
          onPress={() => navigation.navigate('WorkoutTemplates')}
        >
          <Text style={styles.templatesButtonText}>📋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Faith Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            "I can do all things through Christ who strengthens me"
          </Text>
          <Text style={styles.motivationRef}>Philippians 4:13</Text>
        </View>

        {/* Workout Cards */}
        <View style={styles.workoutsContainer}>
          {predefinedWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => handleStartWorkout(workout)}
              disabled={loading}
            >
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <Text style={styles.workoutDescription}>{workout.description}</Text>
                </View>
              </View>

              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{workout.exercises.length}</Text>
                  <Text style={styles.statLabel}>exercises</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
                  </Text>
                  <Text style={styles.statLabel}>sets</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>~45</Text>
                  <Text style={styles.statLabel}>mins</Text>
                </View>
              </View>

              <View style={styles.startButtonContainer}>
                {loading ? (
                  <ActivityIndicator size="small" color={colors.accent.blue} />
                ) : (
                  <>
                    <Text style={styles.startButtonText}>Start Workout</Text>
                    <Text style={styles.startButtonIcon}>▶️</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Templates Link */}
        <TouchableOpacity
          style={styles.templatesCard}
          onPress={() => navigation.navigate('WorkoutTemplates')}
        >
          <Text style={styles.templatesIcon}>📋</Text>
          <View style={styles.templatesContent}>
            <Text style={styles.templatesTitle}>My Templates</Text>
            <Text style={styles.templatesSubtitle}>View saved workout routines</Text>
          </View>
          <Text style={styles.templatesArrow}>›</Text>
        </TouchableOpacity>

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
    justifyContent: 'space-between',
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
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.white,
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.white,
    flex: 1,
    textAlign: 'center'
  },
  templatesButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  templatesButtonText: {
    fontSize: 20
  },
  content: {
    flex: 1
  },
  motivationCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  motivationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text.white,
    marginBottom: spacing.xs,
    lineHeight: 24
  },
  motivationRef: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.blue,
    textAlign: 'right'
  },
  workoutsContainer: {
    padding: spacing.lg,
    gap: spacing.md
  },
  workoutCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  workoutEmoji: {
    fontSize: 40,
    marginRight: spacing.md
  },
  workoutInfo: {
    flex: 1
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4
  },
  workoutDescription: {
    fontSize: 14,
    color: colors.text.secondary
  },
  workoutStats: {
    flexDirection: 'row',
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent.blue,
    marginBottom: 2
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.background.lightGray,
    marginHorizontal: spacing.sm
  },
  startButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.blue,
    padding: spacing.md,
    borderRadius: borderRadius.small
  },
  startButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: spacing.sm
  },
  startButtonIcon: {
    fontSize: 16
  },
  templatesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  templatesIcon: {
    fontSize: 32,
    marginRight: spacing.md
  },
  templatesContent: {
    flex: 1
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2
  },
  templatesSubtitle: {
    fontSize: 13,
    color: colors.text.secondary
  },
  templatesArrow: {
    fontSize: 28,
    color: colors.text.secondary
  },
  bottomSpacer: {
    height: 40
  }
});