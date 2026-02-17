import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';

export const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const exercises = [
    { id: '1', name: 'Bench Press', category: 'push', rating: 4.5, reviews: 234 },
    { id: '2', name: 'Barbell Row', category: 'pull', rating: 4.7, reviews: 189 },
    { id: '3', name: 'Squats', category: 'legs', rating: 4.8, reviews: 312 },
    { id: '4', name: 'Deadlift', category: 'pull', rating: 4.6, reviews: 267 },
    { id: '5', name: 'Overhead Press', category: 'push', rating: 4.4, reviews: 156 },
    { id: '6', name: 'Pull-ups', category: 'pull', rating: 4.9, reviews: 198 },
    { id: '7', name: 'Running', category: 'cardio', rating: 4.3, reviews: 445 },
    { id: '8', name: 'Plank', category: 'core', rating: 4.6, reviews: 223 }
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'push', label: 'Push' },
    { id: 'pull', label: 'Pull' },
    { id: 'legs', label: 'Legs' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'core', label: 'Core' }
  ];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || ex.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <View style={styles.stars}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={i} style={styles.starIcon}>⭐</Text>
        ))}
        {hasHalfStar && <Text style={styles.starIcon}>⭐</Text>}
      </View>
    );
  };

  const renderExercise = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => console.log('Exercise tapped:', item.name)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseCategory}>{item.category.toUpperCase()}</Text>
        <View style={styles.ratingRow}>
          {renderStars(item.rating)}
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviews})</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Text style={styles.playIcon}>▶️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Done Button */}
        <View style={styles.header}>
        <Text style={styles.title}>Exercise Search</Text>
        <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.navigate('DashboardTab')}
        >
            <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item.id && styles.filterTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      </View>

      {/* Results */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises found</Text>
        }
      />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.lightGray,
    alignItems: 'center',
    justifyContent: 'center'
    },
  closeIcon: {
  fontSize: 20,
  color: colors.text.secondary,
  fontWeight: 'bold'
},
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.background.white,
    gap: spacing.sm
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    fontSize: 16
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.accent.blue,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchIcon: {
    fontSize: 20
  },
  filtersContainer: {
    backgroundColor: colors.background.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.large,
    backgroundColor: colors.background.lightGray,
    marginRight: spacing.sm
  },
  filterChipActive: {
    backgroundColor: colors.accent.blue
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary
  },
  filterTextActive: {
    color: colors.text.white
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4
  },
  exerciseCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.blue,
    marginBottom: spacing.sm
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stars: {
    flexDirection: 'row'
  },
  starIcon: {
    fontSize: 12
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.xs
  },
  reviewCount: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playIcon: {
    fontSize: 20
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.xl
  }
});