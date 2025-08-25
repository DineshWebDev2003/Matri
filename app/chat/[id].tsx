import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const messages = [
  { id: '1', text: 'To meet you when you\'re in town', sender: 'other', timestamp: '' },
  { id: '2', text: 'Wednesday I am Available', sender: 'me', timestamp: '' },
  { id: '3', text: 'Sure ! Let\'s meet on Wednesday.', sender: 'other', timestamp: '' },
  { id: '4', text: 'Great ! What time works best for you.?', sender: 'other', timestamp: '' },
  { id: '5', text: 'Nice ! Evening Works.', sender: 'me', timestamp: '' },
  { id: '6', text: '5 PM', sender: 'me', timestamp: '' },
  { id: '7', text: 'Today 8:03 am', type: 'date', timestamp: '' },
  { id: '8', type: 'image', uri: 'https://randomuser.me/api/portraits/women/10.jpg', sender: 'other', timestamp: '' },
];

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const renderMessage = ({ item }) => {
    if (item.type === 'date') {
      return <Text style={styles.dateSeparator}>{item.text}</Text>;
    }
    if (item.type === 'image') {
      return (
        <View style={[styles.messageBubble, styles.otherBubble]}>
          <Image source={{ uri: item.uri }} style={styles.chatImage} />
        </View>
      );
    }
    const isMyMessage = item.sender === 'me';
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
        <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} />
        </TouchableOpacity>
        <Image source={{ uri: params.image as string }} style={styles.headerAvatar} />
        <View>
          <Text style={styles.headerName}>{params.name}</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Feather name="phone" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        inverted
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputButton}>
            <Feather name="camera" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Say Something nice to start a conversation"
          />
          <TouchableOpacity style={styles.inputButton}>
            <Feather name="mic" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton}>
            <Feather name="image" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton}>
            <Feather name="send" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  headerName: { fontWeight: 'bold', fontSize: 16 },
  headerSubtitle: { color: 'gray' },
  messagesContainer: { padding: 10, flexDirection: 'column-reverse' },
  messageBubble: { padding: 15, borderRadius: 20, marginVertical: 5, maxWidth: '75%' },
  myBubble: { backgroundColor: '#facc15', alignSelf: 'flex-end' },
  otherBubble: { backgroundColor: '#F3F4F6', alignSelf: 'flex-start' },
  myMessageText: { color: 'black' },
  otherMessageText: { color: 'black' },
  dateSeparator: { alignSelf: 'center', color: 'gray', marginVertical: 10 },
  chatImage: { width: 150, height: 200, borderRadius: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  input: { flex: 1, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15 },
  inputButton: { padding: 5, marginLeft: 5 },
});
