import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

function LoginAuth() {
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState(Array(6).fill(''));

  function onAuthStateChanged(user) {
    if (user) {
      console.log('User logged in successfully:', user);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const validatePhoneNumber = () => {
    const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, ''); // Remove any spaces
    const isValid = /^\+\d{1,3}\d{6,14}$/.test(cleanedPhoneNumber);
    if (!isValid) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number in E.164 format.');
    }
    return isValid;
  };

  async function signInWithPhoneNumber() {
    if (!validatePhoneNumber()) {
      return;
    }
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.log('Error signing in with phone number:', error);
    }
  }

  async function confirmCode() {
    try {
      const otpCode = code.join('');
      await confirm.confirm(otpCode);
    } catch (error) {
      console.log('Invalid code.');
    }
  }

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
  };

  if (!confirm) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.phoneNumberInput}
          value={phoneNumber}
          onChangeText={text => setPhoneNumber(text)}
          placeholder="Enter your mobile number"
          keyboardType="phone-pad"
        />
        <Button title="Send OTP" onPress={signInWithPhoneNumber} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.otpContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            value={digit}
            onChangeText={text => handleCodeChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
          />
        ))}
      </View>
      <Button title="Confirm Code" onPress={confirmCode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  phoneNumberInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    width: 40,
    textAlign: 'center',
    fontSize: 18,
  },
});

export default LoginAuth;
