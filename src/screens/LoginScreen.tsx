import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
  const { login: saveAuth } = useAuth();
  
  // Check if navigation exists
  React.useEffect(() => {
    console.log('LoginScreen - navigation exists?', !!navigation);
  }, []);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please enter email and password');
    return;
  }

  setLoading(true);
  console.log('=== LOGIN ATTEMPT ===');
  
  try {
    const data = await authAPI.login(email.toLowerCase().trim(), password);
    
    if (data?.token && data?.user) {
      const userData = {
        id: data.user._id || data.user.id,
        username: data.user.username,
        email: data.user.email
      };
      
      // Save auth
      await saveAuth(userData, data.token);
      
      console.log('✅ Login successful!');
      
      // REMOVE THIS - it causes the error:
      // navigation.dispatch(...)
      
      // Navigation will happen automatically when user state changes
    } else {
      Alert.alert('Error', 'Server response was incomplete');
    }
  } catch (err: any) {
    console.error('Login error:', err);
    Alert.alert('Login Failed', err?.error || err?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  const handleSignUp = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    console.log('=== SIGNUP ATTEMPT ===');
    
    try {
      const data = await authAPI.register(username.trim(), email.toLowerCase().trim(), password);
      
      console.log('Registration successful:', data);
      
      if (data?.token && data?.user) {
        // Prepare user data
        const userData = {
          id: data.user._id || data.user.id,
          username: data.user.username,
          email: data.user.email
        };
        
        // CORRECT ORDER: user first, token second
        await saveAuth(userData, data.token);
        
        Alert.alert('Success', 'Account created successfully!');
        console.log('✅ Registration and login successful!');
      } else {
        Alert.alert('Success', 'Account created! Please log in.');
        setIsSignUp(false);
        setPassword('');
      }
    } catch (err: any) {
      console.error('=== SIGNUP ERROR ===');
      console.error('Error:', err);
      
      const message = err?.error || err?.message || 'Registration failed';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>FFF</Text>
        <Text style={styles.tagline}>Faith. Fitness. Fuel.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.text.secondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.text.secondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.text.secondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={isSignUp ? handleSignUp : handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.white} />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Log In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsSignUp(!isSignUp)}
          disabled={loading}
        >
          <Text style={styles.switchText}>
            {isSignUp 
              ? 'Already have an account? Log In' 
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
    padding: spacing.lg,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2
  },
  logo: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text.white,
    marginBottom: spacing.sm
  },
  tagline: {
    fontSize: 18,
    color: colors.text.white,
    opacity: 0.9
  },
  form: {
    marginBottom: spacing.xl
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.small,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.text.primary
  },
  button: {
    backgroundColor: colors.accent.blue,
    borderRadius: borderRadius.small,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 50,
    justifyContent: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: 'bold'
  },
  switchText: {
    color: colors.text.white,
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: 14
  }
});