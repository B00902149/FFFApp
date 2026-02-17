import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        profileAPI.getProfile(user.id),
        profileAPI.getStats(user.id)
      ]);
      
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      profile,
      onUpdate: (updatedProfile: any) => {
        setProfile(updatedProfile);
      }
    });
  };

  const handleLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          console.log('User confirmed logout');
          await logout();
          console.log('Logout completed');
          // Navigation will automatically happen because user becomes null
        }
      }
    ]
  );
};

  const getDaysActive = () => {
    if (!stats) return 0;
    return stats.daysActive || 0;
  };

  const getBMI = () => {
    if (!profile?.currentWeight || !profile?.height) return null;
    
    // Convert to metric if needed
    let weight = profile.currentWeight;
    let height = profile.height;
    
    if (profile.weightUnit === 'lbs') {
      weight = weight * 0.453592; // Convert to kg
    }
    
    if (profile.heightUnit === 'inches') {
      height = height * 2.54; // Convert to cm
    }
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    return bmi.toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  const bmi = getBMI();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProfile();
            }}
            tintColor={colors.accent.blue}
            colors={[colors.accent.blue]}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{profile?.avatar || '👤'}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.username}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          
          {profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.workoutCount || 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.postCount || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.nutritionDays || 0}</Text>
            <Text style={styles.statLabel}>Days Logged</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getDaysActive()}</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
        </View>

        {/* Fitness Goal */}
        {profile?.fitnessGoal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Goal</Text>
            <View style={styles.goalCard}>
              <Text style={styles.goalIcon}>🎯</Text>
              <Text style={styles.goalText}>{profile.fitnessGoal}</Text>
            </View>
          </View>
        )}

        {/* Body Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>
          
          <View style={styles.metricsGrid}>
            {profile?.currentWeight && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Current Weight</Text>
                <Text style={styles.metricValue}>
                  {profile.currentWeight} {profile.weightUnit || 'kg'}
                </Text>
              </View>
            )}

            {profile?.targetWeight && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Target Weight</Text>
                <Text style={styles.metricValue}>
                  {profile.targetWeight} {profile.weightUnit || 'kg'}
                </Text>
              </View>
            )}

            {profile?.height && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Height</Text>
                <Text style={styles.metricValue}>
                  {profile.height} {profile.heightUnit || 'cm'}
                </Text>
              </View>
            )}

            {bmi && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>BMI</Text>
                <Text style={styles.metricValue}>{bmi}</Text>
              </View>
            )}
          </View>

          {(!profile?.currentWeight && !profile?.targetWeight && !profile?.height) && (
            <View style={styles.emptyMetrics}>
              <Text style={styles.emptyText}>No metrics added yet</Text>
              <TouchableOpacity 
                style={styles.addMetricsButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.addMetricsText}>Add Metrics</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Faith Card */}
        <View style={styles.faithCard}>
          <Text style={styles.faithIcon}>🙏</Text>
          <View style={styles.faithContent}>
            <Text style={styles.faithTitle}>Member Since</Text>
            <Text style={styles.faithText}>
              {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              }) : 'Recently'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Exercise')}
          >
            <Text style={styles.actionIcon}>💪</Text>
            <Text style={styles.actionText}>Start Workout</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Nutrition')}
          >
            <Text style={styles.actionIcon}>🍎</Text>
            <Text style={styles.actionText}>Log Nutrition</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Community')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>View Community</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

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
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  logoutButton: {
    fontSize: 16,
    color: colors.accent.red,
    fontWeight: '600'
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
  content: {
    flex: 1
  },
  profileHeader: {
    backgroundColor: colors.background.white,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.sm
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  avatarLargeText: {
    fontSize: 48
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4
  },
  profileEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md
  },
  bio: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    lineHeight: 20
  },
  editButton: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    marginTop: spacing.sm
  },
  editButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    backgroundColor: colors.background.white,
    marginBottom: spacing.sm
  },
  statCard: {
    width: '50%',
    padding: spacing.lg,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent.blue,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center'
  },
  section: {
    backgroundColor: colors.background.white,
    padding: spacing.lg,
    marginBottom: spacing.sm
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.green + '15',
    padding: spacing.md,
    borderRadius: borderRadius.small,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.green
  },
  goalIcon: {
    fontSize: 28,
    marginRight: spacing.md
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  metricCard: {
    width: '47%',
    backgroundColor: colors.background.lightGray,
    padding: spacing.md,
    borderRadius: borderRadius.small
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  emptyMetrics: {
    alignItems: 'center',
    paddingVertical: spacing.xl
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md
  },
  addMetricsButton: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.small
  },
  addMetricsText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: '600'
  },
  faithCard: {
    flexDirection: 'row',
    backgroundColor: colors.accent.blue + '15',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4
  },
  faithText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  actionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 32
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary
  },
  actionArrow: {
    fontSize: 24,
    color: colors.text.secondary
  },
  bottomSpacer: {
    height: 100
  }
});