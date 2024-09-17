import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import EncryptedStorage from "react-native-encrypted-storage";

const TaskConfirmation = () => {
  const route = useRoute();
  const { encodedId } = route.params;
  console.log(encodedId)
  const [decodedId, setDecodedId] = useState(null);
  const [city, setCity] = useState(null);
  const [area, setArea] = useState(null);
  const [alternateName, setAlternateName] = useState(null);
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState(null);
  const [pincode, setPincode] = useState(null);
  const [service, setService] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {

    if (encodedId) {
      console.log("encodedId in task:", encodedId);
      const decoded = atob(encodedId); // Assuming encodedId is base64 encoded
      setDecodedId(decoded);
    }
  }, [encodedId]); 

  useEffect(() => {
    if (decodedId) {
      console.log("se",encodedId)
      const fetchPaymentDetails = async () => {
        console.log("decodedId:", decodedId);
        try {
          const response = await axios.post(`${process.env.BackendAPI}/api/worker/details`, {
            notification_id: decodedId,
          });
          const { city, area, pincode, alternate_name, alternate_phone_number, service } = response.data;
          console.log(response.data)
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

  const handleComplete = async () => {
    
    console.log('confirm or not',encodedId,decodedId)
    const encode = btoa(decodedId);
    try {
      const response = await axios.post(`${process.env.BackendAPI}/api/worker/confirm/completed`, {
        notification_id: decodedId, encodedId:encode
      });
      if (response.status === 200) {
        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
          const {user_id} = response.data
        // Send data to the backend

        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: encode,
          screen: 'PaymentScreen'
        }, { 
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'PaymentScreen', params: { encodedId: encode } }],
          })
        );
      } else{
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handlePress = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.confirmationContainer}>
        <View style={styles.taskHeader}>
          <Text style={styles.headerText}>Task Completion Confirmation</Text>
          <Text style={styles.subHeaderText}>Please confirm if you have completed the assigned task.</Text>
        </View>
        <Text style={styles.taskText}>Task: {service}</Text>
        <Text style={styles.taskText}>Location: {city}, {area}, {pincode}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.completedButton]} onPress={handleComplete}>
            <Icon name="check-circle" size={16} color="#fff" />
            <Text style={styles.buttonText}>Yes, Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.notCompletedButton]} onPress={() => handlePress(false)}>
            <Icon name="times-circle" size={16} color="#000" />
            <Text style={[styles.buttonText, styles.notCompletedText]}>No, Not Completed</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.responseText}>
          Your response has been recorded and will be reviewed by your supervisor.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    paddingLeft: 30,
    paddingRight: 20,
    padding: 10,
    width: '90%',
  },
  taskHeader: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 25,
    marginBottom: 10,
    color: '#333',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666',
  },
  taskText: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38%',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  completedButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  notCompletedButton: {
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  notCompletedText: {
    color: '#000',
  },
  responseText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default TaskConfirmation;
