import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { workoutAPI } from '../services/api';

export const CompleteWorkoutScreen = ({ route, navigation }: any) => {
  const { workout, onComplete } = route.params || {};
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please rate your workout before completing');
      return;
    }

    setLoading(true);
    try {
      await workoutAPI.completeWorkout(workout._id, rating, comment);
      setLoading(false);
      
      Alert.alert(
        'Workout Complete! 🎉',
        'Great job! Would you like to save this as a template?',
        [
          {
            text: 'No Thanks',
            style: 'cancel',
            onPress: () => {
              if (onComplete) onComplete();
              navigation.goBack();
            }
          },
          {
            text: 'Save Template',
            onPress: () => {
              setTemplateName(workout.title);
              setShowTemplateModal(true);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Complete workout error:', error);
      Alert.alert('Error', 'Failed to complete workout');
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
  if (!templateName || templateName.trim() === '') {
    Alert.alert('Error', 'Please enter a template name');
    return;
  }

  try {
    await workoutAPI.saveAsTemplate(workout._id, templateName.trim());
    setShowTemplateModal(false);
    
    Alert.alert(
      'Success! 💪',
      'Template saved! You can use it anytime from the Templates screen.',
      [
        {
          text: 'OK',
          onPress: () => {
            if (onComplete) onComplete();
            // CHANGE THIS:
            navigation.navigate('Main', { screen: 'DashboardTab' });
            // OR JUST USE:
            // navigation.popToTop();
          }
        }
      ]
    );
  } catch (error) {
    console.error('Save template error:', error);
    Alert.alert('Error', 'Failed to save template');
    setShowTemplateModal(false);
  }
};

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Text style={[
              styles.star,
              star <= rating && styles.starFilled
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Workout Complete!</Text>
          <Text style={styles.subtitle}>How did you do?</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Your Workout</Text>
          {renderStars()}
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && "Better luck next time"}
              {rating === 2 && "Keep pushing!"}
              {rating === 3 && "Good effort"}
              {rating === 4 && "Great workout!"}
              {rating === 5 && "Crushing it! 🔥"}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="How did you feel? Any personal records?"
            placeholderTextColor={colors.text.secondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.prayerCard}>
          <Text style={styles.prayerIcon}>🙏</Text>
          <View style={styles.prayerContent}>
            <Text style={styles.prayerTitle}>Take a moment to pray</Text>
            <Text style={styles.prayerText}>
              Thank God for the strength to complete this workout and ask for continued discipline in your fitness journey.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.completeButtonText}>
            {loading ? 'Saving...' : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Template Name Modal */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save as Template</Text>
            <Text style={styles.modalSubtitle}>Enter a name for this workout template:</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Template name"
              placeholderTextColor={colors.text.secondary}
              value={templateName}
              onChangeText={setTemplateName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowTemplateModal(false);
                  if (onComplete) onComplete();
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveTemplate}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark
  },
  content: {
    padding: spacing.lg,
    paddingTop: 60
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.white,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)'
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    color: "rgba(128, 128, 128, 0.8)"
  },
  starButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: spacing.xs
  },
  star: {
    fontSize: 40,
    color: colors.background.lightGray
  },
  starFilled: {
    color: colors.accent.blue
  },
  ratingText: {
    fontSize: 14,
    color: colors.accent.blue,
    textAlign: 'center',
    fontWeight: '600'
  },
  textInput: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 100,
    color: colors.text.primary
  },
  prayerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  prayerIcon: {
    fontSize: 28,
    marginRight: spacing.md
  },
  prayerContent: {
    flex: 1
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
    marginBottom: spacing.xs
  },
  prayerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20
  },
  completeButton: {
    backgroundColor: colors.accent.green,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  buttonDisabled: {
    opacity: 0.6
  },
  completeButtonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  modalContent: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.lg
  },
  modalInput: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.lg
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.small,
    alignItems: 'center'
  },
  modalButtonCancel: {
    backgroundColor: colors.background.lightGray
  },
  modalButtonSave: {
    backgroundColor: colors.accent.blue
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary
  }
});