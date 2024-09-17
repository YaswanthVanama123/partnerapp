import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute,CommonActions } from '@react-navigation/native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

const WorkerAcceptance = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { encodedId } = route.params;
  const [workDetails, setWorkDetails] = useState(null);
  const [city, setCity] = useState(null);
  const [area, setArea] = useState(null);
  const [alternateName, setAlternateName] = useState(null);
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState(null);
  const [pincode, setPincode] = useState(null);
  const [service, setService] = useState(null);
  const [decodedId, setDecodedId] = useState(null);

  useEffect(() => { 
    console.log("encodedId ra" ,encodedId)
    if (encodedId) {
   
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]);

  useEffect(() => {
    if (decodedId) {
      const fetchPaymentDetails = async () => {
        try {
          const response = await axios.post(`${process.env.BackendAPI}/api/worker/details`, {
            notification_id: decodedId,
          });
          const { city, area, pincode, alternate_name, alternate_phone_number, service } = response.data;
          setAlternateName(alternate_name);
          setAlternatePhoneNumber(alternate_phone_number);
          setArea(area);
          setCity(city); 
          setPincode(pincode);
          setService(service);
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      };
      fetchPaymentDetails();
    }
  }, [decodedId]);

  const handleAccept = async () => { 
    try {
      const jwtToken = await EncryptedStorage.getItem('pcs_token');
      const response = await axios.post(`${process.env.BackendAPI}/api/accept/request`,
        { user_notification_id: decodedId },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      if (response.status === 200) {
        const { notificationId } = response.data;
        const encodedNotificationId = btoa(notificationId);
        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
          
        // Send data to the backend
        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: encodedNotificationId,
          screen: 'WorkerNavigation'
        }, { 
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'WorkerNavigation', params: { encodedId: encodedNotificationId } }],
          })
        );
      } else {
        console.error('Unexpected response status:', response.status);
        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
          
        // Send data to the backend
        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: "",
          screen: ''
        }, {
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });


        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }
    } catch (error) {
      console.error('Error while sending acceptance:', error);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
        })
      );
    }
  };

  const handleReject = async () => {
    try {
      const jwtToken = await EncryptedStorage.getItem('pcs_token');
      const response = await axios.post(
        `${process.env.BackendAPI}/api/reject/request`,
        { user_notification_id: decodedId },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      if (response.status === 200) {

        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
          
        // Send data to the backend
        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: "",
          screen: ''
        }, {
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });


        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      } else {
        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
          
        // Send data to the backend
        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: "",
          screen: ''
        }, {
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });


        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error while sending rejection:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.rideRequest}>
        <Text style={styles.header}>New Service Request</Text>
        <View style={styles.info}>
          <Image style={styles.image} source={{ uri: 'https://via.placeholder.com/40' }} />
          <Text>{alternateName}</Text>
        </View>
        <View style={styles.location}>
          <Text style={styles.label}>Service Name</Text>
          <Text style={styles.value}>{service}</Text>
        </View>
        <View style={styles.location}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{`${area}, ${city}, ${pincode}`}</Text>
        </View>
        <View style={styles.estimate}>
          <View>
            <Text>Minimum charges</Text>
            <Text style={styles.rupeeBold}>149$</Text>
          </View>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.decline} onPress={handleReject}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accept} onPress={handleAccept}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  rideRequest: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'#000'
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  location: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#000'
  },
  value: {
    fontSize: 16,
    color:'#000'
  },
  estimate: {
    marginBottom: 20,
  },
  rupeeBold: {
    fontWeight: 'bold',
    color:'#000'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  decline: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 10,
  },
  accept: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkerAcceptance;
