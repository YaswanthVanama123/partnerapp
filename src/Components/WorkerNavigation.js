import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Button, Alert, Image, BackHandler, Linking, Platform, PermissionsAndroid } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import { useRoute, useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';

// Set your Mapbox access token here
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');

const WorkerNavigation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [routeData, setRouteData] = useState(null);
  const [locationDetails, setLocationDetails] = useState({ startPoint: [80.519353, 16.987142], endPoint: [80.6093701, 17.1098751] });
  const [decodedId, setDecodedId] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);

  useEffect(() => {
    const { encodedId } = route.params;
    if (encodedId) {
      try {
        setDecodedId(atob(encodedId));
      } catch (error) {
        console.error('Error decoding Base64:', error);
      }
    }
  }, [route.params]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (decodedId) {
      const intervalId = setInterval(checkCancellationStatus, 3000);
      return () => clearInterval(intervalId);
    }
  }, [decodedId]);

  useEffect(() => {
    if (decodedId) {
      fetchAddressDetails()
      fetchLocationDetails();
    }
  }, [decodedId]);

  const checkCancellationStatus = async () => {
    try {
      const response = await axios.get(`${process.env.BackendAPI}/api/worker/cancelled/status`, {
        params: { notification_id: decodedId },
      });

      if (response.data.notificationStatus === "usercanceled") {
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: '',
          screen: ''
        }, {
          headers: { Authorization: `Bearer ${pcs_token}` }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }
    } catch (error) {
      console.error("Error checking cancellation status:", error);
    }
  };

  const handleCancelBooking = async () => {
    try {
      const response = await axios.post(`${process.env.BackendAPI}/api/worker/tryping/cancel`, {
        notification_id: decodedId,
      });

      if (response.status === 200) {
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: '',
          screen: ''
        }, {
          headers: { Authorization: `Bearer ${pcs_token}` }
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      } else {
        Alert.alert('Error', 'Unable to cancel booking');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to cancel booking');
    }
  };

  const fetchAddressDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.BackendAPI}/api/user/address/details`, {
        params: { notification_id: decodedId },
      });
      setAddressDetails(response.data);
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  }, [decodedId]);

  const fetchLocationDetails = async () => {
    try {
      const response = await axios.get(`${process.env.BackendAPI}/api/user/location/navigation`, {
        params: { notification_id: decodedId },
      });

      const { startPoint, endPoint } = response.data;
      setLocationDetails({
        startPoint: startPoint.map(coord => parseFloat(coord)).reverse(),
        endPoint: endPoint.map(coord => parseFloat(coord)).reverse(),
      });
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  useEffect(() => {
    if (locationDetails.startPoint && locationDetails.endPoint) {
      const fetchRoute = async () => {
        try {
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${locationDetails.startPoint.join(',')};${locationDetails.endPoint.join(',')}?alternatives=true&steps=true&geometries=geojson&access_token=pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg`
          );

          if (response.data.routes.length > 0) {
            setRouteData(response.data.routes[0].geometry);
          } else {
            console.error('No routes found in the response.');
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      };
      fetchRoute();
    }
  }, [locationDetails]);

  const handleLocationReached = async () => {
    const encodedNotificationId = btoa(decodedId);
    navigation.push('OtpVerification', { encodedId: encodedNotificationId });
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const openGoogleMaps = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${locationDetails.endPoint[1]},${locationDetails.endPoint[0]}&travelmode=driving`;
        Linking.openURL(url).catch(err => console.error('Error opening Google Maps:', err));
      },
      (error) => {
        console.error('Error getting current location:', error);
      }
    );
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={locationDetails.startPoint}
        />
        {routeData && (
          <Mapbox.ShapeSource id="routeSource" shape={routeData}>
            <Mapbox.LineLayer
              id="routeLine"
              style={styles.routeLine}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
      {addressDetails && (
        <View style={styles.infoContainer}>
          <Image
            source={{ uri: 'https://i.postimg.cc/FzxxDZfb/IMG-20220317-203743-removebg-preview.png' }}
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
        <Button title="Open in Google Maps" onPress={openGoogleMaps} />
        <Button title="Cancel Booking" color="red" onPress={handleCancelBooking} />
        <Button title="Location Reached" onPress={handleLocationReached} />
      </View>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 16,
    color: '#555',
  },
  phone: {
    fontSize: 16,
    color: '#555',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeLine: {
    lineColor: '#0000ff',
    lineWidth: 5,
  },
});

export default WorkerNavigation;
