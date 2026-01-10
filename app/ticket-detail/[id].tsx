import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getSupportTicket(id as string);
        setTicket(data);
      } catch (e) {
        console.error('Failed to load ticket', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}> <ActivityIndicator size="large" color="#DC2626"/> </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.center}> <Text>Ticket not found</Text> </View>
    );
  }

  const statusText = (() => {
    const s = (ticket.status ?? '').toString().toLowerCase();
    if (s === '1' || s === 'open') return 'Open';
    if (s === '2' || s === 'in-progress') return 'In Progress';
    if (s === '0' || s === 'closed') return 'Closed';
    return s;
  })();

  const bodyContent = (() => {
    const arr = ticket.messages ?? ticket.supportMessage ?? ticket.support_message ?? [];
    const raw = arr[0]?.message ?? '';
    if (typeof raw === 'string') return raw;
    try { return JSON.stringify(raw); } catch { return String(raw); }
  })();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}> 
        <Feather name="arrow-left" size={24} color={colors.textPrimary} onPress={() => router.back()} />
        <Text style={[styles.headerTitle,{color:colors.textPrimary}]}>Support Ticket</Text>
        <View style={{width:24}} />
      </View>

      <Text style={[styles.subject,{color:colors.textPrimary}]}>{ticket.subject}</Text>
      <Text style={[styles.meta,{color:colors.textSecondary}]}>Status: {statusText}</Text>
      <Text style={[styles.meta,{color:colors.textSecondary}]}>Priority: {['High','Medium','Low'][Number(ticket.priority)-1] ?? ticket.priority}</Text>
      <Text style={[styles.meta,{color:colors.textSecondary}]}>Opened: {new Date(ticket.created_at).toLocaleString()}</Text>

      {(ticket.messages ?? ticket.supportMessage ?? ticket.support_message ?? []).map((m:any)=>{
        const isAdmin = !!m.admin_id;
        const bubbleStyle = isAdmin ? styles.bubbleLeft : styles.bubbleRight;
        const bubbleColor = isAdmin ? colors.surfaceLight : colors.primaryLight ?? '#FFE5CC';
        const textColor = isAdmin ? colors.textPrimary : colors.textPrimary;
        return (
          <View key={m.id} style={[styles.bubbleContainer,isAdmin?{alignSelf:'flex-start'}:{alignSelf:'flex-end'}]}> 
            <View style={[bubbleStyle,{backgroundColor:bubbleColor}]}> 
              <Text style={{color:textColor}}>{m.message}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20 },
  subject: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  meta: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:20},
  headerTitle:{fontSize:18,fontWeight:'700'},
  bubbleContainer:{marginTop:10,maxWidth:'80%'},
  bubbleLeft:{padding:12,borderRadius:12,borderTopLeftRadius:0},
  bubbleRight:{padding:12,borderRadius:12,borderTopRightRadius:0},
});
