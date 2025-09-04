import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function SupportTicketsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <TouchableOpacity style={styles.newTicketButton} onPress={() => router.push('/new-ticket')}>
          <Feather name="plus" size={16} color="white" />
          <Text style={styles.newTicketButtonText}>New Ticket</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Subject</Text>
          <Text style={styles.tableHeaderText}>Status</Text>
          <Text style={styles.tableHeaderText}>Priority</Text>
          <Text style={styles.tableHeaderText}>Last Reply</Text>
          <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>Action</Text>
        </View>

        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Data not found</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
        paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  newTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C6222F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  newTicketButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
  contentContainer: { padding: 20 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#C6222F',
    padding: 15,
    borderRadius: 8,
  },
  tableHeaderText: { color: 'white', fontWeight: 'bold', flex: 1, textAlign: 'center' },
  noDataContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  noDataText: { color: '#6B7280', fontSize: 16 },
});
