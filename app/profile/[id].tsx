import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ImageBackground, TouchableOpacity, FlatList, Dimensions, Modal } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { apiService } from '../../services/api';
import ProfileImage from '../../components/ProfileImage';

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

interface TagProps {
  icon?: keyof typeof Feather.glyphMap;
  text: string;
  highlight?: boolean;
}

const Tag: React.FC<TagProps> = ({ icon, text, highlight }) => (
  <View style={[styles.tag, highlight && styles.tagHighlight]}>
    {icon && <Feather name={icon} size={14} color={highlight ? 'white' : Colors.light.tint} />}
    <Text style={[styles.tagText, highlight && styles.tagTextHighlight]}>{text}</Text>
  </View>
);

const { width } = Dimensions.get('window');

export default function ProfileDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Details');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactViewsRemaining, setContactViewsRemaining] = useState(454);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('🔄 Fetching profile for ID:', id);
        const response = await apiService.getProfile(id as string);
        console.log('👤 Profile API response:', response);
        
        if (response.status === 'success') {
          // The API can return either data.member or data.profile
          const memberData = response.data.member || response.data.profile;
          console.log('✅ Member data received:', memberData);
          
          // Transform member data to profile format
          const transformedProfile = {
            id: memberData.id,
            name: memberData.name || `${memberData.firstname || ''} ${memberData.lastname || ''}`.trim(),
            age: memberData.age || 'N/A',
            height: memberData.height || 'N/A',
            location: memberData.location || memberData.city || 'N/A',
            images: memberData.images?.length > 0 ? memberData.images : 
                   memberData.image ? [`https://app.90skalyanam.com/assets/images/user/profile/${memberData.image}`] : 
                   ['https://randomuser.me/api/portraits/women/1.jpg'],
            
            // Basic details
            dob: memberData.dob || 'N/A',
            education: memberData.education || 'N/A',
            born: memberData.born || '1st Born',
            star: memberData.star || 'N/A',
            rassi: memberData.rassi || 'N/A',
            bloodGroup: memberData.bloodGroup || 'N/A',
            maritalStatus: memberData.maritalStatus || 'N/A',
            religion: memberData.religion?.name || memberData.religion || 'N/A',
            caste: memberData.caste || 'N/A',
            languages: memberData.languages || memberData.motherTongue || 'N/A',
            eyeColor: memberData.eyeColor || 'N/A',
            hairColor: memberData.hairColor || 'N/A',
            disability: memberData.disability || 'N/A',
            complexion: memberData.complexion || 'N/A',
            
            // Professional details
            job: memberData.job || 'N/A',
            salary: memberData.salary || 'N/A',
            profession: memberData.profession || memberData.job || 'N/A',
            
            // Address details
            presentAddress: memberData.presentAddress || memberData.city || 'N/A',
            permanentAddress: memberData.permanentAddress || 'N/A',
            
            // Horoscope details
            birthPlace: memberData.birthPlace || memberData.city || 'N/A',
            birthTime: memberData.birthTime || 'N/A',
            patham: memberData.patham || '****',
            lagnam: memberData.lagnam || '****',
            horoscopeType: memberData.horoscopeType || 'Dosham',
            doshamType: memberData.doshamType || '****',
            
            // Family details
            fatherName: memberData.fatherName || 'N/A',
            fatherOccupation: memberData.fatherOccupation || 'N/A',
            motherName: memberData.motherName || 'N/A',
            motherOccupation: memberData.motherOccupation || 'N/A',
            siblings: memberData.siblings || 'N/A',
            
            // Other details
            married: memberData.married || 'N/A',
            ownHouse: memberData.ownHouse || 'N/A',
            ownPlot: memberData.ownPlot || 'N/A',
            familyStatus: memberData.familyStatus || 'N/A',
            familyType: memberData.familyType || 'N/A',
            
            // Contact details
            mobile: memberData.mobile || memberData.phone || 'N/A',
            email: memberData.email || 'N/A',
            
            // Partner preferences from partnerExpectation relationship
            partnerAgeMin: memberData.partnerExpectation?.min_age || 'N/A',
            partnerAgeMax: memberData.partnerExpectation?.max_age || 'N/A',
            partnerHeightMin: memberData.partnerExpectation?.min_height || 'N/A',
            partnerHeightMax: memberData.partnerExpectation?.max_height || 'N/A',
            partnerReligion: memberData.partnerExpectation?.religion || 'N/A',
            partnerCaste: memberData.partnerExpectation?.caste || 'N/A',
            partnerEducation: memberData.partnerExpectation?.education || 'N/A',
            partnerProfession: memberData.partnerExpectation?.profession || 'N/A',
            partnerCountry: memberData.partnerExpectation?.country || 'N/A',
            partnerState: memberData.partnerExpectation?.state || 'N/A',
            partnerCity: memberData.partnerExpectation?.city || 'N/A',
            partnerIncome: memberData.partnerExpectation?.income || 'N/A',
            partnerMaritalStatus: memberData.partnerExpectation?.marital_status || 'N/A',
            lookingFor: memberData.lookingFor || 'N/A',
            
            // Verification and membership
            verified: memberData.verified || memberData.is_verified || 0,
            membershipTier: memberData.limitation?.package?.name || 'Basic',
          };
          
          console.log('🔄 Transformed profile:', transformedProfile);
          setProfile(transformedProfile);
        } else {
          console.log('❌ Profile API failed:', response);
        }
      } catch (error) {
        console.error('💥 Failed to fetch profile:', error);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  // Helper function to calculate age
  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleContactView = () => {
    setShowContactModal(true);
  };

  const confirmContactView = () => {
    setContactViewsRemaining(prev => prev - 1);
    setShowContactModal(false);
    // Here you would typically make an API call to deduct contact view
  };

  const renderTabContent = () => {
    if (!profile) {
      return (
        <View style={styles.card}>
          <Text style={styles.emptyState}>Loading profile information...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'Details':
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Basic Information</Text>
              <DetailItem label="Age" value={`${profile?.age || 'N/A'} Years`} />
              <DetailItem label="Blood Group" value={profile?.bloodGroup || 'N/A'} />
              <DetailItem label="Height" value={profile?.height || 'N/A'} />
              <DetailItem label="Religion" value={profile?.religion || 'N/A'} />
              <DetailItem label="Caste" value={profile?.caste || 'N/A'} />
              <DetailItem label="Languages" value={profile?.languages || 'N/A'} />
              <DetailItem label="Eye Color" value={profile?.eyeColor || 'N/A'} />
              <DetailItem label="Hair Color" value={profile?.hairColor || 'N/A'} />
              <DetailItem label="Disability" value={profile?.disability || 'N/A'} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Professional Details</Text>
              <DetailItem label="Profession" value={profile?.profession || 'N/A'} />
              <DetailItem label="Salary" value={profile?.salary || 'N/A'} />
              <DetailItem label="Job Location" value={profile?.location || 'N/A'} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Address Information</Text>
              <DetailItem label="Present Address" value={profile?.presentAddress || 'N/A'} />
              <DetailItem label="Permanent Address" value={profile?.permanentAddress || 'N/A'} />
              <DetailItem label="Face Colour" value={profile?.complexion || 'N/A'} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Horoscope Details</Text>
              <DetailItem label="Place of Birth" value={profile?.birthPlace || 'N/A'} />
              <DetailItem label="Time of Birth" value={profile?.birthTime || 'N/A'} />
              <DetailItem label="Raasi" value={profile?.rassi || 'N/A'} />
              <DetailItem label="Star" value={profile?.star || 'N/A'} />
              <DetailItem label="Patham" value={profile?.patham || 'N/A'} />
              <DetailItem label="Lagnam" value={profile?.lagnam || 'N/A'} />
              <DetailItem label="Horoscope type" value={profile?.horoscopeType || 'N/A'} />
              <DetailItem label="Dosham type" value={profile?.doshamType || 'N/A'} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Family Details</Text>
              <DetailItem label="Father's Name" value={profile?.fatherName || 'N/A'} />
              <DetailItem label="Father's Profession" value={profile?.fatherOccupation || 'N/A'} />
              <DetailItem label="Mother's Name" value={profile?.motherName || 'N/A'} />
              <DetailItem label="Mother's Profession" value={profile?.motherOccupation || 'N/A'} />
              <DetailItem label="Siblings" value={profile?.siblings || 'N/A'} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Other Details</Text>
              <DetailItem label="Married" value={profile?.married || 'N/A'} />
              <DetailItem label="Own House" value={profile?.ownHouse || 'N/A'} />
              <DetailItem label="Own Plot" value={profile?.ownPlot || 'N/A'} />
              <DetailItem label="Family Status" value={profile?.familyStatus || 'N/A'} />
            </View>
          </>
        );
      case 'Partner':
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Partner Preferences</Text>
              <DetailItem label="Age Range" value={`${profile?.partnerAgeMin || 'N/A'} - ${profile?.partnerAgeMax || 'N/A'} Years`} />
              <DetailItem label="Height Range" value={`${profile?.partnerHeightMin || 'N/A'} - ${profile?.partnerHeightMax || 'N/A'}`} />
              <DetailItem label="Religion" value={profile?.partnerReligion || 'N/A'} />
              <DetailItem label="Caste" value={profile?.partnerCaste || 'N/A'} />
              <DetailItem label="Education" value={profile?.partnerEducation || 'N/A'} />
              <DetailItem label="Profession" value={profile?.partnerProfession || 'N/A'} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Location Preferences</Text>
              <DetailItem label="Country" value={profile?.partnerCountry || 'N/A'} />
              <DetailItem label="State" value={profile?.partnerState || 'N/A'} />
              <DetailItem label="City" value={profile?.partnerCity || 'N/A'} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Other Preferences</Text>
              <DetailItem label="Income" value={profile?.partnerIncome || 'N/A'} />
              <DetailItem label="Marital Status" value={profile?.partnerMaritalStatus || 'N/A'} />
              <DetailItem label="Looking For" value={profile?.lookingFor === '1' ? 'Bride' : 'Groom'} />
            </View>
          </>
        );
      case 'Gallery':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photo Gallery</Text>
            <Text style={styles.emptyState}>Photo gallery will be displayed here...</Text>
          </View>
        );
      default:
        return (
          <View style={styles.card}>
            <Text style={styles.emptyState}>Select a tab to view information</Text>
          </View>
        );
    }
  };

  if (profile && !profile.images) {
    profile.images = [profile.image];
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <FlatList
            data={profile.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width }}>
                {item && item !== 'https://randomuser.me/api/portraits/women/1.jpg' ? (
                  <ImageBackground source={{ uri: item }} style={[styles.profileImage, { width }]}>
                    <View style={styles.imageOverlay} />
                  </ImageBackground>
                ) : (
                  <View style={[styles.profileImage, { width }]}>
                    <ProfileImage 
                      imageUrl={null}
                      name={profile?.name || 'User'}
                      size={width * 0.6}
                      isVerified={profile?.verified === 1 || profile?.is_verified === 1}
                      showBadge={false}
                    />
                    <View style={styles.imageOverlay} />
                  </View>
                )}
              </View>
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortlistButton}>
              <Feather name="heart" size={30} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
          {profile.images.length > 1 && (
            <View style={styles.pagination}>
              <Text style={styles.paginationText}>{currentIndex + 1} / {profile.images.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
              {(profile?.verified === 1 || profile?.is_verified === 1) && (
                <Feather name="check-circle" size={20} color="#007AFF" style={{ marginLeft: 8 }} />
              )}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}><Feather name="share-2" size={20} color="white" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}><Feather name="download" size={20} color="white" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}><Feather name="bookmark" size={20} color="white" /></TouchableOpacity>
            </View>
          </View>

          {/* Profile Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Details' && styles.activeTab]}
              onPress={() => setActiveTab('Details')}
            >
              <Feather name="user" size={18} color={activeTab === 'Details' ? 'white' : Colors.light.icon} />
              <Text style={[styles.tabText, activeTab === 'Details' && styles.activeTabText]}>
                Details
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Partner' && styles.activeTab]}
              onPress={() => setActiveTab('Partner')}
            >
              <Feather name="heart" size={18} color={activeTab === 'Partner' ? 'white' : Colors.light.icon} />
              <Text style={[styles.tabText, activeTab === 'Partner' && styles.activeTabText]}>
                Partner
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Gallery' && styles.activeTab]}
              onPress={() => setActiveTab('Gallery')}
            >
              <Feather name="image" size={18} color={activeTab === 'Gallery' ? 'white' : Colors.light.icon} />
              <Text style={[styles.tabText, activeTab === 'Gallery' && styles.activeTabText]}>
                Gallery
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {renderTabContent()}

          {/* Contact Details Card - Moved to Bottom */}
          <TouchableOpacity style={styles.contactCard} onPress={handleContactView}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactTitle}>Contact Details</Text>
              <Feather name="chevron-up" size={20} color={Colors.light.tint} />
            </View>
            <View style={styles.contactContent}>
              <View style={styles.contactItem}>
                <Feather name="phone" size={16} color={Colors.light.tint} />
                <Text style={styles.contactText}>{profile?.mobile || 'N/A'}</Text>
              </View>
              <View style={styles.contactItem}>
                <Feather name="mail" size={16} color={Colors.light.tint} />
                <Text style={styles.contactText}>{profile?.email || 'N/A'}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Contact View Confirmation Modal */}
          <Modal
            visible={showContactModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowContactModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Confirm Contact View</Text>
                  <TouchableOpacity onPress={() => setShowContactModal(false)}>
                    <Feather name="x" size={24} color={Colors.light.icon} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <Text style={styles.remainingText}>
                    Remaining Contact View : {contactViewsRemaining} times
                  </Text>
                  <Text style={styles.warningText}>
                    **N.B. Viewing this members contact information will cost 1 from your remaining contact view**
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.submitButton} onPress={confirmContactView}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          
          
          
          
                  </View>
      </ScrollView>
      <TouchableOpacity style={styles.sendInterestButton}>
        <Feather name="send" size={20} color="white" />
        <Text style={styles.sendInterestButtonText}>Send Interest</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  imageContainer: {
    width: '100%',
    height: 400,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButtons: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {},
  shortlistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  paginationText: {
    color: 'white',
    fontSize: 14,
  },
  contentContainer: {
    padding: 15,
    marginTop: -50,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: Colors.light.tint,
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6ff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  tagHighlight: {
    backgroundColor: Colors.light.tint,
  },
  tagText: {
    marginLeft: 8,
    color: Colors.light.tint,
    fontSize: 14,
  },
  tagTextHighlight: {
    color: 'white',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  sendInterestButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  sendInterestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: '#666',
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  contactContent: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 12,
    color: Colors.light.icon,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    fontSize: 14,
    color: Colors.light.icon,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  modalBody: {
    marginBottom: 20,
  },
  remainingText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
