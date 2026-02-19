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
    backgroundColor: '#022b54',
    borderRadius: borderRadius.medium,
    padding: spacing.xl,
    marginBottom: spacing.xl,
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
    textShadowRadius: 2
  }
});