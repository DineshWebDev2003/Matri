import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';

export default function WelcomeUploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ name?: string }>();
  const name = params.name || 'User';

  // Default to India (id 'IN'); user can change if needed
  const [countryId, setCountryId] = useState<string>('IN');
  const [stateId, setStateId] = useState<string>('');
  const [city, setCity] = useState('');
  const [countries, setCountries] = useState<{id:string;name:string}[]>([{ id: 'IN', name: 'India' }]);
  const [states, setStates] = useState<{id:string;name:string}[]>([]);
  const [cities, setCities] = useState<{id:string;name:string}[]>([]);

  
  // Load states once (country is fixed to India)
  useEffect(() => {
    (async () => {
      try {
        const raw = await apiService.getStates();
        const arr = Array.isArray(raw)
          ? raw
          : Object.entries(raw).map(([id,name]:any)=>({id:String(id), name:String((name as any).name ?? name)}));
        setStates(arr);
      } catch (e) {
        console.warn('states fetch err', e);
      }
    })();
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (!stateId) { setCities([]); setCity(''); return; }
    (async () => {
      try {
        const res = await apiService.getCities(stateId);
        setCities(res);
      } catch (e) {
        console.warn('cities fetch err', e);
      }
    })();
  },[stateId]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri || !city.trim()) {
      Alert.alert('Required', 'Please select a photo and enter city');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('country_id', countryId);
      formData.append('state_id', stateId);
      formData.append('city', city.trim());
      formData.append('profile_image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const res = await apiService.completeBasicInfo(formData as any);
      if (res.status === 'success') {
        Alert.alert('Success', 'Profile updated!');
        router.replace('/(tabs)/index');
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>Welcome, {name}!</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Add a profile picture & city to get started</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Feather name="camera" size={48} color="#DC2626" />
        )}
      </TouchableOpacity>

      {/* Country Picker */}
      <Picker
        selectedValue={countryId}
        onValueChange={(v)=>setCountryId(String(v))}
        enabled={false}
        style={[styles.cityInput,{height:50, backgroundColor:'#f0f0f0'}]}
      >
        <Picker.Item label="India" value="IN" />
      </Picker>

      {/* State Picker */}
      <Picker
        selectedValue={stateId}
        onValueChange={(v)=>setStateId(String(v))}
        style={[styles.cityInput,{height:50}]}
      >
        <Picker.Item label="Select State" value="" />
        {states.map(s=> <Picker.Item key={s.id} label={s.name} value={s.id} />)}
      </Picker>

      {/* City Picker */}
      <Picker
        selectedValue={city}
        onValueChange={(v)=>setCity(String(v))}
        style={[styles.cityInput,{height:50}]}
        enabled={!!stateId && cities.length>0}
      >
        <Picker.Item label={stateId? (cities.length? 'Select City':'Loading...') :'Select State first'} value="" />
        {cities.map(c=> <Picker.Item key={c.id} label={c.name} value={c.name} />)}
      </Picker>

      {/* fallback text input (hidden) */}
      {/*
      <TextInput
        placeholder="Your City"
        placeholderTextColor={colors.textTertiary}
        style={[styles.cityInput, { color: colors.textPrimary, borderColor: colors.border }]}
        value={city}
        onChangeText={setCity}
      />*/}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Continue</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  welcomeText: { fontSize: 28, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 24, textAlign: 'center' },
  imagePicker: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  cityInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
