import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dimensions, StyleSheet, View, TextInput, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

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
              name={iconName}
              size={iconSize}
              color="rgba(0, 0, 0, 0.05)" // Subtle gray color
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

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    password: '',
    agree: false,
  });

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.mobile || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    if (!formData.agree) {
      Alert.alert('Error', 'You must agree to the terms and policies.');
      return;
    }

    setLoading(true);
    try {
      const username = formData.email.split('@')[0] + Math.floor(100 + Math.random() * 900);
      const registrationData = {
        ...formData,
        username,
        mobile_code: '91', // Assuming Indian country code
        country_code: 'IN',
        password_confirmation: formData.password,
      };

      await auth?.register(registrationData);
      Alert.alert('Success', 'Registration successful! Please log in.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundOverlay />
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Please Provide your valid informations to register!</Text>

                        <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Looking For *" placeholderTextColor="#9CA3AF" />
        </View>
        <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput style={styles.input} placeholder="First Name *" placeholderTextColor="#9CA3AF" value={formData.firstname} onChangeText={(text) => handleInputChange('firstname', text)} />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput style={styles.input} placeholder="Last Name *" placeholderTextColor="#9CA3AF" value={formData.lastname} onChangeText={(text) => handleInputChange('lastname', text)} />
            </View>
        </View>
        <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="E-Mail Address *" placeholderTextColor="#9CA3AF" keyboardType="email-address" value={formData.email} onChangeText={(text) => handleInputChange('email', text)} autoCapitalize="none" />
        </View>
        <View style={styles.row}>
            <View style={[styles.inputContainer, {flex: 1, marginRight: 5}]}>
                <TextInput style={styles.input} placeholder="+91" placeholderTextColor="#9CA3AF" editable={false} />
            </View>
            <View style={[styles.inputContainer, {flex: 3, marginLeft: 5}]}>
                <TextInput style={styles.input} placeholder="Mobile Number *" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={formData.mobile} onChangeText={(text) => handleInputChange('mobile', text)} />
            </View>
        </View>
        <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput style={styles.input} placeholder="Date of Birth *" placeholderTextColor="#9CA3AF" />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput style={styles.input} placeholder="Password *" placeholderTextColor="#9CA3AF" secureTextEntry value={formData.password} onChangeText={(text) => handleInputChange('password', text)} />
            </View>
        </View>
        <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput style={styles.input} placeholder="Religion *" placeholderTextColor="#9CA3AF" />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput style={styles.input} placeholder="Caste *" placeholderTextColor="#9CA3AF" />
            </View>
        </View>

        <TouchableOpacity style={styles.checkboxContainer} onPress={() => handleInputChange('agree', !formData.agree)}>
            <Feather name={formData.agree ? 'check-square' : 'square'} size={24} color={Colors.light.tint} />
            <Text style={styles.checkboxLabel}>I agree with <Text style={styles.link}>Privacy Policy</Text>, <Text style={styles.link}>Terms of Service</Text>, <Text style={styles.link}>Purchase Policy</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.registerButton, loading && styles.disabledButton]} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.loginLink}>Log in</Text>
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
    paddingVertical: 40,
  },
  logo: {
    width: 120, // Smaller logo for register screen
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.tint,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  halfWidth: {
    width: '48%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  link: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: Colors.light.tint + '99',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
