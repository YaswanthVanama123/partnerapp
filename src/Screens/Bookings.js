import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
// import LottieView from 'lottie-react-native'; 

const Bookings = () => {
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true); 
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchBookings = async () => { 
        console.log("fetch thebook")
      try {
        const token = await EncryptedStorage.getItem('pcs_token'); 
        if (!token) throw new Error("Token not found");

        const response = await axios.get(`${process.env.BackendAPI}/api/worker/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        setBookingsData(response.data);
      } catch (error) { 
        console.error('Error fetching bookings data:', error);
      } finally {
        setLoading(false); 
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (created_at) => {
    const date = new Date(created_at);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${String(day).padStart(2, '0')}, ${year}`;
  };

  return (
    <View style={styles.container}>
      {/* {loading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../assets/cardsLoading.json')}
            autoPlay
            loop
            style={[{minHeight:screenHeight},{minWidth:screenWidth}]}
          />
        </View>
      ) : ( */}
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.bookingHistoryContainer}>
            <View style={styles.bookings}>
              {bookingsData.map((booking, index) => (
                <View style={styles.booking} key={index}>
                  <View style={styles.bookingCard}>
                    <View style={styles.profileBooking}>
                      <View style={styles.profileIcon}>
                        <Text>👤</Text>
                      </View>
                      <View style={styles.details}>
                        <Text style={styles.serviceTitle}>{booking.service}</Text>
                        <Text style={styles.bookingTime}>Booked on: {formatDate(booking.created_at)}</Text>
                      </View>
                      <View style={styles.status}>
                        <Text style={styles.completed}>Completed</Text>
                      </View>
                    </View>
                    <View style={styles.amountDiv}>
                      <View>
                        <Text>Provider{"\n"}<Text style={styles.workerName}>{booking.provider}</Text></Text>
                      </View>
                      <View>
                        <Text>Total{"\n"}<Text style={styles.rupeesAmount}>{booking.payment}₹</Text></Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

          </View>
        </ScrollView>
      {/* )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the full screen height
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1, // Allow the loader to fill the entire screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 150, // Adjust as needed
    height: 150, // Adjust as needed
  },
  scrollViewContent: {
    flexGrow: 1, // Ensure the content container takes up all available space
  },
  bookingHistoryContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookings: {
    marginBottom: 30,
  },
  booking: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  profileBooking: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    backgroundColor: '#F4F4F5',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 50,
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  serviceTitle: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
  bookingTime: {
    color: '#6B7280',
    marginTop: 4,
  },
  status: {
    alignSelf: 'flex-start',
    marginLeft: 'auto',
  },
  completed: {
    backgroundColor: '#D1FAE5',
    color: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  amountDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  workerName: {
    color: '#111827',
    fontWeight: 'bold',
  },
  rupeesAmount: {
    color: '#111827',
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  paginationText: {
    marginHorizontal: 10,
    color: '#007bff',
  },
});

export default Bookings;
