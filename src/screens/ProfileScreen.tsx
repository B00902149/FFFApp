import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { profileAPI, workoutAPI } from '../services/api';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadProfile(); }, []);

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
      await calculateStreak();
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStreak = async () => {
    try {
      if (!user?.id) return;
      const response = await workoutAPI.getWorkouts(user.id);
      const workouts = Array.isArray(response) ? response : (response?.workouts || []);
      if (!workouts || workouts.length === 0) { setStreak(0); return; }

      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const hasTodayWorkout = workouts.some((w: any) => w && new Date(w.completedAt || w.createdAt).toISOString().split('T')[0] === todayStr && w.isCompleted);
      const hasYesterdayWorkout = workouts.some((w: any) => w && new Date(w.completedAt || w.createdAt).toISOString().split('T')[0] === yesterdayStr && w.isCompleted);

      if (!hasTodayWorkout && !hasYesterdayWorkout) { setStreak(0); return; }

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasWorkout = workouts.some((w: any) => w && new Date(w.completedAt || w.createdAt).toISOString().split('T')[0] === dateStr && w.isCompleted);
        if (hasWorkout) { currentStreak++; checkDate.setDate(checkDate.getDate() - 1); }
        else break;
        if (currentStreak > 365) break;
      }
      setStreak(currentStreak);
    } catch (error) { setStreak(0); }
  };

  const handleLogout = async () => { await logout(); };

  const getBMI = () => {
    if (!profile?.currentWeight || !profile?.height) return null;
    let weight = profile.weightUnit === 'lbs' ? profile.currentWeight * 0.453592 : profile.currentWeight;
    let height = profile.heightUnit === 'inches' ? profile.height * 2.54 : profile.height;
    return (weight / Math.pow(height / 100, 2)).toFixed(1);
  };

  const getStreakColor = () => {
    if (streak === 0) return '#5a7fa8';
    if (streak < 7) return '#4A9EFF';
    if (streak < 30) return '#FF6B6B';
    return '#FFD700';
  };

  const getStreakMessage = () => {
    if (streak === 0) return 'Start Today!';
    if (streak === 1) return 'Great Start!';
    if (streak < 7) return 'Keep Going!';
    if (streak < 30) return 'On Fire! 🔥';
    return 'Legendary! 🏆';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A9EFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const bmi = getBMI();

  const actionButtons = [
    { icon: '📋', label: 'Workout Templates', screen: 'WorkoutTemplates' },
    { icon: '💪', label: 'Start Workout',      screen: 'Exercise' },
    { icon: '🍎', label: 'Weekly Nutrition',   screen: 'WeeklyNutrition' },
    { icon: '💬', label: 'View Community',     screen: 'Community' },
    { icon: '📈', label: 'Progress Charts',    screen: 'ProgressCharts' },
  ];

  const statItems = [
    { value: stats?.workoutCount || 0,   label: 'Workouts',   color: '#FFFFFF'},
    { value: stats?.postCount || 0,      label: 'Posts',      color: '#FFFFFF' },
    { value: stats?.nutritionDays || 0,  label: 'Days Logged',color: '#FFFFFF'},
    { value: stats?.daysActive || 0,     label: 'Days Active', color: '#FFFFFF' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadProfile(); }}
            tintColor="#4A9EFF"
            colors={['#4A9EFF']}
          />
        }
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profile?.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>{profile?.avatar || '👤'}</Text>
            )}
          </View>
          <Text style={styles.profileName}>{profile?.username}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { profile, onUpdate: setProfile })}>
              <Text style={styles.editButtonText}>✎  Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak Card */}
        <View style={[styles.streakCard, { borderTopColor: getStreakColor() }]}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View style={styles.streakContent}>
            <Text style={[styles.streakValue, { color: getStreakColor() }]}>
              {streak} Day{streak !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.streakLabel}>Workout Streak</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: getStreakColor() }]}>
            <Text style={styles.streakBadgeText}>{getStreakMessage()}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statItems.map(item => (
            <View key={item.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Fitness Goal */}
        {profile?.fitnessGoal && (
          <View style={styles.goalCard}>
            <Text style={styles.goalIcon}>🎯</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>FITNESS GOAL</Text>
              <Text style={styles.goalText}>{profile.fitnessGoal}</Text>
            </View>
          </View>
        )}

        {/* Body Metrics */}
        <View style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>BODY METRICS</Text>
          <View style={styles.metricsGrid}>
            {profile?.currentWeight && (
              <View style={[styles.metricItem, { borderTopColor: '#4A9EFF' }]}>
                <Text style={styles.metricValue}>{profile.currentWeight}</Text>
                <Text style={styles.metricUnit}>{profile.weightUnit || 'kg'}</Text>
                <Text style={styles.metricLabel}>Current</Text>
              </View>
            )}
            {profile?.targetWeight && (
              <View style={[styles.metricItem, { borderTopColor: '#4A9EFF' }]}>
                <Text style={styles.metricValue}>{profile.targetWeight}</Text>
                <Text style={styles.metricUnit}>{profile.weightUnit || 'kg'}</Text>
                <Text style={styles.metricLabel}>Target</Text>
              </View>
            )}
            {profile?.height && (
              <View style={[styles.metricItem, { borderTopColor: '#4A9EFF' }]}>
                <Text style={styles.metricValue}>{profile.height}</Text>
                <Text style={styles.metricUnit}>{profile.heightUnit || 'cm'}</Text>
                <Text style={styles.metricLabel}>Height</Text>
              </View>
            )}
            {bmi && (
              <View style={[styles.metricItem, { borderTopColor: '#4A9EFF' }]}>
                <Text style={styles.metricValue}>{bmi}</Text>
                <Text style={styles.metricUnit}>BMI</Text>
                <Text style={styles.metricLabel}>Index</Text>
              </View>
            )}
          </View>
          {(!profile?.currentWeight && !profile?.targetWeight && !profile?.height) && (
            <TouchableOpacity style={styles.addMetricsBtn} onPress={() => navigation.navigate('EditProfile', { profile, onUpdate: setProfile })}>
              <Text style={styles.addMetricsBtnText}>+ Add Body Metrics</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Member Since */}
        <View style={styles.memberCard}>
          <Text style={styles.memberIcon}>🙏</Text>
          <View>
            <Text style={styles.sectionLabel}>MEMBER SINCE</Text>
            <Text style={styles.memberText}>
              {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          {actionButtons.map((btn, i) => (
            <TouchableOpacity
              key={btn.screen}
              style={[styles.actionRow, i === actionButtons.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate(btn.screen)}
            >
              <Text style={styles.actionIcon}>{btn.icon}</Text>
              <Text style={styles.actionLabel}>{btn.label}</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1628' },
  loadingText: { color: '#8ab4f8', marginTop: 12 },
  content: { padding: 16, paddingBottom: 40 },

  // Profile Header
  profileCard: {
    backgroundColor: '#0d1f3c',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    borderTopWidth: 3,
    borderTopColor: '#4A9EFF',
    elevation: 4,
  },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1a3a6b',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, overflow: 'hidden',
    borderWidth: 3, borderColor: '#4A9EFF',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  avatarText: { fontSize: 48 },
  profileName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  profileEmail: { color: '#5a7fa8', fontSize: 13, marginBottom: 8 },
  bio: { color: '#c8d8f0', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 12, paddingHorizontal: 16 },
  profileActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editButton: { backgroundColor: '#4A9EFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  editButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  logoutButton: { backgroundColor: '#1a3a6b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  logoutButtonText: { color: '#FF6B6B', fontWeight: '700', fontSize: 14 },

  // Streak
  streakCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, elevation: 4,
  },
  streakIcon: { fontSize: 36, marginRight: 14 },
  streakContent: { flex: 1 },
  streakValue: { fontSize: 24, fontWeight: '800' },
  streakLabel: { color: '#4A9EFF', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  streakBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  streakBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', marginBottom: 14,
  },
  statCard: {
    width: '48%', backgroundColor: '#0d1f3c',
    borderRadius: 16, padding: 18, alignItems: 'center',
    marginBottom: 12, elevation: 4,
  },
  statValue: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: '#4A9EFF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  // Goal
  goalCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, borderTopColor: '#4A9EFF', elevation: 4,
  },
  goalIcon: { fontSize: 32, marginRight: 14 },
  goalText: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 4 },

  // Metrics
  metricsCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, borderTopColor: '#4A9EFF', elevation: 4,
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  metricItem: {
    width: '47%', backgroundColor: '#0a1628',
    borderRadius: 12, padding: 14, alignItems: 'center',
    borderTopWidth: 2,
  },
  metricValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  metricUnit: { color: '#5a7fa8', fontSize: 11, marginTop: 2, fontWeight: '600' },
  metricLabel: { color: '#5a7fa8', fontSize: 11, marginTop: 4, letterSpacing: 1, fontWeight: '700' },
  addMetricsBtn: {
    backgroundColor: '#1a3a6b', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 14,
  },
  addMetricsBtnText: { color: '#4A9EFF', fontWeight: '700', fontSize: 14 },

  // Member
  memberCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, borderTopColor: '#4A9EFF', elevation: 4,
  },
  memberIcon: { fontSize: 32, marginRight: 14 },
  memberText: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 4 },

  // Actions
  actionsCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, borderTopColor: '#4A9EFF', elevation: 4,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  actionIcon: { fontSize: 22, marginRight: 14, width: 30 },
  actionLabel: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  actionArrow: { fontSize: 28, color: '#4A9EFF' },

  // Shared
  sectionTitle: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  sectionLabel: { color: '#5a7fa8', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
});