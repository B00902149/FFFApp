import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';

export const ExerciseDetailScreen = ({ route, navigation }: any) => {
  const { exercise } = route.params || { 
    exercise: { name: 'Bench Press', sets: 4, reps: '8-10', weight: '60kg' } 
  };

  const instructions = [
    'Lie flat on bench with feet planted firmly on the floor',
    'Grip the barbell slightly wider than shoulder width',
    'Lower the bar slowly to mid-chest with controlled motion',
    'Press the bar up explosively while breathing out',
    'Lock arms at top without hyperextending elbows',
    'Repeat for desired number of reps'
  ];

  const tips = [
    'Keep your shoulder blades retracted throughout',
    'Maintain a slight arch in your lower back',
    'Don\'t bounce the bar off your chest',
    'Keep your core tight and engaged',
    'Use a spotter for heavy lifts'
  ];

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
        <Text style={styles.headerTitle}>Exercise Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Video Player Placeholder */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <TouchableOpacity style={styles.playButton}>
            <Text style={styles.playIcon}>▶️</Text>
          </TouchableOpacity>
          <Text style={styles.videoLabel}>Exercise Demo Video</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Exercise Info */}
        <View style={styles.infoSection}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Sets</Text>
              <Text style={styles.statValue}>{exercise.sets}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Reps</Text>
              <Text style={styles.statValue}>{exercise.reps}</Text>
            </View>
            {exercise.weight && (
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>{exercise.weight}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pre-Training Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pre-Training Notes</Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteIcon}>⚠️</Text>
            <Text style={styles.noteText}>
              Warm up chest and shoulders thoroughly before starting. Focus on form over weight. 
              Keep core tight throughout the movement.
            </Text>
          </View>
        </View>

        {/* How To Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How To Perform</Text>
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Pro Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipBullet}>💡</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Faith Integration */}
        <View style={styles.faithCard}>
          <Text style={styles.faithIcon}>💪</Text>
          <View style={styles.faithContent}>
            <Text style={styles.faithTitle}>Strength Through Faith</Text>
            <Text style={styles.faithText}>
              "But those who hope in the Lord will renew their strength. They will soar on wings 
              like eagles; they will run and not grow weary, they will walk and not be faint."
            </Text>
            <Text style={styles.faithReference}>Isaiah 40:31</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Return to Workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => console.log('Add to custom workout')}
          >
            <Text style={styles.secondaryButtonText}>Add to Custom Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.white
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.blue + '15',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backIcon: {
    fontSize: 24,
    color: colors.accent.blue,
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center'
  },
  placeholder: {
    width: 40
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000'
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.dark
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  playIcon: {
    fontSize: 30
  },
  videoLabel: {
    color: colors.text.white,
    fontSize: 14,
    opacity: 0.8
  },
  content: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  infoSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
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
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: colors.accent.yellow + '15',
    borderRadius: borderRadius.small,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.yellow
  },
  noteIcon: {
    fontSize: 20,
    marginRight: spacing.sm
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start'
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  stepText: {
    color: colors.text.white,
    fontWeight: 'bold',
    fontSize: 14
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-start'
  },
  tipBullet: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20
  },
  faithCard: {
    flexDirection: 'row',
    backgroundColor: colors.accent.blue + '15',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  faithIcon: {
    fontSize: 32,
    marginRight: spacing.md
  },
  faithContent: {
    flex: 1
  },
  faithTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs
  },
  faithText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.xs
  },
  faithReference: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.blue,
    textAlign: 'right'
  },
  actionButtons: {
    padding: spacing.lg,
    gap: spacing.md
  },
  primaryButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent.blue,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: colors.accent.blue,
    fontSize: 16,
    fontWeight: '600'
  }
});