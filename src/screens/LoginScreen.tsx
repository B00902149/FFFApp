import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
  const { login: saveAuth } = useAuth();
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
    try {
      const data = await authAPI.login(email, password);
      if (data?.token && data?.user) {
        await saveAuth(data.token, data.user);
        Alert.alert('Success', 'Welcome back!');
        // NO navigation.navigate here
      } else {
        Alert.alert('Error', 'Server response was incomplete');
      }
    } catch (err: any) {
      Alert.alert('Error Detail', JSON.stringify(err?.response?.data || err?.message || err));
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
    try {
      await authAPI.register(email, username, password);
      Alert.alert('Success', 'Account created! Now please log in.');
      setIsSignUp(false);
      setPassword('');
    } catch (err: any) {
      const message = err?.error || err?.message || 'Registration failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/mainlogo.png')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.tagline}>One Hub. Infinite Possibilities.</Text>
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
   marginBottom: 0,        // ← was spacing.xl * 2
   paddingBottom: 0,
 },

 logo: {
   width: '100%',
   height: 120,            // ← reduce height to remove black space
   marginBottom: 24,       // ← controlled gap to inputs
   resizeMode: 'contain',
 },
  tagline: {
    color: '#ffffff',
    fontSize: 14,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
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