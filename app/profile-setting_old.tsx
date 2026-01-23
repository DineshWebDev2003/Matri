import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import AccordionSection from '../components/AccordionSection';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import PartnerExpectationForm from '../components/PartnerExpectationForm';
import PhysicalAttributesForm from '../components/PhysicalAttributesForm';
import FamilyInformationForm from '../components/FamilyInformationForm';
import CareerInformationSection from '../components/CareerInformationSection';
import EducationInformationSection from '../components/EducationInformationSection';
import { Feather } from '@expo/vector-icons';

import { APIService } from '../services/apiService';
import UniversalHeader from '../components/UniversalHeader';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------
interface Option {
  id: number;
  name: string;
}

interface BasicInfoForm {
  firstname: string;
  lastname: string;
  birth_date: string;
  religion_id: string;
  gender: string;
  marital_status: string;
  mother_tongue: string;
  profession: string;
  financial_condition: string;
  smoking_status: string;
  drinking_status: string;
  caste: string;
  language: string[];
  present_country: string;
  present_state: string;
  present_city: string;
  present_zip: string;
}

const initialForm: BasicInfoForm = {
  firstname: '',
  lastname: '',
  birth_date: '',
  religion_id: '',
  gender: 'male',
  marital_status: '',
  mother_tongue: '',
  profession: '',
  financial_condition: '',
  smoking_status: '0',
  drinking_status: '0',
  caste: '',
  language: [],
  present_country: '',
  present_state: '',
  present_city: '',
  present_zip: '',
};

export default function ProfileSettingScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const router = useRouter();
  const api = new APIService();

  const [form, setForm] = useState<BasicInfoForm>(initialForm);
  const [religions, setReligions] = useState<Option[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [partnerExpectation, setPartnerExpectation] = useState<any | null>(null);
  const [optionsData, setOptionsData] = useState<any | null>(null);
  const [physicalAttrs, setPhysicalAttrs] = useState<any | null>(null);
  const [familyInfo, setFamilyInfo] = useState<any | null>(null);

  // Fetch states when country changes
  useEffect(() => {
    if (!form.present_country) { setStates([]); return; }
    const loadStates = async () => {
      try {
        const res = api.getStates ? await api.getStates(form.present_country) : await api.request?.(`/get-states/${form.present_country}`);
        const arr = Array.isArray(res) ? res : (res?.data?.states ?? res ?? []);
        const mapped: Option[] = Array.isArray(arr)
          ? arr.map((s: any) => ({ id: s.id ?? s.name, name: s.name ?? s.state ?? s }))
          : [];
        let finalStates = mapped;
        if (!finalStates.length && form.present_country.toLowerCase() === 'india') {
          finalStates = [
            { id: 'TN', name: 'Tamil Nadu' },
            { id: 'KA', name: 'Karnataka' },
            { id: 'KL', name: 'Kerala' },
            { id: 'AP', name: 'Andhra Pradesh' },
            { id: 'TS', name: 'Telangana' },
            { id: 'MH', name: 'Maharashtra' },
          ];
        }
        setStates(finalStates);
        if (finalStates.length && !finalStates.find((s) => s.id.toString() === form.present_state)) {
          handleChange('present_state', finalStates[0].id.toString());
        }
        if (mapped.length && !mapped.find((s) => s.id.toString() === form.present_state)) {
          handleChange('present_state', mapped[0].id.toString());
        }
      } catch (err) {
        console.warn('states load err', err);
      }
    };
    loadStates();
  }, [form.present_country]);
  const [showDob, setShowDob] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [languageInput, setLanguageInput] = useState('');

  // Fetch cities when state changes
  useEffect(()=>{
    if(!form.present_state) { setCities([]); return; }
    (async()=>{
      try{
        const res = api.getCities ? await api.getCities(form.present_state) : await api.request?.(`/get-cities/${form.present_state}`);
        const arr = Array.isArray(res)? res : (res?.data?.cities ?? res ?? []);
        let mapped: Option[] = Array.isArray(arr)? arr.map((c:any)=>({id:c.id||c.name, name:c.name||c.city||c})) : [];
        if (!mapped.length && form.present_country.toLowerCase()==='india') {
          const fallback: Record<string,string[]> = {
            'TN':['Chennai','Coimbatore','Madurai','Tiruchirappalli'],
            'KA':['Bengaluru','Mysuru','Mangaluru'],
            'KL':['Thiruvananthapuram','Kochi','Kozhikode'],
            'AP':['Vijayawada','Visakhapatnam'],
            'TS':['Hyderabad','Warangal'],
            'MH':['Mumbai','Pune','Nagpur']
          };
          const list = fallback[form.present_state] ?? [];
          mapped = list.map((name,i)=>({id:i,name}));
        }
        setCities(mapped);
        if(mapped.length && !mapped.find(c=>c.name===form.present_city)) handleChange('present_city', mapped[0].name);
      }catch(e){ console.warn('cities load err',e);}  
    })();
  },[form.present_state]);

  // ---------------------------------------------------------------------------
  // Fetch Profile Settings
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getUserDetails();
        if (res.status === 'success') {
          const profile = res.data?.profile || {};
          const basic_info = profile.basic_info || {};
          let options = res.data?.options || {};
          const partner_expectation = profile.partner_preference || null;
          const physical_attributes = profile.physical_info || null;
          const family_info = profile.family_info || null;
          console.log('📝 BasicInfo raw -->', basic_info);
          if (basic_info) {
            setForm((prev) => ({
              ...prev,
              firstname: basic_info.firstname || profile.firstname || '',
              lastname: basic_info.lastname || profile.lastname || '',
              birth_date: basic_info.birth_date || '',
              religion_id: basic_info.religion_id?.toString() || '',
              gender: basic_info.gender || 'male',
              marital_status: basic_info.marital_status || '',
              mother_tongue: basic_info.mother_tongue || '',
              profession: basic_info.profession || '',
              financial_condition: basic_info.financial_condition || '',
              smoking_status: basic_info.smoking_status ? '1' : '0',
              drinking_status: basic_info.drinking_status ? '1' : '0',
              caste: basic_info.caste || '',
              language: basic_info.language || [],
              present_country: profile.residence_info?.present_address?.country || '',
              present_state: (profile.residence_info?.present_address?.state || '')?.toString() || '',
              present_city: profile.residence_info?.present_address?.city || '',
              present_zip: profile.residence_info?.present_address?.zip || '',
            }));
          }

          // Always fetch dropdown options to ensure religions/marital arrays
          try {
            const drop = await api.getDropdownOptions();
            if (drop.status === 'success') {
              options = { ...options, ...(drop.data || {}) } as any;
            }
          } catch (e) { console.warn('dropdown fetch err', e); }

          // Ensure we have valid arrays before setting state
          const religionsData = Array.isArray(options?.religions) ? options.religions : [];
          const maritalStatusesData = Array.isArray(options?.marital_statuses) ? options.marital_statuses : [];
          const maritalList = maritalStatusesData.length ? maritalStatusesData : [
            { id: 1, name: 'Single', title: 'Single' },
            { id: 2, name: 'Married', title: 'Married' },
            { id: 3, name: 'Divorced', title: 'Divorced' },
            { id: 4, name: 'Widowed', title: 'Widowed' },
          ];
          let countriesData: Option[] = [];
          if (Array.isArray(options?.countries)) {
            countriesData = options.countries;
          } else if (options?.countries && typeof options.countries === 'object') {
            countriesData = Object.entries(options.countries).map(([code, obj]: any) => ({
              id: code,
              name: obj.country || obj.name || code,
            }));
          }

          const statesData: Option[] = [];
          
                    
          setReligions(religionsData);
          // Ensure current value present
          const currentStatus = (basic_info?.marital_status || profile.marital_status || '').trim();
          const finalMarital = currentStatus && !maritalList.some(ms => (ms.title||ms.name)===currentStatus)
            ? [...maritalList, { id: 999, name: currentStatus, title: currentStatus }] : maritalList;
          setMaritalStatuses(finalMarital);
          // default country
          if (!form.present_country && countriesData.some(c=> c.name.toLowerCase()==='india')) {
            setForm(prev=>({...prev, present_country:'India'}));
          }
          const finalCountries = countriesData.length ? countriesData : [{ id: 356, name: 'India' }];
          setCountries(finalCountries);
          if (!form.present_country) setForm(prev=>({...prev, present_country:'India'}));
          setPartnerExpectation(partner_expectation || null);
          setPhysicalAttrs(physical_attributes || null);
          setFamilyInfo(family_info || null);
          // If backend did not include dropdown arrays, fetch separately
          if ((!options.religions || !options.religions.length) || (!options.marital_statuses || !options.marital_statuses.length)) {
            try {
              const optRes = await api.getDropdownOptions();
              if (optRes.status === 'success') {
                options = { ...options, ...(optRes.data || {}) };
              }
            } catch { /* ignore */ }
          }
          setOptionsData(options);
          console.log('📌 Stored country:', (basic_info?.present_address?.country || ''));
// states loaded separately via getStates()
          // setStates(statesData);
        } else {
          Alert.alert('Error', res.message || 'Failed to load data');
        }
      } catch (error: any) {
        console.warn(error);
        Alert.alert('Error', error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleChange = (key: keyof BasicInfoForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        smoking_status: form.smoking_status === '1',
        drinking_status: form.drinking_status === '1',
        language: form.language,
        present_address: {
          country: form.present_country,
          state: form.present_state,
          city: form.present_city,
          zip: form.present_zip,
        },
      };
      const res = await api.updateBasicInfo(payload);
      if (res.status === 'success') {
        Alert.alert('Success', res.message || 'Profile updated');
      } else {
        Alert.alert('Error', res.message || 'Failed to update');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#C6222F" />
      </View>
    );
  }

  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <UniversalHeader
        title="Profile Settings"
        leftIcon="arrow-left"
        onLeftPress={() => router.back()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <AccordionSection title="Basic Information" defaultOpen>

        {/* First Name */}
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={form.firstname}
          onChangeText={(t) => handleChange('firstname', t)}
          placeholder="Enter first name"
        />

        {/* Last Name */}
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={form.lastname}
          onChangeText={(t) => handleChange('lastname', t)}
          placeholder="Enter last name"
        />

        {/* Date of Birth */}
        <Text style={styles.label}>Date of Birth *</Text>
        <TouchableOpacity onPress={() => setShowDob(true)} style={[styles.input, { justifyContent: 'center' }]}> 
          <Text>{form.birth_date || 'Select date'}</Text>
        </TouchableOpacity>
        {showDob && (
          <DateTimePicker
            value={form.birth_date ? new Date(form.birth_date) : new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(e, selectedDate) => {
              setShowDob(false);
              if (selectedDate) {
                const iso = selectedDate.toISOString().split('T')[0];
                handleChange('birth_date', iso);
              }
            }}
          />
        )}

        {/* Religion */}
        <Text style={styles.label}>Religion *</Text>
        <Picker
          selectedValue={form.religion_id}
          onValueChange={(v) => handleChange('religion_id', v)}
          style={styles.picker}
        >
          <Picker.Item label="Select Religion" value="" />
          {religions.map((r) => (
            <Picker.Item key={r.id} label={r.name} value={r.id.toString()} />
          ))}
        </Picker>

        {/* Gender */}
        <Text style={styles.label}>Gender *</Text>
        <Picker
          selectedValue={form.gender}
          onValueChange={(v) => handleChange('gender', v)}
          style={styles.picker}
        >
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>

        {/* Marital Status */}
        <Text style={styles.label}>Marital Status *</Text>
        <Picker
          selectedValue={form.marital_status}
          onValueChange={(v) => handleChange('marital_status', v)}
          style={styles.picker}
        >
          <Picker.Item label="Select Status" value="" />
          {maritalStatuses.map((m) => (
            <Picker.Item key={m.id} label={m.title || m.name} value={m.title || m.name} />
          ))}
        </Picker>

        {/* Languages */}
        <Text style={styles.label}>Languages *</Text>
        <View style={styles.tagInputContainer}>
          {form.language.map((lang) => (
            <View key={lang} style={styles.tag}>
              <Text style={styles.tagText}>{lang}</Text>
              <TouchableOpacity
                style={styles.tagRemove}
                onPress={() => handleChange('language', form.language.filter((l) => l !== lang))}
              >
                <Feather name="x" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={styles.tagTextInput}
            value={languageInput}
            onChangeText={(text) => {
              if (text.includes(' ')) {
                const trimmed = text.trim();
                if (trimmed && !form.language.includes(trimmed)) {
                  handleChange('language', [...form.language, trimmed]);
                }
                setLanguageInput('');
              } else {
                setLanguageInput(text);
              }
            }}
            onSubmitEditing={() => {
              const trimmed = languageInput.trim();
              if (trimmed && !form.language.includes(trimmed)) {
                handleChange('language', [...form.language, trimmed]);
              }
              setLanguageInput('');
            }}
            placeholder="Type language and press Enter"
            returnKeyType="done"
          />
        </View>

        {/* Mother Tongue */}
        <Text style={styles.label}>Mother Tongue *</Text>
        <TextInput
          style={styles.input}
          value={form.mother_tongue}
          onChangeText={(t) => handleChange('mother_tongue', t)}
          placeholder="Enter mother tongue"
        />

        {/* Profession */}
        <Text style={styles.label}>Profession *</Text>
        <TextInput
          style={styles.input}
          value={form.profession}
          onChangeText={(t) => handleChange('profession', t)}
          placeholder="Enter profession"
        />

        {/* Annual Income */}
        <Text style={styles.label}>Annual Income</Text>
        <TextInput
          style={styles.input}
          value={form.financial_condition}
          onChangeText={(t) => handleChange('financial_condition', t)}
          placeholder="Enter annual income"
          keyboardType="numeric"
        />

        {/* Smoking Habits */}
        <Text style={styles.label}>Smoking Habits *</Text>
        <Picker
          selectedValue={form.smoking_status}
          onValueChange={(v) => handleChange('smoking_status', v)}
          style={styles.picker}
        >
          <Picker.Item label="Non-Smoker" value="0" />
          <Picker.Item label="Smoker" value="1" />
        </Picker>

        {/* Drinking Status */}
        <Text style={styles.label}>Drinking Status *</Text>
        <Picker
          selectedValue={form.drinking_status}
          onValueChange={(v) => handleChange('drinking_status', v)}
          style={styles.picker}
        >
          <Picker.Item label="Non-Drunker" value="0" />
          <Picker.Item label="Drunker" value="1" />
        </Picker>

        {/* Present Country */}
        <Text style={styles.label}>Present Country *</Text>
        <Picker
          selectedValue={form.present_country}
          onValueChange={(v) => { console.log('▶️ Country selected:', v); handleChange('present_country', v); }}
          style={styles.picker}
        >
          <Picker.Item label="Select Country" value="" />
          {Array.isArray(countries) && countries.map((c) => (
            <Picker.Item key={c.id} label={c.name} value={c.name} />
          ))}
        </Picker>


        {/* State */}
        <Text style={styles.label}>State *</Text>
        <Picker
          selectedValue={form.present_state}
          onValueChange={(v) => handleChange('present_state', v)}
          style={styles.picker}
        >
          <Picker.Item label={form.present_country ? 'Select State' : 'Select Country first'} value="" />
          {states.map((s) => (
            <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />
          ))}
        </Picker>

        {/* City */}
        <Text style={styles.label}>City *</Text>
        <Picker
          selectedValue={form.present_city}
          onValueChange={(v)=>handleChange('present_city', v)}
          style={styles.picker}
        >
          <Picker.Item label={form.present_state? 'Select City':'Select State first'} value="" />
          {cities.map(c=> <Picker.Item key={c.id} label={c.name} value={c.name} />)}
        </Picker>

        {/* Pincode */}
        <Text style={styles.label}>Pincode</Text>
        <TextInput
          style={styles.input}
          value={form.present_zip}
          onChangeText={(t) => handleChange('present_zip', t)}
          placeholder="Zip Code"
          keyboardType="numeric"
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
        </AccordionSection>

        <AccordionSection title="Physical Attributes">
          <PhysicalAttributesForm stored={physicalAttrs} />
        </AccordionSection>

        <AccordionSection title="Career Information">
          <CareerInformationSection />
        </AccordionSection>

        <AccordionSection title="Education Information">
          <EducationInformationSection />
        </AccordionSection>

        <AccordionSection title="Family Information">
          <FamilyInformationForm stored={familyInfo} />
        </AccordionSection>

        <AccordionSection title="Partner Expectation">
          <PartnerExpectationForm options={optionsData} stored={partnerExpectation} />
        </AccordionSection>
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  label: { marginTop: 12, marginBottom: 4, fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#C6222F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
