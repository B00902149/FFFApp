import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { profileAPI } from '../services/api';

const AVATARS = ['👤', '😊', '💪', '🔥', '⚡', '🙏', '✨', '🎯', '🏃', '🏋️', '🤸', '🧘'];
const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'General Fitness', 'Athletic Performance'];

export const EditProfileScreen = ({ route, navigation }: any) => {
  const { profile, onUpdate } = route.params || {};

  const [avatar, setAvatar] = useState(profile?.avatar || '👤');
  const [bio, setBio] = useState(profile?.bio || '');
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitnessGoal || 'General Fitness');
  const [currentWeight, setCurrentWeight] = useState(profile?.currentWeight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(profile?.targetWeight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [weightUnit, setWeightUnit] = useState(profile?.weightUnit || 'kg');
  const [heightUnit, setHeightUnit] = useState(profile?.heightUnit || 'cm');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        avatar,
        bio: bio.trim(),
        fitnessGoal,
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        height: height ? parseFloat(height) : null,
        weightUnit,
        heightUnit
      };

      const updatedProfile = await profileAPI.updateProfile(profile._id, updates);
      
      Alert.alert('Success', 'Profile updated successfully!');
      
      if (onUpdate) {
        onUpdate(updatedProfile);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Avatar Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Avatar</Text>
          <View style={styles.avatarsGrid}>
            {AVATARS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.avatarOption,
                  avatar === item && styles.avatarOptionSelected
                ]}
                onPress={() => setAvatar(item)}
              >
                <Text style={styles.avatarOptionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio / Testimony</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share a bit about your fitness journey and faith..."
            placeholderTextColor={colors.text.secondary}
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{bio.length}/500</Text>
        </View>

        {/* Fitness Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Goal</Text>
          <View style={styles.goalsGrid}>
            {FITNESS_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalOption,
                  fitnessGoal === goal && styles.goalOptionSelected
                ]}
                onPress={() => setFitnessGoal(goal)}
              >
                <Text style={[
                  styles.goalOptionText,
                  fitnessGoal === goal && styles.goalOptionTextSelected
                ]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight</Text>
          
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'kg' && styles.unitButtonActive]}
              onPress={() => setWeightUnit('kg')}
            >
              <Text style={[styles.unitButtonText, weightUnit === 'kg' && styles.unitButtonTextActive]}>
                kg
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'lbs' && styles.unitButtonActive]}
              onPress={() => setWeightUnit('lbs')}
            >
              <Text style={[styles.unitButtonText, weightUnit === 'lbs' && styles.unitButtonTextActive]}>
                lbs
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Weight</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={currentWeight}
                onChangeText={setCurrentWeight}
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Weight</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Height */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Height</Text>
          
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, heightUnit === 'cm' && styles.unitButtonActive]}
              onPress={() => setHeightUnit('cm')}
            >
              <Text style={[styles.unitButtonText, heightUnit === 'cm' && styles.unitButtonTextActive]}>
                cm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, heightUnit === 'inches' && styles.unitButtonActive]}
              onPress={() => setHeightUnit('inches')}
            >
              <Text style={[styles.unitButtonText, heightUnit === 'inches' && styles.unitButtonTextActive]}>
                inches
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="0"
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
        </View>
      )}
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
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  cancelButton: {
    fontSize: 16,
    color: colors.text.secondary
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  saveButton: {
    fontSize: 16,
    color: colors.accent.blue,
    fontWeight: '600'
  },
  saveButtonDisabled: {
    opacity: 0.3
  },
  content: {
    flex: 1
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  avatarOptionSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: colors.accent.blue + '20'
  },
  avatarOptionText: {
    fontSize: 32
  },
  textArea: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs
  },
  goalsGrid: {
    gap: spacing.sm
  },
  goalOption: {
    backgroundColor: colors.background.lightGray,
    padding: spacing.md,
    borderRadius: borderRadius.small,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  goalOptionSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: colors.accent.blue + '20'
  },
  goalOptionText: {
    fontSize: 15,
    color: colors.text.primary,
    textAlign: 'center'
  },
  goalOptionTextSelected: {
    fontWeight: '600',
    color: colors.accent.blue
  },
  unitToggle: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: 4
  },
  unitButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.small
  },
  unitButtonActive: {
    backgroundColor: colors.accent.blue
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary
  },
  unitButtonTextActive: {
    color: colors.text.white
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md
  },
  inputGroup: {
    flex: 1
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs
  },
  input: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16
  },
  bottomSpacer: {
    height: 100
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});