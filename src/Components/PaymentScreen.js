import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, BackHandler } from 'react-native';
import { useNavigation, useRoute, CommonActions, useFocusEffect } from "@react-navigation/native";
import axios from 'axios';
import EncryptedStorage from "react-native-encrypted-storage";

const PaymentScreen = ({ route }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [decodedId, setDecodedId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const { encodedId } = route.params;
    console.log("encod",encodedId)
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [route.params]);

  useEffect(() => {
    if (decodedId) {
      const fetchPaymentDetails = async () => {
        console.log(decodedId)
        try {
          const response = await axios.post(`${process.env.BackendAPI}/api/payment/details`, {
            notification_id: decodedId,
          });

          const { start_time, end_time, time_worked, totalAmount } = response.data;

          // Ensure totalAmount is a number
          const amount = Number(totalAmount) || 0;

          setPaymentDetails({
            start_time: formatTime(start_time),
            end_time: formatTime(end_time),
            time_worked,
          });
          setTotalAmount(amount);
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      };
      fetchPaymentDetails();
    }
  }, [decodedId]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate to a specific route when the back button is pressed
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
        // Return true to indicate that the back button press has been handled
        return true;
      };

      // Add event listener for hardware back button press
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup function to remove the event listener
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCouponCodeChange = (text) => {
    setCouponCode(text);
  };

  const applyCoupon = () => {
    if (couponCode === 'DISCOUNT10') {
      setTotalAmount((prevAmount) => Math.max(prevAmount - 10, 0));
    }
  };

  const handlePayment = async () => {
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

    Alert.alert('Payment', 'User has paid successfully.');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
      })
    );
  };

  return (
    <View style={styles.paymentMainContainer}>
      <View style={styles.paymentContainer}>
        <Text style={styles.header}>Payment</Text>
        <Text style={styles.serviceStyle}>Complete your payment.</Text>
        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.serviceStyle}>Service</Text>
            <Text style={styles.serviceStyle}>Plumbing Repair</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.serviceStyle}>Start time</Text>
            <Text style={styles.serviceStyle}>{paymentDetails.start_time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.serviceStyle}>End time</Text>
            <Text style={styles.serviceStyle}>{paymentDetails.end_time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.serviceStyle}>Time worked</Text>
            <Text style={styles.serviceStyle}>{paymentDetails.time_worked}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.serviceStyle}>Total Amount</Text>
            <Text style={styles.serviceStyle}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.totalAmountContainer}>
          <Text>Total Amount</Text>
          <Text>${totalAmount.toFixed(2)}</Text>
        </View>
        <Button title="User Paid" onPress={handlePayment} color="#000" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  paymentMainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  paymentContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 20,
    width: 300,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  serviceStyle:{
    color:'#000'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#000'
  },
  paymentDetails: {
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalAmountContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PaymentScreen;
