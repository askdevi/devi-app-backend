import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const RegisterScreen = ({ route, navigation }) => {
  const { userId, phoneNumber } = route.params;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: new Date(),
    birthTime: new Date(),
    birthPlace: '',
    gender: '',
    preferredLanguage: 'English',
    relationshipStatus: '',
    occupation: '',
  });

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, birthDate: selectedDate });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, birthTime: selectedTime });
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.birthPlace ||
      !formData.relationshipStatus ||
      !formData.occupation
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Format the dates for storage
      const formattedBirthDate = formData.birthDate.toISOString().split('T')[0];
      const hours = formData.birthTime.getHours().toString().padStart(2, '0');
      const minutes = formData.birthTime.getMinutes().toString().padStart(2, '0');
      const formattedBirthTime = `${hours}:${minutes}`;

      // Create user document in Firestore
      const userData = {
        userId,
        phoneNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formattedBirthDate,
        birthTime: unknownBirthTime ? '12:00' : formattedBirthTime,
        birthPlace: formData.birthPlace,
        gender: formData.gender || 'other',
        preferredLanguage: formData.preferredLanguage,
        relationshipStatus: formData.relationshipStatus || 'other',
        occupation: formData.occupation || 'other',
        tokens: 3, // Initial tokens
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userId), userData);

      Alert.alert(
        'Registration Successful',
        'Welcome to AskDevi! You have received 3 tokens.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to create user profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>A final few details to begin your journey</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* First Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          placeholder="Enter your first name"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Last Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          placeholder="Enter your last name"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Birth Date */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Birth Date *</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inputText}>{formData.birthDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker value={formData.birthDate} mode="date" display="default" onChange={handleDateChange} />
        )}
      </View>

      {/* Birth Time */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Birth Time *</Text>
        <TouchableOpacity
          style={[styles.input, unknownBirthTime && styles.disabledInput]}
          onPress={() => !unknownBirthTime && setShowTimePicker(true)}
          disabled={unknownBirthTime}
        >
          <Text style={styles.inputText}>
            {unknownBirthTime
              ? '12:00'
              : `${formData.birthTime.getHours().toString().padStart(2, '0')}:${formData.birthTime
                  .getMinutes()
                  .toString()
                  .padStart(2, '0')}`}
          </Text>
        </TouchableOpacity>
        {showTimePicker && !unknownBirthTime && (
          <DateTimePicker value={formData.birthTime} mode="time" display="default" onChange={handleTimeChange} />
        )}
        <View style={styles.checkboxContainer}>
          <Switch value={unknownBirthTime} onValueChange={(value) => setUnknownBirthTime(value)} />
          <Text style={styles.checkboxText}>I don't know my birth time</Text>
        </View>
      </View>

      {/* Birth Place */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Birth Place *</Text>
        <TextInput
          style={styles.input}
          value={formData.birthPlace}
          onChangeText={(text) => setFormData({ ...formData, birthPlace: text })}
          placeholder="Enter your birth place"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Relationship Status */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Relationship Status *</Text>
        <Picker
          selectedValue={formData.relationshipStatus}
          onValueChange={(itemValue) => setFormData({ ...formData, relationshipStatus: itemValue })}
          style={styles.picker}
        >
          <Picker.Item label="Select Status" value="" />
          <Picker.Item label="Single" value="single" />
          <Picker.Item label="Dating" value="dating" />
          <Picker.Item label="Married" value="married" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      {/* Occupation */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Occupation *</Text>
        <Picker
          selectedValue={formData.occupation}
          onValueChange={(itemValue) => setFormData({ ...formData, occupation: itemValue })}
          style={styles.picker}
        >
          <Picker.Item label="Select Occupation" value="" />
          <Picker.Item label="Employed" value="employed" />
          <Picker.Item label="Self-Employed" value="self-employed" />
          <Picker.Item label="Homemaker" value="homemaker" />
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      {/* Submit Button */}
      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <>
          <TouchableOpacity onPress={handleSubmit} style={[styles.registerButton]}>
            <Text style={[styles.buttonText]}>Register</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

// const styles = StyleSheet.create({
//   container: { flex: 1 },
// });

// export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#220038',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputText: {
    color: '#ffffff',
  },
  disabledInput: {
    opacity: 0.5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  picker: {
    color: '#ffffff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkboxText: {
    color: '#ffffff',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  skipButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  registerButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4d4f',
    marginBottom: 16,
  },
});

export default RegisterScreen;
