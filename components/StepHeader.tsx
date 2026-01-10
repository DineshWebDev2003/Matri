import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

// Describe each step once so header & dropdown stay in sync
interface StepMeta {
  id: number;
  title: string;
  route: string;
}

const STEPS: StepMeta[] = [
  { id: 1, title: 'Basic Info', route: '/(auth)/registration_progress/basic-info' },
  { id: 2, title: 'Physical Attributes', route: '/(auth)/registration_progress/physical-attributes' },
  { id: 3, title: 'Family Info', route: '/(auth)/registration_progress/family-info' },
  { id: 4, title: 'Education Info', route: '/(auth)/registration_progress/education-info' },
  { id: 5, title: 'Career Info', route: '/(auth)/registration_progress/career-info' },
  { id: 6, title: 'Partner Expectation', route: '/(auth)/registration_progress/partner-expectation' },
];

interface Props {
  currentStep: number;
  onBack?: () => void;
}

export default function StepHeader({ currentStep, onBack }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const totalSteps = STEPS.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.headerBackground }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack ? onBack : () => router.back()}>
        <Feather name="chevron-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.centerArea}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Step {currentStep}/{totalSteps}</Text>
        <Picker
          style={[styles.picker, { color: colors.textPrimary }]}
          selectedValue={currentStep}
          dropdownIconColor={colors.textPrimary}
          onValueChange={(value: number) => {
            const step = STEPS.find(s => s.id === value);
            if (step) {
              router.replace(step.route);
            }
          }}
        >
          {STEPS.map(step => (
            <Picker.Item key={step.id} label={`${step.id}. ${step.title}`} value={step.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 4,
  },
  backBtn: {
    padding: 8,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    width: '100%',
    marginTop: -6,
  },
});
