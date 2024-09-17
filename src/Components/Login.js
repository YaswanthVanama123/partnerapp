import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const validateCsToken = async () => {
      try {
        const pcsToken = await EncryptedStorage.getItem('pcs_token');
        if (pcsToken) {
          const response = await axios.post(`${process.env.BackendAPI}/api/worker/authenticate`, {}, {
            headers: {
              'Authorization': `Bearer ${pcsToken}`
            }
          });
          if (response.data.isValid) {
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
            //   })
            // );
          }
        }
      } catch (error) {
        console.error('Error validating token:', error);
      }
    };
    validateCsToken();
  }, [navigation]);

  const loginBackend = async (phoneNumber) => {
    try {
      const response = await axios.post(`${process.env.BackendAPI}/api/worker/login`, { phone_number: phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Error during backend login:', error);
      throw error;
    }
  };

  const login = async () => {
    if (!phoneNumber || !name) {
      Alert.alert('Login Failed', 'Phone number and name are required.');
      return;
    }

    try {
      const tokenValue = await loginBackend(phoneNumber);
      const {token} = tokenValue
      console.log(token)
      await EncryptedStorage.setItem('pcs_token',(token));

      Alert.alert('Login Successful');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Login Failed', 'An error occurred during login.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Login" onPress={login} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default Login;
