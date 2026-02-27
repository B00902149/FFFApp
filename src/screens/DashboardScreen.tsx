import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { verseAPI, nutritionAPI, profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [verse, setVerse] = useState({
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13"
  });
  const [loading, setLoading] = useState(false);
  const [todaySummary, setTodaySummary] = useState({ workouts: 0, calories: 0, posts: 0 });

  const motivationalQuotes = [
    "Train your body. Discipline your mind. Fuel your purpose.",
    "Faith makes all things possible. Love makes all things easy.",
    "Your body is a temple. Treat it with respect and honor.",
    "Strength doesn't come from what you can do. It comes from God's power within you.",
    "Every workout is a prayer of gratitude for the body God gave you.",
    "Faith over fear. Progress over perfection. Praise over pride.",
    "Be strong and courageous. The Lord your God is with you.",
    "Your struggle is your strength. Your faith is your fuel."
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    loadDailyVerse();
    loadTodaySummary();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDailyVerse = async () => {
    try {
      const dailyVerse = await verseAPI.getDaily();
      setVerse(dailyVerse);
    } catch (error) {}
  };

  const loadTodaySummary = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const [nutritionData, statsData] = await Promise.all([
        nutritionAPI.getNutrition(user.id, today).catch(() => null),
        profileAPI.getStats(user.id).catch(() => null)
      ]);
      setTodaySummary({
        workouts: statsData?.workoutCount || 0,
        calories: nutritionData?.totalCalories || 0,
        posts: statsData?.postCount || 0
      });
    } catch (error) {} finally { setLoading(false); }
  };

  const tiles = [
    { id: 1, title: 'My Health',  icon: '❤️',  screen: 'Health',    color: '#FF6B6B' },
    { id: 2, title: 'Exercise',   icon: '💪',  screen: 'Exercise',  color: '#4ECDC4' },
    { id: 3, title: 'Nutrition',  icon: '🍎',  screen: 'Nutrition', color: '#FF9F43' },
    { id: 4, title: 'Community',  icon: '👥',  screen: 'Community', color: '#7B6FFF' },
  ];

  const summaryItems = [
    { value: todaySummary.workouts, label: 'Workouts', screen: 'Exercise',  color: '#4ECDC4' },
    { value: todaySummary.calories, label: 'Calories', screen: 'Nutrition', color: '#FF9F43' },
    { value: todaySummary.posts,    label: 'Posts',    screen: 'Community', color: '#4A9EFF' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.greetingName}>{user?.username || 'Athlete'} 👋</Text>
        </View>

        {/* Daily Verse */}
        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>✝️  DAILY VERSE</Text>
          <Text style={styles.verseText}>"{verse.text}"</Text>
          <Text style={styles.verseReference}>— {verse.reference}</Text>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>TODAY'S SUMMARY</Text>
            <Text style={styles.summaryDate}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#4A9EFF" style={{ paddingVertical: 16 }} />
          ) : (
            <View style={styles.summaryGrid}>
              {summaryItems.map((item, i) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.summaryItem}
                    onPress={() => navigation.navigate(item.screen)}
                  >
                    <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                  </TouchableOpacity>
                  {i < summaryItems.length - 1 && <View style={styles.summaryDivider} />}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Main Tiles */}
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={[styles.tile, { borderTopColor: tile.color }]}
              onPress={() => navigation.navigate(tile.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.tileIcon}>{tile.icon}</Text>
              <Text style={styles.tileTitle}>{tile.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Charts */}
        <TouchableOpacity
          style={styles.progressCard}
          onPress={() => navigation.navigate('ProgressCharts')}
          activeOpacity={0.7}
        >
          <Text style={styles.progressIcon}>📈</Text>
          <View style={styles.progressContent}>
            <Text style={styles.progressTitle}>View Progress Charts</Text>
            <Text style={styles.progressSubtitle}>Track your weight, calories & more</Text>
          </View>
          <Text style={styles.progressArrow}>›</Text>
        </TouchableOpacity>

        {/* Rotating Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteIcon}>💬</Text>
          <Text style={styles.quote}>{motivationalQuotes[currentQuoteIndex]}</Text>
          <View style={styles.quoteDots}>
            {motivationalQuotes.map((_, i) => (
              <View key={i} style={[styles.quoteDot, i === currentQuoteIndex && styles.quoteDotActive]} />
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  content: { padding: 16, paddingBottom: 40 },

  greeting: { marginBottom: 20, paddingTop: 8 },
  greetingText: { color: '#5a7fa8', fontSize: 14, letterSpacing: 0.5 },
  greetingName: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 2 },

  verseCard: {
    backgroundColor: '#0d1f3c',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4A9EFF',
  },
  verseLabel: { color: '#4A9EFF', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  verseText: { color: '#c8d8f0', fontSize: 14, fontStyle: 'italic', lineHeight: 22, marginBottom: 8 },
  verseReference: { color: '#4A9EFF', fontSize: 12, fontWeight: '600', textAlign: 'right' },

  summaryCard: {
    backgroundColor: '#0d1f3c',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderTopWidth: 3,
    borderTopColor: '#4A9EFF',
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryTitle: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  summaryDate: { color: '#5a7fa8', fontSize: 12 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  summaryLabel: { color: '#5a7fa8', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#1a3a6b' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  tile: {
    width: '48%',
    backgroundColor: '#0d1f3c',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderTopWidth: 3,
    elevation: 4,
    minHeight: 120,
  },
  tileIcon: { fontSize: 36, marginBottom: 10 },
  tileTitle: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },

  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1f3c',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderTopWidth: 3,
    borderTopColor: '#4A9EFF',
    elevation: 4,
  },
  progressIcon: { fontSize: 28, marginRight: 14 },
  progressContent: { flex: 1 },
  progressTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  progressSubtitle: { color: '#5a7fa8', fontSize: 12 },
  progressArrow: { fontSize: 32, color: '#4A9EFF' },

  quoteCard: {
    backgroundColor: '#0d1f3c',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: '#4A9EFF',
  },
  quoteIcon: { fontSize: 24, marginBottom: 12 },
  quote: {
    color: '#c8d8f0',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  quoteDots: { flexDirection: 'row', gap: 6 },
  quoteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a3a6b' },
  quoteDotActive: { backgroundColor: '#4A9EFF', width: 20 },
});