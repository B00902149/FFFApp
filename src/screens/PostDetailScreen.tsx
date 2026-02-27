import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';

const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  'Help Request':  { icon: '🆘', color: '#7B6FFF' },
  'Testimony':     { icon: '✨', color: '#FFD700' },
  'Encouragement': { icon: '💪', color: '#26de81' },
  'Victory':       { icon: '🎉', color: '#FF9F43' },
  'default':       { icon: '📝', color: '#4A9EFF' },
};

const getTimeAgo = (dateString: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
};

export const PostDetailScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { post: initialPost, onUpdate } = route.params || {};
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cfg = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG['default'];
  const isLiked = user?.id ? post.likes.includes(user.id) : false;
  const isOwnPost = user?.id === post.userId;

  const handleLike = async () => {
    if (!user?.id) return;
    try {
      const updated = await postsAPI.likePost(post._id, user.id);
      setPost(updated);
      if (onUpdate) onUpdate(updated);
    } catch { console.error('Failed to like post'); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!user?.id || !user?.username) { Alert.alert('Error', 'User not logged in'); return; }
    setSubmitting(true);
    try {
      const updated = await postsAPI.addComment(post._id, user.id, user.username, commentText.trim());
      setPost(updated);
      if (onUpdate) onUpdate(updated);
      setCommentText('');
    } catch {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user?.id || post.userId !== user.id) {
      Alert.alert('Not Authorized', 'You can only delete your own posts');
      return;
    }
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await postsAPI.deletePost(post._id, user.id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete post');
          }
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>POST</Text>
        {isOwnPost
          ? <TouchableOpacity onPress={handleDeletePost} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          : <View style={{ width: 60 }} />
        }
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Post Card */}
        <View style={[styles.postCard, { borderTopColor: cfg.color }]}>
          <View style={styles.postHeader}>
            <View style={[styles.avatar, { backgroundColor: cfg.color + '30' }]}>
              <Text style={[styles.avatarText, { color: cfg.color }]}>
                {post.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.username}>{post.username}</Text>
              <Text style={styles.timestamp}>{getTimeAgo(post.createdAt)}</Text>
            </View>
            <View style={[styles.categoryPill, { backgroundColor: cfg.color + '20' }]}>
              <Text style={styles.categoryPillIcon}>{cfg.icon}</Text>
              <Text style={[styles.categoryPillText, { color: cfg.color }]}>{post.category}</Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
              <Text style={[styles.actionText, isLiked && { color: '#FF6B6B' }]}>
                {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionBtn}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>
                {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
              </Text>
            </View>
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentsCard}>
          <Text style={styles.commentsTitle}>COMMENTS ({post.comments.length})</Text>

          {post.comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No comments yet</Text>
              <Text style={styles.emptyText}>Be the first to encourage!</Text>
            </View>
          ) : (
            post.comments.map((comment: any, index: number) => (
              <View key={index} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentUsername}>{comment.username}</Text>
                    <Text style={styles.commentTime}>{getTimeAgo(comment.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor="#2a4a7f"
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
          onPress={handleAddComment}
          disabled={!commentText.trim() || submitting}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendIcon}>➤</Text>
          }
        </TouchableOpacity>
      </View>
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
  backBtn: { width: 60 },
  backText: { color: '#4A9EFF', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  deleteBtn: { width: 60, alignItems: 'flex-end' },
  deleteBtnText: { fontSize: 22 },

  scroll: { flex: 1 },
  content: { padding: 16 },

  // Post
  postCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, elevation: 4,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800' },
  postMeta: { flex: 1 },
  username: { color: '#fff', fontSize: 15, fontWeight: '700' },
  timestamp: { color: '#5a7fa8', fontSize: 12, marginTop: 2 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  categoryPillIcon: { fontSize: 13 },
  categoryPillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  postContent: { color: '#c8d8f0', fontSize: 16, lineHeight: 26, marginBottom: 16 },

  postActions: { flexDirection: 'row', gap: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1a3a6b' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 18 },
  actionText: { color: '#5a7fa8', fontSize: 13, fontWeight: '600' },

  // Comments
  commentsCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, borderTopWidth: 3, borderTopColor: '#4A9EFF',
  },
  commentsTitle: { color: '#5a7fa8', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 16 },

  emptyComments: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptyText: { color: '#5a7fa8', fontSize: 13 },

  commentCard: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1a3a6b' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#26de8130', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  commentAvatarText: { fontSize: 14, fontWeight: '800', color: '#26de81' },
  commentMeta: { flex: 1 },
  commentUsername: { color: '#fff', fontSize: 14, fontWeight: '700' },
  commentTime: { color: '#5a7fa8', fontSize: 11, marginTop: 2 },
  commentText: { color: '#c8d8f0', fontSize: 14, lineHeight: 20, marginLeft: 42 },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#0d1f3c',
    borderTopWidth: 1, borderTopColor: '#1a3a6b',
    gap: 10,
  },
  commentInput: {
    flex: 1, backgroundColor: '#0a1628',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#fff', maxHeight: 100,
    borderWidth: 1, borderColor: '#1a3a6b',
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4A9EFF', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.3 },
  sendIcon: { fontSize: 18, color: '#fff' },
});