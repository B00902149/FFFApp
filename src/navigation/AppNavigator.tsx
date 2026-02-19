import React from 'react';
import { Platform, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import { NutritionScreen } from '../screens/NutritionScreen';
import { AddFoodScreen } from '../screens/AddFoodScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createNativeStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"  // ADD THIS LINE
      screenOptions={({ route }) => ({
        headerShown: true,
        header: ({ navigation, route }) => {
          const currentRoute = navigation.getState().routes[navigation.getState().index].name;
          
          return (
            <View style={{
              paddingTop: 50,
              paddingBottom: 12,
              paddingHorizontal: 20,
              backgroundColor: colors.primary.dark,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4
            }}>
              {/* Logo */}
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text.white,
                letterSpacing: 1
              }}>
                FFF
              </Text>

              {/* Navigation Pills */}
              <View style={{
                flexDirection: 'row',
                gap: 6,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 24,
                padding: 4
              }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: currentRoute === 'SearchTab' ? colors.accent.blue : 'transparent'
                  }}
                  onPress={() => navigation.navigate('SearchTab')}
                >
                  <Text style={{ fontSize: 20 }}>🔍</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: currentRoute === 'DashboardTab' ? colors.accent.blue : 'transparent'
                  }}
                  onPress={() => navigation.navigate('DashboardTab')}
                >
                  <Text style={{ fontSize: 20 }}>🏠</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: currentRoute === 'ProfileTab' ? colors.accent.blue : 'transparent'
                  }}
                  onPress={() => navigation.navigate('ProfileTab')}
                >
                  <Text style={{ fontSize: 20 }}>👤</Text>
                </TouchableOpacity>
              </View>

              {/* Notification */}
              <TouchableOpacity>
                <Text style={{ fontSize: 24 }}>🔔</Text>
              </TouchableOpacity>
            </View>
          );
        },
        tabBarStyle: { display: 'none' }
      })}
    >
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="DashboardTab" component={DashboardScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  console.log('AppNavigator render');
  console.log('User:', user ? user.username : 'null');
  console.log('Loading:', isLoading);

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
      >
        {user ? (
          // User is logged in - show app screens
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
          </>
        ) : (
          // User is not logged in - show only login
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};