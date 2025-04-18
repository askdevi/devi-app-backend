import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { auth } from '../lib/firebase';

const LoginScreen = ({ navigation }) => { // Added navigation prop
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  };

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhoneNumber);
      setConfirm(confirmation);
      startResendTimer();
      Alert.alert('Success', 'Verification code has been sent to your phone.');
    } catch (err) {
      console.error('Error sending code:', JSON.stringify(err));
      
      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later or use a different phone number.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('The phone number format is incorrect. Please enter a valid number.');
      } else {
        setError(`Failed to send code: ${err.message || JSON.stringify(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!confirm) throw new Error('No verification session found.');

      const result = await confirm.confirm(verificationCode);
      const userId = result.user.uid;

      // Check user existence in backend
      const response = await fetch(`http://10.0.2.2:3000/api/user?userId=${userId}`);
      const userData = await response.json();

      if (userData.exists) {
        navigation.navigate('Home');
      } else {
        navigation.navigate('Register', {
          userId: userId,
          phoneNumber: phoneNumber
        });
      }

    } catch (err) {
      console.error('Verification error:', JSON.stringify(err));
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      {!confirm ? (
        <>
          <PhoneInput
            defaultValue={phoneNumber}
            defaultCode="IN"
            layout="first"
            onChangeFormattedText={setPhoneNumber}
            containerStyle={styles.phoneInput}
            textContainerStyle={styles.phoneTextContainer}
          />
          <Button 
            title={loading ? 'Sending...' : 'SEND OTP'} 
            onPress={handleSendCode} 
            disabled={loading} 
          />
        </>
      ) : (
        <>
          <TextInput
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />
          <Button 
            title={loading ? 'Verifying...' : 'Verify OTP'} 
            onPress={handleVerifyCode} 
            disabled={loading} 
          />
          {resendTimer > 0 ? (
            <Text style={styles.timerText}>Resend code in {resendTimer}s</Text>
          ) : (
            <Button title="Resend Code" onPress={handleSendCode} />
          )}
        </>
      )}

      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  phoneInput: {
    width: '100%',
    marginBottom: 20,
  },
  phoneTextContainer: {
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 16,
  },
  timerText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  loader: {
    marginTop: 20,
  }
});

export default LoginScreen;
