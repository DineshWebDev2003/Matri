import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TextInputProps,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar, PanResponder,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { SMOKING_STATUS, DRINKING_STATUS, MARITAL_STATUS } from '../constants/dropdownOptions';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

// Smoking Habits options from shared constants
const smokingHabits = SMOKING_STATUS.map(s => ({ id: String(s.id), name: s.label }));

// Drinking Habits options from shared constants
const drinkingHabits = DRINKING_STATUS.map(d => ({ id: String(d.id), name: d.label }));

// Looking For options
const lookingForOptions = [
  { id: '1', name: 'Groom' },
  { id: '2', name: 'Bride' },
];

// Financial Condition options
const financialConditions = [
  { id: 'Struggling', name: 'Struggling' },
  { id: 'Average', name: 'Average' },
  { id: 'Stable', name: 'Stable' },
  { id: 'Wealthy', name: 'Wealthy' },
];

// Height options (in feet)
const heights = [
  { id: '4.6', name: '4\'6"' },
  { id: '4.7', name: '4\'7"' },
  { id: '4.8', name: '4\'8"' },
  { id: '4.9', name: '4\'9"' },
  { id: '4.10', name: '4\'10"' },
  { id: '4.11', name: '4\'11"' },
  { id: '5.0', name: '5\'0"' },
  { id: '5.1', name: '5\'1"' },
  { id: '5.2', name: '5\'2"' },
  { id: '5.3', name: '5\'3"' },
  { id: '5.4', name: '5\'4"' },
  { id: '5.5', name: '5\'5"' },
  { id: '5.6', name: '5\'6"' },
  { id: '5.7', name: '5\'7"' },
  { id: '5.8', name: '5\'8"' },
  { id: '5.9', name: '5\'9"' },
  { id: '5.10', name: '5\'10"' },
  { id: '5.11', name: '5\'11"' },
  { id: '6.0', name: '6\'0"' },
  { id: '6.1', name: '6\'1"' },
  { id: '6.2', name: '6\'2"' },
  { id: '6.3', name: '6\'3"' },
  { id: '6.4', name: '6\'4"' },
  { id: '6.5', name: '6\'5"' },
  { id: '6.6', name: '6\'6"' }
];

// Helper to normalize height string values (e.g., "5.20" → "5.2")
const normalizeHeight = (val: any): string => {
  if (val === undefined || val === null || val === '') return '';
  // keep only first two numeric parts
  const str = String(val).replace(/[^0-9.]/g, '');
  const parts = str.split('.');
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts[1].replace(/0+$/, '')}`;
};

// Weight options (in kg)
const weights = Array.from({ length: 81 }, (_, i) => ({
  id: String(40 + i),
  name: `${40 + i} kg`
}));

// Blood group options
const bloodGroups = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

// Complexion options
const complexions = [
  { id: 'fair', name: 'Fair', color: '#F5DEB3' },
  { id: 'wheatish', name: 'Wheatish', color: '#D2B48C' },
  { id: 'brown', name: 'Brown', color: '#8B6914' },
  { id: 'dark', name: 'Dark', color: '#3D2817' }
];

// Eye Color options
const eyeColors = [
  { id: 'black', name: 'Black' },
  { id: 'brown', name: 'Brown' },
  { id: 'hazel', name: 'Hazel' },
  { id: 'green', name: 'Green' },
  { id: 'blue', name: 'Blue' },
  { id: 'gray', name: 'Gray' }
];

// Hair Color options
const hairColors = [
  { id: 'black', name: 'Black' },
  { id: 'brown', name: 'Brown' },
  { id: 'blonde', name: 'Blonde' },
  { id: 'red', name: 'Red' },
  { id: 'gray', name: 'Gray' },
  { id: 'white', name: 'White' }
];

type Step = 1 | 2 | 3 | 4 | 5 | 6;

type FormInputProps = TextInputProps & {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  containerStyle?: object;
  fieldName?: string;
  formData?: any;
  onFieldChange?: (field: string, value: string) => void;
};

const FormInput = ({ label, icon, containerStyle, fieldName, formData, onFieldChange, ...props }: FormInputProps) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
        {icon && <Feather name={icon} size={18} color={colors.textSecondary} style={styles.inputIcon} />}
        <TextInput 
          style={[styles.input, { color: colors.textPrimary }]} 
          value={fieldName ? formData?.[fieldName] || '' : ''}
          onChangeText={(value) => fieldName && onFieldChange ? onFieldChange(fieldName, value) : undefined}
          placeholderTextColor={colors.inputPlaceholder}
          {...props} 
        />
      </View>
    </View>
  );
};

export default function ProfileCompletionScreen() {
  // Helper to safely derive display name from country option shapes
  const extractCountryName = (item:any):string=>{
    if(!item) return '';
    if(typeof item==='string') return item;
    if(typeof item==='object'){
      const cand = item.country || item.name || item.label || item.nicename || (item.name?.en) || Object.values(item).find(v=>typeof v==='string');
      return cand ? String(cand) : 'Unknown';
    }
    return String(item);
  };
  const [religionOptions, setReligionOptions] = useState<{id:string;name:string}[]>([]);
  const [casteOptions, setCasteOptions] = useState<{id:string;name:string}[]>([]);
  const getCasteName = (cid:string)=> casteOptions.find(c=>c.id===String(cid))?.name || cid;
  const getOptionName = (opts:{id:string;name:string}[], val:any)=> opts.find(o=>String(o.id)===String(val))?.name || String(val);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<{id:string;name:string}[]>([]);
  const [countryOptions, setCountryOptions]   = useState<{id:string;name:string}[]>([]);
  const [stateOptions, setStateOptions]       = useState<{id:string;name:string}[]>([]);
  const [cityOptions, setCityOptions]         = useState<{id:string;name:string}[]>([]);
  // Profile summary (image, full name, id) for display card
  const [profileSummary, setProfileSummary] = useState<{ image: string; name: string; id: string }>({ image: '', name: '', id: '' });
  const [showImageModal, setShowImageModal] = useState(false);
  const getReligionName = (rid:string)=> religionOptions.find(r=>r.id===String(rid))?.name || rid;
  const router = useRouter();
  const auth = useAuth();
  const params = useLocalSearchParams();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Initialize with current date or parsed birth_date if available
    if (formData?.birth_date) {
      return new Date(formData.birth_date);
    }
    return new Date();
  });

  const [formData, setFormData] = useState({
    // ------ Step 1 required only (web parity) ------
    firstname: '',
    lastname: '',
    birth_date: '',          // YYYY-MM-DD
    religion_id: '',         // numeric id
    gender: '',              // m / f
    looking_for: '',         // 1 = Groom, 2 = Bride
    marital_status: '',      // string title matching table
    mother_tongue: '',
    languages: '',           // comma-separated string for now
    profession: '',
    financial_condition: '',
    smoking_status: '',      // 0/1/2 numeric (no/yes/occasionally)
    drinking_status: '',     // 0/1/2
    caste: '',
    country: 'IN',
    state: '',
    city: '',
    zip: '',
    
    // Step 2: Physical Attributes
    height: '',
    weight: '',
    bloodGroup: '',
    eyeColor: '',
    hairColor: '',
    complexion: '',
    disability: '',
    
    // Step 3: Family Information
    fatherName: '',
    fatherProfession: '',
    fatherContact: '',
    motherName: '',
    motherProfession: '',
    motherContact: '',
    numberOfBrothers: '',
    numberOfSisters: '',
    
    // Step 4: Partner Expectation
    partnerGeneralRequirement: '',
    partnerMinAge: '',
    partnerMaxAge: '',
    partnerMinHeight: '',
    partnerMaxHeight: '',
    partnerMaritalStatus: '',
    partnerReligion: '',
    partnerComplexion: '',
    partnerSmokingHabits: '',
    partnerDrinkingHabits: '',
    partnerSpokenLanguages: '',
    partnerEducation: '',
    partnerProfession: '',
    partnerFinancialCondition: '',
    partnerFamilyValues: '',

    // Step 5: Career Information
    company: '',
    designation: '',
    careerStartYear: '',
    careerEndYear: '',

    // Step 6: Education Information
    institute: '',
    degree: '',
    fieldOfStudy: '',
    educationStartYear: '',
    educationEndYear: '',
  });

  // Multi-entry arrays
  type EducationRecord = { institute: string; degree: string; fieldOfStudy: string; start: string; end: string };
  type CareerRecord = { company: string; designation: string; start: string; end: string };

// Years options for picker (current year down to 1950)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1949 }, (_, i) => String(currentYear - i));

type YearPickerProps = {
  label: string;
  selectedYear: string;
  onYearChange: (year: string) => void;
  containerStyle?: object;
};

const YearPickerInput = ({ label, selectedYear, onYearChange, containerStyle }: YearPickerProps) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>  
        <Picker
          selectedValue={selectedYear}
          onValueChange={(value)=>onYearChange(String(value))}
          style={{ flex: 1, color: colors.textPrimary }}
        >
          <Picker.Item label="Select" value="" />
          {years.map(y => (
            <Picker.Item key={y} label={y} value={y} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

  const [educationList, setEducationList] = useState<EducationRecord[]>([{ institute: '', degree: '', fieldOfStudy: '', start: '', end: '' }]);
  const [careerList, setCareerList] = useState<CareerRecord[]>([{ company: '', designation: '', start: '', end: '' }]);

  // Helpers
  const addEducation = () => setEducationList(prev => [...prev, { institute:'', degree:'', fieldOfStudy:'', start:'', end:'' }]);
  const updateEducation = (index:number, field:keyof EducationRecord, value:string) => {
    setEducationList(prev=> prev.map((rec,i)=> i===index ? { ...rec, [field]: value } as EducationRecord : rec));
  };
  const deleteEducation = (index:number) => setEducationList(prev => prev.filter((_,i)=> i !== index));
  const addCareer = () => setCareerList(prev => [...prev, { company:'', designation:'', start:'', end:'' }]);
  const updateCareer = (index:number, field:keyof CareerRecord, value:string) => {
    setCareerList(prev=> prev.map((rec,i)=> i===index ? { ...rec, [field]: value } as CareerRecord : rec));
  };
  const deleteCareer = (index:number) => setCareerList(prev => prev.filter((_,i)=> i !== index));

  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  useEffect(() => {
    // fetch dropdown options once
    const fetchDropdowns = async () => {
      try {
        const dropRes = await apiService.getDropdownOptions();
        if (dropRes.status === 'success') {
          const opts = dropRes.data || {};
          // Religions array may come as [{id,name}] or object {id:name}
          const religionsArr: {id:string;name:string}[] = Array.isArray(opts.religions)
            ? opts.religions.map((r: any) => ({ id: String(r.id ?? r.value ?? r.key ?? r), name: r.name ?? r.label ?? r }))
            : Object.entries(opts.religions || {}).map(([id, name]: any) => ({ id: String(id), name: String((name as any).name ?? name) }));
          setReligionOptions(religionsArr);

          const maritalArr: {id:string;name:string}[] = Array.isArray(opts.marital_statuses)
            ? opts.marital_statuses.map((m: any) => ({ id: String(m.id ?? m.value ?? m), name: m.name ?? m.label ?? m }))
            : Object.entries(opts.marital_statuses || {}).map(([id, name]: any) => ({ id: String(id), name: extractCountryName(name) }));
          setMaritalStatusOptions(maritalArr);

          // Countries may come as object code:name
          const countryArr: {id:string;name:string}[] = Array.isArray(opts.countries)
            ? opts.countries.map((c:any)=>({id:String(c.id ?? c.code ?? c.key ?? extractCountryName(c)), name:extractCountryName(c)}))
            : Object.entries(opts.countries || {}).map(([code, obj]:any)=>({id:String(code), name:extractCountryName(obj)}));
          const seen=new Set<string>();
          const filteredCountryArr = (countryArr.length?countryArr:[{id:'IN',name:'India'}]).filter(c=>c.name && c.name!=='Unknown' && !seen.has(c.name) && (seen.add(c.name),true));
          setCountryOptions(filteredCountryArr);

          // If no countries included, fetch separately
          if(!countryArr.length){
            try{
              const cRes = await apiService.getCountries();
              const cArr = Object.entries(cRes || {}).map(([id,val]:any)=>({id:String(id), name: extractCountryName(val)}));
              const seen2=new Set<string>();
              const filtered= (cArr.length?cArr:[{id:'IN',name:'India'}]).filter(c=>c.name && c.name!=='Unknown' && !seen2.has(c.name) && (seen2.add(c.name),true));
              setCountryOptions(filtered);
            }catch{/* ignore */}
          }

          // Fetch initial states list
          try{
            const statesRes = await apiService.getStates();
            const statesArr = Object.entries(statesRes || {}).map(([id,name]:any)=>({id:String(id), name:String(name)}));
            setStateOptions(statesArr);
          }catch{ /* ignore */ }
        }
      } catch (err) {
        console.error('dropdown fetch err', err);
      }
    };
    fetchDropdowns();
    // Pre-fill from registration data if available
    if (params.registrationData) {
      try {
        const regData = JSON.parse(params.registrationData as string);
        console.log('📋 Registration data received:', regData);
        
        setFormData(prev => {
          const updated = {
            ...prev,
            dateOfBirth: regData.birth_date || prev.dateOfBirth,
            religion: String(regData.religion_id || regData.religion || prev.religion),
            caste: String(regData.caste_id || regData.caste || prev.caste),
            country: regData.country || prev.country,
            state: regData.state || regData.present_state || prev.state,
            // Auto-detect gender from looking_for (1 = Bridegroom/Male, 2 = Bride/Female)
            gender: regData.gender || (regData.looking_for === '1' ? 'male' : regData.looking_for === '2' ? 'female' : prev.gender),
          };
          // Preload castes
          if(updated.religion){
            fetchCastes(updated.religion);
          }
          return updated;
        });
      } catch (error) {
        console.error('Error parsing registration data:', error);
      }
    }
    
    // We will fetch castes after setting the form data
    fetchUserProfile();
    // Fetch countries separately if still empty
    (async()=>{
      if(!countryOptions.length){
        try{
          const cRes = await apiService.getCountries();
          const cArr = Object.entries(cRes || {}).map(([id,val]:any)=>({id:String(id), name: extractCountryName(val)}));
          const seen3=new Set<string>();
          setCountryOptions(cArr.filter(c=>c.name && c.name!=='Unknown' && !seen3.has(c.name) && (seen3.add(c.name),true)));
        }catch(err){console.warn('countries fetch err',err);}
      }
    })();

    // When state changes, fetch cities list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch cities when state changes
  useEffect(()=>{
    if(formData.state){
      (async()=>{
        try{
          const citiesRes = await apiService.getCities(formData.state);
          const cityArr = Array.isArray(citiesRes)
            ? citiesRes.map((itm:any,idx:number)=>{
                if(typeof itm==='string') return {id:String(idx), name:itm};
                if(typeof itm==='object') return {id:String(itm.id ?? idx), name:String(itm.name ?? itm.label ?? Object.values(itm)[0] ?? 'Unknown')};
                return {id:String(idx), name:String(itm)};
              })
            : Object.entries(citiesRes||{}).map(([id,val]:any)=>({id:String(id), name:String(val?.name ?? val?.label ?? val)}));
          setCityOptions(cityArr);
        }catch(err){console.warn('cities fetch err',err);}
      })();
    }
  },[formData.state]);

  // Fetch castes when religion changes (runs once per religion selection)
  useEffect(() => {
    if(formData.religion_id){
      fetchCastes(formData.religion_id);
    }
  }, [formData.religion_id]);

  // Set default country to India (or first option) once list loads
  useEffect(()=>{
    if(!formData.country && countryOptions.length){
      const india = countryOptions.find(c=> c.name.toLowerCase()==='india');
      setFormData(prev=>({...prev, country: String(india? india.id : countryOptions[0].id)}));
    }
  },[countryOptions]);

  // Align existing country value once country options loaded
  useEffect(()=>{
    if(formData.country && countryOptions.length){
      const found = countryOptions.find(c=> c.name.toLowerCase()===String(formData.country).toLowerCase());
      if(found && found.id!==formData.country){
        setFormData(prev=>({...prev, country: found.id}));
      }
    }
  },[countryOptions]);

  // Align existing state value once stateOptions are loaded
  useEffect(()=>{
    if(formData.state && stateOptions.length){
      const found = stateOptions.find(s=> s.name.toLowerCase()===String(formData.state).toLowerCase());
      if(found && found.id!==formData.state){
        setFormData(prev=>({...prev, state: found.id}));
      }
    }
  },[stateOptions]);

  // Align existing city value once cityOptions are loaded
  useEffect(()=>{
    if(formData.city && cityOptions.length){
      const found = cityOptions.find(ct=> ct.name.toLowerCase()===String(formData.city).toLowerCase());
      if(found && found.id!==formData.city){
        setFormData(prev=>({...prev, city: found.id}));
      }
    }
  },[cityOptions]);

  // Align existing caste value once casteOptions are loaded
  useEffect(() => {
    if(formData.caste && casteOptions.length){
      const found = casteOptions.find(c=>c.name.toLowerCase()===String(formData.caste).toLowerCase());
      if(found && found.id!==formData.caste){
        setFormData(prev=>({...prev, caste: found.id}));
      }
    }
  }, [casteOptions]);

  // Align partnerMaritalStatus once marital options are ready
  useEffect(() => {
    if (formData.partnerMaritalStatus && maritalStatusOptions.length) {
      const found = maritalStatusOptions.find(m => m.name.toLowerCase() === String(formData.partnerMaritalStatus).toLowerCase());
      if (found && found.id !== formData.partnerMaritalStatus) {
        setFormData(prev => ({ ...prev, partnerMaritalStatus: found.id }));
      }
    }
  }, [maritalStatusOptions]);

  // Fetch castes list by religion id helper
  const fetchCastes = async (religionId:string)=>{
    try{
      const res = await apiService.getCastesByReligion(religionId);
      if(res.status==='success'){
        const raw = res.data.castes ?? res.data ?? {};
        const arr = Array.isArray(raw)
          ? raw.map((c:any) => ({ id: String(c.id ?? c.value ?? c.key ?? c), name: c.name ?? c.label ?? c }))
          : Object.entries(raw).map(([id, name]: any) => ({ id: String(id), name: String((name as any).name ?? name) }));
        setCasteOptions(arr);
        // If we already have a caste name saved, switch it to its id immediately
        if(formData.caste && arr.length){
          const match = arr.find(c=>c.name.toLowerCase()===String(formData.caste).toLowerCase());
          if(match && match.id!==formData.caste){
            setFormData(prev=>({...prev, caste: String(match.id)}));
          }
        }
      }
    }catch(err){console.error('castes fetch err', err);}
  };

  const fetchUserProfile = async () => {
    try {
      setDataLoading(true);
      console.log('📊 Fetching existing profile data...');
      
      // First, set basic user data from auth context
      const user = auth?.user;
      if (user) {
        setFormData(prev => ({
          ...prev,
        }));
      }

      // Then fetch complete profile data from API
      const response = await apiService.getUserDetails();
      console.log('👤 Complete profile response:', response);
      
      if (response && response.status === 'success' && response.data) {
        // Backend returns data.user, so extract it
        const profileRoot = response.data.profile || response.data.user || response.data;
        // Set summary card info
        setProfileSummary({ image: String(profileRoot.image || profileRoot.profile_photo || profileRoot.avatar || ''), name: String(profileRoot.fullname || `${profileRoot.firstname ?? ''} ${profileRoot.lastname ?? ''}`.trim()), id: String(profileRoot.profile_id || '') });
        // If API returns nested sections, merge basic_info etc. onto a flat object
        const profileData = {
          ...profileRoot,
          ...(profileRoot.basic_info || {}),
          ...(profileRoot.physical_info || {}),
          ...(profileRoot.family_info || {}),
          ...(profileRoot.residence_info || {}),
          ...(Array.isArray(profileRoot.education_info) ? profileRoot.education_info[0] || {} : profileRoot.education_info || {}),
          ...(Array.isArray(profileRoot.career_info) ? profileRoot.career_info[0] || {} : profileRoot.career_info || {}),
          ...(profileRoot.partner_preference || {}),
        };
        
        setFormData(prev => ({
          ...prev,
          // Basic Information
          birth_date: profileData.birth_date || profileData.date_of_birth || '',
          religion_id: String(profileData.religion_id || profileData.religion || prev.religion_id),
          gender: profileData.gender || '',
          looking_for: profileData.looking_for === 'Bridegroom' ? '1' : profileData.looking_for === 'Bride' ? '2' : prev.looking_for,
          profession: profileData.profession || '',
          financial_condition: profileData.financial_condition || prev.financial_condition,
          smoking_status: String(profileData.smoking_status || profileData.smokingHabits || ''),
          drinking_status: String(profileData.drinking_status || profileData.drinkingHabits || ''),
          marital_status: (profileData.marital_status || '').toLowerCase(),
          caste: String(profileData.caste_id || profileData.caste || prev.caste),
          mother_tongue: profileData.mother_tongue || '',
          languages: Array.isArray(profileData.language) ? profileData.language.join(',') : (profileData.languages || ''),
          country: profileData.country || '',
          state: profileData.state || '',
          city: profileData.city || '',
          zip: profileData.zip || profileData.present_address?.zip || '',
          firstname: profileData.firstname || '',
          lastname: profileData.lastname || '',
          numberOfBrothers: String(profileData.numberOfBrothers || ''),
          numberOfSisters: String(profileData.numberOfSisters || ''),
          // Physical Attributes
          height: profileData.height !== undefined ? String(profileData.height) : '',
          weight: profileData.weight !== undefined ? String(profileData.weight) : '',
          bloodGroup: profileData.bloodGroup || profileData.blood_group || '',
          eyeColor: profileData.eyeColor || profileData.eye_color || '',
          hairColor: profileData.hairColor || profileData.hair_color || '',
          complexion: profileData.complexion || '',
          disability: profileData.disability || '',
          // Family Information
          fatherName: profileData.fatherName || profileData.father_name || '',
          fatherProfession: profileData.fatherProfession || profileData.father_profession || '',
          fatherContact: profileData.fatherContact || profileData.father_contact || '',
          motherName: profileData.motherName || profileData.mother_name || '',
          motherProfession: profileData.motherProfession || profileData.mother_profession || '',
          motherContact: profileData.motherContact || profileData.mother_contact || '',
          numberOfBrothers: String(profileData.total_brother ?? profileData.numberOfBrothers ?? ''),
          numberOfSisters: String(profileData.total_sister ?? profileData.numberOfSisters ?? ''),
          // Partner Expectations
          partnerGeneralRequirement: profileData.requirements || profileData.partnerGeneralRequirement || '',
          partnerMinAge: String(profileData.min_age ?? profileData.partnerMinAge ?? ''),
          partnerMaxAge: String(profileData.max_age ?? profileData.partnerMaxAge ?? ''),
          partnerMinHeight: normalizeHeight(profileData.min_height || profileData.partnerMinHeight || ''),
          partnerMaxHeight: normalizeHeight(profileData.max_height || profileData.partnerMaxHeight || ''),
          partnerMaritalStatus: (()=>{
            const raw = profileData.marital_status || profileData.partnerMaritalStatus || '';
            if(!raw) return '';
            const found = MARITAL_STATUS.find(ms=> (ms.label ?? ms.name ?? '').toLowerCase()===String(raw).toLowerCase() || String(ms.id)===String(raw));
            return found ? String(found.id) : String(raw);
          })(),
          partnerReligion: profileData.religion || profileData.partnerReligion || '',
          partnerComplexion: profileData.complexion || profileData.partnerComplexion || '',
          partnerSmokingHabits: String(profileData.smoking_status ?? profileData.partnerSmokingHabits ?? ''),
          partnerDrinkingHabits: String(profileData.drinking_status ?? profileData.partnerDrinkingHabits ?? ''),
          partnerSpokenLanguages: Array.isArray(profileData.language) ? profileData.language.join(',') : (profileData.partnerSpokenLanguages || ''),
          partnerEducation: profileData.min_degree || profileData.partnerEducation || '',
          partnerProfession: profileData.profession || profileData.partnerProfession || '',
          partnerFinancialCondition: profileData.financial_condition || profileData.partnerFinancialCondition || '',
          partnerFamilyValues: profileData.family_position || profileData.partnerFamilyValues || '',
          // Career Information
          company: profileData.company || '',
          designation: profileData.designation || '',
          careerStartYear: profileData.careerStartYear || '',
          careerEndYear: profileData.careerEndYear || '',
          // Education Information
          institute: profileData.institute || '',
          degree: profileData.degree || '',
          fieldOfStudy: profileData.fieldOfStudy || profileData.field_of_study || '',
          educationStartYear: profileData.educationStartYear || '',
          educationEndYear: profileData.educationEndYear || '',
        }));

        // --- Prefill multi-entry arrays ---
        const eduArr = profileRoot.education_info || profileData.educations;
        if (Array.isArray(eduArr) && eduArr.length) {
          const mappedEdu = eduArr.map((e:any)=>({
            institute: e.institute || e.institution || '',
            degree: e.degree || '',
            fieldOfStudy: e.field_of_study || '',
            start: e.start || '',
            end: e.end || '',
          }));
          setEducationList(mappedEdu);
        }
        const careerArr = profileRoot.career_info || profileData.careers;
        if (Array.isArray(careerArr) && careerArr.length) {
          const mappedCareer = careerArr.map((c:any)=>({
            company: c.company || '',
            designation: c.designation || '',
            start: c.start || '',
            end: c.end || '',
          }));
          setCareerList(mappedCareer);
        }
      }
    } catch (error) {
      console.error('💥 Error fetching profile data:', error);
    } finally {
      setDataLoading(false);
    }
  };


  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      handleInputChange('birth_date', formattedDate);
    }
  };

  const handleSkipAll = async () => {
    Alert.alert('Skip All', 'Are you sure you want to skip profile completion?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        onPress: async () => {
          try {
            setLoading(true);
            await apiService.skipAllProfile();
            router.replace('/(tabs)');
          } catch (error) {
            console.error('Error skipping profile:', error);
            Alert.alert('Error', 'Failed to skip profile completion');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (loading) return;
    handleSubmit();
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  // Navigate forward without submitting (used by arrows & swipe)
  const goNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };


  const panResponderRef = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50) {
          goNextStep();
        } else if (g.dx > 50) {
          handlePrevious();
        }
      },
    })
  );

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const handleConfirmSkip = async () => {
    setShowSkipConfirm(false);
    setLoading(true);
    try {
      let skipFn: ()=>Promise<any> = async() => {};
      switch(currentStep){
        case 1:
          skipFn = apiService.skipBasicInfo;break;
        case 2:
          skipFn = apiService.skipFamilyInfo;break;
        case 3:
          skipFn = apiService.skipEducationInfo;break;
        case 4:
          skipFn = apiService.skipCareerInfo;break;
        case 5:
          skipFn = apiService.skipPhysicalAttributes;break;
        case 6:
          skipFn = apiService.skipPartnerExpectation;break;
      }
      console.log('⏭️ Skipping step', currentStep);
      await skipFn().catch(err=>console.warn('skip step err',err));
      if(currentStep<6){
        setCurrentStep((currentStep+1) as Step);
      }else{
        router.replace('/');
      }
    } catch (error) {
      console.error('⚠️ Error skipping basic info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('📤 Submitting profile completion data for step:', currentStep);
      
      // Prepare step data based on current step
      let stepData: any = {};
      
      switch (currentStep) {
        case 1:
          // Basic Information – payload matches /profile/basic-info API
          stepData = {
            firstname: formData.firstname,
            lastname: formData.lastname,
            birth_date: formData.birth_date,
            religion_id: formData.religion_id,
            gender: (():string=>{
            const g=String(formData.gender).toLowerCase();
            return g.startsWith('m')?'m':g.startsWith('f')?'f':g;
          })(),
            looking_for: formData.looking_for,
            marital_status: (()=> {
              const found = MARITAL_STATUS.find(ms=> String(ms.id)===String(formData.marital_status));
              return found ? (found.label ?? found.name ?? found.id) : String(formData.marital_status);
            })(),
            caste: getCasteName(formData.caste),
            mother_tongue: formData.mother_tongue,
            languages: formData.languages ? formData.languages.split(',').map(l=>l.trim()) : [],
            profession: formData.profession,
            financial_condition: formData.financial_condition,
            smoking_status: formData.smoking_status,
            drinking_status: formData.drinking_status==='2'?1:(formData.drinking_status||0),
            country: getOptionName(countryOptions, formData.country),
            state: getOptionName(stateOptions, formData.state),
            city: getOptionName(cityOptions, formData.city),
            zip: formData.zip,
          };
          break;
        case 2:
          // Family Information
          stepData = {
            father_name: formData.fatherName,
            father_contact: formData.fatherContact,
            father_profession: formData.fatherProfession,
            mother_name: formData.motherName,
            mother_contact: formData.motherContact,
            mother_profession: formData.motherProfession,
            total_brother: Number(formData.numberOfBrothers) || 0,
            total_sister: Number(formData.numberOfSisters) || 0,
          };
          break;
        case 3:
          // Education Information – arrays per API spec
          stepData = {
            degree: educationList.map(e=>e.degree),
            institute: educationList.map(e=>e.institute),
            start: educationList.map(e=>e.start),
            end: educationList.map(e=>e.end),
            field_of_study: educationList.map(e=>e.fieldOfStudy),
          };
          break;
        case 4:
          // Career Information
          stepData = {
            company: careerList.map(c=>c.company),
            designation: careerList.map(c=>c.designation),
            start: careerList.map(c=>c.start),
            end: careerList.map(c=>c.end),
          };
          break;
        case 5:
          // Physical Attributes
          stepData = {
            height: parseFloat(formData.height) || '',
            weight: parseFloat(formData.weight) || '',
            blood_group: formData.bloodGroup,
            eye_color: formData.eyeColor,
            hair_color: formData.hairColor,
            complexion: formData.complexion,
            disability: formData.disability,
          };
          break;
        case 6:
          // Partner Expectation
          stepData = {
            general_requirement: formData.partnerGeneralRequirement,
            min_age: Number(formData.partnerMinAge) || '',
            max_age: Number(formData.partnerMaxAge) || '',
            min_height: formData.partnerMinHeight ? parseFloat(formData.partnerMinHeight) : null,
            max_height: formData.partnerMaxHeight ? parseFloat(formData.partnerMaxHeight) : null,
            marital_status: (()=>{
              const found = MARITAL_STATUS.find(ms=> String(ms.id)===String(formData.partnerMaritalStatus));
              return found ? (found.label ?? found.name ?? found.id) : formData.partnerMaritalStatus;
            })(),
            religion: formData.partnerReligion,
            complexion: formData.partnerComplexion,
            education: formData.partnerEducation,
            profession: formData.partnerProfession,
            financial_condition: formData.partnerFinancialCondition,
            family_values: formData.partnerFamilyValues,
            smoking_status: Number(formData.partnerSmokingHabits) || '',
            drinking_status: Number(formData.partnerDrinkingHabits) || '',
            language: formData.partnerSpokenLanguages ? formData.partnerSpokenLanguages.split(',').map(l=>l.trim()) : [],
          };
          break;
      }
      let response: any = { status: 'error' };
      switch (currentStep) {
        case 1:
          response = await apiService.postBasicInfo(stepData);
          break;
        case 2:
          response = await apiService.postFamilyInfo(stepData);
          break;
        case 3:
          response = await apiService.postEducationInfo(stepData);
          break;
        case 4:
          response = await apiService.postCareerInfo(stepData);
          break;
        case 5:
          response = await apiService.postPhysicalAttributes(stepData);
          break;
        case 6:
          response = await apiService.postPartnerExpectation(stepData);
          break;
      }
      
      console.log('✅ Step submission response:', response);
      const resData:any = response?.data ?? response; // axios may wrap
      const isSuccess = resData?.status === 'success';
      
      if (isSuccess) {
        if (currentStep < 6) {
          // Move to next step
          setCurrentStep((currentStep + 1) as Step);
        } else {
          // All steps completed
          Alert.alert('Success', 'Profile completed successfully!');
          router.replace('/');
        }
      } else {
        const errMsg = resData?.message?.[0] || resData?.message?.error?.[0] || 'Failed to submit step. Please try again.';
        Alert.alert('Error', errMsg);
      }
    } catch (error: any) {
      console.error('❌ Error submitting profile step:', error);
      Alert.alert('Error', error.message || 'Failed to submit step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGenderLabel = (g: string) => (g === 'm' ? 'Male' : g === 'f' ? 'Female' : 'Not detected');

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle,{ color: colors.primary }]}>Basic Information</Text>
            <Text style={styles.stepDescription}>Complete your basic details</Text>

            {/* Profile summary card */}
            {profileSummary.name ? (
              <TouchableOpacity style={styles.profileSummaryCard} onPress={()=>setShowImageModal(true)}>
                {profileSummary.image ? (
                <Image source={{ uri: profileSummary.image }} style={styles.profileImage} />
              ) : (
                <Feather name="user" size={48} color={colors.primary} style={styles.profileImagePlaceholder} />
              )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.profileName}>{profileSummary.name}</Text>
                  <Text style={styles.profileId}>{profileSummary.id}</Text>
                </View>
                <Feather name="eye" size={22} color="red" />
              </TouchableOpacity>
            ) : null}

            {/* Names */}
            <FormInput 
              label="First Name *" 
              placeholder="Your First Name" 
              icon="user"
              fieldName="firstname"
              formData={formData}
              onFieldChange={handleInputChange}
            />
            <FormInput 
              label="Last Name *" 
              placeholder="Your Last Name" 
              icon="user"
              fieldName="lastname"
              formData={formData}
              onFieldChange={handleInputChange}
            />

            {/* Birth Date */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Date of Birth *</Text>
              <TouchableOpacity 
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: formData.birth_date ? colors.textPrimary : colors.textSecondary }}>
                  {formData.birth_date || 'Select your date of birth'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                />
              )}
            </View>

            {/* Religion */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Religion *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.religion_id}
                  onValueChange={(value) => handleInputChange('religion_id', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Religion" value="" />
                  {religionOptions.map((rel) => (
                    <Picker.Item key={rel.id} label={rel.name} value={rel.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Looking For */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Looking For *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  enabled={false}
                  selectedValue={formData.looking_for}
                  onValueChange={()=>{}}
                  style={styles.picker}
                >
                  <Picker.Item label="Select" value="" />
                  {lookingForOptions.map((opt)=>(
                    <Picker.Item key={opt.id} label={opt.name} value={opt.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <FormInput 
              label="Mother Tongue *" 
              placeholder="e.g., Tamil" 
              icon="message-circle"
              fieldName="mother_tongue"
              formData={formData}
              onFieldChange={handleInputChange}
            />

            <FormInput 
              label="Languages (comma separated) *" 
              placeholder="English,Tamil" 
              icon="globe"
              fieldName="languages"
              formData={formData}
              onFieldChange={handleInputChange}
            />

            <FormInput 
              label="Financial Condition *" 
              placeholder="Select Condition" 
              icon="dollar-sign"
              fieldName="financial_condition"
              formData={formData}
              onFieldChange={handleInputChange}
            />

            <FormInput 
              label="Profession *" 
              placeholder="Your Profession" 
              icon="briefcase"
              fieldName="profession"
              formData={formData}
              onFieldChange={handleInputChange}
            />
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Smoking Habits</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.smoking_status}
                    onValueChange={(value) => handleInputChange('smoking_status', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select" value="" />
                    {smokingHabits.map((habit) => (
                      <Picker.Item key={habit.id} label={habit.name} value={habit.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Drinking Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.drinking_status}
                    onValueChange={(value) => handleInputChange('drinking_status', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select" value="" />
                    {drinkingHabits.map((habit) => (
                      <Picker.Item key={habit.id} label={habit.name} value={habit.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Marital Status *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.marital_status}
                  onValueChange={(value) => handleInputChange('marital_status', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Marital Status" value="" />
                  {MARITAL_STATUS.map((status) => (
                    <Picker.Item key={status.id} label={status.label} value={status.id} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Caste *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={(() => {
                    if (!formData.caste) return '';
                    // if it's already an ID present in options, use it directly
                    if (casteOptions.some(c => String(c.id) === String(formData.caste))) {
                      return String(formData.caste);
                    }
                    // else attempt to map name -> id
                    const match = casteOptions.find(c => c.name.toLowerCase() === String(formData.caste).toLowerCase());
                    return match ? String(match.id) : String(formData.caste);
                  })()}
                  onValueChange={(value) => handleInputChange('caste', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Caste" value="" />
                  {casteOptions.map((c) => (
                    <Picker.Item key={c.id} label={c.name} value={c.id} />
                  ))}
                </Picker>
              </View>
            </View>
            <FormInput 
              label="Spoken Languages *" 
              placeholder="e.g., English, Tamil" 
              icon="globe"
              fieldName="languages"
              formData={formData}
              onFieldChange={handleInputChange}
            />
            
            
            <Text style={styles.subHeader}>Present Address</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Country *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  enabled={false}
                  selectedValue={(() => {
                    if(!formData.country) return '';
                    if(countryOptions.some(c=> String(c.id) === String(formData.country))){
                      return String(formData.country);
                    }
                    const match = countryOptions.find(c=> c.name.toLowerCase()===String(formData.country).toLowerCase());
                    return match ? String(match.id) : String(formData.country);
                  })()}
                  onValueChange={(value) => handleInputChange('country', value)}
                  style={styles.picker}
                >
                  <Picker.Item 
                    label={( () => {
                        const found = countryOptions.find(c=> String(c.id)===String(formData.country) || c.name.toLowerCase()===String(formData.country).toLowerCase());
                        return found ? found.name : 'India';
                    })()} 
                    value={( () => {
                        const found = countryOptions.find(c=> String(c.id)===String(formData.country) || c.name.toLowerCase()===String(formData.country).toLowerCase());
                        return found ? String(found.id) : formData.country || '';
                    })()} 
                  />
                  {countryOptions.map(c=>(<Picker.Item key={c.id} label={c.name} value={c.id} />))}
                </Picker>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>State *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={(() => {
                      if(!formData.state) return '';
                      if(stateOptions.some(s=> String(s.id) === String(formData.state))){
                        return String(formData.state);
                      }
                      const match = stateOptions.find(s=> s.name.toLowerCase()===String(formData.state).toLowerCase());
                      return match ? String(match.id) : String(formData.state);
                    })()}
                    onValueChange={(value)=>handleInputChange('state',value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select State" value="" />
                    {stateOptions.map(s=>(<Picker.Item key={s.id} label={s.name} value={s.id} />))}
                  </Picker>
                </View>
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>City *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={(() => {
                      if(!formData.city) return '';
                      if(cityOptions.some(c=> String(c.id) === String(formData.city))){
                        return String(formData.city);
                      }
                      const match = cityOptions.find(ct=> ct.name.toLowerCase()===String(formData.city).toLowerCase());
                      return match ? String(match.id) : String(formData.city);
                    })()}
                    onValueChange={(value)=>handleInputChange('city',value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select City" value="" />
                    {cityOptions.map(ct=>(<Picker.Item key={ct.id} label={ct.name} value={ct.id} />))}
                  </Picker>
                </View>
              </View>
            </View>
            <FormInput 
              label="Zip Code" 
              placeholder="Your Zip Code" 
              icon="hash"
              fieldName="zip"
              formData={formData}
              onFieldChange={handleInputChange}
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle,{ color: colors.primary }]}>Physical Attributes</Text>
            <Text style={styles.stepDescription}>Tell us about your physical characteristics</Text>
            
            <View style={styles.row}>
              <FormInput label="Height *" placeholder="e.g., 5.8" icon="trending-up" containerStyle={styles.halfWidth} fieldName="height" formData={formData} onFieldChange={handleInputChange} />
              <FormInput label="Weight *" placeholder="e.g., 70" icon="activity" containerStyle={styles.halfWidth} fieldName="weight" formData={formData} onFieldChange={handleInputChange} />
            </View>
            
            {/* Blood Group Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Blood Group *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.bloodGroup}
                  onValueChange={(value) => handleInputChange('bloodGroup', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Blood Group" value="" />
                  {bloodGroups.map((bg) => (
                    <Picker.Item key={bg} label={bg} value={bg} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <FormInput label="Face Colour *" placeholder="e.g., Fair" icon="sun" fieldName="complexion" formData={formData} onFieldChange={handleInputChange} />
            
            <View style={styles.inputContainer}>
              <FormInput label="Eye Color" placeholder="e.g., Brown" icon="eye" fieldName="eyeColor" formData={formData} onFieldChange={handleInputChange} />
            </View>
            
            <View style={styles.inputContainer}>
              <FormInput label="Hair Color" placeholder="e.g., Black" icon="eye" fieldName="hairColor" formData={formData} onFieldChange={handleInputChange} />
            </View>
            
            <FormInput label="Disability" placeholder="If any" icon="alert-circle" fieldName="disability" formData={formData} onFieldChange={handleInputChange} />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle,{ color: colors.primary }]}>Family Information</Text>
            <Text style={styles.stepDescription}>Tell us about your family</Text>
            
            <FormInput label="Father's Name *" placeholder="Father's Name" icon="user" fieldName="fatherName" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Father's Profession" placeholder="Father's Profession" icon="briefcase" fieldName="fatherProfession" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Father's Contact" placeholder="Father's Contact" icon="phone" fieldName="fatherContact" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Mother's Name *" placeholder="Mother's Name" icon="user" fieldName="motherName" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Mother's Profession" placeholder="Mother's Profession" icon="briefcase" fieldName="motherProfession" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Mother's Contact" placeholder="Mother's Contact" icon="phone" fieldName="motherContact" formData={formData} onFieldChange={handleInputChange} />
            <View style={styles.row}>
              <FormInput label="No. of Brothers" placeholder="e.g., 1" icon="users" containerStyle={styles.halfWidth} fieldName="numberOfBrothers" formData={formData} onFieldChange={handleInputChange} />
              <FormInput label="No. of Sisters" placeholder="e.g., 1" icon="users" containerStyle={styles.halfWidth} fieldName="numberOfSisters" formData={formData} onFieldChange={handleInputChange} />
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle,{ color: colors.primary }]}>Partner Expectation</Text>
            <Text style={styles.stepDescription}>What are you looking for?</Text>
            
            <FormInput label="General Requirement" placeholder="e.g., Educated, Family-oriented" icon="file-text" fieldName="partnerGeneralRequirement" formData={formData} onFieldChange={handleInputChange} />
            <View style={styles.row}>
              <FormInput label="Min Age" placeholder="e.g., 25" icon="user" containerStyle={styles.halfWidth} fieldName="partnerMinAge" formData={formData} onFieldChange={handleInputChange} />
              <FormInput label="Max Age" placeholder="e.g., 30" icon="user" containerStyle={styles.halfWidth} fieldName="partnerMaxAge" formData={formData} onFieldChange={handleInputChange} />
            </View>
            <View style={styles.row}>
              <FormInput label="Min Height" placeholder="e.g., 5.5" icon="trending-up" containerStyle={styles.halfWidth} fieldName="partnerMinHeight" formData={formData} onFieldChange={handleInputChange} />
              <FormInput label="Max Height" placeholder="e.g., 6.0" icon="trending-up" containerStyle={styles.halfWidth} fieldName="partnerMaxHeight" formData={formData} onFieldChange={handleInputChange} />
            </View>
            {/* Marital Status Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Marital Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.partnerMaritalStatus}
                  onValueChange={(value) => handleInputChange('partnerMaritalStatus', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Marital Status" value="" />
                  {MARITAL_STATUS.map((status) => (
                    <Picker.Item key={status.id} label={status.label} value={status.id} />
                  ))}
                </Picker>
              </View>
            </View>
            {/* Religion Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Religion</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.partnerReligion}
                  onValueChange={(value) => handleInputChange('partnerReligion', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Religion" value="" />
                  {religionOptions.map((opt) => (
                    <Picker.Item key={opt.id} label={opt.name} value={opt.name} />
                  ))}
                </Picker>
              </View>
            </View>
            <FormInput label="Face Colour" placeholder="e.g., Fair, Wheatish" icon="sun" fieldName="partnerComplexion" formData={formData} onFieldChange={handleInputChange} />
            {/* Smoking & Drinking Dropdowns */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Smoking Habits</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.partnerSmokingHabits}
                    onValueChange={(value) => handleInputChange('partnerSmokingHabits', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select One" value="" />
                    <Picker.Item label="Non-smoker" value="0" />
                    <Picker.Item label="Smoker" value="1" />
                    <Picker.Item label="Occasionally" value="2" />
                  </Picker>
                </View>
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Drinking Habits</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.partnerDrinkingHabits}
                    onValueChange={(value) => handleInputChange('partnerDrinkingHabits', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select One" value="" />
                    <Picker.Item label="Non-drinker" value="0" />
                    <Picker.Item label="Drinker" value="1" />
                    <Picker.Item label="Occasionally" value="2" />
                  </Picker>
                </View>
              </View>
            </View>
            <FormInput label="Spoken Languages" placeholder="e.g., English, Tamil" icon="globe" fieldName="partnerSpokenLanguages" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Education" placeholder="e.g., Masters" icon="book-open" fieldName="partnerEducation" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Profession" placeholder="e.g., Doctor, Engineer" icon="briefcase" fieldName="partnerProfession" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Financial Condition" placeholder="e.g., Well Settled" icon="dollar-sign" fieldName="partnerFinancialCondition" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Family Values" placeholder="e.g., Modern, Traditional" icon="home" fieldName="partnerFamilyValues" formData={formData} onFieldChange={handleInputChange} />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle,{ color: colors.primary }]}>Career Information</Text>
            <Text style={styles.stepDescription}>Add your career history (multiple allowed)</Text>
            {careerList.map((job, idx)=>(
              <View key={idx} style={{ marginBottom:20 }}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={[styles.subHeader, { color: colors.textPrimary }]}>Position #{idx+1}</Text>
                {careerList.length>1 && (
                  <TouchableOpacity onPress={()=>deleteCareer(idx)}>
                    <Feather name="x" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
                <FormInput label="Company *" placeholder="Company" icon="briefcase" value={job.company} onChangeText={val=>updateCareer(idx,'company',val)} />
                <FormInput label="Designation *" placeholder="Designation" icon="award" value={job.designation} onChangeText={val=>updateCareer(idx,'designation',val)} />
                <View style={styles.row}>
                  <YearPickerInput label="Start Year" containerStyle={styles.halfWidth} selectedYear={job.start} onYearChange={(val)=>updateCareer(idx,'start',val)} />
                  <YearPickerInput label="End Year" containerStyle={styles.halfWidth} selectedYear={job.end} onYearChange={(val)=>updateCareer(idx,'end',val)} />
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={addCareer} style={[styles.button, styles.secondaryButton, { alignSelf:'flex-start', backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}> 
              <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>+ Add another career</Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle,{ color: colors.primary }]}>Education Information</Text>
            <Text style={styles.stepDescription}>Add your education details (multiple allowed)</Text>

            {educationList.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: 20 }}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={[styles.subHeader, { color: colors.textPrimary }]}>Education #{idx + 1}</Text>
                {educationList.length>1 && (
                  <TouchableOpacity onPress={()=>deleteEducation(idx)}>
                    <Feather name="x" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
                <FormInput label="Institution *" placeholder="Institute Name" icon="book-open" value={edu.institute} onChangeText={val=>updateEducation(idx,'institute',val)} />
                <FormInput label="Degree *" placeholder="e.g., B.Tech" icon="award" value={edu.degree} onChangeText={val=>updateEducation(idx,'degree',val)} />
                <FormInput label="Field of Study" placeholder="e.g., Computer Science" icon="edit-3" value={edu.fieldOfStudy} onChangeText={val=>updateEducation(idx,'fieldOfStudy',val)} />
                <View style={styles.row}>
                  <YearPickerInput label="Start Year" containerStyle={styles.halfWidth} selectedYear={edu.start} onYearChange={(val)=>updateEducation(idx,'start',val)} />
                  <YearPickerInput label="End Year" containerStyle={styles.halfWidth} selectedYear={edu.end} onYearChange={(val)=>updateEducation(idx,'end',val)} />
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={addEducation} style={[styles.button, styles.secondaryButton, { alignSelf:'flex-start', backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}> 
              <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>+ Add another education</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView {...(panResponderRef.current?.panHandlers)} contentContainerStyle={styles.container} style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="edit-3" size={24} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.primary }]}>Edit Your Profile</Text>
            </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Step {currentStep} of 6</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressRow}>
          <TouchableOpacity style={styles.arrowButton} disabled={currentStep===1} onPress={handlePrevious}>
            <Feather name="chevron-left" size={18} color={currentStep===1?colors.divider:colors.primary} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View key={step} style={[styles.progressBar, { backgroundColor: colors.divider }, step <= currentStep && { backgroundColor: colors.primary }]} />
          ))}
        </View>
          <TouchableOpacity style={styles.arrowButton} disabled={currentStep===6} onPress={goNextStep}>
            <Feather name="chevron-right" size={18} color={currentStep===6?colors.divider:colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Step Content */}
        {renderStep()}


        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
              onPress={handlePrevious}
              disabled={loading}
            >
              <Feather name="arrow-left" size={20} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { flex: currentStep === 1 ? 1 : 0.5, backgroundColor: colors.primary }]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {currentStep === 6 ? 'Complete' : currentStep === 1 ? 'Save Basic Info' : 'Save & Next'}
                </Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
        marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 0,
  },
  arrowButton: {
    padding: 4,

  },
  profileSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 8,
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    borderWidth:2,
    borderColor:'red',
  },
  profileImagePlaceholder: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileId: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: Colors.light.tint,
    backgroundColor: Colors.light.tint,
  },
  stepContent: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
        marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
      },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
    flex: 0.4,
  },
  secondaryButtonText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
        marginTop: 16,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  cancelButtonText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: Colors.light.tint,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 8,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
        marginTop: 20,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
      },
});
