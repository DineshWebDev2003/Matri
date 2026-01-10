import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { apiService } from '../../../services/api';

const LInput = ({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void; }) => {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.textPrimary, marginBottom: 4 }}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.inputBorder, color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.inputPlaceholder}
      />
    </View>
  );
};

export default function EducationInfoScreen({ onCompleted }: { onCompleted?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [degree, setDegree] = useState('');
  const [institute, setInstitute] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [field, setField] = useState('');
  const [list, setList] = useState<any[]>([]);

  const addEntry = () => {
    if (!degree || !institute) {
      Alert.alert('Validation', 'Degree & Institute required');
      return;
    }
    setList([...list, { degree, institute, start, end, field }]);
    setDegree(''); setInstitute(''); setStart(''); setEnd(''); setField('');
  };

  const submit = async (skip=false) => {
    setLoading(true);
    try {
      const url = skip? '/profile/education-info/skip':'/profile/education-info';
      if(skip) await apiService.api.post(url);
      else {
        const payload = {
          degree: list.map(l=>l.degree),
          institute: list.map(l=>l.institute),
          start: list.map(l=>l.start||null),
          end: list.map(l=>l.end||null),
          field_of_study: list.map(l=>l.field||null),
        };
        await apiService.api.post(url,payload);
      }
      onCompleted && onCompleted();
    }catch(e:any){
      Alert.alert('Error', e?.response?.data?.message || 'Request failed');
    }finally{setLoading(false);}  
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LInput label="Degree" value={degree} onChangeText={setDegree} />
      <LInput label="Institute" value={institute} onChangeText={setInstitute} />
      <LInput label="Start Year" value={start} onChangeText={setStart} />
      <LInput label="End Year" value={end} onChangeText={setEnd} />
      <LInput label="Field of Study" value={field} onChangeText={setField} />
      <TouchableOpacity style={[styles.btn,{backgroundColor:'#6B7280',marginBottom:12}]} onPress={addEntry}><Text style={styles.btnText}>Add Entry</Text></TouchableOpacity>
      {list.map((l,i)=>(<Text key={i}>{l.degree} - {l.institute}</Text>))}
      {loading? <ActivityIndicator size="large" />:(
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn,{backgroundColor:'#DC2626'}]} onPress={()=>submit(false)}><Text style={styles.btnText}>Submit</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn,{backgroundColor:'#9CA3AF'}]} onPress={()=>submit(true)}><Text style={styles.btnText}>Skip</Text></TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  container:{padding:16},
  input:{borderWidth:1,borderRadius:6,padding:10},
  btn:{paddingVertical:10,borderRadius:6,alignItems:'center'},
  btnRow:{flexDirection:'row',justifyContent:'space-between',marginTop:20},
  btnText:{color:'#fff',fontWeight:'600'},
});