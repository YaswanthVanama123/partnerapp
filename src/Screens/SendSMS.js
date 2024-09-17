import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text } from 'react-native';
import axios from 'axios';

const SendSMS = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState(null);

  // Function to validate that the phone number is 10 digits and only numeric
  const validatePhoneNumber = (number) => {
    const regex = /^[0-9]{10}$/; // Regex for 10 digit Indian mobile number
    return regex.test(number);
  };

  const sendSMS = async () => {
    // Add the +91 prefix to the phone number for Indian numbers
    const fullPhoneNumber = `+91${phoneNumber}`;

    // Validate the phone number before sending
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    try { 
      // Send the full phone number (with +91) to the backend
      const response = await axios.post(`${process.env.BackendAPI}/api/send-sms`, {
        phoneNumber: fullPhoneNumber,
      });

      if (response.data.success) {
        Alert.alert('SMS sent successfully!', 'Check your phone for the verification code.');
        setVerificationCode(response.data.verificationCode); // For testing, display the sent code
      } else {
        Alert.alert('Failed to send SMS', 'Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error sending SMS', 'Please try again later.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter your phone number (without +91):</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ marginRight: 10 }}>+91</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter 10-digit phone number"
          keyboardType="phone-pad"
          maxLength={10} // Limit to 10 digits
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, flex: 1 }}
        />
      </View>
      <Button title="Send SMS" onPress={sendSMS} />
      {verificationCode && (
        <Text>Verification Code (for testing): {verificationCode}</Text>
      )}
    </View>
  );
};

export default SendSMS;
