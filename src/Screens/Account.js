import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';

const AccountScreen = () => {
  const [hasToken, setHasToken] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Check if the pcs_token is present
    const checkToken = async () => {
      try {
        const token = await EncryptedStorage.getItem('pcs_token');
        setHasToken(!!token); // Set hasToken to true if token exists
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    checkToken();
  }, []);

  const handleLogout = async () => {
    try {
      await EncryptedStorage.removeItem('pcs_token');
      setHasToken(false); // Update state to reflect the logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login'); // Navigate to the Login screen
  };

  return (
    <View style={styles.container}>
      {hasToken ? (
        <View>
          <Text style={styles.title}>Your Account</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Please Log In</Text>
          <Button title="Login" onPress={handleLogin} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default AccountScreen;
