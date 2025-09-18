import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dimensions, StyleSheet, View, TextInput, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const [formData, setFormData] = useState({
    looking_for: '',
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    birth_date: '',
    password: '',
    religion: '',
    caste: '',
    agree: false,
  });

  // Religion options from your web project
  const religions = [
    { id: '1', name: 'Hindu' },
    { id: '2', name: 'Muslim' },
    { id: '3', name: 'Christian' },
    { id: '4', name: 'Sikh' },
    { id: '5', name: 'Buddhist' },
    { id: '6', name: 'Jain' },
    { id: '7', name: 'Parsi' },
    { id: '8', name: 'Other' }
  ];

  // Caste options based on religion
  const casteOptions = {
    '1': [ // Hindu
      'Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Vanniyar', 'Gounder', 'Thevar', 'Nadar',
      'Chettiar', 'Mudaliar', 'Pillai', 'Naicker', 'Reddy', 'Gowda', 'Lingayat', 'Vokkaliga',
      'Maratha', 'Jat', 'Gujjar', 'Rajput', 'Kamma', 'Kapu', 'Balija', 'Velama',
      'Baniya', 'Khatri', 'Arora', 'Bhumihar', 'Kayastha', 'Kurmi', 'Yadav', 'Kuruba',
      'Besta', 'Mala', 'Madiga', 'Chamar', 'Dusadh', 'Pasi', 'Other'
    ],
    '2': [ // Muslim
      'Shaikh', 'Sayyid', 'Mughal', 'Pathan', 'Ansari', 'Qureshi', 'Siddiqui', 'Faruqi',
      'Usmani', 'Khan', 'Mirza', 'Malik', 'Sheikh', 'Syed', 'Memon', 'Bohra',
      'Khoja', 'Dudhwala', 'Rayeen', 'Qassab', 'Mansoori', 'Salmani', 'Fareedi', 'Other'
    ],
    '3': [ // Christian
      'Roman Catholic', 'Protestant', 'Syro-Malabar', 'Syro-Malankara', 'Jacobite', 'Orthodox',
      'Latin Catholic', 'CSI', 'Knanaya', 'Goan Catholic', 'Mangalorean Catholic', 'Anglo-Indian',
      'Nadar Christian', 'Dalian', 'Baptist', 'Pentecostal', 'Seventh-day Adventist', 'Other'
    ],
    '4': [ // Sikh
      'Jat Sikh', 'Khatri', 'Arora', 'Ramgarhia', 'Ahluwalia', 'Bhatia', 'Kamboj', 'Lubana',
      'Mazhabi', 'Ramdasia', 'Rai Sikh', 'Saini', 'Tarkhan', 'Other'
    ],
    '5': ['Other'], // Buddhist
    '6': ['Other'], // Jain
    '7': ['Parsi', 'Other'], // Parsi
    '8': ['Other'] // Other
  };

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset caste when religion changes
      if (name === 'religion') {
        newData.caste = '';
      }
      return newData;
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleInputChange('birth_date', formattedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleRegister = async () => {
    if (!formData.looking_for || !formData.firstname || !formData.lastname || !formData.email || !formData.mobile || !formData.birth_date || !formData.password || !formData.religion || !formData.caste) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    if (!formData.agree) {
      Alert.alert('Error', 'You must agree to the terms and policies.');
      return;
    }

    setLoading(true);
    try {
      // Generate username from email (required field)
      const emailPrefix = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const username = emailPrefix + randomSuffix;

      console.log('📝 Registration data being sent:', {
        looking_for: formData.looking_for,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        mobile: formData.mobile,
        birth_date: formData.birth_date,
        religion: formData.religion,
        caste: formData.caste,
        username: username
      });

      const registrationData = {
        looking_for: formData.looking_for,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        mobile: formData.mobile,
        birth_date: formData.birth_date,
        password: formData.password,
        religion: formData.religion,
        caste: formData.caste,
        username: username,
        mobile_code: '91',
        country_code: 'IN',
        country: 'India',
        password_confirmation: formData.password,
        agree: '1',
      };

      await auth?.register(registrationData);
      Alert.alert('Success', 'Registration successful! Please log in.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.error('💥 Registration error:', error);
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

        {/* Looking For Dropdown */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Looking For *</Text>
          <Picker
            selectedValue={formData.looking_for}
            style={styles.picker}
            onValueChange={(itemValue) => handleInputChange('looking_for', itemValue)}
          >
            <Picker.Item label="Select One" value="" />
            <Picker.Item label="Bridegroom (மணமகன்)" value="1" />
            <Picker.Item label="Bride (மணமகள்)" value="2" />
          </Picker>
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
            {/* Date Picker */}
            <View style={[styles.inputContainer, styles.halfWidth]}>
                <TouchableOpacity onPress={showDatePickerModal} style={styles.datePickerButton}>
                    <Text style={[styles.input, { color: formData.birth_date ? '#1F2937' : '#9CA3AF' }]}>
                        {formData.birth_date || 'Date of Birth *'}
                    </Text>
                    <Feather name="calendar" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput style={styles.input} placeholder="Password *" placeholderTextColor="#9CA3AF" secureTextEntry value={formData.password} onChangeText={(text) => handleInputChange('password', text)} />
            </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.birth_date ? new Date(formData.birth_date) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
        {/* Religion Dropdown */}
        <View style={styles.row}>
            <View style={[styles.pickerContainer, styles.halfWidth]}>
                <Text style={styles.pickerLabel}>Religion *</Text>
                <Picker
                  selectedValue={formData.religion}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleInputChange('religion', itemValue)}
                >
                  <Picker.Item label="Select Religion" value="" />
                  {religions.map((religion) => (
                    <Picker.Item key={religion.id} label={religion.name} value={religion.id} />
                  ))}
                </Picker>
            </View>
            
            {/* Caste Dropdown */}
            <View style={[styles.pickerContainer, styles.halfWidth]}>
                <Text style={styles.pickerLabel}>Caste *</Text>
                <Picker
                  selectedValue={formData.caste}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleInputChange('caste', itemValue)}
                  enabled={!!formData.religion}
                >
                  <Picker.Item label={formData.religion ? "Select Caste" : "Select Religion First"} value="" />
                  {formData.religion && casteOptions[formData.religion]?.map((caste, index) => (
                    <Picker.Item key={index} label={caste} value={caste} />
                  ))}
                </Picker>
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
  pickerContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    minHeight: 50,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: -5,
  },
  picker: {
    height: 40,
    color: '#1F2937',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    height: 50,
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
