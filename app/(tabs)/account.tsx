import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const FeatureItem = ({ text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureText}>{text}</Text>
    <Feather name="check" size={20} color="#FFC107" />
  </View>
);

export default function AccountScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="arrow-left" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.profileName}>Sanjay, 26</Text>
              <Feather name="check-circle" size={18} color={Colors.light.tint} style={{ marginLeft: 5 }} />
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planText}>Current Plan - Premium User</Text>
            </View>
            <Text style={styles.planExpiry}>Plan ends on 02 Nov 2025</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.infoButton}><Text style={styles.infoButtonText}>Plan details</Text></TouchableOpacity>
          <TouchableOpacity style={styles.infoButton}><Text style={styles.infoButtonText}>Profile Info</Text></TouchableOpacity>
          <TouchableOpacity style={styles.infoButton}><Text style={styles.infoButtonText}>Privacy Setting</Text></TouchableOpacity>
        </View>

        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>Upgrade to Premium Plan</Text>
          <Text style={styles.upgradeSubtitle}>Unlock all our features to get complete control of your experience</Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>UPGRADE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featuresHeader}>
            <Text style={styles.featuresTitle}>What you get :</Text>
            <Text style={styles.featuresSubtitle}>Premium</Text>
          </View>
          <FeatureItem text="User (3 device)" />
          <FeatureItem text="View Profile Photos - (All)" />
          <FeatureItem text="Send Interests - (Unlimited)" />
          <FeatureItem text="Chats Allowed" />
          <FeatureItem text="Horoscope - (view full horoscope)" />
          <FeatureItem text="Newly Joined - (immediately show)" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContainer: { paddingBottom: 20 },
  profileSection: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  profileImage: { width: 60, height: 60, borderRadius: 30 },
  profileInfo: { marginLeft: 15 },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  planBadge: { backgroundColor: '#FFF8E1', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 5 },
  planText: { color: '#FFC107', fontWeight: '600', fontSize: 12 },
  planExpiry: { color: Colors.light.icon, fontSize: 12, marginTop: 5 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 20 },
  infoButton: { borderWidth: 1, borderColor: Colors.light.icon, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
  infoButtonText: { color: Colors.light.text, fontWeight: '600' },
  upgradeCard: { backgroundColor: '#FFC107', borderRadius: 15, padding: 20, marginHorizontal: 20, alignItems: 'center' },
  upgradeTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.text },
  upgradeSubtitle: { color: Colors.light.text, textAlign: 'center', marginTop: 5, fontSize: 14 },
  upgradeButton: { backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 30, paddingVertical: 10, marginTop: 15 },
  upgradeButtonText: { color: Colors.light.text, fontWeight: 'bold', fontSize: 16 },
  featuresSection: { marginTop: 20, paddingHorizontal: 20 },
  featuresHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  featuresTitle: { fontSize: 16, fontWeight: 'bold' },
  featuresSubtitle: { fontSize: 14, color: Colors.light.icon, fontWeight: '600' },
  featureItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  featureText: { fontSize: 15, color: Colors.light.text },
});