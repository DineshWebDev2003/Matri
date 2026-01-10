import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { apiService } from '../../../services/api';

const LInput = ({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (v: string) => void; keyboardType?: any; }) => {
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

import StepHeader from '../../../components/StepHeader';

export default function PhysicalAttributesScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [data, setData] = useState({
    height: '',
    weight: '',
    blood_group: '',
    eye_color: '',
    hair_color: '',
    complexion: '',
    disability: '',
  });
  const handleChange = (field: keyof typeof data, value: string) => setData({ ...data, [field]: value });

  const submit = async (skip = false) => {
    setLoading(true);
    try {
      const url = skip ? '/profile/physical-attributes/skip' : '/profile/physical-attributes';
      const res = await apiService.api.post(url, skip ? {} : data);
      if (res?.data?.status === 'success') router.replace('/(auth)/registration_progress/family-info');
      else Alert.alert('Error', res?.data?.message || 'Failed');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StepHeader currentStep={2} />
      <ScrollView contentContainerStyle={styles.container}>
        <LInput label="Height (e.g., 5.8)" value={data.height} onChangeText={v => handleChange('height', v)} />
        <LInput label="Weight (kg)" value={data.weight} onChangeText={v => handleChange('weight', v)} keyboardType="numeric" />
        <LInput label="Blood Group" value={data.blood_group} onChangeText={v => handleChange('blood_group', v)} />
        <LInput label="Eye Color" value={data.eye_color} onChangeText={v => handleChange('eye_color', v)} />
        <LInput label="Hair Color" value={data.hair_color} onChangeText={v => handleChange('hair_color', v)} />
        <LInput label="Complexion" value={data.complexion} onChangeText={v => handleChange('complexion', v)} />
        <LInput label="Disability" value={data.disability} onChangeText={v => handleChange('disability', v)} />

      {loading ? <ActivityIndicator size="large" /> : (
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#DC2626' }]} onPress={() => submit(false)}>
            <Text style={styles.btnText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#9CA3AF' }]} onPress={() => submit(true)}>
            <Text style={styles.btnText}>Skip</Text>
          </TouchableOpacity>
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