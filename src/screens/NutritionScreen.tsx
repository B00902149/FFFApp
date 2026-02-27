import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { nutritionAPI } from '../services/api';

interface FoodItem {
  _id?: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Meal {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  items: FoodItem[];
  color: string;
  icon: string;
}

export const NutritionScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadNutritionData(); }, [currentDate]);

  const loadNutritionData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const dateString = currentDate.toISOString().split('T')[0];
      const data = await nutritionAPI.getNutrition(user.id, dateString);
      setNutritionData(data);
    } catch (error: any) {
      Alert.alert('Error', error.error || error.message || 'Failed to load nutrition data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const isSame = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    if (isSame(date, today)) return 'Today';
    if (isSame(date, yesterday)) return 'Yesterday';
    if (isSame(date, tomorrow)) return 'Tomorrow';
    return date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleRemoveFood = async (mealType: string, foodId: string) => {
    if (!user?.id) return;
    Alert.alert('Remove Food', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            const dateString = currentDate.toISOString().split('T')[0];
            const updatedData = await nutritionAPI.removeFood(user.id, dateString, mealType, foodId);
            setNutritionData(updatedData);
          } catch { Alert.alert('Error', 'Failed to remove food item'); }
        }
      }
    ]);
  };

  const openAddFood = (mealType: string) => {
    navigation.navigate('AddFood', {
      mealType,
      onFoodAdded: async (mealType: string, foodItem: FoodItem) => {
        if (!user?.id) return;
        try {
          const dateString = currentDate.toISOString().split('T')[0];
          const updatedData = await nutritionAPI.addFood(user.id, dateString, mealType, foodItem);
          setNutritionData(updatedData);
        } catch { Alert.alert('Error', 'Failed to add food item'); }
      }
    });
  };

  if (loading && !nutritionData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF9F43" />
        <Text style={styles.loadingText}>Loading nutrition...</Text>
      </View>
    );
  }

  const totalCalories = nutritionData?.totalCalories || 0;
  const calorieGoal = nutritionData?.calorieGoal || 2000;
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);
  const overGoal = totalCalories > calorieGoal;

 const meals: Meal[] = [
   { name: 'Breakfast', type: 'breakfast', items: nutritionData?.breakfast || [], color: '#4A9EFF'},
   { name: 'Lunch',     type: 'lunch',     items: nutritionData?.lunch     || [], color: '#4A9EFF' },
   { name: 'Dinner',    type: 'dinner',    items: nutritionData?.dinner    || [], color: '#4A9EFF'},
   { name: 'Snacks',    type: 'snacks',    items: nutritionData?.snacks    || [], color: '#4A9EFF' },
 ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>NUTRITION</Text>
        <TouchableOpacity
          style={styles.statsBtn}
          onPress={() => navigation.navigate('WeeklyNutrition')}
        >
          <Text style={styles.statsBtnText}>≡</Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigator */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow}>
          <Text style={styles.dateArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow}>
          <Text style={styles.dateArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadNutritionData(); }}
            tintColor="#FF9F43"
            colors={['#FF9F43']}
          />
        }
      >
        {/* Calorie Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.calorieRow}>
            <View>
              <Text style={styles.sectionLabel}>CALORIES</Text>
              <View style={styles.calorieDisplay}>
                <Text style={[styles.calorieNumber, { color: overGoal ? '#FF6B6B' : '#26de81' }]}>
                  {totalCalories}
                </Text>
                <Text style={styles.calorieGoal}>/ {calorieGoal}</Text>
              </View>
            </View>
            <View style={styles.calorieMeta}>
              <Text style={[styles.remainingValue, { color: overGoal ? '#FF6B6B' : '#26de81' }]}>
                {overGoal ? '+' : ''}{Math.abs(calorieGoal - totalCalories)}
              </Text>
              <Text style={styles.remainingLabel}>{overGoal ? 'over' : 'left'}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: overGoal ? '#FF6B6B' : '#4A9EFF'}
            ]} />
          </View>
          <Text style={styles.progressPct}>{Math.round(progress)}% of daily goal</Text>
        </View>

        {/* Macro Summary */}
        <View style={styles.macroCard}>
          {[
            { label: 'Protein', value: nutritionData?.totalProtein || 0, unit: 'g', color: '#FFFFFF' },
            { label: 'Carbs',   value: nutritionData?.totalCarbs   || 0, unit: 'g', color: '#FFFFFF' },
            { label: 'Fat',     value: nutritionData?.totalFat     || 0, unit: 'g', color: '#FFFFFF' },
          ].map(macro => (
            <View key={macro.label} style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: macro.color }]}>{macro.value}{macro.unit}</Text>
              <Text style={styles.macroLabel}>{macro.label}</Text>
            </View>
          ))}
        </View>

        {/* Meal Cards */}
        {meals.map((meal) => {
          const mealCals = meal.items.reduce((sum, item) => sum + item.calories, 0);
          return (
            <View key={meal.type} style={[styles.mealCard, { borderTopColor: meal.color }]}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealIcon}>{meal.icon}</Text>
                  <View>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={[styles.mealCals, { color: meal.color }]}>{mealCals} cal</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: meal.color }]}
                  onPress={() => openAddFood(meal.type)}
                >
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {meal.items.length > 0 ? (
                meal.items.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.foodRow}
                    onPress={() => handleRemoveFood(meal.type, item._id!)}
                  >
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      {(item.protein || item.carbs || item.fat) && (
                        <Text style={styles.foodMacros}>
                          P: {item.protein || 0}g · C: {item.carbs || 0}g · F: {item.fat || 0}g
                        </Text>
                      )}
                    </View>
                    <Text style={styles.foodCals}>{item.calories} cal</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Tap + to add food</Text>
              )}
            </View>
          );
        })}

        {/* Faith Card */}
        <View style={styles.faithCard}>
          <Text style={styles.faithIcon}>🙏</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.faithTitle}>Fuel Your Purpose</Text>
            <Text style={styles.faithText}>
              "So whether you eat or drink or whatever you do, do it all for the glory of God."
            </Text>
            <Text style={styles.faithRef}>— 1 Corinthians 10:31</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1628' },
  loadingText: { color: '#8ab4f8', marginTop: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#0d1f3c',
    borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  backBtn: { width: 60 },
  backText: { color: '#4A9EFF', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  statsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#4A9EFF', alignItems: 'center', justifyContent: 'center',
  },
  statsBtnText: { fontSize: 20 },

  dateNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0d1f3c', paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  dateArrow: { padding: 8 },
  dateArrowText: { color: '#4A9EFF', fontSize: 28, fontWeight: '300' },
  dateText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  content: { padding: 16, paddingBottom: 40 },

  // Summary
  summaryCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, borderTopColor: '#4A9EFF', elevation: 4,
  },
  calorieRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  sectionLabel: { color: '#5a7fa8', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  calorieDisplay: { flexDirection: 'row', alignItems: 'baseline' },
  calorieNumber: { fontSize: 42, fontWeight: '800' },
  calorieGoal: { color: '#5a7fa8', fontSize: 18, marginLeft: 6 },
  calorieMeta: { alignItems: 'flex-end' },
  remainingValue: { fontSize: 24, fontWeight: '800' },
  remainingLabel: { color: '#5a7fa8', fontSize: 12, fontWeight: '600' },
  progressTrack: {
    height: 8, backgroundColor: '#1a3a6b',
    borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPct: { color: '#5a7fa8', fontSize: 12, fontWeight: '600' },

  // Macros
  macroCard: {
    flexDirection: 'row', backgroundColor: '#0d1f3c',
    borderRadius: 16, padding: 18, marginBottom: 14,
    justifyContent: 'space-around', elevation: 4,
  },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 22, fontWeight: '800' },
  macroLabel: { color: '#4A9EFF', fontSize: 11, fontWeight: '700', marginTop: 4, letterSpacing: 1 },

  // Meals
  mealCard: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, marginBottom: 14,
    borderTopWidth: 3, elevation: 4,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  mealTitleRow: { flexDirection: 'row', alignItems: 'center' },
  mealIcon: { fontSize: 24, marginRight: 12 },
  mealName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  mealCals: { fontSize: 12, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  addBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 28 },

  foodRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a3a6b',
  },
  foodInfo: { flex: 1, marginRight: 12 },
  foodName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  foodMacros: { color: '#5a7fa8', fontSize: 11, marginTop: 2 },
  foodCals: { color: '#4A9EFF', fontSize: 13, fontWeight: '700' },
  emptyText: { color: '#2a4a7f', fontStyle: 'italic', fontSize: 13, paddingVertical: 8 },

  // Faith
  faithCard: {
    flexDirection: 'row', backgroundColor: '#0d1f3c',
    borderRadius: 16, padding: 18,
    borderLeftWidth: 3, borderLeftColor: '#4A9EFF',
  },
  faithIcon: { fontSize: 28, marginRight: 14 },
  faithTitle: { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 6 },
  faithText: { color: '#c8d8f0', fontSize: 13, fontStyle: 'italic', lineHeight: 20, marginBottom: 6 },
  faithRef: { color: '#4A9EFF', fontSize: 12, fontWeight: '600', textAlign: 'right' },
});