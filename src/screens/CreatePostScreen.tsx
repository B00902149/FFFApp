import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import { useDailyQuote } from '../hooks/useDailyQuote';

const CATEGORIES = [
  { name: 'Help Request', icon: '🆘', color: '#7B6FFF' },
  { name: 'Testimony',    icon: '✨', color: '#FFD700' },
  { name: 'Encouragement',icon: '💪', color: '#26de81' },
  { name: 'Victory',      icon: '🎉', color: '#FF9F43' },
];

export const CreatePostScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { onPostCreated } = route.params || {};
  const quote = useDailyQuote();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const canPost = !loading && !!selectedCategory && !!content.trim();

  const handleSubmit = async () => {
    if (!selectedCategory) { Alert.alert('Select Category', 'Please choose a category for your post'); return; }
    if (!content.trim())   { Alert.alert('Add Content', 'Please write something to share'); return; }
    if (!user?.id || !user?.username) { Alert.alert('Error', 'User not logged in'); return; }

    setLoading(true);
    try {
      const newPost = await postsAPI.createPost(user.id, user.username, selectedCategory, content.trim());
      if (onPostCreated) onPostCreated(newPost);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Share with Community</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={!canPost}>
          {loading
            ? <ActivityIndicator color="#4A9EFF" size="small" />
            : <Text style={[styles.postBtn, !canPost && styles.postBtnDisabled]}>Post</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Category Selection */}
        <Text style={styles.sectionLabel}>CHOOSE CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryCard,
                  { borderColor: cat.color + '40' },
                  isSelected && { borderColor: cat.color, backgroundColor: cat.color + '18' },
                ]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryName, isSelected && { color: cat.color }]}>
                  {cat.name}
                </Text>
                {isSelected && (
                  <View style={[styles.selectedDot, { backgroundColor: cat.color }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content Input */}
        <Text style={styles.sectionLabel}>YOUR MESSAGE</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Share your testimony, ask for help, encourage others, or celebrate a victory..."
            placeholderTextColor="#2a4a7f"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, content.length > 900 && { color: '#FF6B6B' }]}>
            {content.length}/1000
          </Text>
        </View>

        {/* Daily Quote Card */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteIcon}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteRef}>— {quote.author}</Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0d1f3c', borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  cancelBtn: { color: '#5a7fa8', fontSize: 16, fontWeight: '600', width: 60 },
  title: { color: '#fff', fontSize: 16, fontWeight: '800' },
  postBtn: { color: '#4A9EFF', fontSize: 16, fontWeight: '800', width: 60, textAlign: 'right' },
  postBtnDisabled: { opacity: 0.3 },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  sectionLabel: {
    color: '#5a7fa8', fontSize: 11, fontWeight: '800',
    letterSpacing: 2, marginBottom: 12, marginTop: 8,
  },

  // Categories
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  categoryCard: {
    width: '47%', aspectRatio: 1.5,
    backgroundColor: '#0d1f3c', borderRadius: 16,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    padding: 12,
  },
  categoryIcon: { fontSize: 28, marginBottom: 6 },
  categoryName: { color: '#8ab4f8', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  selectedDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },

  // Input
  inputCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 16, marginBottom: 16,
    borderTopWidth: 3, borderTopColor: '#4A9EFF',
  },
  textInput: {
    color: '#fff', fontSize: 15, lineHeight: 24,
    minHeight: 150, textAlignVertical: 'top',
  },
  charCount: { color: '#2a4a7f', fontSize: 12, textAlign: 'right', marginTop: 8 },

  // Quote
  quoteCard: {
    flexDirection: 'row', backgroundColor: '#0d1f3c',
    borderRadius: 16, padding: 18,
    borderLeftWidth: 3, borderLeftColor: '#4A9EFF',
  },
  quoteIcon: { fontSize: 24, marginRight: 14 },
  quoteText: { color: '#c8d8f0', fontSize: 13, fontStyle: 'italic', lineHeight: 20, marginBottom: 6 },
  quoteRef: { color: '#4A9EFF', fontSize: 12, fontWeight: '600', textAlign: 'right' },
});