import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { workoutAPI } from '../services/api';

export const CompleteWorkoutScreen = ({ route, navigation }: any) => {
  const { workoutId } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  Keyboard.dismiss();
  
  if (rating === 0) {
    Alert.alert('Please rate your workout', 'Tap the stars to rate your workout');
    return;
  }

  setLoading(true);
  try {
    console.log('Completing workout:', workoutId, 'Rating:', rating);
    await workoutAPI.completeWorkout(workoutId, rating, comment);
    
    Alert.alert(
      'Workout Complete! 🎉',
      'Great job! Your progress has been saved.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Main')  // ✅ FIXED
        }
      ]
    );
  } catch (error: any) {
    console.error('Failed to complete workout:', error);
    Alert.alert('Error', error.error || 'Failed to save workout');
  } finally {
    setLoading(false);
  }
};

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            disabled={loading}
            style={styles.starButton}
          >
            <Text style={styles.star}>
              {star <= rating ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Workout Complete!</Text>
            <Text style={styles.subtitle}>
              Great job! Share your experience with the community
            </Text>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.label}>Rate your workout</Text>
              {renderStars()}
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 5 ? 'Amazing! 🔥' : rating === 4 ? 'Great work! 💪' : rating === 3 ? 'Good effort! 👍' : rating === 2 ? 'Keep going! 💪' : 'Every step counts! 🙏'}
                </Text>
              )}
            </View>

            {/* Comment */}
            <View style={styles.section}>
              <Text style={styles.label}>How do you feel? (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Share your thoughts, testimony, or what God revealed to you today..."
                placeholderTextColor={colors.text.secondary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={6}
                editable={!loading}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>{comment.length}/500</Text>
            </View>

            {/* Prayer Prompt */}
            <View style={styles.prayerPrompt}>
              <Text style={styles.prayerIcon}>🙏</Text>
              <Text style={styles.prayerText}>
                Take a moment to thank God for the strength He gave you today
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Complete & Save</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => navigation.navigate('Main')}  // ✅ FIXED
                disabled={loading}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>

            {/* Extra space at bottom for keyboard */}
            <View style={styles.bottomSpacer} />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 3
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent.green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.lg
  },
  successIcon: {
    fontSize: 60,
    color: colors.text.white,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg
  },
  section: {
    marginBottom: spacing.lg
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  starButton: {
    padding: spacing.xs
  },
  star: {
    fontSize: 40
  },
  ratingText: {
    fontSize: 14,
    color: colors.accent.blue,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: spacing.sm
  },
  input: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top'
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs
  },
  prayerPrompt: {
    flexDirection: 'row',
    backgroundColor: colors.accent.blue + '15',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  prayerIcon: {
    fontSize: 24,
    marginRight: spacing.md
  },
  prayerText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20
  },
  buttons: {
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  submitButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center'
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: 'bold'
  },
  skipButton: {
    padding: spacing.md,
    alignItems: 'center'
  },
  skipText: {
    fontSize: 16,
    color: colors.text.secondary
  },
  bottomSpacer: {
    height: 100
  }
});