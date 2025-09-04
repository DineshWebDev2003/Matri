import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const newMatches = [
  { id: '1', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', image: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: '4', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', image: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '6', image: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

const messages = [
  { id: '1', name: 'Sophia', message: 'Start Conversation', time: '', unread: 2, image: 'https://randomuser.me/api/portraits/women/7.jpg', highlight: true, type: 'chat', isNewMatch: true },
  { id: '2', name: 'Sushmitha', message: 'Let\'s talk', time: '5: 34', unread: 0, image: 'https://randomuser.me/api/portraits/women/8.jpg', type: 'chat', isNewMatch: false },
  { id: '3', name: 'Roshini', message: 'What is your age ?', time: '13/7/25', unread: 0, image: 'https://randomuser.me/api/portraits/women/9.jpg', type: 'chat', isNewMatch: false },
  { id: '4', name: 'Priya', message: 'Sent you an interest', time: '1 day ago', unread: 1, image: 'https://randomuser.me/api/portraits/women/10.jpg', type: 'interest', isNewMatch: false },
  { id: '5', name: 'Anjali', message: 'Sent you an interest', time: '2 days ago', unread: 0, image: 'https://randomuser.me/api/portraits/women/11.jpg', type: 'interest', isNewMatch: false },
];

export default function ChatsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState(messages);
  const router = useRouter();

  React.useEffect(() => {
    let filtered = messages;

    if (activeTab === 'New Matches') {
      filtered = filtered.filter(m => m.isNewMatch);
    } else if (activeTab === 'Unread') {
      filtered = filtered.filter(m => m.unread > 0);
    } else if (activeTab === 'Chats') {
      filtered = filtered.filter(m => m.type === 'chat');
    } else if (activeTab === 'Interest') {
      filtered = filtered.filter(m => m.type === 'interest');
    }

    if (searchQuery) {
      filtered = filtered.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredMessages(filtered);
  }, [searchQuery, activeTab]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView key="chat-scroll-view" contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <TextInput placeholder="Search..." style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
            <TouchableOpacity style={styles.searchButton}>
              <Feather name="search" size={20} color={'white'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'All' && styles.activeTab]} onPress={() => setActiveTab('All')}>
            <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'New Matches' && styles.activeTab]} onPress={() => setActiveTab('New Matches')}>
            <Text style={[styles.tabText, activeTab === 'New Matches' && styles.activeTabText]}>New Matches</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'Unread' && styles.activeTab]} onPress={() => setActiveTab('Unread')}>
            <Text style={[styles.tabText, activeTab === 'Unread' && styles.activeTabText]}>Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'Chats' && styles.activeTab]} onPress={() => setActiveTab('Chats')}>
            <Text style={[styles.tabText, activeTab === 'Chats' && styles.activeTabText]}>Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'Interest' && styles.activeTab]} onPress={() => setActiveTab('Interest')}>
            <Text style={[styles.tabText, activeTab === 'Interest' && styles.activeTabText]}>Interest</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.matchesContainer}>
          <FlatList
            data={newMatches}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }: { item: any }) => (
              <View style={styles.matchItem}>
                <Image source={{ uri: item.image }} style={styles.matchImage} />
                <View style={styles.onlineIndicator} />
              </View>
            )}
          />
        </View>

        <FlatList
          data={filteredMessages}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity style={[styles.messageItem, item.highlight && styles.highlightedMessage]} onPress={() => router.push({ pathname: `/chat/${item.id}`, params: { ...item } })}>
              <Image source={{ uri: item.image }} style={styles.messageAvatar} />
              <View style={styles.messageContent}>
                <Text style={styles.messageName}>{item.name}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
              <View style={styles.messageMeta}>
                <Text style={styles.messageTime}>{item.time}</Text>
                {item.unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadCount}>{item.unread}</Text></View>}
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  searchSection: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, backgroundColor: 'white' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, height: 50, paddingHorizontal: 15, fontSize: 16 },
  searchButton: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 10, margin: 5 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 15 },
  tab: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10 },
  activeTab: { backgroundColor: 'black', borderColor: 'black' },
  tabText: { fontWeight: '600' },
  activeTabText: { color: 'white' },
  matchesContainer: { paddingLeft: 20, paddingVertical: 10 },
  matchItem: { marginRight: 15, position: 'relative' },
  matchImage: { width: 60, height: 60, borderRadius: 30 },
  onlineIndicator: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#34D399', position: 'absolute', bottom: 2, right: 2, borderWidth: 2, borderColor: 'white' },
  messageItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  highlightedMessage: { backgroundColor: '#FFFBEB' },
  messageAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  messageContent: { flex: 1 },
  messageName: { fontWeight: 'bold', fontSize: 16 },
  messageText: { color: '#6B7280', marginTop: 2 },
  messageMeta: { alignItems: 'flex-end' },
  messageTime: { color: '#9CA3AF', fontSize: 12 },
  unreadBadge: { backgroundColor: 'black', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  unreadCount: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});