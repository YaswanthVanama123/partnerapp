import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Button, Alert, Image, Platform, PermissionsAndroid } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';

// Set your Mapbox access token here
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');

const Navigation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [routeData, setRouteData] = useState(null);
  const [locationDetails, setLocationDetails] = useState({ startPoint: [80.519353, 16.987142], endPoint: [80.6093701, 17.1098751] });
  const [decodedId, setDecodedId] = useState(null);
  const [workerName, setWorkerName] = useState(null);
  const [pin, setPin] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [encodedData, setEncodedData] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);

  useEffect(() => {
    const encodedId  = 'MjU2';
    setEncodedData(encodedId);
    if (encodedId) {
      try {
        const decodedId = atob(encodedId);
        setDecodedId(decodedId);
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [route.params]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission denied');
            return;
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();

  }, [])

  const checkCancellationStatus = async () => {
    try {
      console.log(process.env.BackendAPI)
      const response = await axios.get(
        `${process.env.BackendAPI}/api/worker/cancelled/status`,
        {
            params: {
              notification_id: decodedId,
            },
          }
      );

      const { notificationStatus } = response.data;

     if (notificationStatus === "usercanceled") {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error("Error checking cancellation status:", error);
    }
  };

  useEffect(() => {
    if (decodedId) {
      const intervalId = setInterval(checkCancellationStatus, 3000); // Check every 3 seconds
      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [decodedId]);

  const handleCancelBooking = async () => {
    const notificationId = await EncryptedStorage.getItem('decodedId');
    try {
      const response = await axios.post(
        `${process.env.BackendAPI}/api/worker/tryping/cancel`,
        {
          notification_id: notificationId,
        }
      );

      if (response.status === 200) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Unable to cancel booking');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to cancel booking');
    }
  };

  useEffect(() => {
    const fetchAddressDetails = async () => {
      const notificationId = decodedId;
      try {
        console.log(process.env.BACKEND_API)
        const response = await axios.get(
          `${process.env.BackendAPI}/api/user/address/details`,
          {
            params: { notification_id: notificationId },
          }
        );
        setAddressDetails(response.data);
      } catch (error) {
        console.error('Error fetching address details:', error);
      }
    };

    if (decodedId) {
      console.log(decodedId)
      fetchAddressDetails();
    }
  }, [decodedId]);

  const fetchLocationDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.BackendAPI}/api/user/location/navigation`,
        { params: { notification_id: decodedId } },
      );

      const { startPoint, endPoint } = response.data;
      console.log(endPoint);
      const parsedStartPoint = startPoint.map(coord => parseFloat(coord));
      const parsedEndPoint = endPoint.map(coord => parseFloat(coord));
      let reversedStart = [...parsedStartPoint].reverse();
      let reversedEnd = [...parsedEndPoint].reverse();
      console.log(reversedStart, reversedEnd);
      setLocationDetails({ startPoint: reversedStart, endPoint: reversedEnd });
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  useEffect(() => {
    const startPoint = locationDetails.startPoint;
    const endPoint = locationDetails.endPoint;
    console.log(startPoint);
    console.log(endPoint);

    const fetchRoute = async () => {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint.join(',')};${endPoint.join(',')}?alternatives=true&steps=true&geometries=geojson&access_token=pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg`
        );

        if (response.data.routes && response.data.routes.length > 0) {
          const routeData = response.data.routes[0];
          if (routeData.geometry) {
            setRouteData(routeData.geometry);
            console.log(routeData.geometry);
          } else {
            console.error('Geometry property is missing in the route data.');
          }
        } else {
          console.error('No routes found in the response.');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [locationDetails]);

  const handleLocationReached = () => {
    const encodedNotificationId = btoa(decodedId);
    navigation.navigate('Home');// Navigate to the OTP verification path
  };

  useEffect(() => {
    if (decodedId) {
      fetchLocationDetails();
      const intervalId = setInterval(() => {
        fetchLocationDetails();
        
      }, 40000);

      return () => clearInterval(intervalId);
    }
  }, [decodedId]);

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={locationDetails.endPoint}
        />
        {routeData && (
          <Mapbox.ShapeSource id="routeSource" shape={routeData}>
            <Mapbox.LineLayer
              id="routeLine"
              style={{ lineColor: '#007cbf', lineWidth: 5 }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
      {addressDetails && (
        <View style={styles.infoContainer}>
          <Image
            source={{
              uri: 'https://i.postimg.cc/FzxxDZfb/IMG-20220317-203743-removebg-preview.png',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{addressDetails.alternate_name}</Text>
          <Text style={styles.address}>
            Address: {addressDetails.city}, {addressDetails.area}, {addressDetails.pincode}
          </Text>
          <Text style={styles.phone}>{addressDetails.alternate_phone_number}</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Cancel Booking" onPress={handleCancelBooking} />
        <Button title="Location Reached" onPress={handleLocationReached} />
      </View>
      {showMessageBox && (
        <View style={styles.messageBox}>
          <Text>Your cancellation time of 4 minutes is over.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  address: {
    fontSize: 16,
    marginTop: 5,
  },
  phone: {
    fontSize: 16,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
  },
  messageBox: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 20,
    left: '50%',

  },
});

export default Navigation;
