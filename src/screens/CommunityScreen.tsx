import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';

interface Post {
  _id: string;
  userId: string;
  username: string;
  category: string;
  content: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

export const CommunityScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getPosts(20, 0);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
      Alert.alert('Error', 'Failed to load community posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) return;

    try {
      const updatedPost = await postsAPI.likePost(postId, user.id);
      
      // Update local state
      setPosts(posts.map(p => 
        p._id === postId ? updatedPost : p
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost', {
      onPostCreated: (newPost: Post) => {
        setPosts([newPost, ...posts]);
      }
    });
  };

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

  if (loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
          <Text style={styles.loadingText}>Loading community...</Text>
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
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreatePost}
        >
          <Text style={styles.createIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Faith Banner */}
      <View style={styles.faithBanner}>
        <Text style={styles.bannerIcon}>💬</Text>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Share Your Journey</Text>
          <Text style={styles.bannerText}>
            Encourage one another and build each other up
          </Text>
        </View>
      </View>

      {/* Posts Feed */}
      <ScrollView 
        style={styles.feed}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPosts();
            }}
            tintColor={colors.accent.blue}
            colors={[colors.accent.blue]}
          />
        }
      >
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌟</Text>
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share something with the community!
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.emptyButtonText}>Create First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => {
            const isLiked = user?.id ? post.likes.includes(user.id) : false;
            
            return (
              <View key={post._id} style={styles.postCard}>
                {/* Post Header */}
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

                {/* Category Label */}
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

                {/* Post Content */}
                <Text style={styles.postContent}>{post.content}</Text>

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLike(post._id)}
                  >
                    <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
                    <Text style={styles.actionText}>
                      {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      navigation.navigate('PostDetail', { 
                        post,
                        onUpdate: (updatedPost: Post) => {
                          setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
                        }
                      });
                    }}
                  >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionText}>
                      {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center'
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  createIcon: {
    fontSize: 28,
    color: colors.text.white,
    fontWeight: 'bold',
    marginTop: -2
  },
  placeholder: {
    width: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary
  },
  faithBanner: {
    flexDirection: 'row',
    backgroundColor: colors.accent.blue + '15',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  bannerIcon: {
    fontSize: 32,
    marginRight: spacing.md
  },
  bannerContent: {
    flex: 1
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2
  },
  bannerText: {
    fontSize: 13,
    color: colors.text.secondary
  },
  feed: {
    flex: 1
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
    marginTop: spacing.xl * 2
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.md
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  emptyButton: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium
  },
  emptyButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600'
  },
  postCard: {
    backgroundColor: colors.background.white,
    marginBottom: spacing.sm,
    padding: spacing.lg
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
  bottomSpacer: {
    height: 100
  }
});