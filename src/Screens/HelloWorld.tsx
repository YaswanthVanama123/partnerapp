import React from 'react';
import {
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import BackgroundGeolocation, {
  Location,
  Subscription
} from "react-native-background-geolocation";
import EncryptedStorage from 'react-native-encrypted-storage';
import haversine from 'haversine';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment-timezone';

const HelloWorld = () => {
  const [enabled, setEnabled] = React.useState(true);
  const [location, setLocation] = React.useState('');
  const [lastLocation, setLastLocation] = React.useState(null);

  React.useEffect(() => {
    const initializeGeolocation = async () => {
      const pcsToken = await EncryptedStorage.getItem('pcs_token');
      
      if (pcsToken) {
        // pcs_token exists, proceed with geolocation setup
        const onLocation: Subscription = BackgroundGeolocation.onLocation(async (location) => {
          setLocation(JSON.stringify(location, null, 2));
          const priviousLocation = await EncryptedStorage.getItem('previousLocation');

          if (priviousLocation) {
            const locationData = JSON.parse(priviousLocation);
            const { coords } = location;
            const distance = haversine(
              { latitude: locationData.latitude, longitude: locationData.longitude },
              { latitude: coords.latitude, longitude: coords.longitude },
              { unit: 'km' }
            );

            if (distance >= 1) { // 1 kilometer
              sendLocationToServer(location);
              const { latitude, longitude } = location.coords;
              const locationData = { latitude, longitude };
              await EncryptedStorage.setItem('previousLocation', JSON.stringify(locationData));
            }
          } else {
            const { latitude, longitude } = location.coords;
            const locationData = { latitude, longitude };
            await EncryptedStorage.setItem('previousLocation', JSON.stringify(locationData));
            sendLocationToServer(location);
          }
        });

        const onGeofence: Subscription = BackgroundGeolocation.onGeofence(async (geofence) => {
          if (geofence.action === 'ENTER') {
            console.log(`Entered geofence: ${geofence.identifier}`);
          } else if (geofence.action === 'EXIT') {
            console.log(`Exited geofence: ${geofence.identifier}`);
            await EncryptedStorage.setItem('previousLocation', JSON.stringify(null));
          }
    
        });

        const geofences = [
          {
            identifier: 'Gampalagudem',
            radius: 10000, // 10 km radius
            latitude: 16.998121,
            longitude: 80.5230137,
            notifyOnEntry: true,
            notifyOnExit: true,
          },
          {
            identifier: 'Los Angeles',
            radius: 10000, // 10 km radius
            latitude: 34.0522,
            longitude: -118.2437,
            notifyOnEntry: true,
            notifyOnExit: true,
          },
          {
            identifier: 'Chicago',
            radius: 10000, // 10 km radius
            latitude: 41.8781,
            longitude: -87.6298,
            notifyOnEntry: true,
            notifyOnExit: true,
          }
        ];

        BackgroundGeolocation.ready({
          desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
          distanceFilter: 1, // Update location every 1 meter
          stopTimeout: 5,
          debug: true,
          logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
          stopOnTerminate: false,
          startOnBoot: true,
          batchSync: false,
          autoSync: true,
        }).then((state) => {
          setEnabled(state.enabled);
          geofences.forEach((geofence) => {
            BackgroundGeolocation.addGeofence(geofence).then(() => {
              console.log(`Geofence for ${geofence.identifier} added successfully`);
            }).catch((error) => {
              console.error(`Failed to add geofence for ${geofence.identifier}: `, error);
            });
          });
        });

        return () => {
          onLocation.remove();
          onGeofence.remove();
        };
      } else {
        console.log('pcs_token is not available, skipping location tracking.');
      }
    };

    initializeGeolocation();
  }, []);

  React.useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [enabled]);

  const sendLocationToServer = async (location) => {
    try {
      const Item = await EncryptedStorage.getItem('unique');
      if (Item) {
        const locationsCollection = firestore().collection('locations');
        const { latitude, longitude } = location.coords;
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error('Invalid latitude or longitude values');
        }
        const locationData = {
          location: new firestore.GeoPoint(lat, lon),
          timestamp: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
          worker_id: parseInt(Item, 10) // Convert Item to an integer
        };
        const snapshot = await locationsCollection
          .where('worker_id', '==', locationData.worker_id)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await locationsCollection.doc(docId).update({
            location: locationData.location,
            timestamp: locationData.timestamp
          });
          console.log('Location data updated successfully.');
        } else {
          await locationsCollection.add(locationData);
          console.log('New location data sent to Firestore successfully.');
        }
      }
    } catch (error) {
      console.error('Error sending location data to Firestore:', error);
    }
  };

  return (
    <View>
      <Switch value={enabled} onValueChange={setEnabled} />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#000'
  }
});

export default HelloWorld;
