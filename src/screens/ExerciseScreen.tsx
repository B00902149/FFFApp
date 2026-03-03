import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../services/api';
import { useDailyQuote } from '../hooks/useDailyQuote';

// Preset workout plans shown on this screen
// Each workout contains exercises with pre-defined sets, reps, and weights
// completed: false — all sets start as incomplete when a workout is created
const WORKOUTS = [
  {
    id: 1, title: 'Upper Body Strength', description: 'Chest, shoulders & triceps',
    emoji: '💪', color: '#4A9EFF', duration: 45,
    exercises: [
      { name: 'Bench Press',           sets: [{ reps: 10, weight: 60, completed: false }, { reps: 10, weight: 60, completed: false }, { reps: 8, weight: 65, completed: false }, { reps: 8, weight: 65, completed: false }] },
      { name: 'Overhead Press',        sets: [{ reps: 10, weight: 40, completed: false }, { reps: 10, weight: 40, completed: false }, { reps: 10, weight: 40, completed: false }] },
      { name: 'Incline Dumbbell Press',sets: [{ reps: 12, weight: 20, completed: false }, { reps: 12, weight: 20, completed: false }, { reps: 12, weight: 20, completed: false }] },
      { name: 'Tricep Dips',           sets: [{ reps: 12, weight: 0,  completed: false }, { reps: 12, weight: 0,  completed: false }, { reps: 10, weight: 0,  completed: false }] },
    ]
  },
  {
    id: 2, title: 'Lower Body Power', description: 'Squats, deadlifts & leg work',
    emoji: '🦵', color: '#4ECDC4', duration: 50,
    exercises: [
      { name: 'Barbell Squats',       sets: [{ reps: 8,  weight: 80,  completed: false }, { reps: 8,  weight: 80,  completed: false }, { reps: 8,  weight: 80,  completed: false }, { reps: 6, weight: 85, completed: false }] },
      { name: 'Romanian Deadlifts',   sets: [{ reps: 10, weight: 60,  completed: false }, { reps: 10, weight: 60,  completed: false }, { reps: 10, weight: 60,  completed: false }] },
      { name: 'Leg Press',            sets: [{ reps: 12, weight: 100, completed: false }, { reps: 12, weight: 100, completed: false }, { reps: 12, weight: 100, completed: false }] },
      { name: 'Leg Curls',            sets: [{ reps: 12, weight: 30,  completed: false }, { reps: 12, weight: 30,  completed: false }, { reps: 12, weight: 30,  completed: false }] },
    ]
  },
  {
    id: 3, title: 'Back & Biceps', description: 'Pull exercises & arms',
    emoji: '🏋️', color: '#7B6FFF', duration: 45,
    exercises: [
      { name: 'Pull-ups',      sets: [{ reps: 8,  weight: 0,  completed: false }, { reps: 8,  weight: 0,  completed: false }, { reps: 6,  weight: 0,    completed: false }] },
      { name: 'Barbell Rows',  sets: [{ reps: 10, weight: 50, completed: false }, { reps: 10, weight: 50, completed: false }, { reps: 10, weight: 50,   completed: false }] },
      { name: 'Lat Pulldown',  sets: [{ reps: 12, weight: 45, completed: false }, { reps: 12, weight: 45, completed: false }, { reps: 12, weight: 45,   completed: false }] },
      { name: 'Bicep Curls',   sets: [{ reps: 12, weight: 15, completed: false }, { reps: 12, weight: 15, completed: false }, { reps: 10, weight: 17.5, completed: false }] },
    ]
  },
  {
    id: 4, title: 'Full Body HIIT', description: 'High intensity conditioning',
    emoji: '🔥', color: '#FF6B6B', duration: 30,
    exercises: [
      { name: 'Burpees',          sets: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
      { name: 'Push-ups',         sets: [{ reps: 20, weight: 0, completed: false }, { reps: 20, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
      { name: 'Mountain Climbers',sets: [{ reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }, { reps: 30, weight: 0, completed: false }] },
      { name: 'Jump Squats',      sets: [{ reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }, { reps: 15, weight: 0, completed: false }] },
    ]
  },
];

export const ExerciseScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const quote = useDailyQuote();

  // Tracks which workout card is currently loading (by workout id); null = none loading
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Creates the workout in the database then navigates to the active workout screen
  const handleStartWorkout = async (workout: any) => {
    try {
      if (!user?.id) { Alert.alert('Error', 'Please login to start a workout'); return; }
      setLoadingId(workout.id); // show spinner on the tapped card only
      const createdWorkout = await workoutAPI.createWorkout({
        userId: user.id,
        title: workout.title,
        exercises: workout.exercises,
      });
      navigation.navigate('ExerciseProgress', { workout: createdWorkout });
    } catch {
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    } finally {
      setLoadingId(null); // clear spinner regardless of success or failure
    }
  };

  return (
    <View style={styles.container}>

      {/* ── Header: Back / Title / Templates shortcut ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>WORKOUTS</Text>
        <TouchableOpacity
          style={styles.templatesBtn}
          onPress={() => navigation.navigate('WorkoutTemplates')}
        >
          <Text style={styles.templatesBtnText}>📋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Daily Quote Card ── */}
        <View style={styles.faithCard}>
          <Text style={styles.faithText}>"{quote.text}"</Text>
          <Text style={styles.faithRef}>— {quote.author}</Text>
        </View>

        {/* ── Preset Workout Cards ── */}
        {WORKOUTS.map((workout) => {
          // Sum all sets across every exercise for the stats bar
          const totalSets = workout.exercises.reduce((t, e) => t + e.sets.length, 0);
          const isLoading = loadingId === workout.id; // true only for the card being started

          return (
            <View key={workout.id} style={[styles.workoutCard, { borderTopColor: workout.color }]}>

              {/* Card header: emoji + title + description */}
              <View style={styles.cardHeader}>
                <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <Text style={styles.workoutDesc}>{workout.description}</Text>
                </View>
              </View>

              {/* Quick stats: exercises / sets / estimated duration */}
              <View style={styles.statsRow}>
                {[
                  { value: workout.exercises.length, label: 'exercises' },
                  { value: totalSets,                label: 'sets' },
                  { value: `~${workout.duration}`,   label: 'mins' },
                ].map((stat, i) => (
                  <React.Fragment key={stat.label}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: workout.color }]}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                    {/* Vertical divider between stats, skipped after the last one */}
                    {i < 2 && <View style={styles.statDivider} />}
                  </React.Fragment>
                ))}
              </View>

              {/* Exercise name list shown as a preview inside the card */}
              <View style={styles.exercisePreview}>
                {workout.exercises.map((ex, i) => (
                  <Text key={i} style={styles.exerciseItem}>
                    · {ex.name} <Text style={styles.exerciseSets}>({ex.sets.length} sets)</Text>
                  </Text>
                ))}
              </View>

              {/* Start button — shows spinner while this card's workout is being created */}
              {/* All other cards are disabled while any workout is loading */}
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: workout.color }]}
                onPress={() => handleStartWorkout(workout)}
                disabled={!!loadingId}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.startBtnText}>Start Workout  ▶</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {/* ── Templates Banner — links to saved workout templates ── */}
        <TouchableOpacity
          style={styles.templatesCard}
          onPress={() => navigation.navigate('WorkoutTemplates')}
        >
          <Text style={styles.templatesCardIcon}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.templatesCardTitle}>My Templates</Text>
            <Text style={styles.templatesCardSub}>View saved workout routines</Text>
          </View>
          <Text style={styles.templatesCardArrow}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0d1f3c', borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  backBtn: { width: 60 },
  backText: { color: '#4A9EFF', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  templatesBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1a3a6b', alignItems: 'center', justifyContent: 'center',
  },
  templatesBtnText: { fontSize: 20 },

  content: { padding: 16, paddingBottom: 40 },

  // Daily quote card
  faithCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16, padding: 18,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#4A9EFF',
  },
  faithText: { color: '#c8d8f0', fontSize: 14, fontStyle: 'italic', lineHeight: 22, marginBottom: 8 },
  faithRef: { color: '#4A9EFF', fontSize: 12, fontWeight: '700', textAlign: 'right' },

  // Workout card (border colour injected per card from WORKOUTS data)
  workoutCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  workoutEmoji: { fontSize: 40, marginRight: 14 },
  workoutInfo: { flex: 1 },
  workoutTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  workoutDesc: { color: '#5a7fa8', fontSize: 13 },

  // Stats bar (exercises / sets / mins)
  statsRow: {
    flexDirection: 'row', backgroundColor: '#0a1628',
    borderRadius: 12, padding: 14, marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: '#5a7fa8', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: '#1a3a6b', marginHorizontal: 8 },

  // Exercise preview list
  exercisePreview: { marginBottom: 16 },
  exerciseItem: { color: '#8ab4f8', fontSize: 13, marginBottom: 4 },
  exerciseSets: { color: '#5a7fa8', fontSize: 12 },

  // Start workout button
  startBtn: {
    borderRadius: 12, padding: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Templates banner card at the bottom
  templatesCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, borderTopWidth: 3, borderTopColor: '#26de81',
  },
  templatesCardIcon: { fontSize: 28, marginRight: 14 },
  templatesCardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  templatesCardSub: { color: '#5a7fa8', fontSize: 13 },
  templatesCardArrow: { fontSize: 32, color: '#4A9EFF' },
});