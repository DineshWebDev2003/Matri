import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
    const auth = useAuth();


  const BackgroundOverlay = () => {
    const icons = ['heart', 'ring', 'flower-tulip', 'human-male-female', 'camera-iris'];
    const iconSize = 50;
    const { width, height } = Dimensions.get('window');

    const numCols = Math.ceil(width / (iconSize * 2));
    const numRows = Math.ceil(height / (iconSize * 2));

    return (
      <View style={styles.overlayContainer}>
        {Array.from({ length: numRows }).map((_, rowIndex) =>
          Array.from({ length: numCols }).map((_, colIndex) => {
            const iconName = icons[(rowIndex * numCols + colIndex) % icons.length];
            return (
              <MaterialCommunityIcons
                key={`${rowIndex}-${colIndex}`}
                name={iconName as any}
                size={iconSize}
                color="rgba(255, 99, 99, 0.08)" // Light red watermark
                style={{
                  position: 'absolute',
                  top: rowIndex * iconSize * 2.5,
                  left: colIndex * iconSize * 2.5,
                  transform: [{ rotate: '-15deg' }],
                }}
              />
            );
          })
        )}
      </View>
    );
  };

    const handleLogin = async () => {
    if (!auth) return;

    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
            await auth.login(username, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundOverlay />
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../../assets/icon.png')}
          style={[styles.logo, { width: 250, height: 250 }]}
          resizeMode="contain"
        />
        
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username or Email"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => { /* Forgot password logic */ }}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.loginButton, loading && styles.disabledButton]} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.signupLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 50,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  forgotPasswordText: {
    textAlign: 'right',
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.light.tint + '99',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  signupText: {
    fontSize: 16,
    color: '#6B7280',
  },
  signupLink: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});