import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
// Import all screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import HealthScreen from '../screens/HealthScreen';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';
import { ExerciseProgressScreen } from '../screens/ExerciseProgressScreen';
import { CompleteWorkoutScreen } from '../screens/CompleteWorkoutScreen';
import { NutritionScreen } from '../screens/NutritionScreen';
import { AddFoodScreen } from '../screens/AddFoodScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ProgressChartsScreen } from '../screens/ProgressChartsScreen';
import { WeeklyNutritionScreen } from '../screens/WeeklyNutritionScreen';
import { WorkoutTemplatesScreen } from '../screens/WorkoutTemplatesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const NavBar = ({ navigation, activeTab }: { navigation: any; activeTab: 'search' | 'dashboard' | 'profile' }) => (
  <View style={styles.topNav}>
    <Image
      source={require('../../assets/logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
    <View style={styles.navPills}>
      <TouchableOpacity
        style={[styles.navPill, activeTab === 'search' && styles.navPillActive]}
        onPress={() => navigation.navigate('SearchTab')}
      >
        <Text style={styles.navPillText}>🔍</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navPill, activeTab === 'dashboard' && styles.navPillActive]}
        onPress={() => navigation.navigate('DashboardTab')}
      >
        <Text style={styles.navPillText}>🏠</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navPill, activeTab === 'profile' && styles.navPillActive]}
        onPress={() => navigation.navigate('ProfileTab')}
      >
        <Text style={styles.navPillText}>👤</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity style={styles.bellIcon}>
      <Text style={styles.bellText}>🔔</Text>
    </TouchableOpacity>
  </View>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,  // ← enable headers globally
        tabBarStyle: { display: 'none', height: 0 },
        tabBarButton: () => null,
      }}
      initialRouteName="DashboardTab"
    >
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          header: ({ navigation }) => <NavBar navigation={navigation} activeTab="search" />
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          header: ({ navigation }) => <NavBar navigation={navigation} activeTab="dashboard" />
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          header: ({ navigation }) => <NavBar navigation={navigation} activeTab="profile" />
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.primary.dark }
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Health" component={HealthScreen} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} />
            <Stack.Screen name="ExerciseProgress" component={ExerciseProgressScreen} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
            <Stack.Screen name="CompleteWorkout" component={CompleteWorkoutScreen} />
            <Stack.Screen name="Nutrition" component={NutritionScreen} />
            <Stack.Screen name="AddFood" component={AddFoodScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ProgressCharts" component={ProgressChartsScreen} />
            <Stack.Screen name="WeeklyNutrition" component={WeeklyNutritionScreen} />
            <Stack.Screen name="WorkoutTemplates" component={WorkoutTemplatesScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d1f3c',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    width: 50,
    height: 50,
  },
  navPills: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    padding: 4,
    gap: 4,
  },
  navPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  navPillActive: {
    backgroundColor: '#4A9EFF',
  },
  navPillText: {
    fontSize: 18,
  },
  bellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellText: {
    fontSize: 20,
  },
});