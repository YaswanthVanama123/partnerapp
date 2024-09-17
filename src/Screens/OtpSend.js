import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const OtpScreen = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [message, setMessage] = useState('');

  // Send OTP to the backend
  const sendOtp = async () => {
    try {
      // Automatically prepend +91 for Indian mobile numbers
      const formattedMobileNumber = `${mobileNumber}`;
        
      const response = await axios.post(`${process.env.BackendAPI}/api/otp/send`, {
        mobileNumber: formattedMobileNumber,
      });
      console.log(response)
      setVerificationId(response.data.verificationId);
      setMessage('OTP sent successfully!');
    } catch (error) {
      setMessage('Failed to send OTP.');
    }
  };

  // Validate OTP
  const validateOtp = async () => {
    try {
      const formattedMobileNumber = `${mobileNumber}`;
      
      const response = await axios.get(`${process.env.BackendAPI}/api/validate`, {
        params: {
          mobileNumber: formattedMobileNumber,
          verificationId,
          otpCode: otp,
        },
      });
      console.log(response)
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Failed to validate OTP.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter Mobile Number"
        value={mobileNumber}
        onChangeText={(text) => setMobileNumber(text)}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <Button title="Send OTP" onPress={sendOtp} />

      {verificationId && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={(text) => setOtp(text)}
            keyboardType="numeric"
            style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
          />
          <Button title="Validate OTP" onPress={validateOtp} />
        </>
      )}

      {message && <Text style={styles.error}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
    error:{
        color:'#000'
    }
});

export default OtpScreen;
