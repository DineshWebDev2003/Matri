import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Image, KeyboardAvoidingView, Platform, Modal, Animated, Dimensions, PanResponder } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Helper function to format timestamp
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

// Message type definition
interface Message {
  id: string;
  text?: string;
  sender: string;
  timestamp: string;
  type?: 'image' | 'audio';
  uri?: string;
  duration?: number;
}

const initialMessages: Message[] = [
  { id: '1', text: 'To meet you when you\'re in town', sender: 'other', timestamp: new Date('2024-01-15T08:30:00').toISOString() },
  { id: '2', text: 'Wednesday I am Available', sender: 'me', timestamp: new Date('2024-01-15T08:32:00').toISOString() },
  { id: '3', text: 'Sure ! Let\'s meet on Wednesday.', sender: 'other', timestamp: new Date('2024-01-15T08:35:00').toISOString() },
  { id: '4', text: 'Great ! What time works best for you.?', sender: 'other', timestamp: new Date('2024-01-15T08:36:00').toISOString() },
  { id: '5', text: 'Nice ! Evening Works.', sender: 'me', timestamp: new Date('2024-01-15T08:40:00').toISOString() },
  { id: '6', text: '5 PM', sender: 'me', timestamp: new Date('2024-01-15T08:41:00').toISOString() },
  { id: '8', type: 'image', uri: 'https://randomuser.me/api/portraits/women/10.jpg', sender: 'other', timestamp: new Date('2024-01-15T09:00:00').toISOString() },
];

// Wave animation component for voice recording
const WaveAnimation = ({ isRecording }: { isRecording: boolean }) => {
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.5)).current;
  const waveAnim3 = useRef(new Animated.Value(0.8)).current;
  const waveAnim4 = useRef(new Animated.Value(0.4)).current;
  const waveAnim5 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isRecording) {
      const createWaveAnimation = (animValue: Animated.Value) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const animations = [
        createWaveAnimation(waveAnim1),
        createWaveAnimation(waveAnim2),
        createWaveAnimation(waveAnim3),
        createWaveAnimation(waveAnim4),
        createWaveAnimation(waveAnim5),
      ];

      animations.forEach(anim => anim.start());

      return () => {
        animations.forEach(anim => anim.stop());
      };
    }
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <View style={styles.waveContainer}>
      {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5].map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 20],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(initialMessages.reverse()); // Reverse for proper order
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioDuration, setAudioDuration] = useState<{[key: string]: number}>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const recordingTimer = useRef<any>(null);
  
  // Hold-to-record functionality
  const micPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRecording();
      },
      onPanResponderRelease: () => {
        stopRecording();
      },
      onPanResponderTerminate: () => {
        stopRecording();
      },
    })
  ).current;

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
      const newMessage = { 
        id: Date.now().toString(), 
        text: inputText, 
        sender: 'me', 
        timestamp: new Date().toISOString() 
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
      const newMessage: Message = { 
        id: Date.now().toString(), 
        type: 'image', 
        uri: result.assets[0].uri, 
        sender: 'me', 
        timestamp: new Date().toISOString() 
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
      const newMessage: Message = { 
        id: Date.now().toString(), 
        type: 'image', 
        uri: result.assets[0].uri, 
        sender: 'me', 
        timestamp: new Date().toISOString() 
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  async function startRecording() {
    try {
      console.log('Starting recording..');
      setIsRecording(true);
      setRecordingDuration(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { recording } = await Audio.Recording.createAsync(
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      
      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setIsRecording(false);
    
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    
    if (recording) {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const newMessage: Message = { 
        id: Date.now().toString(), 
        type: 'audio', 
        uri: uri || '', 
        sender: 'me', 
        timestamp: new Date().toISOString(),
        duration: recordingDuration 
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
    setRecording(undefined);
      setRecordingDuration(0);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }

  const playAudio = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.sender === 'me';
    const messageTime = new Date(item.timestamp);
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const previousTime = previousMessage ? new Date(previousMessage.timestamp) : null;
    
    // Check if we need to show date separator
    const showDateSeparator = !previousTime || 
      formatDate(messageTime) !== formatDate(previousTime);

    const renderMessageContent = () => {
    switch (item.type) {
      case 'image':
        return (
            <View style={styles.messageContainer}>
            <TouchableOpacity onPress={() => { setSelectedImage(item.uri || ''); setModalVisible(true); }}>
            <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
                <Image source={{ uri: item.uri || '' }} style={styles.chatImage} />
              </View>
            </TouchableOpacity>
              <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
                {formatTime(messageTime)}
              </Text>
            </View>
        );
      case 'audio':
        return (
            <View style={styles.messageContainer}>
          <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
                <TouchableOpacity onPress={() => playAudio(item.uri || '')} style={styles.audioBubble}>
                  <Feather name="play" size={20} color={isMyMessage ? 'black' : 'black'} />
                  <View style={styles.audioWaveContainer}>
                    {/* Static wave visualization for audio messages */}
                    {[...Array(8)].map((_, i) => (
                      <View key={i} style={[styles.audioWave, { height: Math.random() * 15 + 5 }]} />
                    ))}
                  </View>
                  <Text style={styles.audioDuration}>
                    {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : '0:05'}
                  </Text>
            </TouchableOpacity>
              </View>
              <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
                {formatTime(messageTime)}
              </Text>
          </View>
        );
      default:
        return (
            <View style={styles.messageContainer}>
          <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
            <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{item.text}</Text>
              </View>
              <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
                {formatTime(messageTime)}
              </Text>
          </View>
        );
    }
    };

    return (
      <View>
        {showDateSeparator && (
          <Text style={styles.dateSeparator}>{formatDate(messageTime)}</Text>
        )}
        {renderMessageContent()}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} />
        </TouchableOpacity>
        <Image source={{ uri: (params.image as string) || 'https://randomuser.me/api/portraits/women/1.jpg' }} style={styles.headerAvatar} />
        <View>
          <Text style={styles.headerName}>{params.name}</Text>
          <Text style={styles.headerSubtitle}>{t('online')}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Feather name="phone" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />
        {isRecording && (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording... {recordingDuration}s</Text>
            </View>
            <WaveAnimation isRecording={isRecording} />
            <Text style={styles.recordingHint}>Release to send</Text>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          {!isRecording && (
            <>
          <TouchableOpacity style={styles.inputButton} onPress={takePhoto}>
            <Feather name="camera" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton} onPress={pickImage}>
            <Feather name="image" size={24} color="#6B7280" />
          </TouchableOpacity>
            </>
          )}
          
          {!isRecording ? (
          <TextInput
            style={styles.input}
              placeholder={t('say_something_nice')}
            value={inputText}
            onChangeText={setInputText}
              multiline
            />
          ) : (
            <View style={styles.recordingInputPlaceholder} />
          )}
          
          <View 
            {...micPanResponder.panHandlers}
            style={[
              styles.micButton, 
              isRecording && styles.micButtonRecording
            ]}
          >
            <Feather 
              name="mic" 
              size={24} 
              color={isRecording ? 'white' : '#6B7280'} 
            />
          </View>
          
          {!isRecording && inputText.trim().length > 0 && (
          <TouchableOpacity style={styles.inputButton} onPress={handleSend}>
              <Feather name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
          )}
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
          <Image source={{ uri: selectedImage || '' }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: 'white',
    borderBottomWidth: 1, 
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  headerName: { fontWeight: 'bold', fontSize: 16 },
  headerSubtitle: { color: '#34D399', fontSize: 12 },
  messagesContainer: { 
    padding: 10, 
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 2,
  },
  messageBubble: { 
    padding: 12, 
    borderRadius: 18, 
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: { 
    backgroundColor: '#007AFF', 
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherBubble: { 
    backgroundColor: 'white', 
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  myMessageText: { color: 'white', fontSize: 16 },
  otherMessageText: { color: 'black', fontSize: 16 },
  messageTime: {
    fontSize: 11,
    marginTop: 2,
  },
  myMessageTime: {
    color: '#666',
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: '#666',
    alignSelf: 'flex-start',
  },
  dateSeparator: { 
    alignSelf: 'center', 
    color: '#666', 
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginVertical: 15,
    overflow: 'hidden',
  },
  chatImage: { width: 200, height: 250, borderRadius: 15 },
  audioBubble: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    height: 20,
  },
  audioWave: {
    width: 2,
    backgroundColor: '#666',
    marginHorizontal: 1,
    borderRadius: 1,
  },
  audioDuration: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1, 
    borderTopColor: '#e0e0e0',
    minHeight: 60,
  },
  input: { 
    flex: 1, 
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6', 
    borderRadius: 20, 
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginHorizontal: 8,
  },
  inputButton: { 
    padding: 8, 
    marginHorizontal: 2,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micButtonRecording: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.1 }],
  },
  recordingContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  recordingHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  recordingInputPlaceholder: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    marginVertical: 10,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#FF3B30',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  closeButton: { 
    position: 'absolute', 
    top: 50, 
    right: 20, 
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  fullScreenImage: { width: '100%', height: '80%' },
});
