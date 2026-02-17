import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../services/api';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  completed: boolean;
}

interface SetLog {
  setNumber: number;
  reps: string;
  weight: string;
  completed: boolean;
}

export const ExerciseProgressScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { workoutId } = route.params || {};
  
  const [workout, setWorkout] = useState<any>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setLogs, setSetLogs] = useState<SetLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workoutId) {
      loadWorkout();
    } else {
      createNewWorkout();
    }
  }, []);

  const loadWorkout = async () => {
    try {
      const data = await workoutAPI.getWorkout(workoutId);
      setWorkout(data);
      initializeSetLogs(data.exercises[0]);
    } catch (error) {
      console.error('Failed to load workout:', error);
      Alert.alert('Error', 'Failed to load workout');
    }
  };

  const createNewWorkout = async () => {
    try {
      const newWorkout = {
        userId: user?.id,
        title: 'Training Day 2',
        description: 'Upper Body Push',
        category: 'Push',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '8-10', weight: '60kg', completed: false },
          { name: 'Incline DB Press', sets: 3, reps: '10-12', weight: '20kg', completed: false },
          { name: 'Cable Flyes', sets: 3, reps: '12-15', weight: '15kg', completed: false }
        ]
      };

      const created = await workoutAPI.createWorkout(newWorkout);
      setWorkout(created);
      initializeSetLogs(created.exercises[0]);
    } catch (error) {
      console.error('Failed to create workout:', error);
      Alert.alert('Error', 'Failed to create workout');
    }
  };

  const initializeSetLogs = (exercise: Exercise) => {
    const logs: SetLog[] = [];
    for (let i = 0; i < exercise.sets; i++) {
      logs.push({
        setNumber: i + 1,
        reps: exercise.reps || '',
        weight: exercise.weight || '',
        completed: false
      });
    }
    setSetLogs(logs);
  };

  const updateSetLog = (index: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...setLogs];
    updated[index][field] = value;
    setSetLogs(updated);
  };

  const toggleSetComplete = (index: number) => {
    const updated = [...setLogs];
    updated[index].completed = !updated[index].completed;
    setSetLogs(updated);
  };

  const nextExercise = () => {
    if (!workout) return;

    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      initializeSetLogs(workout.exercises[currentExerciseIndex + 1]);
    } else {
      // Workout complete
      navigation.navigate('CompleteWorkout', { workoutId: workout._id });
    }
  };

  const currentExercise = workout?.exercises[currentExerciseIndex];

  if (!workout || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workout.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Exercise Info */}
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseDetails}>
            {currentExercise.sets} sets × {currentExercise.reps} reps
          </Text>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </Text>
        </View>

        {/* Set Logging Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Log Your Sets</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.setColumn]}>Set</Text>
            <Text style={[styles.tableHeaderText, styles.repsColumn]}>Reps</Text>
            <Text style={[styles.tableHeaderText, styles.weightColumn]}>Weight</Text>
            <Text style={[styles.tableHeaderText, styles.doneColumn]}>Done</Text>
          </View>

          {/* Table Rows */}
          {setLogs.map((log, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.setColumn]}>{log.setNumber}</Text>
              
              <TextInput
                style={[styles.tableCell, styles.repsColumn, styles.input]}
                value={log.reps}
                onChangeText={(value) => updateSetLog(index, 'reps', value)}
                keyboardType="numeric"
                placeholder="8-10"
              />
              
              <TextInput
                style={[styles.tableCell, styles.weightColumn, styles.input]}
                value={log.weight}
                onChangeText={(value) => updateSetLog(index, 'weight', value)}
                keyboardType="numeric"
                placeholder="60"
              />
              
              <TouchableOpacity 
                style={styles.doneColumn}
                onPress={() => toggleSetComplete(index)}
              >
                <View style={[styles.checkbox, log.completed && styles.checkboxChecked]}>
                  {log.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={nextExercise}
        >
          <Text style={styles.nextButtonText}>
            {currentExerciseIndex < workout.exercises.length - 1 
              ? 'Next Exercise' 
              : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.lightGray
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  backButton: {
    fontSize: 16,
    color: colors.accent.blue,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center'
  },
  placeholder: {
    width: 50
  },
  content: {
    flex: 1
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing.xl * 2,
    fontSize: 16,
    color: colors.text.secondary
  },
  exerciseCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs
  },
  exerciseDetails: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.sm
  },
  progressText: {
    fontSize: 14,
    color: colors.accent.blue,
    fontWeight: '600'
  },
  tableCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent.blue,
    marginBottom: spacing.sm
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray,
    alignItems: 'center'
  },
  tableCell: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center'
  },
  setColumn: {
    width: '15%'
  },
  repsColumn: {
    width: '30%'
  },
  weightColumn: {
    width: '30%'
  },
  doneColumn: {
    width: '25%'
  },
  input: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  checkboxChecked: {
    backgroundColor: colors.accent.blue
  },
  checkmark: {
    color: colors.text.white,
    fontWeight: 'bold',
    fontSize: 16
  },
  nextButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center'
  },
  nextButtonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: 'bold'
  }
});