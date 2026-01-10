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

export default function PartnerExpectationScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [data, setData] = useState({
    general_requirement: '',
    min_age: '',
    max_age: '',
    min_height: '',
    max_height: '',
    marital_status: '',
    religion: '',
    complexion: '',
    education: '',
    profession: '',
    financial_condition: '',
    family_values: '',
    smoking_status: '',
    drinking_status: '',
    language: '',
  });
  const handleChange = (field: keyof typeof data, value: string) => setData({ ...data, [field]: value });

  const submit = async (skip = false) => {
    setLoading(true);
    try {
      const url = skip ? '/profile/partner-expectation/skip' : '/profile/partner-expectation';
      const payload = { ...data, language: data.language.split(',').map(l=>l.trim()).filter(Boolean) };
      const res = await apiService.api.post(url, skip ? {} : payload);
      if (res?.data?.status === 'success') router.replace('/(auth)/registration_progress/career-info');
      else Alert.alert('Error', res?.data?.message || 'Failed');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LInput label="General Requirement" value={data.general_requirement} onChangeText={v=>handleChange('general_requirement',v)} />
      <LInput label="Min Age" value={data.min_age} onChangeText={v=>handleChange('min_age',v)} keyboardType="numeric" />
      <LInput label="Max Age" value={data.max_age} onChangeText={v=>handleChange('max_age',v)} keyboardType="numeric" />
      <LInput label="Min Height" value={data.min_height} onChangeText={v=>handleChange('min_height',v)} />
      <LInput label="Max Height" value={data.max_height} onChangeText={v=>handleChange('max_height',v)} />
      <LInput label="Marital Status" value={data.marital_status} onChangeText={v=>handleChange('marital_status',v)} />
      <LInput label="Religion" value={data.religion} onChangeText={v=>handleChange('religion',v)} />
      <LInput label="Complexion" value={data.complexion} onChangeText={v=>handleChange('complexion',v)} />
      <LInput label="Education" value={data.education} onChangeText={v=>handleChange('education',v)} />
      <LInput label="Profession" value={data.profession} onChangeText={v=>handleChange('profession',v)} />
      <LInput label="Financial Condition" value={data.financial_condition} onChangeText={v=>handleChange('financial_condition',v)} />
      <LInput label="Family Values" value={data.family_values} onChangeText={v=>handleChange('family_values',v)} />
      <LInput label="Smoking Status (0/1/2)" value={data.smoking_status} onChangeText={v=>handleChange('smoking_status',v)} keyboardType="numeric" />
      <LInput label="Drinking Status (0/1/2)" value={data.drinking_status} onChangeText={v=>handleChange('drinking_status',v)} keyboardType="numeric" />
      <LInput label="Languages (comma separated)" value={data.language} onChangeText={v=>handleChange('language',v)} />
      {loading? <ActivityIndicator size="large" /> : (
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn,{backgroundColor:'#DC2626'}]} onPress={()=>submit(false)}><Text style={styles.btnText}>Submit</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn,{backgroundColor:'#9CA3AF'}]} onPress={()=>submit(true)}><Text style={styles.btnText}>Skip</Text></TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:16},
  input:{borderWidth:1,borderRadius:6,padding:10},
  btnRow:{flexDirection:'row',justifyContent:'space-between',marginTop:20},
  btn:{flex:1,marginHorizontal:4,paddingVertical:12,borderRadius:6,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'600'},
});
