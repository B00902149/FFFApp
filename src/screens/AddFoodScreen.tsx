import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image
} from 'react-native';
import { nutritionAPI } from '../services/api';

const SERVING_PRESETS = [
  { label: '½',    multiplier: 0.5 },
  { label: '1x',   multiplier: 1 },
  { label: '1.5x', multiplier: 1.5 },
  { label: '2x',   multiplier: 2 },
];

const UNIT_OPTIONS = ['g', 'ml', 'oz', 'cup', 'bowl', 'glass'];

export const AddFoodScreen = ({ route, navigation }: any) => {
  const { mealType, onFoodAdded } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);

  // Serving controls
  const [multiplier, setMultiplier] = useState(1);
  const [customGrams, setCustomGrams] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('g');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) handleSearch();
      else setSearchResults([]);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await nutritionAPI.searchFood(searchQuery);
      setSearchResults(results);
    } catch {
      Alert.alert('Search Error', 'Failed to search foods. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectFood = (food: any) => {
    setSelectedFood(food);
    setMultiplier(1);
    setCustomGrams('');
    setSelectedUnit('g');
  };

  // Calculate adjusted macros
  const getAdjustedValue = (base: number) => {
    if (customGrams && !isNaN(Number(customGrams))) {
      // Custom grams: assume base values are per 100g
      return Math.round((base / 100) * Number(customGrams));
    }
    return Math.round(base * multiplier);
  };

  const getServingLabel = () => {
    if (customGrams) return `${customGrams}${selectedUnit}`;
    const preset = SERVING_PRESETS.find(p => p.multiplier === multiplier);
    return preset ? `${preset.label} serving (${selectedFood?.servingSize})` : selectedFood?.servingSize;
  };

  const handleAddFood = () => {
    if (!selectedFood) return;
    onFoodAdded(mealType, {
      name: selectedFood.name,
      calories: getAdjustedValue(selectedFood.calories),
      protein:  getAdjustedValue(selectedFood.protein || 0),
      carbs:    getAdjustedValue(selectedFood.carbs || 0),
      fat:      getAdjustedValue(selectedFood.fat || 0),
      servingSize: getServingLabel(),
    });
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
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add to {mealType}</Text>
        <TouchableOpacity onPress={handleAddFood} disabled={!selectedFood}>
          <Text style={[styles.addBtn, !selectedFood && styles.addBtnDisabled]}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search foods..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          autoCapitalize="none"
          placeholderTextColor="#2a4a7f"
        />
        {searching && <ActivityIndicator color="#4A9EFF" />}
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>

        {/* Selected Food Card */}
        {selectedFood && (
          <View style={styles.selectedCard}>
            {/* Food Name & Change */}
            <View style={styles.selectedTop}>
              <Text style={styles.selectedLabel}>✓ SELECTED</Text>
              <TouchableOpacity onPress={() => setSelectedFood(null)}>
                <Text style={styles.changeBtn}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedName}>{selectedFood.name}</Text>

            {/* Adjusted Macros */}
            <View style={styles.macroRow}>
              <View style={styles.calChip}>
                <Text style={styles.calValue}>{getAdjustedValue(selectedFood.calories)}</Text>
                <Text style={styles.calLabel}>cal</Text>
              </View>
              {[
                { label: 'Protein', value: selectedFood.protein },
                { label: 'Carbs',   value: selectedFood.carbs },
                { label: 'Fat',     value: selectedFood.fat },
              ].map(m => (
                <View key={m.label} style={styles.macroChip}>
                  <Text style={styles.macroChipValue}>{getAdjustedValue(m.value || 0)}g</Text>
                  <Text style={styles.macroChipLabel}>{m.label}</Text>
                </View>
              ))}
            </View>

            {/* Serving Presets */}
            <Text style={styles.servingTitle}>SERVING SIZE</Text>
            <View style={styles.presetRow}>
              {SERVING_PRESETS.map(p => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.presetBtn, multiplier === p.multiplier && !customGrams && styles.presetBtnActive]}
                  onPress={() => { setMultiplier(p.multiplier); setCustomGrams(''); }}
                >
                  <Text style={[styles.presetText, multiplier === p.multiplier && !customGrams && styles.presetTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount */}
            <Text style={styles.servingTitle}>CUSTOM AMOUNT</Text>
            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. 150"
                placeholderTextColor="#2a4a7f"
                value={customGrams}
                onChangeText={setCustomGrams}
                keyboardType="decimal-pad"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                {UNIT_OPTIONS.map(unit => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.unitBtn, selectedUnit === unit && styles.unitBtnActive]}
                    onPress={() => setSelectedUnit(unit)}
                  >
                    <Text style={[styles.unitText, selectedUnit === unit && styles.unitTextActive]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.servingHint}>Base: {selectedFood.servingSize}</Text>
          </View>
        )}

        {/* Search Results */}
        {!selectedFood && searchResults.length > 0 && (
          <View>
            <Text style={styles.resultsLabel}>RESULTS ({searchResults.length})</Text>
            {searchResults.map((food, i) => (
              <TouchableOpacity key={i} style={styles.resultCard} onPress={() => selectFood(food)}>
                <View style={styles.resultTop}>
                  <Text style={styles.resultName}>{food.name}</Text>
                  <Text style={styles.resultCals}>{food.calories} cal</Text>
                </View>
                <Text style={styles.resultServing}>{food.servingSize}</Text>
                <View style={styles.resultMacros}>
                  {[
                    { label: 'P', value: food.protein },
                    { label: 'C', value: food.carbs },
                    { label: 'F', value: food.fat },
                  ].map(m => (
                    <View key={m.label} style={styles.miniChip}>
                      <Text style={styles.miniChipText}>{m.label}: {m.value}g</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Searching */}
        {searching && (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color="#4A9EFF" />
            <Text style={styles.stateText}>Searching USDA database...</Text>
          </View>
        )}

        {/* No Results */}
        {!searching && searchQuery.length > 2 && searchResults.length === 0 && (
          <View style={styles.stateBox}>
            <Text style={styles.stateEmoji}>🔍</Text>
            <Text style={styles.stateTitle}>No results found</Text>
            <Text style={styles.stateText}>Try "chicken breast", "banana", or "rice"</Text>
          </View>
        )}

        {/* Initial State */}
        {searchQuery.length === 0 && (
          <View style={styles.stateBox}>
            <Image
              source={require('../../assets/usda.png')}
              style={styles.usdaLogo}
              resizeMode="contain"
            />
            <Text style={styles.stateTitle}>Search USDA Food Database</Text>
            <Text style={styles.stateText}>400,000+ foods with accurate nutrition data</Text>
            <View style={styles.examplesCard}>
              <Text style={styles.examplesTitle}>TRY SEARCHING</Text>
              {['chicken breast', 'scrambled eggs', 'brown rice', 'banana'].map(e => (
                <TouchableOpacity key={e} onPress={() => setSearchQuery(e)}>
                  <Text style={styles.exampleItem}>→ {e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Min chars hint */}
        {searchQuery.length > 0 && searchQuery.length <= 2 && (
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>💡 Type at least 3 characters to search</Text>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0d1f3c', borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  cancelBtn: { color: '#5a7fa8', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', textTransform: 'capitalize' },
  addBtn: { color: '#4A9EFF', fontSize: 16, fontWeight: '800' },
  addBtnDisabled: { opacity: 0.3 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 8 },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },

  // Selected Card
  selectedCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, borderTopColor: '#26de81', elevation: 4,
  },
  selectedTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  selectedLabel: { color: '#26de81', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  changeBtn: { color: '#4A9EFF', fontSize: 13, fontWeight: '700' },
  selectedName: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 14, textTransform: 'capitalize' },

  macroRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  calChip: {
    flex: 1.2, backgroundColor: '#4A9EFF', borderRadius: 10,
    padding: 10, alignItems: 'center',
  },
  calValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  calLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  macroChip: {
    flex: 1, backgroundColor: '#1a3a6b', borderRadius: 10,
    padding: 10, alignItems: 'center',
  },
  macroChipValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  macroChipLabel: { color: '#5a7fa8', fontSize: 10, marginTop: 2 },

  // Serving
  servingTitle: {
    color: '#5a7fa8', fontSize: 11, fontWeight: '700',
    letterSpacing: 2, marginBottom: 10,
  },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  presetBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#1a3a6b', alignItems: 'center',
    borderWidth: 1, borderColor: '#1a3a6b',
  },
  presetBtnActive: { backgroundColor: '#4A9EFF', borderColor: '#4A9EFF' },
  presetText: { color: '#5a7fa8', fontSize: 13, fontWeight: '700' },
  presetTextActive: { color: '#fff' },

  customRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  customInput: {
    backgroundColor: '#1a3a6b', borderRadius: 10,
    padding: 12, color: '#fff', fontSize: 16,
    fontWeight: '700', width: 90, textAlign: 'center',
    borderWidth: 1, borderColor: '#2a4a7f',
  },
  unitScroll: { flex: 1 },
  unitBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#1a3a6b', marginRight: 8,
    borderWidth: 1, borderColor: '#1a3a6b',
  },
  unitBtnActive: { backgroundColor: '#4A9EFF', borderColor: '#4A9EFF' },
  unitText: { color: '#5a7fa8', fontSize: 13, fontWeight: '700' },
  unitTextActive: { color: '#fff' },
  servingHint: { color: '#2a4a7f', fontSize: 11, fontStyle: 'italic', marginTop: 4 },

  // Results
  resultsLabel: { color: '#5a7fa8', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  resultCard: {
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 16, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: '#4A9EFF',
  },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  resultName: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1, textTransform: 'capitalize' },
  resultCals: { color: '#4A9EFF', fontSize: 15, fontWeight: '800' },
  resultServing: { color: '#5a7fa8', fontSize: 12, marginBottom: 10 },
  resultMacros: { flexDirection: 'row', gap: 8 },
  miniChip: { backgroundColor: '#1a3a6b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  miniChipText: { color: '#8ab4f8', fontSize: 11, fontWeight: '600' },

  // States
  stateBox: { alignItems: 'center', paddingVertical: 40 },
  stateEmoji: { fontSize: 64, marginBottom: 16 },
  stateTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  stateText: { color: '#5a7fa8', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  usdaLogo: { width: 160, height: 80, marginBottom: 16 },

  examplesCard: {
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 16, marginTop: 20, width: '100%',
    borderTopWidth: 2, borderTopColor: '#4A9EFF',
  },
  examplesTitle: { color: '#5a7fa8', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  exampleItem: { color: '#4A9EFF', fontSize: 15, fontWeight: '600', marginBottom: 10 },

  hintCard: {
    backgroundColor: '#0d1f3c', borderRadius: 12, padding: 14, marginTop: 8,
    borderLeftWidth: 3, borderLeftColor: '#4A9EFF',
  },
  hintText: { color: '#8ab4f8', fontSize: 14, textAlign: 'center' },
});