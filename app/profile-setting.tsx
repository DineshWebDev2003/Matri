import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const AccordionItem = ({ title, children, icon }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.accordionHeader}>
        <View style={styles.accordionTitleContainer}>
          <Feather name={icon} size={20} color="#C6222F" style={styles.accordionIcon} />
          <Text style={styles.accordionTitle}>{title}</Text>
        </View>
        <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#C6222F" />
      </TouchableOpacity>
      {isOpen && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};


type FormInputProps = TextInputProps & {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  containerStyle?: object;
};

const FormInput = ({ label, icon, ...props }: FormInputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      {icon && <Feather name={icon} size={20} color="#6B7280" style={styles.inputIcon} />}
      <TextInput style={styles.input} {...props} />
    </View>
  </View>
);

export default function ProfileSettingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Setting</Text>
        <Feather name="heart" size={22} color="#C6222F" />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <AccordionItem title="Basic Information" icon="user">
          <View style={styles.row}>
            <FormInput label="First Name *" placeholder="Dinesh" icon="user" containerStyle={styles.halfWidth} />
            <FormInput label="Last Name *" placeholder="M" icon="user" containerStyle={styles.halfWidth} />
          </View>
          <FormInput label="Date of Birth *" placeholder="YYYY-MM-DD" icon="calendar" />
          <FormInput label="Religion *" placeholder="Select Religion" icon="moon" />
          <FormInput label="Gender *" placeholder="Select Gender" icon="user" />
          <FormInput label="Profession *" placeholder="Your Profession" icon="briefcase" />
          <FormInput label="Mother Tongue" placeholder="e.g., Tamil" icon="message-square" />
          <FormInput label="Financial Condition *" placeholder="e.g., Stable" icon="dollar-sign" />
          <View style={styles.row}>
            <FormInput label="Smoking Habits *" placeholder="Select" icon="wind" containerStyle={styles.halfWidth} />
            <FormInput label="Drinking Habits *" placeholder="Select" icon="droplet" containerStyle={styles.halfWidth} />
          </View>
          <FormInput label="Marital Status *" placeholder="Select Marital Status" icon="heart" />
          <FormInput label="Caste" placeholder="Your Caste" icon="users" />
          <FormInput label="Spoken Languages *" placeholder="e.g., English, Tamil" icon="globe" />
          
          <Text style={styles.subHeader}>Present Address</Text>
          <FormInput label="Country *" placeholder="Select Country" icon="map-pin" />
          <View style={styles.row}>
            <FormInput label="State" placeholder="Your State" icon="map" containerStyle={styles.halfWidth} />
            <FormInput label="City *" placeholder="Your City" icon="map" containerStyle={styles.halfWidth} />
          </View>
          <FormInput label="Zip Code" placeholder="Your Zip Code" icon="hash" />

          <Text style={styles.subHeader}>Permanent Address</Text>
          <FormInput label="Country" placeholder="Select Country" icon="map-pin" />
          <View style={styles.row}>
            <FormInput label="State" placeholder="Your State" icon="map" containerStyle={styles.halfWidth} />
            <FormInput label="City" placeholder="Your City" icon="map" containerStyle={styles.halfWidth} />
          </View>
          <FormInput label="Zip Code" placeholder="Your Zip Code" icon="hash" />
        </AccordionItem>

        <AccordionItem title="Partner Expectation" icon="heart">
            <FormInput label="General Requirement" placeholder="e.g., Educated, Family-oriented" icon="file-text" />
            <FormInput label="Country" placeholder="Select Country" icon="map-pin" />
            <View style={styles.row}>
                <FormInput label="Min Age" placeholder="e.g., 25" icon="user" containerStyle={styles.halfWidth} />
                <FormInput label="Max Age" placeholder="e.g., 30" icon="user" containerStyle={styles.halfWidth} />
            </View>
            <View style={styles.row}>
                <FormInput label="Min Height" placeholder="e.g., 5.5" icon="trending-up" containerStyle={styles.halfWidth} />
                <FormInput label="Max Height" placeholder="e.g., 6.0" icon="trending-up" containerStyle={styles.halfWidth} />
            </View>
            <FormInput label="Marital Status" placeholder="Select Marital Status" icon="heart" />
            <FormInput label="Religion" placeholder="Select Religion" icon="moon" />
            <FormInput label="Complexion" placeholder="e.g., Fair, Wheatish" icon="sun" />
            <View style={styles.row}>
                <FormInput label="Smoking Habits" placeholder="Select" icon="wind" containerStyle={styles.halfWidth} />
                <FormInput label="Drinking Habits" placeholder="Select" icon="droplet" containerStyle={styles.halfWidth} />
            </View>
            <FormInput label="Spoken Languages" placeholder="e.g., English, Tamil" icon="globe" />
            <FormInput label="Education" placeholder="e.g., Masters" icon="book-open" />
            <FormInput label="Profession" placeholder="e.g., Doctor, Engineer" icon="briefcase" />
            <FormInput label="Financial Condition" placeholder="e.g., Well Settled" icon="dollar-sign" />
            <FormInput label="Family Values" placeholder="e.g., Modern, Traditional" icon="home" />
        </AccordionItem>

        <AccordionItem title="Physical Attributes" icon="activity">
            <FormInput label="Height *" placeholder="e.g., 5.8" icon="trending-up" />
            <FormInput label="Weight *" placeholder="e.g., 70kg" icon="bar-chart-2" />
            <FormInput label="Blood Group *" placeholder="Select Blood Group" icon="droplet" />
            <FormInput label="Eye Color *" placeholder="e.g., Brown" icon="eye" />
            <FormInput label="Hair Color *" placeholder="e.g., Black" icon="user" />
            <FormInput label="Complexion *" placeholder="e.g., Fair, Wheatish" icon="sun" />
            <FormInput label="Disability" placeholder="If any" icon="alert-circle" />
        </AccordionItem>

        <AccordionItem title="Family Information" icon="users">
            <FormInput label="Father's Name *" placeholder="Father's Name" icon="user" />
            <FormInput label="Father's Profession" placeholder="Father's Profession" icon="briefcase" />
            <FormInput label="Father's Contact" placeholder="Father's Contact" icon="phone" />
            <FormInput label="Mother's Name *" placeholder="Mother's Name" icon="user" />
            <FormInput label="Mother's Profession" placeholder="Mother's Profession" icon="briefcase" />
            <FormInput label="Mother's Contact" placeholder="Mother's Contact" icon="phone" />
            <View style={styles.row}>
                <FormInput label="No. of Brothers" placeholder="e.g., 1" icon="users" containerStyle={styles.halfWidth} />
                <FormInput label="No. of Sisters" placeholder="e.g., 1" icon="users" containerStyle={styles.halfWidth} />
            </View>
        </AccordionItem>

        <AccordionItem title="Career Information" icon="briefcase">
            {/* This would be a dynamic list in a real app */}
            <FormInput label="Company *" placeholder="Company Name" icon="briefcase" />
            <FormInput label="Designation *" placeholder="Your Designation" icon="award" />
            <View style={styles.row}>
                <FormInput label="Start Year *" placeholder="e.g., 2020" icon="calendar" containerStyle={styles.halfWidth} />
                <FormInput label="End Year" placeholder="Present" icon="calendar" containerStyle={styles.halfWidth} />
            </View>
        </AccordionItem>

        <AccordionItem title="Education Information" icon="book-open">
            {/* This would be a dynamic list in a real app */}
            <FormInput label="Institute *" placeholder="Institute Name" icon="book-open" />
            <FormInput label="Degree *" placeholder="e.g., B.Tech" icon="award" />
            <FormInput label="Field of Study *" placeholder="e.g., Computer Science" icon="edit-3" />
            <View style={styles.row}>
                <FormInput label="Start Year *" placeholder="e.g., 2016" icon="calendar" containerStyle={styles.halfWidth} />
                <FormInput label="End Year" placeholder="e.g., 2020" icon="calendar" containerStyle={styles.halfWidth} />
            </View>
        </AccordionItem>

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  contentContainer: { padding: 20, paddingTop: 10 },
  accordionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  accordionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  accordionIcon: { marginRight: 10 },
  accordionTitle: { fontSize: 18, fontWeight: 'bold', color: '#C6222F' },
  accordionContent: { padding: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: { width: '48%' },
  inputContainer: { flex: 1, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  submitButton: {
    backgroundColor: '#C6222F',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
});
