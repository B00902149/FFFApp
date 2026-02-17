import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';

const CATEGORIES = [
  { name: 'Prayer Request', icon: '🙏', color: colors.accent.blue },
  { name: 'Testimony', icon: '✨', color: colors.accent.yellow },
  { name: 'Encouragement', icon: '💪', color: colors.accent.green },
  { name: 'Victory', icon: '🎉', color: colors.accent.red }
];

export const CreatePostScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { onPostCreated } = route.params || {};

  const [selectedCategory, setSelectedCategory] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please choose a category for your post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Add Content', 'Please write something to share');
      return;
    }

    if (!user?.id || !user?.username) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);
    try {
      const newPost = await postsAPI.createPost(
        user.id,
        user.username,
        selectedCategory,
        content.trim()
      );

      Alert.alert('Success', 'Your post has been shared!');
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share with Community</Text>
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={loading || !selectedCategory || !content.trim()}
        >
          <Text style={[
            styles.postButton,
            (loading || !selectedCategory || !content.trim()) && styles.postButtonDisabled
          ]}>
            {loading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Category *</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.name && styles.categoryCardSelected,
                  { borderColor: category.color + '40' }
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text style={styles.categoryCardIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryCardText,
                  selectedCategory === category.name && { color: category.color }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Message *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your testimony, request prayer, encourage others, or celebrate a victory..."
            placeholderTextColor={colors.text.secondary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{content.length}/1000</Text>
        </View>

        {/* Faith Reminder */}
        <View style={styles.faithCard}>
          <Text style={styles.faithIcon}>💝</Text>
          <View style={styles.faithContent}>
            <Text style={styles.faithText}>
              "Therefore encourage one another and build each other up, just as in fact you are doing."
            </Text>
            <Text style={styles.faithReference}>1 Thessalonians 5:11</Text>
          </View>
        </View>
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
  postButton: {
    fontSize: 16,
    color: colors.accent.blue,
    fontWeight: '600'
  },
  postButtonDisabled: {
    opacity: 0.3
  },
  content: {
    flex: 1
  },
  section: {
    padding: spacing.lg
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1.5,
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md
  },
  categoryCardSelected: {
    backgroundColor: colors.background.white,
    borderWidth: 3
  },
  categoryCardIcon: {
    fontSize: 32,
    marginBottom: spacing.xs
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center'
  },
  textInput: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top'
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs
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
    fontSize: 28,
    marginRight: spacing.md
  },
  faithContent: {
    flex: 1
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
  }
});