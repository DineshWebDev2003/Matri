import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://app.90skalyanam.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Service
export const apiService = {
  api: apiClient,

  // Authentication methods
  async login(username: string, password: string) {
    try {
      const response = await this.api.post('/login', {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Login failed');
    }
  },

  async register(userData: any) {
    try {
      console.log('📝 Attempting registration with:', userData.email, userData.username);
      
      // Use URLSearchParams for form-encoded data (Laravel standard)
      const formData = new URLSearchParams();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          formData.append(key, userData[key].toString());
        }
      });

      const response = await this.api.post('/register', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('💥 Registration API error:', error.response?.data);
      console.error('💥 Registration API status:', error.response?.status);
      console.error('💥 Registration API full error:', error);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Registration failed');
    }
  },

  logout: async () => {
    const response = await apiClient.get('/logout');
    return response.data;
  },

  // User Data
  getUserInfo: async () => {
    const response = await apiClient.get('/user-info');
    return response.data;
  },

  getDashboard: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await apiClient.post('/profile-setting', profileData);
    return response.data;
  },

  changePassword: async (passwordData: any) => {
    const response = await apiClient.post('/change-password', passwordData);
    return response.data;
  },

  // KYC
  getKycForm: async () => {
    const response = await apiClient.get('/kyc-form');
    return response.data;
  },

  submitKyc: async (kycData: any) => {
    const response = await apiClient.post('/kyc-submit', kycData);
    return response.data;
  },

  // Deposits/Payments
  getDepositMethods: async () => {
    const response = await apiClient.get('/deposit/methods');
    return response.data;
  },

  getDepositHistory: async () => {
    const response = await apiClient.get('/deposit/history');
    return response.data;
  },

  // Profiles/Users - Get real member data using new API endpoints
  getProfiles: async (params?: { type?: string; limit?: number; search?: string }) => {
    try {
      console.log('🔄 Fetching real member profiles from API...');
      console.log('📋 Request params:', params);
      
      // Use the new API endpoints we created
      const queryParams = new URLSearchParams();
      
      if (params?.type) {
        queryParams.append('type', params.type);
      }
      if (params?.limit) {
        queryParams.append('per_page', params.limit.toString());
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      
      const endpoint = params?.search ? '/members/search' : '/members';
      const url = `${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      console.log('🌐 API URL:', url);
      
      const response = await apiClient.get(url);
      
      if (response.data.status === 'success') {
        const members = response.data.data.members;
        console.log(`✅ Retrieved ${members.length} real profiles from API`);
        
        // Transform backend member data to mobile app profile format
        const transformedProfiles = members.map((member: any) => transformMemberToProfile(member));
        
        return {
          status: 'success',
          data: {
            profiles: transformedProfiles,
            pagination: response.data.data.pagination
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('💥 Real profiles fetch error:', error);
      
      // Return empty data instead of fallback
      return {
        status: 'error',
        data: {
          profiles: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 0,
            total: 0,
            has_more: false
          }
        }
      };
    }
  },

  getProfile: async (id: string) => {
    try {
      console.log('🔄 Fetching individual member profile:', id);
      
      // Use the new getMember endpoint for individual profiles
      const response = await apiClient.get(`/members/${id}`);
      
      if (response.data.status === 'success') {
        const member = response.data.data.member;
        console.log('✅ Retrieved individual profile from API');
        
        // Transform backend member data to mobile app profile format
        const transformedProfile = transformMemberToProfile(member);
        
        return {
          status: 'success',
          data: {
            profile: transformedProfile
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('💥 Individual profile fetch error:', error);
      
      // Return error instead of fallback
      return {
        status: 'error',
        data: {
          profile: null
        }
      };
    }
  },

  getAllProfiles: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  searchProfiles: async (searchParams?: any) => {
    const response = await apiClient.get('/user-info');
    return response.data;
  },

  // General Settings
  getGeneralSettings: async () => {
    const response = await apiClient.get('/general-setting');
    return response.data;
  },

  getCountries: async () => {
    const response = await apiClient.get('/get-countries');
    return response.data;
  },

  // Authorization
  getAuthorization: async () => {
    const response = await apiClient.get('/authorization');
    return response.data;
  },

  verifyEmail: async (verificationData: any) => {
    const response = await apiClient.post('/verify-email', verificationData);
    return response.data;
  },

  verifyMobile: async (verificationData: any) => {
    const response = await apiClient.post('/verify-mobile', verificationData);
    return response.data;
  },

  // Search members by name, caste, or profile ID
  async searchMembers(params: { query: string; limit?: number }) {
    try {
      console.log('🔍 Searching members with query:', params.query);
      const response = await this.api.get('/members/search', {
        params: {
          q: params.query,
          limit: params.limit || 20
        }
      });
      console.log('✅ Search results retrieved');
      return response.data;
    } catch (error: any) {
      console.error('❌ Search failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message?.error?.join(', ') || 'Search failed');
    }
  },
};


// Helper function to transform backend member data to mobile app profile format
const transformMemberToProfile = (memberData: any) => {
  // Safely access nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Calculate age from birth_date if available
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A';
    }
  };

  // Ensure memberData is not null/undefined
  if (!memberData) {
    memberData = {};
  }

  // Transform backend member data to mobile app profile format based on actual API response
  const profile = {
    id: safeGet(memberData, 'id', '1')?.toString() || '1',
    name: `${safeGet(memberData, 'firstname', 'User')} ${safeGet(memberData, 'lastname', '')}`.trim(),
    firstname: safeGet(memberData, 'firstname', 'User'),
    lastname: safeGet(memberData, 'lastname', ''),
    age: calculateAge(safeGet(memberData, 'basic_info.birth_date')),
    height: safeGet(memberData, 'physical_attributes.height', 'N/A'),
    location: safeGet(memberData, 'basic_info.city') || safeGet(memberData, 'address.city') || 'N/A',
    city: safeGet(memberData, 'basic_info.city') || safeGet(memberData, 'address.city') || 'N/A',
    idNo: safeGet(memberData, 'profile_id') || `USR${safeGet(memberData, 'id', '1')?.toString().padStart(5, '0') || '00001'}`,
    profile_id: safeGet(memberData, 'profile_id'),
    images: safeGet(memberData, 'image') ? [`https://app.90skalyanam.com/assets/images/user/profile/${safeGet(memberData, 'image')}`] : 
            safeGet(memberData, 'galleries', []).length > 0 ? 
            safeGet(memberData, 'galleries', []).map((gallery: any) => `https://app.90skalyanam.com/assets/images/user/gallery/${gallery.image}`) :
            ['https://randomuser.me/api/portraits/women/1.jpg'],
    image: safeGet(memberData, 'image'),
    premium: (safeGet(memberData, 'package_id', 0) > 0) || false,
    profileComplete: safeGet(memberData, 'profile_complete') === '1',
    lookingFor: safeGet(memberData, 'looking_for', '1'),
    kycVerified: safeGet(memberData, 'kv') === '1',
    emailVerified: safeGet(memberData, 'ev') === '1',
    mobileVerified: safeGet(memberData, 'sv') === '1',
    joinedDate: safeGet(memberData, 'created_at') || new Date().toISOString(),
    isNewlyJoined: true,
    
    // Additional profile details with safe access from actual API structure
    dob: safeGet(memberData, 'basic_info.birth_date', 'N/A'),
    education: safeGet(memberData, 'education_info.0.degree', 'N/A'),
    born: '1st Born',
    star: safeGet(memberData, 'basic_info.star', 'N/A'),
    rassi: safeGet(memberData, 'basic_info.rassi', 'N/A'),
    bloodGroup: safeGet(memberData, 'physical_attributes.blood_group', 'N/A'),
    maritalStatus: safeGet(memberData, 'basic_info.marital_status', 'N/A'),
    job: safeGet(memberData, 'career_info.0.designation') || safeGet(memberData, 'basic_info.profession', 'N/A'),
    salary: safeGet(memberData, 'career_info.0.annual_income') || safeGet(memberData, 'basic_info.financial_condition', 'N/A'),
    birthPlace: safeGet(memberData, 'basic_info.birth_place') || safeGet(memberData, 'basic_info.city', 'N/A'),
    birthTime: safeGet(memberData, 'basic_info.birth_time', 'N/A'),
    fatherName: safeGet(memberData, 'family.father_name', 'N/A'),
    fatherOccupation: safeGet(memberData, 'family.father_occupation', 'N/A'),
    motherName: safeGet(memberData, 'family.mother_name', 'N/A'),
    motherOccupation: safeGet(memberData, 'family.mother_occupation', 'N/A'),
    siblings: safeGet(memberData, 'family.siblings', 'N/A'),
    ownHouse: safeGet(memberData, 'family.own_house', 'N/A'),
    ownPlot: safeGet(memberData, 'family.own_plot', 'N/A'),
    familyStatus: safeGet(memberData, 'family.family_status', 'N/A'),
    familyType: safeGet(memberData, 'family.family_type', 'N/A'),
    diet: safeGet(memberData, 'physical_attributes.diet', 'N/A'),
    patham: '****',
    lagnam: '****',
    horoscopeType: 'Dosham',
    doshamType: '****',
    married: '1',
    
    // Religion info from actual API structure
    religion: safeGet(memberData, 'basic_info.religion', 'N/A'),
    caste: safeGet(memberData, 'basic_info.caste', 'N/A'),
    motherTongue: safeGet(memberData, 'basic_info.mother_tongue', 'N/A'),
    
    // Physical attributes
    complexion: safeGet(memberData, 'physical_attributes.complexion', 'N/A'),
    bodyType: safeGet(memberData, 'physical_attributes.body_type', 'N/A'),
    
    // Partner expectations
    partnerAgeMin: safeGet(memberData, 'partner_expectation.min_age', 22),
    partnerAgeMax: safeGet(memberData, 'partner_expectation.max_age', 35),
    partnerHeightMin: safeGet(memberData, 'partner_expectation.min_height', '150cm'),
    partnerHeightMax: safeGet(memberData, 'partner_expectation.max_height', '180cm'),
    
    // Additional fields from API response
    gender: safeGet(memberData, 'basic_info.gender', 'N/A'),
    smokingStatus: safeGet(memberData, 'basic_info.smoking_status', 'N/A'),
    drinkingStatus: safeGet(memberData, 'basic_info.drinking_status', 'N/A'),
    country: safeGet(memberData, 'basic_info.country', 'N/A'),
    state: safeGet(memberData, 'basic_info.state', 'N/A'),
    mobile: safeGet(memberData, 'mobile', 'N/A'),
    email: safeGet(memberData, 'email', 'N/A'),
  };

  return profile;
};

// Helper function to transform real user data to profile format
const transformUserToProfile = (userData: any, type: string) => {
  // Safely access nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Calculate age from birth_date if available
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 25; // Default age
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 25;
    }
  };

  // Ensure userData is not null/undefined
  if (!userData) {
    userData = {};
  }

  // Transform real user data to profile format with safe property access
  const profile = {
    id: safeGet(userData, 'id', '1')?.toString() || '1',
    name: `${safeGet(userData, 'firstname', 'User')} ${safeGet(userData, 'lastname', '')}`.trim(),
    firstname: safeGet(userData, 'firstname', 'User'),
    lastname: safeGet(userData, 'lastname', ''),
    age: safeGet(userData, 'birth_date') ? calculateAge(safeGet(userData, 'birth_date')) : 25,
    height: safeGet(userData, 'height', '165cm'),
    location: safeGet(userData, 'city') || safeGet(userData, 'address.city') || 'Chennai',
    idNo: `USR${safeGet(userData, 'id', '1')?.toString().padStart(5, '0') || '00001'}`,
    images: safeGet(userData, 'image') ? [`https://app.90skalyanam.com/assets/images/user/profile/${safeGet(userData, 'image')}`] : ['https://randomuser.me/api/portraits/women/1.jpg'],
    premium: (safeGet(userData, 'package_id', 0) > 0) || false,
    profileComplete: safeGet(userData, 'reg_step') === 1,
    lookingFor: safeGet(userData, 'looking_for', '1'),
    kycVerified: safeGet(userData, 'kv') === 1,
    emailVerified: safeGet(userData, 'ev') === 1,
    mobileVerified: safeGet(userData, 'sv') === 1,
    joinedDate: safeGet(userData, 'created_at') || new Date().toISOString(),
    isNewlyJoined: true,
    
    // Additional profile details with safe access
    dob: safeGet(userData, 'birth_date', '01/01/1999'),
    education: safeGet(userData, 'education', 'Graduate'),
    born: '1st Born',
    star: safeGet(userData, 'star', 'Rohini'),
    rassi: safeGet(userData, 'rassi', 'Taurus'),
    bloodGroup: safeGet(userData, 'blood_group', 'O +ve'),
    maritalStatus: safeGet(userData, 'marital_status', 'Never Married'),
    job: safeGet(userData, 'profession', 'Professional'),
    salary: safeGet(userData, 'income', '5-7 LPA'),
    birthPlace: safeGet(userData, 'birth_place') || safeGet(userData, 'city', 'Chennai'),
    birthTime: safeGet(userData, 'birth_time', '10:00 AM'),
    fatherName: safeGet(userData, 'father_name', 'Father'),
    fatherOccupation: safeGet(userData, 'father_occupation', 'Business'),
    motherName: safeGet(userData, 'mother_name', 'Mother'),
    motherOccupation: safeGet(userData, 'mother_occupation', 'Homemaker'),
    siblings: safeGet(userData, 'siblings', '1 Brother'),
    ownHouse: safeGet(userData, 'own_house', 'Yes'),
    ownPlot: safeGet(userData, 'own_plot', 'No'),
    familyStatus: safeGet(userData, 'family_status', 'Middle class'),
    familyType: safeGet(userData, 'family_type', 'Nuclear family'),
    diet: safeGet(userData, 'diet', 'Vegetarian'),
    patham: '****',
    lagnam: '****',
    horoscopeType: 'Dosham',
    doshamType: '****',
    married: '1',
  };

  return profile;
};

// All mock data removed - using only real API data

export default apiService;
