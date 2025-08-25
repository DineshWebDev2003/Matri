import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = () => {
    setLoading(true);
    // Simulate an API call
    setTimeout(() => {
      login('dummy-auth-token');
      setLoading(false);
      // On successful login, the root layout will redirect to '(tabs)'
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mobile number"
            placeholderTextColor={Colors.light.icon}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.light.icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={20} color={Colors.light.icon} />
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
          <TouchableOpacity onPress={() => { /* Navigate to Register */ }}>
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
    backgroundColor: Colors.light.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: Colors.light.text,
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
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.light.tint + '99',
  },
  loginButtonText: {
    color: '#fff',
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
    color: Colors.light.icon,
  },
  signupLink: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});