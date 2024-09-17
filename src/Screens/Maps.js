import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import axios from 'axios';

// Set your Mapbox access token here
Mapbox.setAccessToken('pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg');

const Maps = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [route, setRoute] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    startPoint: [ 80.519353,16.987142,],
    endPoint: [ 80.6093701,17.1098751,],
  });

  useEffect(() => {
    // Define your waypoints (longitude, latitude)
    // const startPoint = [-122.41669, 37.7853];
    // const endPoint = [-122.41669, 37.781];
    const startPoint = locationDetails.startPoint;
    const endPoint = locationDetails.endPoint
    
    // Fetch route from Mapbox Directions API
    const fetchRoute = async () => {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint.join(',')};${endPoint.join(',')}?alternatives=true&steps=true&geometries=geojson&access_token=pk.eyJ1IjoieWFzd2FudGh2YW5hbWEiLCJhIjoiY2x5Ymw5MXZpMWZseDJqcTJ3NXFlZnRnYyJ9._E8mIoaIlyGrgdeu71StDg`
        );
        setRoute(response.data.routes[0].geometry);
        console.log(response.data.routes[0].geometry)
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoute();
  }, []);

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={locationDetails.startPoint}
        />
        {route && (
          <Mapbox.ShapeSource id="routeSource" shape={route}>
            <Mapbox.LineLayer
              id="routeLine"
              style={{ lineColor: '#007cbf', lineWidth: 5 }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
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
});

export default Maps;
