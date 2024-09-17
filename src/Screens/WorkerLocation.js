import React, { useState, useEffect } from 'react';
import { View, Text, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

function WorkersLocation() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const sendLocationToBackend = async (latitude, longitude) => {
    const pcsToken = await EncryptedStorage.getItem('pcs_token'); 
      if (!pcsToken) {
        console.error('PCS token is missing');
        return;
      }

      try {
        const response = await axios.post(
          `${process.env.BackendAPI}/api/worker/location/update`,
          {
            latitude,
            longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${pcsToken}`, // Use the PCS token from EncryptedStorage
            },
          }
        );
        console.log(response);
      } catch (error) {
        console.error('Error sending location to backend:', error);
      }
    };

    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startLocationTracking();
        } else {
          console.log('Location permission denied');
        }
      } else {
        startLocationTracking();
      }
    };

    const startLocationTracking = () => {
      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          sendLocationToBackend(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000,
          distanceFilter: 10,
        }
      );

      return () => {
        Geolocation.clearWatch(watchId);
      };
    };

    requestLocationPermission();
  }, []);

  return (
    <View>
      <Text>Location Tracker</Text>
      <Text>
        Latitude: {location.latitude}
        {'\n'}
        Longitude: {location.longitude}
      </Text>
    </View>
  );
}

export default WorkersLocation;
