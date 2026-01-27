import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileLoginScreen() {
  const [step, setStep] = useState<'enter' | 'otp'>('enter');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const auth = useAuth();

  const requestOtp = async () => {
    if (!mobile) return Alert.alert('Error', 'Enter mobile number');
    try {
      setLoading(true);
      // Call API here for OTP
      await auth?.sendOtp(mobile);
      setStep('otp');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return Alert.alert('Error', 'Enter 6-digit OTP');
    try {
      setLoading(true);
      await auth?.verifyOtp(mobile, otp);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/login.webp')} style={styles.headerImage} resizeMode="cover" />
        <LinearGradient colors={['rgba(220, 38, 38, 0.8)', 'rgba(220, 38, 38, 0.4)', 'transparent']} style={StyleSheet.absoluteFillObject} />
      </View>

      <View style={styles.container}>
      <Text style={styles.screenTitleText}>Mobile Login</Text>
      {step === 'enter' ? (
        <>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Mobile Number</Text>
          <View style={[styles.inputRow, { borderColor: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>
            <Text style={[styles.dialCode, { color: colors.textPrimary }]}>+91</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              keyboardType="phone-pad"
              placeholder="Enter mobile"
              placeholderTextColor={colors.textTertiary}
              value={mobile}
              onChangeText={setMobile}
            />
          </View>
          <TouchableOpacity style={[styles.button, loading && styles.disabled]} disabled={loading} onPress={requestOtp}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Enter OTP</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, textAlign: 'center', letterSpacing: 6, fontSize: 20 }]}
            keyboardType="numeric"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={colors.textTertiary}
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={[styles.button, loading && styles.disabled]} disabled={loading} onPress={verifyOtp}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={requestOtp} style={{ marginTop: 16 }}>
            <Text style={{ color: '#DC2626', fontWeight: '600' }}>Didn't receive? Resend</Text>
          </TouchableOpacity>
        </>
      )}
      </View>

      {/* Floating decorative icons */}
      <Feather
        pointerEvents="none"
        name="message-circle"
        size={100}
        color={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
        style={styles.floatIconTop}
      />
      <Feather
        pointerEvents="none"
        name="shield"
        size={140}
        color={theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
        style={styles.floatIconBottom}
      />

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 240,
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  screenTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    alignSelf: 'center',
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  dialCode: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  floatIconTop: {
    position: 'absolute',
    top: 60,
    right: -30,
    transform: [{ rotate: '20deg' }],
  },
  floatIconBottom: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    transform: [{ rotate: '-15deg' }],
  },

  back: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
});
