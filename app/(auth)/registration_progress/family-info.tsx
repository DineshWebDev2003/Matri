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

export default function FamilyInfoScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [data, setData] = useState({
    father_name: '',
    father_contact: '',
    father_profession: '',
    mother_name: '',
    mother_contact: '',
    mother_profession: '',
    total_brother: '',
    total_sister: '',
  });
  const handleChange = (field: keyof typeof data, value: string) => setData({ ...data, [field]: value });

  const submit = async (skip = false) => {
    setLoading(true);
    try {
      const url = skip ? '/profile/family-info/skip' : '/profile/family-info';
      const res = await apiService.api.post(url, skip ? {} : data);
      if (res?.data?.status === 'success') router.replace('/(auth)/registration_progress/partner-expectation');
      else Alert.alert('Error', res?.data?.message || 'Failed');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LInput label="Father Name" value={data.father_name} onChangeText={v => handleChange('father_name', v)} />
      <LInput label="Father Contact" value={data.father_contact} onChangeText={v => handleChange('father_contact', v)} keyboardType="phone-pad" />
      <LInput label="Father Profession" value={data.father_profession} onChangeText={v => handleChange('father_profession', v)} />
      <LInput label="Mother Name" value={data.mother_name} onChangeText={v => handleChange('mother_name', v)} />
      <LInput label="Mother Contact" value={data.mother_contact} onChangeText={v => handleChange('mother_contact', v)} keyboardType="phone-pad" />
      <LInput label="Mother Profession" value={data.mother_profession} onChangeText={v => handleChange('mother_profession', v)} />
      <LInput label="Total Brothers" value={data.total_brother} onChangeText={v => handleChange('total_brother', v)} keyboardType="numeric" />
      <LInput label="Total Sisters" value={data.total_sister} onChangeText={v => handleChange('total_sister', v)} keyboardType="numeric" />
      {loading ? <ActivityIndicator size="large" /> : (
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#DC2626' }]} onPress={() => submit(false)}><Text style={styles.btnText}>Submit</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#9CA3AF' }]} onPress={() => submit(true)}><Text style={styles.btnText}>Skip</Text></TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, borderRadius: 6, padding: 10 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btn: { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});