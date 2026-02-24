import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../services/api';

export const WorkoutTemplatesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const data = await workoutAPI.getTemplates(user.id);
      setTemplates(data);
    } catch (error) {
      console.error('Load templates error:', error);
      Alert.alert('Error', 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string, templateName: string) => {
    Alert.alert(
      'Use Template',
      `Start a new workout using "${templateName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Workout',
          onPress: async () => {
            try {
              const workout = await workoutAPI.createFromTemplate(templateId);
              Alert.alert('Success', 'Workout created from template!');
              navigation.navigate('ExerciseProgress', { 
                workout,
                onComplete: () => loadTemplates()
              });
            } catch (error) {
              console.error('Use template error:', error);
              Alert.alert('Error', 'Failed to create workout from template');
            }
          }
        }
      ]
    );
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    Alert.alert(
      'Delete Template',
      `Delete "${templateName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutAPI.deleteTemplate(templateId);
              Alert.alert('Success', 'Template deleted');
              loadTemplates();
            } catch (error) {
              console.error('Delete template error:', error);
              Alert.alert('Error', 'Failed to delete template');
            }
          }
        }
      ]
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
          <Text style={styles.title}>Workout Templates</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.white} />
        </View>
      </View>
    );
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
        <Text style={styles.title}>Workout Templates</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How Templates Work</Text>
            <Text style={styles.infoText}>
              Save your favorite workouts as templates to reuse them anytime. After completing a workout, you can save it as a template from the completion screen.
            </Text>
          </View>
        </View>

        {/* Templates List */}
        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Templates Yet</Text>
            <Text style={styles.emptyText}>
              Complete a workout and save it as a template to get started!
            </Text>
          </View>
        ) : (
          templates.map((template) => (
            <View key={template._id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <View style={styles.templateIcon}>
                  <Text style={styles.templateIconText}>💪</Text>
                </View>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.templateName}</Text>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateDetails}>
                    {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''} • {
                      template.exercises.reduce((total: number, ex: any) => total + ex.sets.length, 0)
                    } sets
                  </Text>
                </View>
              </View>

              {/* Exercises Preview */}
              <View style={styles.exercisesList}>
                {template.exercises.slice(0, 3).map((exercise: any, index: number) => (
                  <View key={index} style={styles.exerciseItem}>
                    <Text style={styles.exerciseBullet}>•</Text>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseSets}>
                      {exercise.sets.length} × {exercise.sets[0]?.reps || 0} reps
                    </Text>
                  </View>
                ))}
                {template.exercises.length > 3 && (
                  <Text style={styles.moreExercises}>
                    +{template.exercises.length - 3} more exercise{template.exercises.length - 3 !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>

              {/* Actions */}
              <View style={styles.templateActions}>
                <TouchableOpacity 
                  style={styles.useButton}
                  onPress={() => handleUseTemplate(template._id, template.templateName)}
                >
                  <Text style={styles.useButtonText}>Use Template</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTemplate(template._id, template.templateName)}
                >
                  <Text style={styles.deleteButtonIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Faith Card */}
        <View style={styles.faithCard}>
          <Text style={styles.faithIcon}>🙏</Text>
          <View style={styles.faithContent}>
            <Text style={styles.faithText}>
              "I can do all things through Christ who strengthens me."
            </Text>
            <Text style={styles.faithReference}>Philippians 4:13</Text>
          </View>
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
    backgroundColor: colors.accent.blue,
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.md
  },
  infoContent: {
    flex: 1
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
    marginBottom: spacing.xs
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.white,
    marginBottom: spacing.sm
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20
  },
  templateCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md
  },
  templateIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  templateIconText: {
    fontSize: 24
  },
  templateInfo: {
    flex: 1
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2
  },
  templateTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4
  },
  templateDetails: {
    fontSize: 12,
    color: colors.accent.blue,
    fontWeight: '600'
  },
  exercisesList: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  exerciseBullet: {
    fontSize: 16,
    color: colors.accent.blue,
    marginRight: spacing.xs
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary
  },
  exerciseSets: {
    fontSize: 12,
    color: colors.text.secondary
  },
  moreExercises: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs
  },
  templateActions: {
    flexDirection: 'row',
    gap: spacing.md
  },
  useButton: {
    flex: 1,
    backgroundColor: colors.accent.blue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.small,
    alignItems: 'center'
  },
  useButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600'
  },
  deleteButton: {
    width: 50,
    backgroundColor: colors.accent.red + '20',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButtonIcon: {
    fontSize: 20
  },
  faithCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue,
    marginTop: spacing.lg
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
  },
  bottomSpacer: {
    height: 40
  }
});