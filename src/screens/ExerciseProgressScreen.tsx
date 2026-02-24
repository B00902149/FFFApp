import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { workoutAPI } from '../services/api';

export const ExerciseProgressScreen = ({ route, navigation }: any) => {
  const { workout } = route.params || {};
  
  const [currentWorkout, setCurrentWorkout] = useState(workout);

  useEffect(() => {
    if (!workout) {
      Alert.alert('Error', 'No workout data found');
      navigation.goBack();
    }
  }, []);

  const handleSetComplete = async (exerciseIndex: number, setIndex: number) => {
    try {
      const newCompleted = !currentWorkout.exercises[exerciseIndex].sets[setIndex].completed;
      
      await workoutAPI.updateSet(
        currentWorkout._id,
        exerciseIndex,
        setIndex,
        newCompleted
      );

      // Update local state
      const updated = { ...currentWorkout };
      updated.exercises[exerciseIndex].sets[setIndex].completed = newCompleted;
      setCurrentWorkout(updated);

    } catch (error) {
      console.error('Update set error:', error);
      Alert.alert('Error', 'Failed to update set');
    }
  };

  const handleComplete = () => {
    // Check if all sets are completed
    const allCompleted = currentWorkout.exercises.every((ex: any) =>
      ex.sets.every((set: any) => set.completed)
    );

    if (!allCompleted) {
      Alert.alert(
        'Incomplete Workout',
        'Not all sets are marked complete. Continue anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete Anyway',
            onPress: () => navigateToComplete()
          }
        ]
      );
    } else {
      navigateToComplete();
    }
  };

  const navigateToComplete = () => {
  navigation.navigate('CompleteWorkout', {
    workout: currentWorkout,
    onComplete: () => {
      // CHANGE THIS:
      navigation.navigate('Main', { screen: 'DashboardTab' });
      // OR BETTER:
      navigation.popToTop(); // Goes back to dashboard
    }
  });
};

  if (!currentWorkout) {
    return null;
  }

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
          <Text style={styles.title}>{currentWorkout.title}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Exercises */}
        {currentWorkout.exercises.map((exercise: any, exerciseIndex: number) => (
          <View key={exerciseIndex} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            
            {/* Sets */}
            {exercise.sets.map((set: any, setIndex: number) => (
              <TouchableOpacity
                key={setIndex}
                style={[
                  styles.setRow,
                  set.completed && styles.setRowCompleted
                ]}
                onPress={() => handleSetComplete(exerciseIndex, setIndex)}
              >
                <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                <Text style={styles.setDetails}>
                  {set.reps} reps {set.weight > 0 ? `@ ${set.weight}kg` : ''}
                </Text>
                <View style={[
                  styles.checkbox,
                  set.completed && styles.checkboxCompleted
                ]}>
                  {set.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Complete Button */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Complete Workout</Text>
        </TouchableOpacity>
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
  headerContent: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.white
  },
  placeholder: {
    width: 28
  },
  content: {
    flex: 1,
    padding: spacing.lg
  },
  exerciseCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.small,
    marginBottom: spacing.xs,
    backgroundColor: colors.background.lightGray
  },
  setRowCompleted: {
    backgroundColor: colors.accent.green + '20'
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    width: 60
  },
  setDetails: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxCompleted: {
    backgroundColor: colors.accent.green,
    borderColor: colors.accent.green
  },
  checkmark: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: 'bold'
  },
  completeButton: {
    backgroundColor: colors.accent.blue,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl
  },
  completeButtonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: 'bold'
  }
});