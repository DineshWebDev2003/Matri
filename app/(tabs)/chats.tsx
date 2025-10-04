import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '@/constants/Colors';

// Dummy data – replace with API later
const newMatches = [
  { id: '1', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', image: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: '4', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', image: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '6', image: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

const messages = [
  { id: '1', name: 'Sophia',    message: 'Start Conversation',     time: '',          unread: 2, image: 'https://randomuser.me/api/portraits/women/7.jpg',  isNewMatch: true,  type: 'chat'     },
  { id: '2', name: 'Sushmitha', message: "Let's talk",             time: '5:34',      unread: 0, image: 'https://randomuser.me/api/portraits/women/8.jpg',  isNewMatch: false, type: 'chat'     },
  { id: '3', name: 'Roshini',   message: 'What is your age ?',     time: '13/7/25',   unread: 0, image: 'https://randomuser.me/api/portraits/women/9.jpg',  isNewMatch: false, type: 'chat'     },
  { id: '4', name: 'Priya',     message: 'Sent you an interest',   time: '1 day ago', unread: 1, image: 'https://randomuser.me/api/portraits/women/10.jpg', isNewMatch: false, type: 'interest' },
  { id: '5', name: 'Anjali',    message: 'Sent you an interest',   time: '2 days ago',unread: 0, image: 'https://randomuser.me/api/portraits/women/11.jpg', isNewMatch: false, type: 'interest' },
];

type TabKey = 'All' | 'New Matches' | 'Unread' | 'Chats' | 'Interest';

export default function ChatsScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState(messages);

  useEffect(() => {
    let filtered = messages;

    if (activeTab === 'New Matches')      filtered = filtered.filter(m => m.isNewMatch);
    else if (activeTab === 'Unread')      filtered = filtered.filter(m => m.unread > 0);
    else if (activeTab === 'Chats')       filtered = filtered.filter(m => m.type === 'chat');
    else if (activeTab === 'Interest')    filtered = filtered.filter(m => m.type === 'interest');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => m.name.toLowerCase().includes(q));
    }

    setFilteredMessages(filtered);
  }, [activeTab, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('messages')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            placeholder={t('search_placeholder')}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchBtn}>
            <Feather name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        {(['All', 'New Matches', 'Unread', 'Chats', 'Interest'] as TabKey[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {t(tab.toLowerCase().replace(' ', '_'))}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* New Matches */}
      <FlatList
        data={newMatches}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.matchesList}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.matchItem}>
            <Image source={{ uri: item.image }} style={styles.matchImg} />
            <View style={styles.onlineDot} />
          </View>
        )}
      />

      {/* Messages */}
      <FlatList
        data={filteredMessages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.messageItem, item.unread > 0 && styles.highlightRow]}
            onPress={() => router.push({ pathname: `/chat/${item.id}`, params: { ...item } } as any)}
          >
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={styles.msgContent}>
              <Text style={styles.msgName}>{item.name}</Text>
              <Text style={styles.msgText}>{item.message}</Text>
            </View>
            <View style={styles.msgMeta}>
              <Text style={styles.msgTime}>{item.time}</Text>
              {item.unread > 0 && (
                <View style={styles.unreadBadge}><Text style={styles.unreadTxt}>{item.unread}</Text></View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 },

  // Search
  searchSection: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, backgroundColor: 'white' },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: 'white' },
  searchInput: { flex: 1, paddingHorizontal: 12, height: 40 },
  searchBtn: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 10, margin: 5 },

  // Tabs
  tabsWrapper: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 15 },
  tab: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10 },
  activeTab: { backgroundColor: 'black', borderColor: 'black' },
  tabText: { fontWeight: '600' },
  activeTabText: { color: 'white' },

  // Matches
  matchesList: { paddingLeft: 20, paddingVertical: 10 },
  matchItem: { marginRight: 15, position: 'relative' },
  matchImg: { width: 60, height: 60, borderRadius: 30 },
  onlineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#34D399', position: 'absolute', bottom: 2, right: 2, borderWidth: 2, borderColor: 'white' },

  // Messages
  messageItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  highlightRow: { backgroundColor: '#FFFBEB' }, // merged with highlightedMessage
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 }, // merged with messageAvatar
  msgContent: { flex: 1 }, // merged with messageContent
  msgName: { fontWeight: 'bold', fontSize: 16 }, // merged with messageName
  msgText: { color: '#6B7280', marginTop: 2 }, // merged with messageText
  msgMeta: { alignItems: 'flex-end' }, // merged with messageMeta
  msgTime: { color: '#9CA3AF', fontSize: 12 }, // merged with messageTime
  unreadBadge: { backgroundColor: 'black', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  unreadTxt: { color: 'white', fontSize: 12, fontWeight: 'bold' }, // merged with unreadCount
});
