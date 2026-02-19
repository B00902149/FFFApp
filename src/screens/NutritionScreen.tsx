import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
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
}

export const NutritionScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNutritionData();
  }, [currentDate]);

  const loadNutritionData = async () => {
  if (!user?.id) {
    console.log('❌ No user ID found');
    Alert.alert('Error', 'User not logged in');
    return;
  }

  try {
    setLoading(true);
    const dateString = currentDate.toISOString().split('T')[0];
    
    console.log('📅 Loading nutrition data...');
    console.log('User ID:', user.id);
    console.log('Date:', dateString);
    
    const data = await nutritionAPI.getNutrition(user.id, dateString);
    
    console.log('✅ Nutrition data loaded successfully');
    console.log('Data:', data);
    
    setNutritionData(data);
  } catch (error: any) {
    console.error('❌ Failed to load nutrition');
    console.error('Full error:', JSON.stringify(error, null, 2));
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
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1: Date, d2: Date) => 
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
    if (isSameDay(date, tomorrow)) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleAddFood = async (mealType: string, foodItem: FoodItem) => {
    if (!user?.id) return;

    try {
      const dateString = currentDate.toISOString().split('T')[0];
      const updatedData = await nutritionAPI.addFood(user.id, dateString, mealType, foodItem);
      setNutritionData(updatedData);
    } catch (error) {
      console.error('Failed to add food:', error);
      Alert.alert('Error', 'Failed to add food item');
    }
  };

  const handleRemoveFood = async (mealType: string, foodId: string) => {
    if (!user?.id) return;

    Alert.alert(
      'Remove Food',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const dateString = currentDate.toISOString().split('T')[0];
              const updatedData = await nutritionAPI.removeFood(user.id, dateString, mealType, foodId);
              setNutritionData(updatedData);
            } catch (error) {
              console.error('Failed to remove food:', error);
              Alert.alert('Error', 'Failed to remove food item');
            }
          }
        }
      ]
    );
  };

  const openAddFood = (mealType: string) => {
    navigation.navigate('AddFood', {
      mealType,
      onFoodAdded: handleAddFood
    });
  };

  if (loading && !nutritionData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
          <Text style={styles.loadingText}>Loading nutrition data...</Text>
        </View>
      </View>
    );
  }

  const totalCalories = nutritionData?.totalCalories || 0;
  const calorieGoal = nutritionData?.calorieGoal || 2000;
  const meals: Meal[] = [
    { name: 'Breakfast', type: 'breakfast', items: nutritionData?.breakfast || [] },
    { name: 'Lunch', type: 'lunch', items: nutritionData?.lunch || [] },
    { name: 'Dinner', type: 'dinner', items: nutritionData?.dinner || [] },
    { name: 'Snacks', type: 'snacks', items: nutritionData?.snacks || [] }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Date Navigator */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
        <TouchableOpacity onPress={() => changeDate(1)}>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie Summary */}
      <View style={styles.summary}>
        <View style={styles.calorieDisplay}>
          <Text style={styles.calorieNumber}>{totalCalories}</Text>
          <Text style={styles.calorieLabel}>/ {calorieGoal} cal</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min((totalCalories / calorieGoal) * 100, 100)}%` },
              totalCalories > calorieGoal && styles.progressOverGoal
            ]} 
          />
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{calorieGoal - totalCalories}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round((totalCalories / calorieGoal) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
      </View>

      {/* Meals List */}
<ScrollView 
  style={styles.mealsList}
  contentContainerStyle={styles.mealsContent}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        loadNutritionData();
      }}
      tintColor={colors.accent.blue}
      colors={[colors.accent.blue]}
    />
  }
>
  {meals.map((meal, index) => (
    <View key={index} style={styles.mealSection}>
      {/* meal content... */}
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCalories}>
                  {meal.items.reduce((sum, item) => sum + item.calories, 0)} cal
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openAddFood(meal.type)}
              >
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
            </View>
            
            {meal.items.length > 0 ? (
              meal.items.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.foodItem}
                  onPress={() => handleRemoveFood(meal.type, item._id!)}
                >
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    {(item.protein || item.carbs || item.fat) && (
                      <Text style={styles.macros}>
                        P: {item.protein || 0}g | C: {item.carbs || 0}g | F: {item.fat || 0}g
                      </Text>
                    )}
                  </View>
                  <Text style={styles.foodCalories}>{item.calories} cal</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No items added</Text>
            )}
          </View>
        ))}

        {/* Faith Section */}
        <View style={styles.faithCard}>
          <Text style={styles.faithIcon}>🙏</Text>
          <View style={styles.faithContent}>
            <Text style={styles.faithTitle}>Fuel Your Purpose</Text>
            <Text style={styles.faithText}>
              "So whether you eat or drink or whatever you do, do it all for the glory of God."
            </Text>
            <Text style={styles.faithReference}>1 Corinthians 10:31</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary.dark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.white,
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.white,
    flex: 1,
    textAlign: 'center'
  },
  placeholder: {
    width: 40
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
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  arrow: {
    fontSize: 24,
    color: colors.accent.blue,
    paddingHorizontal: spacing.md,
    fontWeight: 'bold'
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary
  },
  summary: {
    backgroundColor: colors.background.white,
    padding: spacing.lg,
    marginBottom: spacing.sm
  },
  calorieDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.accent.blue
  },
  calorieLabel: {
    fontSize: 18,
    color: colors.text.secondary,
    marginLeft: spacing.sm
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.green
  },
  progressOverGoal: {
    backgroundColor: colors.accent.red
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.background.lightGray
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2
  },
  mealsList: {
    flex: 1
  },
  mealsContent: {
    paddingBottom: 100
  },
  mealSection: {
    backgroundColor: colors.background.white,
    padding: spacing.lg,
    marginBottom: spacing.sm
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary
  },
  mealCalories: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addIcon: {
    fontSize: 20,
    color: colors.text.white,
    fontWeight: 'bold'
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.lightGray
  },
  foodInfo: {
    flex: 1,
    marginRight: spacing.md
  },
  foodName: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2
  },
  macros: {
    fontSize: 12,
    color: colors.text.secondary
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    paddingVertical: spacing.sm
  },
  faithCard: {
    flexDirection: 'row',
    backgroundColor: colors.accent.blue + '15',
    margin: spacing.lg,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
    marginBottom: spacing.xs
  },
  faithText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.text.white,
    lineHeight: 20,
    marginBottom: spacing.xs
  },
  faithReference: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.blue,
    textAlign: 'right'
  }
});