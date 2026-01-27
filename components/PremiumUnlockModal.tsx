import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PremiumUnlockModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const router = useRouter();
  const goToPlans = () => {
    onClose();
    router.push('/plans');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.container,{backgroundColor: theme==='dark'? '#111827':'#FFFFFF'}]}>
          <LinearGradient colors={["#D97706", "#FBBF24"]} style={styles.header}>
            <FontAwesome5 name="crown" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.title,{color: theme==='dark'? '#FFFFFF':'#1F2937'}]}>Unlock Premium</Text>
          </LinearGradient>
          <Text style={[styles.message,{color: theme==='dark'? '#D1D5DB':'#4B5563'}]}>
            Upgrade to premium to send interests and start chatting instantly!
          </Text>
          <TouchableOpacity style={[styles.upgradeBtn,{backgroundColor: theme==='dark'? '#FBBF24':'#D97706'}]} onPress={goToPlans}>
            <Text style={styles.upgradeText}>View Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterBtn} onPress={onClose}>
            <Text style={styles.laterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    maxWidth: 500,
    width: '90%',
    alignSelf: 'center',
    maxWidth:500,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    color:'#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  message: {
    color:'#F3F4F6',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 24,
    paddingHorizontal: 12,
  },
  upgradeBtn: {
    backgroundColor:'#FBBF24',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeText: { fontSize:16,fontWeight:'bold'},
  laterBtn: {
    borderWidth: 1,
    borderColor: '#FBBF24',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  laterText:{color:'#FBBF24',fontSize:14},
});
