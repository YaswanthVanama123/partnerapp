// import React, { useEffect } from 'react';
// import BackgroundGeolocation from 'react-native-background-geolocation';

// const LocationTracking = () => {
//   useEffect(() => {
//     const configureAndStartGeolocation = async () => {
//       try {
//         await BackgroundGeolocation.ready({
//           desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//           distanceFilter: 50,
//           // Add more configuration options as needed
//         });

//         BackgroundGeolocation.start();

//         // Log current position
//         BackgroundGeolocation.getCurrentPosition(
//           (location) => {
//             console.log('Current Position:', location);
//             console.log('Longitude:', location.coords.longitude);
//             console.log('Latitude:', location.coords.latitude);
//           },
//           (error) => {
//             console.warn('Error getting current position:', error);
//           }
//         );

//         // Listen for location updates
//         BackgroundGeolocation.onLocation(
//           (location) => {
//             console.log('Location update:', location);
//             console.log('Longitude:', location.coords.longitude);
//             console.log('Latitude:', location.coords.latitude);
//           },
//           (error) => {
//             console.warn('Location error:', error);
//           }
//         );
//       } catch (error) {
//         console.warn('BackgroundGeolocation error:', error);
//       }
//     };

//     configureAndStartGeolocation();

//     // Cleanup on unmount
//     return () => {
//       BackgroundGeolocation.stop();
//       BackgroundGeolocation.removeAllListeners();
//     };
//   }, []);

//   return null; // Render nothing, or add UI as needed
// };

// export default LocationTracking;
