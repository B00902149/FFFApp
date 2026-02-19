import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { verseAPI, nutritionAPI, profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [verse, setVerse] = useState({
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13"
  });
  const [loading, setLoading] = useState(false);
  
  // Today's Summary State
  const [todaySummary, setTodaySummary] = useState({
    workouts: 0,
    calories: 0,
    posts: 0
  });

  // Motivational Quotes Rotation
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

  // Rotate quotes every 5 seconds
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
    } catch (error) {
      console.error('Failed to load verse:', error);
    }
  };

  const loadTodaySummary = async () => {
    try {
      if (!user?.id) return;

      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Load today's data
      const [nutritionData, statsData] = await Promise.all([
        nutritionAPI.getNutrition(user.id, today).catch(() => null),
        profileAPI.getStats(user.id).catch(() => null)
      ]);

      setTodaySummary({
        workouts: statsData?.workoutCount || 0,
        calories: nutritionData?.totalCalories || 0,
        posts: statsData?.postCount || 0
      });
    } catch (error) {
      console.error('Load summary error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTilePress = (screen: string) => {
    console.log('Tile pressed:', screen);
    if (screen) {
      navigation.navigate(screen);
    }
  };

  const tiles = [
    { id: 1, title: 'My Health', icon: '❤️', screen: 'Health' },
    { id: 2, title: 'Exercise', icon: '💪', screen: 'Exercise' },
    { id: 3, title: 'Nutrition', icon: '🍎', screen: 'Nutrition' },
    { id: 4, title: 'Community', icon: '👥', screen: 'Community' }
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Daily Verse */}
        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>DAILY VERSE</Text>
          <Text style={styles.verseText}>{verse.text}</Text>
          <Text style={styles.verseReference}>{verse.reference}</Text>
        </View>

        {/* Today's Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>📊 Today's Summary</Text>
            <Text style={styles.summaryDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.summaryLoading}>
              <ActivityIndicator size="small" color={colors.accent.blue} />
            </View>
          ) : (
            <View style={styles.summaryGrid}>
              <TouchableOpacity 
                style={styles.summaryItem}
                onPress={() => navigation.navigate('Exercise')}
              >
                <Text style={styles.summaryValue}>{todaySummary.workouts}</Text>
                <Text style={styles.summaryLabel}>Workouts</Text>
              </TouchableOpacity>
              
              <View style={styles.summaryDivider} />
              
              <TouchableOpacity 
                style={styles.summaryItem}
                onPress={() => navigation.navigate('Nutrition')}
              >
                <Text style={styles.summaryValue}>{todaySummary.calories}</Text>
                <Text style={styles.summaryLabel}>Calories</Text>
              </TouchableOpacity>
              
              <View style={styles.summaryDivider} />
              
              <TouchableOpacity 
                style={styles.summaryItem}
                onPress={() => navigation.navigate('Community')}
              >
                <Text style={styles.summaryValue}>{todaySummary.posts}</Text>
                <Text style={styles.summaryLabel}>Posts</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dashboard Grid */}
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <TouchableOpacity 
              key={tile.id} 
              style={styles.tile}
              onPress={() => handleTilePress(tile.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{tile.icon}</Text>
              </View>
              <Text style={styles.tileTitle}>{tile.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Charts Link */}
        <TouchableOpacity 
          style={styles.progressCard}
          onPress={() => navigation.navigate('ProgressCharts')}
          activeOpacity={0.7}
        >
          <View style={styles.progressIcon}>
            <Text style={styles.progressIconText}>📈</Text>
          </View>
          <View style={styles.progressContent}>
            <Text style={styles.progressTitle}>View Progress Charts</Text>
            <Text style={styles.progressSubtitle}>Track your weight, calories & more</Text>
          </View>
          <Text style={styles.progressArrow}>›</Text>
        </TouchableOpacity>

        {/* Motivational Quote (Rotating) */}
        <View style={styles.quoteCard}>
          <Text style={styles.quote}>
            {motivationalQuotes[currentQuoteIndex]}
          </Text>
          <View style={styles.quoteDots}>
            {motivationalQuotes.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.quoteDot,
                  index === currentQuoteIndex && styles.quoteDotActive
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.primary.dark
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 40
  },
  verseCard: {
    backgroundColor: '#022b54',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  verseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.blue,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'
  },
  verseText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text.white,
    marginBottom: spacing.sm,
    lineHeight: 24
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.blue,
    textAlign: 'right'
  },
  // Today's Summary Styles
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary
  },
  summaryDate: {
    fontSize: 13,
    color: colors.text.secondary
  },
  summaryLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center'
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent.blue,
    marginBottom: 4
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase'
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.background.lightGray
  },
  // Grid Styles
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg
  },
  tile: {
    width: '48%',
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  icon: {
    fontSize: 30
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center'
  },
  // Progress Card Styles
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  progressIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  progressIconText: {
    fontSize: 24
  },
  progressContent: {
    flex: 1
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4
  },
  progressSubtitle: {
    fontSize: 13,
    color: colors.text.secondary
  },
  progressArrow: {
    fontSize: 28,
    color: colors.text.secondary
  },
  // Quote Card Styles
  quoteCard: {
    backgroundColor: '#022b54',
    borderRadius: borderRadius.medium,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center'
  },
  quote: {
    fontSize: 17,
    fontStyle: 'italic',
    color: colors.text.white,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: spacing.md
  },
  quoteDots: {
    flexDirection: 'row',
    gap: 6
  },
  quoteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  quoteDotActive: {
    backgroundColor: colors.accent.blue,
    width: 20
  }
});