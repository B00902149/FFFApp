import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { verseAPI } from '../services/api';

export const DashboardScreen = ({ navigation }: any) => {
  const [verse, setVerse] = useState({
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13"
  });

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = async () => {
    try {
      const dailyVerse = await verseAPI.getDaily();
      setVerse(dailyVerse);
    } catch (error) {
      console.error('Failed to load verse:', error);
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.username}>Welcome!</Text>
        </View>
        <TouchableOpacity style={styles.notification}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Daily Verse */}
        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>Daily Verse</Text>
          <Text style={styles.verseText}>{verse.text}</Text>
          <Text style={styles.verseReference}>{verse.reference}</Text>
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

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quote}>
            "Train your body. Discipline your mind. Fuel your purpose."
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 60
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm
  },
  avatarText: {
    fontSize: 20
  },
  username: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600'
  },
  notification: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationIcon: {
    fontSize: 24
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100
  },
  verseCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
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
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 24
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'right'
  },
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
    minHeight: 140
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
  quoteCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.xl
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text.white,
    textAlign: 'center',
    lineHeight: 24
  }
});