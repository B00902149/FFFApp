import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { nutritionAPI } from '../services/api';

export const AddFoodScreen = ({ route, navigation }: any) => {
  const { mealType, onFoodAdded } = route.params;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);

  // Search when user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      console.log('🔍 Searching for:', searchQuery);
      const results = await nutritionAPI.searchFood(searchQuery);
      console.log('✅ Got results:', results.length);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', 'Failed to search foods. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    const foodItem = {
      name: selectedFood.name,
      calories: selectedFood.calories,
      protein: selectedFood.protein || 0,
      carbs: selectedFood.carbs || 0,
      fat: selectedFood.fat || 0,
      servingSize: selectedFood.servingSize || '1 serving'
    };

    onFoodAdded(mealType, foodItem);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to {mealType}</Text>
        <TouchableOpacity 
          onPress={handleAddFood}
          disabled={!selectedFood}
        >
          <Text style={[styles.addButton, !selectedFood && styles.addButtonDisabled]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods (e.g., chicken breast)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            autoCapitalize="none"
            placeholderTextColor={colors.text.secondary}
          />
          {searching && <ActivityIndicator style={styles.searchSpinner} color={colors.accent.blue} />}
        </View>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Selected Food Preview */}
        {selectedFood && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedTitle}>✓ SELECTED</Text>
              <TouchableOpacity onPress={() => setSelectedFood(null)}>
                <Text style={styles.clearButton}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedName}>{selectedFood.name}</Text>
            <Text style={styles.selectedCalories}>{selectedFood.calories} calories</Text>
            <View style={styles.selectedMacros}>
              <Text style={styles.macroText}>Protein: {selectedFood.protein}g</Text>
              <Text style={styles.macroText}>Carbs: {selectedFood.carbs}g</Text>
              <Text style={styles.macroText}>Fat: {selectedFood.fat}g</Text>
            </View>
            <Text style={styles.selectedServing}>Serving: {selectedFood.servingSize}</Text>
          </View>
        )}

        {/* Search Results */}
        {!selectedFood && searchResults.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Search Results ({searchResults.length})</Text>
            {searchResults.map((food, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultCard}
                onPress={() => handleSelectFood(food)}
              >
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{food.name}</Text>
                  <Text style={styles.resultServing}>{food.servingSize}</Text>
                  <View style={styles.resultMacros}>
                    <View style={styles.macroChip}>
                      <Text style={styles.macroChipText}>{food.calories} cal</Text>
                    </View>
                    <View style={styles.macroChip}>
                      <Text style={styles.macroChipText}>P: {food.protein}g</Text>
                    </View>
                    <View style={styles.macroChip}>
                      <Text style={styles.macroChipText}>C: {food.carbs}g</Text>
                    </View>
                    <View style={styles.macroChip}>
                      <Text style={styles.macroChipText}>F: {food.fat}g</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.tapHint}>Tap to select</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading State */}
        {searching && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.accent.blue} />
            <Text style={styles.loadingText}>Searching USDA database...</Text>
          </View>
        )}

        {/* Empty State - No Results */}
        {!searching && searchQuery.length > 2 && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>
              Try searching for "chicken breast", "banana", or "rice"
            </Text>
          </View>
        )}

        {/* Initial State */}
        {searchQuery.length === 0 && (
          <View style={styles.initialState}>
            <Text style={styles.initialIcon}>🍎</Text>
            <Text style={styles.initialTitle}>Search USDA Food Database</Text>
            <Text style={styles.initialText}>
              Search from 400,000+ foods with accurate nutrition data
            </Text>
            <View style={styles.examplesBox}>
              <Text style={styles.examplesTitle}>Try searching:</Text>
              <Text style={styles.exampleItem}>• "chicken breast"</Text>
              <Text style={styles.exampleItem}>• "scrambled eggs"</Text>
              <Text style={styles.exampleItem}>• "brown rice"</Text>
              <Text style={styles.exampleItem}>• "banana"</Text>
            </View>
          </View>
        )}

        {searchQuery.length > 0 && searchQuery.length <= 2 && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>💡 Type at least 3 characters to search</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.white
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
  cancelButton: {
    fontSize: 16,
    color: colors.text.secondary
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    textTransform: 'capitalize'
  },
  addButton: {
    fontSize: 16,
    color: colors.accent.blue,
    fontWeight: '600'
  },
  addButtonDisabled: {
    opacity: 0.3
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md
  },
  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary
  },
  searchSpinner: {
    marginLeft: spacing.sm
  },
  content: {
    flex: 1
  },
  selectedCard: {
    backgroundColor: colors.accent.green + '15',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.green
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  selectedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.accent.green,
    letterSpacing: 1
  },
  clearButton: {
    fontSize: 14,
    color: colors.accent.blue,
    fontWeight: '600'
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    textTransform: 'capitalize'
  },
  selectedCalories: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.sm
  },
  selectedMacros: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs
  },
  macroText: {
    fontSize: 13,
    color: colors.text.secondary
  },
  selectedServing: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.lightGray
  },
  resultCard: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray,
    backgroundColor: colors.background.white
  },
  resultInfo: {
    marginBottom: spacing.xs
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    textTransform: 'capitalize'
  },
  resultServing: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.sm
  },
  resultMacros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  macroChip: {
    backgroundColor: colors.background.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.small
  },
  macroChipText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500'
  },
  tapHint: {
    fontSize: 12,
    color: colors.accent.blue,
    marginTop: spacing.xs,
    fontStyle: 'italic'
  },
  loadingState: {
    alignItems: 'center',
    padding: spacing.xl * 2
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text.secondary
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center'
  },
  initialState: {
    alignItems: 'center',
    padding: spacing.xl * 2
  },
  initialIcon: {
    fontSize: 80,
    marginBottom: spacing.md
  },
  initialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm
  },
  initialText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  examplesBox: {
    backgroundColor: colors.background.lightGray,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    width: '100%'
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm
  },
  exampleItem: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs
  },
  hintBox: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.accent.blue + '15',
    borderRadius: borderRadius.small
  },
  hintText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center'
  }
});