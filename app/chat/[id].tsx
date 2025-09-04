import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Image, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

const initialMessages = [
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
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      const newMessage = { id: Date.now().toString(), text: inputText, sender: 'me', timestamp: '' };
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      setInputText('');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newMessage = { id: Date.now().toString(), type: 'image', uri: result.assets[0].uri, sender: 'me', timestamp: '' };
      setMessages(prevMessages => [newMessage, ...prevMessages]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      const newMessage = { id: Date.now().toString(), type: 'image', uri: result.assets[0].uri, sender: 'me', timestamp: '' };
      setMessages(prevMessages => [newMessage, ...prevMessages]);
    }
  };

  async function startRecording() {
    try {
      console.log('Starting recording..');
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    const newMessage = { id: Date.now().toString(), type: 'audio', uri: uri, sender: 'me', timestamp: '' };
    setMessages(prevMessages => [newMessage, ...prevMessages]);
    setRecording(undefined);
  }

  const playAudio = async (uri) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === 'me';
    switch (item.type) {
      case 'date':
        return <Text style={styles.dateSeparator}>{item.text}</Text>;
      case 'image':
        return (
          <TouchableOpacity onPress={() => { setSelectedImage(item.uri); setModalVisible(true); }}>
            <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
              <Image source={{ uri: item.uri }} style={styles.chatImage} />
            </View>
          </TouchableOpacity>
        );
      case 'audio':
        return (
          <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
            <TouchableOpacity onPress={() => playAudio(item.uri)} style={styles.audioBubble}>
              <Feather name="play" size={24} color={isMyMessage ? 'black' : 'black'} />
              <Text style={{marginLeft: 10}}>Voice Message</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
            <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{item.text}</Text>
          </View>
        );
    }
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

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          inverted
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputButton} onPress={takePhoto}>
            <Feather name="camera" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton} onPress={pickImage}>
            <Feather name="image" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Say Something nice..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.inputButton} onPress={recording ? stopRecording : startRecording}>
            <Feather name="mic" size={24} color={isRecording ? 'red' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton} onPress={handleSend}>
            <Feather name="send" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Feather name="x" size={30} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>
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
  messageBubble: { padding: 10, borderRadius: 20, marginVertical: 5, maxWidth: '75%' },
  myBubble: { backgroundColor: '#facc15', alignSelf: 'flex-end' },
  otherBubble: { backgroundColor: '#F3F4F6', alignSelf: 'flex-start' },
  myMessageText: { color: 'black' },
  otherMessageText: { color: 'black' },
  dateSeparator: { alignSelf: 'center', color: 'gray', marginVertical: 10 },
  chatImage: { width: 150, height: 200, borderRadius: 15 },
  audioBubble: { flexDirection: 'row', alignItems: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  input: { flex: 1, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15 },
  inputButton: { padding: 5, marginLeft: 5 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
  fullScreenImage: { width: '100%', height: '100%' },
});
