import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator} from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';


export const PostDetailScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { post: initialPost, onUpdate } = route.params || {};

  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Prayer Request': return '🙏';
      case 'Testimony': return '✨';
      case 'Encouragement': return '💪';
      case 'Victory': return '🎉';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prayer Request': return colors.accent.blue;
      case 'Testimony': return colors.accent.yellow;
      case 'Encouragement': return colors.accent.green;
      case 'Victory': return colors.accent.red;
      default: return colors.text.secondary;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (!user?.id) return;

    try {
      const updatedPost = await postsAPI.likePost(post._id, user.id);
      setPost(updatedPost);
      if (onUpdate) onUpdate(updatedPost);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Add Comment', 'Please write a comment');
      return;
    }

    if (!user?.id || !user?.username) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setSubmitting(true);
    try {
      const updatedPost = await postsAPI.addComment(
        post._id,
        user.id,
        user.username,
        commentText.trim()
      );

      setPost(updatedPost);
      if (onUpdate) onUpdate(updatedPost);
      setCommentText('');
      Alert.alert('Success', 'Comment added!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user?.id) return;

    // Check if user owns the post
    if (post.userId !== user.id) {
      Alert.alert('Not Authorized', 'You can only delete your own posts');
      return;
    }

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postsAPI.deletePost(post._id, user.id);
              Alert.alert('Deleted', 'Post has been deleted');
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const isLiked = user?.id ? post.likes.includes(user.id) : false;
  const isOwnPost = user?.id === post.userId;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {isOwnPost && (
          <TouchableOpacity onPress={handleDeletePost}>
            <Text style={styles.deleteButton}>🗑️</Text>
          </TouchableOpacity>
        )}
        {!isOwnPost && <View style={styles.placeholder} />}
      </View>

      <ScrollView style={styles.content}>
        {/* Original Post */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>
                {post.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.username}>{post.username}</Text>
              <Text style={styles.timestamp}>{getTimeAgo(post.createdAt)}</Text>
            </View>
            <View 
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(post.category) + '20' }
              ]}
            >
              <Text style={styles.categoryIcon}>{getCategoryIcon(post.category)}</Text>
            </View>
          </View>

          <View style={styles.categoryLabelContainer}>
            <Text 
              style={[
                styles.categoryLabel,
                { color: getCategoryColor(post.category) }
              ]}
            >
              {post.category}
            </Text>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionText}>
                {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>
                {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
              </Text>
            </View>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({post.comments.length})
          </Text>

          {post.comments.length === 0 ? (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsIcon}>💬</Text>
              <Text style={styles.noCommentsText}>No comments yet</Text>
              <Text style={styles.noCommentsSubtext}>Be the first to encourage!</Text>
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
                    <Text style={styles.commentTimestamp}>
                      {getTimeAgo(comment.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor={colors.text.secondary}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!commentText.trim() || submitting) && styles.sendButtonDisabled
          ]}
          onPress={handleAddComment}
          disabled={!commentText.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  deleteButton: {
    fontSize: 24,
    padding: spacing.sm
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  postCard: {
    backgroundColor: colors.background.white,
    padding: spacing.lg,
    marginBottom: spacing.sm
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.blue + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  avatar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent.blue
  },
  postMeta: {
    flex: 1
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2
  },
  categoryBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryIcon: {
    fontSize: 18
  },
  categoryLabelContainer: {
    marginBottom: spacing.sm
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background.lightGray,
    gap: spacing.lg
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionIcon: {
    fontSize: 18,
    marginRight: spacing.xs
  },
  actionText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500'
  },
  commentsSection: {
    backgroundColor: colors.background.white,
    padding: spacing.lg
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2
  },
  noCommentsIcon: {
    fontSize: 48,
    marginBottom: spacing.sm
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: colors.text.secondary
  },
  commentCard: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.green + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent.green
  },
  commentMeta: {
    flex: 1
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary
  },
  commentTimestamp: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
    marginLeft: 40
  },
  bottomSpacer: {
    height: 100
  },
  commentInputContainer: {
  flexDirection: 'row',
  padding: spacing.md,
  paddingBottom: spacing.xl + 10,  // Extra space for Android nav bar
  backgroundColor: colors.background.white,
  borderTopWidth: 1,
  borderTopColor: colors.background.lightGray,
  alignItems: 'flex-end',
  // Add minimum height to ensure it's visible
  minHeight: 70
},
  commentInput: {
    flex: 1,
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    maxHeight: 100,
    marginRight: spacing.sm
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    opacity: 0.3
  },
  sendIcon: {
    fontSize: 20,
    color: colors.text.white
  }
});