import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { apiService } from '../../../services/api';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { SMOKING_STATUS, DRINKING_STATUS, LOOKING_FOR } from '../../../constants/dropdownOptions';

// Re-usable labelled input
const LInput = ({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (v:string)=>void; keyboardType?:any; }) => {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.textPrimary, marginBottom: 4 }}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.inputBorder, color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.inputPlaceholder}
      />
    </View>
  );
};

import { useRouter } from 'expo-router';

import StepHeader from '../../../components/StepHeader';

export default function BasicInfoScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [data, setData] = useState({
    firstname: '',
    lastname: '',
    birth_date: '',
    religion_id: '',
    gender: '',
    looking_for: '',
    marital_status: '',
    caste: '',
    mother_tongue: '',
    languages: '',
    profession: '',
    financial_condition: '',
    smoking_status: '',
    drinking_status: '',
    country: '',
    state: '',
    city: '',
    zip: '',
  });

  const handleChange = (field: keyof typeof data, value: string) => setData({ ...data, [field]: value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // languages to array
      const payload = { ...data, languages: data.languages.split(',').map(l => l.trim()).filter(Boolean) };
      const res = await apiService.api.post('/profile/basic-info', payload);
      if (res?.data?.status === 'success') {
        onCompleted && onCompleted();
      } else {
        Alert.alert('Error', res?.data?.message || 'Failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await apiService.api.post('/profile/basic-info/skip');
      router.replace('/(auth)/registration_progress/physical-attributes');
    } catch (e) {
      Alert.alert('Error', 'Skip failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StepHeader currentStep={1} />
      <ScrollView contentContainerStyle={styles.container}>
        <LInput label="First Name" value={data.firstname} onChangeText={v => handleChange('firstname', v)} />
        <LInput label="Last Name" value={data.lastname} onChangeText={v => handleChange('lastname', v)} />
        <LInput label="Birth Date (YYYY-MM-DD)" value={data.birth_date} onChangeText={v => handleChange('birth_date', v)} />
        <LInput label="Religion Id" value={data.religion_id} onChangeText={v => handleChange('religion_id', v)} />
        <LInput label="Gender (m/f)" value={data.gender} onChangeText={v => handleChange('gender', v)} />
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.textPrimary, marginBottom: 4 }}>Looking For</Text>
          <Picker
            selectedValue={data.looking_for}
            onValueChange={v => handleChange('looking_for', v)}
          >
            {LOOKING_FOR.map((opt) => (
              <Picker.Item key={opt.id} label={opt.label} value={opt.id} />
            ))}
          </Picker>
        </View>
      )}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, borderRadius: 6, padding: 10 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btn: { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
