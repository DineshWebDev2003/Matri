import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';

const allProfiles = [
    { 
      id: '1', name: 'Sofia', age: 25, height: "152cm", location: 'Madurai', idNo: 'NDR10101', images: ['https://randomuser.me/api/portraits/women/1.jpg', 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=1889&auto=format&fit=crop', 'https://images.unsplash.com/photo-1594744806549-83db4a74a58b?q=80&w=1887&auto=format&fit=crop', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop', 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop'], premium: true,
      dob: '15/05/1999', education: 'B.E. CSE', born: '1st Born', star: 'Rohini', rassi: 'Taurus', bloodGroup: 'O +ve', maritalStatus: 'Never Married',
      job: 'Software Engineer', salary: '5-7 LPA', birthPlace: 'Madurai', birthTime: '10:00 AM',
      fatherName: 'Rajan', fatherOccupation: 'Business',
      motherName: 'Mala', motherOccupation: 'Teacher',
      siblings: '1 Brother',
      ownHouse: 'Yes', ownPlot: 'No', familyStatus: 'Upper Middle class', familyType: 'Nuclear family',
      diet: 'Non-Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '2', name: 'Pooja', age: 25, height: "160cm", location: 'Chennai', idNo: 'NDR10102', images: ['https://randomuser.me/api/portraits/women/2.jpg', 'https://images.unsplash.com/photo-1619981943232-5643b5e4053a?q=80&w=1887&auto=format&fit=crop', 'https://randomuser.me/api/portraits/women/10.jpg', 'https://randomuser.me/api/portraits/women/11.jpg'], premium: false,
      dob: '24/07/1997', education: 'MCA', born: '2nd Born', star: 'Vishaakam', rassi: 'Libra', bloodGroup: 'AB +ve', maritalStatus: 'Separated',
      job: 'Technical Supporter', salary: 'Less than 1LPA', birthPlace: 'Trichy', birthTime: '6:40 AM',
      fatherName: 'Arumugam (Late)', fatherOccupation: 'Engineer',
      motherName: 'Janaki', motherOccupation: 'Home maker',
      siblings: '2 Sisters',
      ownHouse: 'Yes', ownPlot: 'Yes', familyStatus: 'Middle class', familyType: 'Joint family',
      diet: 'Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '3', name: 'Suhashini', age: 24, height: "165cm", location: 'Trichy', idNo: 'NDR10103', images: ['https://randomuser.me/api/portraits/women/3.jpg', 'https://randomuser.me/api/portraits/women/12.jpg'], premium: false,
      dob: '10/11/2000', education: 'M.Sc. Maths', born: '1st Born', star: 'Anusham', rassi: 'Scorpio', bloodGroup: 'B +ve', maritalStatus: 'Never Married',
      job: 'Teacher', salary: '2-3 LPA', birthPlace: 'Trichy', birthTime: '01:20 PM',
      fatherName: 'Subramanian', fatherOccupation: 'Government Employee',
      motherName: 'Lakshmi', motherOccupation: 'Home maker',
      siblings: '1 Sister',
      ownHouse: 'Yes', ownPlot: 'Yes', familyStatus: 'Middle class', familyType: 'Nuclear family',
      diet: 'Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '4', name: 'Divya', age: 26, height: "158cm", location: 'Kovaipudur', idNo: 'NDR10104', images: ['https://randomuser.me/api/portraits/women/4.jpg', 'https://randomuser.me/api/portraits/women/14.jpg', 'https://randomuser.me/api/portraits/women/15.jpg'], premium: false,
      dob: '02/03/1998', education: 'B.Com', born: '2nd Born', star: 'Uthiraadam', rassi: 'Sagittarius', bloodGroup: 'A +ve', maritalStatus: 'Never Married',
      job: 'Accountant', salary: '3-4 LPA', birthPlace: 'Coimbatore', birthTime: '11:45 PM',
      fatherName: 'Krishnan', fatherOccupation: 'Bank Manager',
      motherName: 'Saraswathi', motherOccupation: 'Home maker',
      siblings: 'No Siblings',
      ownHouse: 'Yes', ownPlot: 'No', familyStatus: 'Upper Middle class', familyType: 'Nuclear family',
      diet: 'Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '5', name: 'Shree Devi', age: 24, height: "155cm", location: 'Thiruvallur', idNo: 'NDR10105', images: ['https://randomuser.me/api/portraits/women/5.jpg', 'https://randomuser.me/api/portraits/women/16.jpg'], premium: false,
      dob: '20/08/2000', education: 'B.Tech IT', born: '1st Born', star: 'Kettai', rassi: 'Scorpio', bloodGroup: 'O -ve', maritalStatus: 'Never Married',
      job: 'Data Analyst', salary: '4-5 LPA', birthPlace: 'Chennai', birthTime: '08:30 AM',
      fatherName: 'Ganesan', fatherOccupation: 'Engineer',
      motherName: 'Vani', motherOccupation: 'Professor',
      siblings: '1 Brother',
      ownHouse: 'No', ownPlot: 'No', familyStatus: 'Middle class', familyType: 'Nuclear family',
      diet: 'Non-Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '6', name: 'Shivanya', age: 26, height: "162cm", location: 'Trichy', idNo: 'NDR10106', images: ['https://randomuser.me/api/portraits/women/1.jpg'], premium: true,
      dob: '15/05/1998', education: 'B.E. ECE', born: '1st Born', star: 'Rohini', rassi: 'Taurus', bloodGroup: 'O +ve', maritalStatus: 'Never Married',
      job: 'Hardware Engineer', salary: '5-7 LPA', birthPlace: 'Trichy', birthTime: '10:00 AM',
      fatherName: 'Raman', fatherOccupation: 'Business', motherName: 'Sita', motherOccupation: 'Homemaker', siblings: '1 Brother',
      ownHouse: 'Yes', ownPlot: 'No', familyStatus: 'Upper Middle class', familyType: 'Nuclear family', diet: 'Non-Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '7', name: 'Divya Dia', age: 27, height: "158cm", location: 'Chennai', idNo: 'NDR10107', images: ['https://randomuser.me/api/portraits/women/2.jpg'], premium: false,
      dob: '24/07/1997', education: 'MCA', born: '2nd Born', star: 'Vishaakam', rassi: 'Libra', bloodGroup: 'AB +ve', maritalStatus: 'Never Married',
      job: 'Technical Supporter', salary: 'Less than 1LPA', birthPlace: 'Chennai', birthTime: '6:40 AM',
      fatherName: 'Arumugam (Late)', fatherOccupation: 'Engineer', motherName: 'Janaki', motherOccupation: 'Home maker', siblings: '2 Sisters',
      ownHouse: 'Yes', ownPlot: 'Yes', familyStatus: 'Middle class', familyType: 'Joint family', diet: 'Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '8', name: 'Elsa Perry', age: 22, height: "165cm", location: 'Ooty', idNo: 'NDR10108', images: ['https://randomuser.me/api/portraits/women/3.jpg'], premium: false,
      dob: '10/11/2002', education: 'M.Sc. Maths', born: '1st Born', star: 'Anusham', rassi: 'Scorpio', bloodGroup: 'B +ve', maritalStatus: 'Never Married',
      job: 'Teacher', salary: '2-3 LPA', birthPlace: 'Ooty', birthTime: '01:20 PM',
      fatherName: 'Subramanian', fatherOccupation: 'Government Employee', motherName: 'Lakshmi', motherOccupation: 'Home maker', siblings: '1 Sister',
      ownHouse: 'Yes', ownPlot: 'Yes', familyStatus: 'Middle class', familyType: 'Nuclear family', diet: 'Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '9', name: 'Maghilini', age: 26, height: "162cm", location: 'Trichy', idNo: 'NDR10109', images: ['https://randomuser.me/api/portraits/women/4.jpg'], premium: true,
      dob: '15/05/1998', education: 'B.E. IT', born: '1st Born', star: 'Rohini', rassi: 'Taurus', bloodGroup: 'A +ve', maritalStatus: 'Never Married',
      job: 'Software Developer', salary: '7-10 LPA', birthPlace: 'Trichy', birthTime: '11:00 AM',
      fatherName: 'Ravi', fatherOccupation: 'Doctor', motherName: 'Sunitha', motherOccupation: 'Professor', siblings: '1 Sister',
      ownHouse: 'Yes', ownPlot: 'Yes', familyStatus: 'Upper Middle class', familyType: 'Nuclear family', diet: 'Non-Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '10', name: 'Smrithi Sri', age: 27, height: "158cm", location: 'Chennai', idNo: 'NDR10110', images: ['https://randomuser.me/api/portraits/women/5.jpg'], premium: false,
      dob: '24/07/1997', education: 'B.Com', born: '2nd Born', star: 'Vishaakam', rassi: 'Libra', bloodGroup: 'B +ve', maritalStatus: 'Never Married',
      job: 'Accountant', salary: '3-4 LPA', birthPlace: 'Chennai', birthTime: '7:00 AM',
      fatherName: 'Kumar', fatherOccupation: 'Business', motherName: 'Jaya', motherOccupation: 'Home maker', siblings: '1 Brother',
      ownHouse: 'Yes', ownPlot: 'No', familyStatus: 'Middle class', familyType: 'Joint family', diet: 'Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
    { 
      id: '11', name: 'Vaishali', age: 22, height: "165cm", location: 'Ooty', idNo: 'NDR10111', images: ['https://randomuser.me/api/portraits/women/6.jpg'], premium: false,
      dob: '10/11/2002', education: 'B.Sc. CS', born: '1st Born', star: 'Anusham', rassi: 'Scorpio', bloodGroup: 'O +ve', maritalStatus: 'Never Married',
      job: 'System Analyst', salary: '4-5 LPA', birthPlace: 'Ooty', birthTime: '02:00 PM',
      fatherName: 'Suresh', fatherOccupation: 'Bank Employee', motherName: 'Latha', motherOccupation: 'Home maker', siblings: 'No Siblings',
      ownHouse: 'Yes', ownPlot: 'Yes', familyStatus: 'Middle class', familyType: 'Nuclear family', diet: 'Vegetarian',
      patham: '****', lagnam: '****', horoscopeType: 'Dosham', doshamType: '****', married: '1',
    },
];

export const mockProfiles = {
  all: allProfiles,
  newlyJoined: allProfiles.slice(5, 8),
  newMatches: allProfiles.slice(8, 11),
};

const ProfileCard = ({ item, onPress }: { item: any, onPress: () => void }) => (
  <TouchableOpacity style={[styles.profileCard, item.premium && styles.premiumCard]} onPress={onPress}>
    <Image source={{ uri: item.images[0] }} style={styles.profileImage} />
    <View style={styles.profileInfo}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.profileName}>{item.name}</Text>
        <Feather name="check-circle" size={16} color={Colors.light.tint} style={{ marginLeft: 5 }} />
      </View>
      <Text style={styles.profileDetail}>Age: {item.age}</Text>
      <Text style={styles.profileDetail}>Height: {item.height}</Text>
      <Text style={styles.profileDetail}>Location: {item.location}</Text>
      <Text style={styles.profileDetail}>ID No: {item.idNo}</Text>
    </View>
    <TouchableOpacity style={styles.bookmarkIcon}>
      <Feather name="bookmark" size={20} color={Colors.light.icon} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function ProfilesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { initialTab } = params;

  const [activeTab, setActiveTab] = useState(initialTab || 'New Matches');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as string);
    }
  }, [initialTab]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Profiles</Text>
              </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <TextInput placeholder="Search..." style={styles.searchInput} />
          <TouchableOpacity style={styles.searchButton}>
            <Feather name="search" size={20} color={'white'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('New Matches')}>
          <Text style={[styles.tabText, activeTab === 'New Matches' && styles.activeTabText]}>New Matches</Text>
          {activeTab === 'New Matches' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Newly joined')}>
          <Text style={[styles.tabText, activeTab === 'Newly joined' && styles.activeTabText]}>Newly joined</Text>
          {activeTab === 'Newly joined' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('All Profiles')}>
          <Text style={[styles.tabText, activeTab === 'All Profiles' && styles.activeTabText]}>All Profiles</Text>
          {activeTab === 'All Profiles' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'New Matches' ? mockProfiles.newMatches : activeTab === 'Newly joined' ? mockProfiles.newlyJoined : mockProfiles.all}
        renderItem={({ item }) => <ProfileCard item={item} onPress={() => router.push(`/profile/${item.id}`)} />}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  searchSection: { padding: 20, backgroundColor: 'white' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, height: 50, paddingHorizontal: 15, fontSize: 16 },
  searchButton: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 10, margin: 5 },
  tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: 'white' },
  tabText: { color: Colors.light.icon, fontWeight: '600', fontSize: 16, paddingBottom: 10 },
  activeTabText: { color: Colors.light.text },
  activeTabIndicator: { height: 3, backgroundColor: Colors.light.tint, position: 'absolute', bottom: 0, left: 0, right: 0 },
  listContainer: { paddingHorizontal: 20, paddingTop: 10 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  premiumCard: { backgroundColor: '#FFFBEB' },
  profileImage: { width: 80, height: 100, borderRadius: 10 },
  profileInfo: { flex: 1, marginLeft: 15, alignSelf: 'flex-start' },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileDetail: { color: Colors.light.icon, marginTop: 4, fontSize: 14 },
  bookmarkIcon: { position: 'absolute', top: 15, right: 15 },
});