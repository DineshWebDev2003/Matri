import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { apiService } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

interface TicketFormProps {
  onClose: () => void;
  onSuccess: (ticket: any) => void;
}

export default function TicketForm({ onClose, onSuccess }: TicketFormProps) {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('High');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const priorities = ['High', 'Medium', 'Low'];

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Permission required to access photos');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Image],
        quality: 1,
      });
      if (!result.canceled && result.assets.length > 0) {
        setFiles(result.assets.slice(0, 1) as any);
      }
    } catch (e) {
      console.warn('File pick cancelled');
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim()) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('priority', priority === 'High' ? '1' : priority === 'Medium' ? '2' : '3');
      formData.append('message', message);
      files.forEach((file, idx) => {
        const uri = file.uri;
        // @ts-ignore
        const name = (file.fileName || file.name) ?? `image_${idx}.jpg`;
        // @ts-ignore
        const type = file.type === 'image' ? 'image/jpeg' : 'application/octet-stream';
        // @ts-ignore
        formData.append(`attachments[]`, { uri, name, type });
      });
      // Attachments can be appended here if implemented

      const newTicket = await apiService.createSupportTicket(formData);
      onSuccess(newTicket);
      onClose();
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.log('Validation errors ⇒', error.response.data?.errors);
        alert(Object.values(error.response.data?.errors || {}).flat().join('\n'));
      } else {
        console.error('Error creating ticket:', error);
        alert('Unable to create ticket.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.title}>Create Ticket</Text>

            <Text style={styles.label}>Subject *</Text>
            <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Enter subject" />

            <Text style={styles.label}>Priority *</Text>
            <TouchableOpacity style={styles.pickerContainer} onPress={() => {
              const next = priorities[(priorities.indexOf(priority) + 1) % priorities.length];
              setPriority(next);
            }}>
              <Text>{priority}</Text>
              <Feather name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your message"
              multiline
            />

            <Text style={styles.label}>Image</Text>
            <View style={styles.attachmentContainer}>
              <TouchableOpacity style={styles.chooseFileButton} onPress={pickImage}>
                <Text style={styles.chooseFileButtonText}>Choose Image</Text>
              </TouchableOpacity>
              <Text style={styles.fileName}>{files.length ? files[0].name : 'No image selected'}</Text>
            </View>
            {files.map((f, i) => (
              <Text key={i} style={styles.fileName}>{f.name}</Text>
            ))}
            <Text style={styles.attachmentInfo}>JPEG/PNG up to 4 MB</Text>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="send" size={16} color="white" />
                  <Text style={styles.submitButtonText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, alignSelf: 'center' },
  label: { fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C6222F',
    paddingVertical: 15,
    borderRadius: 8,
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  attachmentContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chooseFileButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  chooseFileButtonText: { fontWeight: '500' },
  fileName: { marginLeft: 10, color: '#6B7280' },
  attachmentInfo: { color: '#6B7280', fontSize: 12, marginBottom: 5 }
});
