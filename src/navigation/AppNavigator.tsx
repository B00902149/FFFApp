import React from 'react';
import { Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';
import { CompleteWorkoutScreen } from '../screens/CompleteWorkoutScreen';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { HealthScreen } from '../screens/HealthScreen';
import { ExerciseProgressScreen } from '../screens/ExerciseProgressScreen';
import { NutritionScreen } from '../screens/NutritionScreen'
import { AddFoodScreen } from '../screens/AddFoodScreen';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen'




const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#001F3F' }} edges={['top']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007BFF',
          tabBarInactiveTintColor: '#A9A9A9',
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 8,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
            ...Platform.select({
              android: {
                height: 85,
                paddingBottom: 25
              }
            })
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600'
          }
        }}
        initialRouteName="DashboardTab"
    >
      <Tab.Screen 
        name="SearchTab" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🔍</Text>
        }}
      />
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>
        }}
      />
    </Tab.Navigator>
    </SafeAreaView>
  );
};

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#001F3F' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={user ? "Main" : "Login"}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};