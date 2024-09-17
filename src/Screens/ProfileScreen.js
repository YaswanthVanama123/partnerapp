import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import EncryptedStorage from 'react-native-encrypted-storage'; // Assuming you are using this for storage
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

const ProfileScreen = () => {
  const screenHeight = Dimensions.get('window').height;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

  const checkToken = async () => {
    try {
      const token = await EncryptedStorage.getItem('pcs_token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.log('Error retrieving token:', error);
      setIsLoggedIn(false);
    }
  };

  const serviceScreen = () =>{
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MyServices'}],
      })
    );
  }

  const notifications = () =>{
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Notification'}],
      })
    );
  }

  const profile = () =>{
    navigation.navigate('Profile');
  }

  const handleLogout = async () => {
    try {
      await EncryptedStorage.removeItem('pcs_token');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const menuItems = [
    'Profile',
    'Edit Skill Registration',
    'Wallet',
    'About Click Solver',
  ];

  return (
    <View style={[styles.profileContainer, { minHeight: screenHeight }]}>
      {isLoggedIn ? (
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Yaswanth</Text>
              <Text style={styles.userPhone}>+91 9392365494</Text>
            </View>
            <TouchableOpacity>
              <EvilIcons name="pencil" size={35} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.option} onPress={serviceScreen}>
              <SimpleLineIcons name="notebook" size={24} color="#000" />
              <Text style={styles.optionText}>My Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={notifications}> 
              <Ionicons name="notifications-outline" size={24} color="#000" />
              <Text style={styles.optionText}>Service Notification</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <Feather name="headphones" size={24} color="#000" />
              <Text style={styles.optionText}>Help & support</Text>
            </TouchableOpacity>
          </View>


              <View style={styles.menuItem}>
                <TouchableOpacity onPress={profile}>
                <View style={styles.menuContainer}>
                  <View>
                    <AntDesign name='profile' size={20} color='#000' />
                  </View>
                  <View>
                    <Text style={styles.menuItemText}>Profile</Text>
                  </View>
                  <View style={styles.arrowIcon}>
                    <SimpleLineIcons name='arrow-right' size={15} color='#000' />
                  </View>
                </View>
                </TouchableOpacity>
                <TouchableOpacity >
                <View style={styles.menuContainer}>
                  <View>
                    <MaterialIcons name='app-registration' size={20} color='#000' />
                  </View>
                  <View>
                    <Text style={styles.menuItemText}>Edit Skill Registration</Text>
                  </View>
                  <View style={styles.arrowIcon}>
                    <SimpleLineIcons name='arrow-right' size={15} color='#000' />
                  </View>
                </View>
                </TouchableOpacity>
                <TouchableOpacity >
                <View style={styles.menuContainer}>
                  <View>
                    <Ionicons name='wallet-outline' size={20} color='#000' />
                  </View>
                  <View>
                    <Text style={styles.menuItemText}>Wallet</Text>
                  </View>
                  <View style={styles.arrowIcon}>
                    <SimpleLineIcons name='arrow-right' size={15} color='#000' />
                  </View>
                </View>
                </TouchableOpacity>

                <View style={styles.logoutContainer}>
                  <TouchableOpacity style={[styles.logout]} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                </View>

              </View>
        </>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>You are not logged in.</Text>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  arrowIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText:{
    color:'#000'
  },
  menuContainer:{
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    gap:10
  },
  logoutContainer: {
    margin: 10,
    marginTop:100
  },
  logoutText: {
    color: 'red',
    textAlign: 'center',
  },
  logout: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 22,
    color: '#000',
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  option: {
    justifyContent: 'center',
    paddingLeft: 15,
    gap: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
    width: 100,
    height: 100,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#191919',
  },
  menuItem: {
    display:'flex',
    flexDirection:'column',
    gap:20,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop:30

  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
  loginContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loginPrompt: {
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;
