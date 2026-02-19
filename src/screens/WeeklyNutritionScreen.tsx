import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { nutritionAPI } from '../services/api';

const screenWidth = Dimensions.get('window').width;

interface DayData {
  date: string;
  dayName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const WeeklyNutritionScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [weekTotal, setWeekTotal] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;

      // Get last 7 days
      const days: DayData[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        try {
          const nutrition = await nutritionAPI.getNutrition(user.id, dateStr);
          
          // Calculate macros from all meals
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;

          ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
            const mealItems = nutrition[meal] || [];
            mealItems.forEach((item: any) => {
              totalProtein += item.protein || 0;
              totalCarbs += item.carbs || 0;
              totalFat += item.fat || 0;
            });
          });

          days.push({
            date: dateStr,
            dayName,
            calories: nutrition.totalCalories || 0,
            protein: Math.round(totalProtein),
            carbs: Math.round(totalCarbs),
            fat: Math.round(totalFat)
          });
        } catch (error) {
          // Day has no data
          days.push({
            date: dateStr,
            dayName,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          });
        }
      }

      setWeekData(days);

      // Calculate totals
      const totals = days.reduce((acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      setWeekTotal(totals);

    } catch (error) {
      console.error('Load weekly data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCalorieChart = () => {
    if (weekData.length === 0) return null;

    const maxCalories = Math.max(...weekData.map(d => d.calories), 1);
    const chartHeight = 150;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Calories</Text>
        
        <View style={styles.barsContainer}>
          {weekData.map((day, index) => {
            const barHeight = (day.calories / maxCalories) * chartHeight;
            const isToday = index === weekData.length - 1;

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barColumn}>
                  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    {day.calories > 0 && (
                      <View 
                        style={[
                          styles.bar,
                          { 
                            height: barHeight,
                            backgroundColor: isToday ? colors.accent.blue : colors.accent.green
                          }
                        ]}
                      >
                        <Text style={styles.barValue}>{day.calories}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                  {day.dayName}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMacroBreakdown = () => {
    const total = weekTotal.protein + weekTotal.carbs + weekTotal.fat;
    if (total === 0) return null;

    const proteinPercent = (weekTotal.protein * 4 / (weekTotal.calories || 1)) * 100;
    const carbsPercent = (weekTotal.carbs * 4 / (weekTotal.calories || 1)) * 100;
    const fatPercent = (weekTotal.fat * 9 / (weekTotal.calories || 1)) * 100;

    return (
      <View style={styles.macroContainer}>
        <Text style={styles.sectionTitle}>Weekly Macros Breakdown</Text>

        {/* Progress bars */}
        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Protein</Text>
          <View style={styles.macroBarContainer}>
            <View 
              style={[
                styles.macroBar, 
                { 
                  width: `${Math.min(proteinPercent, 100)}%`,
                  backgroundColor: colors.accent.blue 
                }
              ]} 
            />
          </View>
          <Text style={styles.macroValue}>{weekTotal.protein}g</Text>
        </View>

        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <View style={styles.macroBarContainer}>
            <View 
              style={[
                styles.macroBar, 
                { 
                  width: `${Math.min(carbsPercent, 100)}%`,
                  backgroundColor: colors.accent.green 
                }
              ]} 
            />
          </View>
          <Text style={styles.macroValue}>{weekTotal.carbs}g</Text>
        </View>

        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Fat</Text>
          <View style={styles.macroBarContainer}>
            <View 
              style={[
                styles.macroBar, 
                { 
                  width: `${Math.min(fatPercent, 100)}%`,
                  backgroundColor: colors.accent.red 
                }
              ]} 
            />
          </View>
          <Text style={styles.macroValue}>{weekTotal.fat}g</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Weekly Nutrition</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.white} />
          <Text style={styles.loadingText}>Loading weekly data...</Text>
        </View>
      </View>
    );
  }

  const avgCalories = weekTotal.calories / 7;

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
        <Text style={styles.title}>Weekly Nutrition</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🔥</Text>
            <Text style={styles.summaryValue}>{weekTotal.calories.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Calories</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryValue}>{Math.round(avgCalories)}</Text>
            <Text style={styles.summaryLabel}>Daily Average</Text>
          </View>
        </View>

        {/* Calorie Chart */}
        {renderCalorieChart()}

        {/* Macro Breakdown */}
        {renderMacroBreakdown()}

        {/* Daily Breakdown */}
        <View style={styles.dailyContainer}>
          <Text style={styles.sectionTitle}>Daily Breakdown</Text>
          
          {weekData.map((day, index) => {
            const isToday = index === weekData.length - 1;
            return (
              <View key={index} style={[styles.dayCard, isToday && styles.dayCardToday]}>
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                    {day.dayName}
                    {isToday && ' (Today)'}
                  </Text>
                  <Text style={styles.dayDate}>
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                
                <View style={styles.dayStats}>
                  <View style={styles.dayStat}>
                    <Text style={styles.dayStatValue}>{day.calories}</Text>
                    <Text style={styles.dayStatLabel}>cal</Text>
                  </View>
                  <View style={styles.dayStatDivider} />
                  <View style={styles.dayStat}>
                    <Text style={styles.dayStatValue}>{day.protein}g</Text>
                    <Text style={styles.dayStatLabel}>protein</Text>
                  </View>
                  <View style={styles.dayStatDivider} />
                  <View style={styles.dayStat}>
                    <Text style={styles.dayStatValue}>{day.carbs}g</Text>
                    <Text style={styles.dayStatLabel}>carbs</Text>
                  </View>
                  <View style={styles.dayStatDivider} />
                  <View style={styles.dayStat}>
                    <Text style={styles.dayStatValue}>{day.fat}g</Text>
                    <Text style={styles.dayStatLabel}>fat</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Faith Card */}
        <View style={styles.faithCard}>
          <Text style={styles.faithIcon}>🙏</Text>
          <View style={styles.faithContent}>
            <Text style={styles.faithText}>
              "So whether you eat or drink or whatever you do, do it all for the glory of God."
            </Text>
            <Text style={styles.faithReference}>1 Corinthians 10:31</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: spacing.lg,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.white,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.white
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.white
  },
  content: {
    flex: 1,
    padding: spacing.lg
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: spacing.sm
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
    textAlign: 'center'
  },
  chartContainer: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center'
  },
  barColumn: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end'
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    alignItems: 'center',
    paddingTop: 4,
    minHeight: 30
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.white
  },
  barLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontWeight: '600'
  },
  barLabelToday: {
    color: colors.accent.blue,
    fontWeight: 'bold'
  },
  macroContainer: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  macroLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary
  },
  macroBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: colors.background.lightGray,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: spacing.sm
  },
  macroBar: {
    height: '100%',
    borderRadius: 10
  },
  macroValue: {
    width: 50,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'right'
  },
  dailyContainer: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  dayCard: {
    backgroundColor: colors.background.lightGray,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  dayCardToday: {
    backgroundColor: colors.accent.blue + '15',
    borderWidth: 2,
    borderColor: colors.accent.blue
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary
  },
  dayNameToday: {
    color: colors.accent.blue
  },
  dayDate: {
    fontSize: 12,
    color: colors.text.secondary
  },
  dayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  dayStat: {
    alignItems: 'center'
  },
  dayStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  dayStatLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2
  },
  dayStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.background.lightGray
  },
  faithCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue
  },
  faithIcon: {
    fontSize: 28,
    marginRight: spacing.md
  },
  faithContent: {
    flex: 1
  },
  faithText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.text.white,
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  faithReference: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.blue,
    textAlign: 'right'
  },
  bottomSpacer: {
    height: 40
  }
});