import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
}

export const ExerciseScreen = ({ navigation }: any) => {
  const [workoutData, setWorkoutData] = useState({
    warmup: [
      { id: '1', name: 'Arm Circles', sets: 2, reps: '10' },
      { id: '2', name: 'Light Cardio', sets: 1, reps: '5 min' }
    ],
    exercises: [
      { id: '3', name: 'Bench Press', sets: 4, reps: '8-10', weight: '60kg' },
      { id: '4', name: 'Incline DB Press', sets: 3, reps: '10-12', weight: '20kg' },
      { id: '5', name: 'Cable Flyes', sets: 3, reps: '12-15', weight: '15kg' }
    ]
  });

  const handleExerciseDetail = (exercise: Exercise) => {
    navigation.navigate('ExerciseDetail', { exercise });
  };

  const renderExerciseRow = (exercise: Exercise) => (
    <View key={exercise.id} style={styles.exerciseRow}>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseDetails}>
          {exercise.sets} sets × {exercise.reps} {exercise.weight ? `@ ${exercise.weight}` : ''}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => handleExerciseDetail(exercise)}
      >
        <Text style={styles.playIcon}>▶️</Text>
      </TouchableOpacity>
    </View>
  );

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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Training Day 2</Text>
          <Text style={styles.subtitle}>Upper Body Push</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Faith Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            "I can do all things through Christ who strengthens me"
          </Text>
          <Text style={styles.motivationRef}>Philippians 4:13</Text>
        </View>

        {/* Warm Up Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Warm Up</Text>
          {workoutData.warmup.map(renderExerciseRow)}
        </View>

        {/* Exercises Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workoutData.exercises.map(renderExerciseRow)}
        </View>

        {/* Start Workout Button */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('ExerciseProgress')}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F3F'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: '#001F3F',
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
  headerContent: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.white
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  motivationCard: {
    backgroundColor: colors.accent.blue + '15',
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
  section: {
    backgroundColor: colors.background.white,
    padding: spacing.lg,
    marginBottom: spacing.sm
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4
  },
  exerciseDetails: {
    fontSize: 14,
    color: colors.text.secondary
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playIcon: {
    fontSize: 16
  },
  startButton: {
    backgroundColor: colors.accent.green,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  startButtonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: 'bold'
  }
});