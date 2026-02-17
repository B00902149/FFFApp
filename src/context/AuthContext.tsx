import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, authToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from AsyncStorage on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('📂 Loading saved auth...');
      
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');

      console.log('Stored token type:', typeof storedToken);
      console.log('Stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');
      console.log('Stored user:', storedUser ? 'exists' : 'null');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('✅ User session restored');
      } else {
        console.log('ℹ️ No saved session found');
      }
    } catch (error) {
      console.error('❌ Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, authToken: string) => {
    try {
      console.log('🔐 Saving auth data...');
      console.log('User:', userData);
      console.log('Token type:', typeof authToken);
      
      // Ensure token is a string
      const tokenString = String(authToken);
      
      console.log('Token string type:', typeof tokenString);
      console.log('Saving token:', tokenString.substring(0, 20) + '...');
      
      // Save to AsyncStorage with STRING token
      await AsyncStorage.setItem('authToken', tokenString);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setToken(tokenString);

      console.log('✅ Auth data saved successfully');
    } catch (error) {
      console.error('❌ Failed to save auth:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      console.log('✅ AsyncStorage cleared');
      
      // Clear state
      setUser(null);
      setToken(null);
      
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};