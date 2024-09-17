import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const [servicecounts, setServicecounts] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [messageBoxDisplay, setMessageBoxDisplay] = useState(false);
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [workerAverageRating, setWorkerAverageRating] = useState(0);
  const navigation = useNavigation();
  const [screenName,setScreenName] = useState(null)
  const [params,setParams] = useState(null)

  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        
        if(pcs_token){
        const response = await axios.get(`${process.env.BackendAPI}/api/worker/track/details`, {
          headers: { Authorization: `Bearer ${pcs_token}` },
        });
   
        const { route, parameter } = response.data;
        const params = JSON.parse(parameter)
        
   
        if(route === "" || route === null || route === undefined ){
          setMessageBoxDisplay(false)
        }
        else{
          setMessageBoxDisplay(true) 
        }
        
        // Update state with the response data
        setScreenName(route);
        setParams(params);
      }
      } catch (error) {
        console.error('Error fetching track details:', error);
      }
    };

    fetchTrackDetails();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const jwtToken = await EncryptedStorage.getItem('pcs_token');
      if (!jwtToken) {
        // Navigate to the login screen if the token is not available
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          }) 
        );
        return;
      }
      try {
        console.log("back ",process.env.BackendAPI)
        const response = await axios.get(`${process.env.BackendAPI}/api/worker/life/details`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        if (response.data === "") {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'SkillRegistration' }],
            })
          );
        }
        const { profileDetails, averageRating, workerId } = response.data;
        const { service_counts, money_earned, profile } = profileDetails[0];
        setServicecounts(service_counts);
        setTotalEarnings(money_earned);
        setProfile(profile);
        setData(profileDetails);
        const unique = String(workerId)
        await EncryptedStorage.setItem('unique',(unique));
        setWorkerAverageRating(parseFloat(averageRating).toFixed(1));
        const feedbackData = profileDetails.map(item => ({
          name: item.name,
          feedbackText: item.comment,
          feedbackRating: item.feedback_rating,
          date: item.created_at
        }));
        setFeedback(feedbackData);
      } catch (error) {
        console.error('There was an error fetching the data!', error);
      }
    };

    fetchData();
  }, []);

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

  useEffect(() => {
    const fetchData = async () => {

      const jwtToken = await EncryptedStorage.getItem('pcs_token');
      if (!jwtToken) {
        // Navigate to the login screen if the token is not available
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
        return;
      }

      try {
        const response = await axios.post(
          `${process.env.BackendAPI}/api/user/active/update`,
          {},
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
      } catch (error) {
        console.error('There was an error fetching the data!', error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchData = async () => {

      const jwtToken = await EncryptedStorage.getItem('pcs_token');
      if (!jwtToken) {
        // Navigate to the login screen if the token is not available
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
        return;
      }

      try {
        const response = await axios.post(
          `${process.env.BackendAPI}/api/registration/status`,
          {},
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        if (response.data === "") {
          navigation.navigate('SkillRegistration');
        }
      } catch (error) {
        console.error('There was an error fetching the data!', error);
      }
    };

    fetchData();
  }, []);

  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Text key={i} style={styles.filledStar}>★</Text>);
      } else {
        stars.push(<Text key={i} style={styles.emptyStar}>☆</Text>);
      }
    }
    return stars;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Click Solver</Text>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.textColor}>Total Services</Text>
          <Text style={styles.summaryValue}>{servicecounts}</Text>
          <Text style={styles.percentage}>+12% from last month</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.textColor}>Total Earnings</Text>
          <Text style={styles.summaryValue}>₹{totalEarnings}</Text>
          <Text style={styles.percentage}>+20.1% from last month</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.textColor}>Average Rating</Text>
          <Text style={styles.summaryValue}>{workerAverageRating}</Text>
          <Text style={styles.percentage}>+0.2 from last month</Text>
        </View>
      </View>
    </View>
  );

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <Text style={styles.customerName}>{item.name} <Text style={styles.rating}>{renderStars(item.feedbackRating)}</Text></Text>
      <Text style={styles.textColor}>{formatCreatedAt(item.date)}</Text>
      <Text style={styles.feedbackText}>{item.feedbackText}</Text>
    </View>
  );

  return (
    <SafeAreaView>
    <FlatList
      ListHeaderComponent={renderHeader}
      data={data}
      keyExtractor={(item) => item.notification_id.toString()}
      renderItem={({ item }) => (
        <View style={styles.orderItem}>
          <Text style={styles.columns}>Service ID: {item.notification_id}</Text>
          <Text style={styles.columns}>Time Worked: {item.time_worked}</Text>
          <Text style={styles.columns}>Location: {item.city}, {item.area}, {item.pincode}</Text>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.feedback}>
          <Text style={styles.sectionTitle}>Customer Feedback <Text style={styles.link}>View All</Text></Text>
          <FlatList
            data={feedback}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderFeedbackItem}
          />
        </View>
      )}
    />
      {messageBoxDisplay && (
        <TouchableOpacity
          style={styles.messageBoxContainer}
          onPress={() => navigation.replace(screenName, params)}
        >
          <View style={styles.messageBox}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeContainerText}>10 </Text>
              <Text style={styles.timeContainerText}>Mins</Text>
            </View>
            <View>
              {screenName === "PaymentScreen" ? (
                <Text style={styles.textContainerText}>Payment in progress</Text>
              ) : screenName === "WorkerNavigation" ? (
                <Text style={styles.textContainerText}>User is waiting for your help commander</Text>
              ): screenName === "OtpVerification" ? (
                <Text style={styles.textContainerText}>User is waiting for your help commander</Text>
              ) : screenName === "TimingScreen" ? (
                <Text style={styles.textContainerText}>Work in progress</Text>
              ) 
              : (
                <Text style={styles.textContainerText}>Nothing</Text>
              )}
              <Text style={styles.textContainerTextCommander}>Yaswanth is solving your problem</Text>
            </View>
            <View>
              <Text>Icon</Text>
            </View>
            {/* <TouchableOpacity onPress={() => setMessageBoxDisplay(false)}>
              <Text>Close</Text>
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
  
};


const styles = StyleSheet.create({
  dashboard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  columns:{
    color:'#000'
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  title: {
    fontSize: 24,
    color:'#000'
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginVertical: 20,
  },
  summaryItem: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    margin: 10,
    minWidth: 200,
  },
  textColor:{
    color:'#000'
  },
  summaryValue: {
    fontSize: 28,
    color: '#333',
  },
  percentage: {
    color: 'green',
    fontSize: 14,
  },
  orders: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
  },
  link: {
    fontSize: 14,
    color: '#0066cc',
  },
  orderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color:'#000'
  },
  feedback: {
    marginVertical: 20,
  },
  feedbackItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color:'#000'
  },
  rating: {
    color: '#000',
  },
  feedbackText: {
    color: '#000',
  },
  filledStar: {
    color: '#000',
  },
  emptyStar: {
    color: '#ccc',
  },
  messageBoxContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    zIndex: 1,
  },
  messageBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeContainer: {
    padding: 10,
    backgroundColor: '#33AD83',
    borderRadius: 5,
  },
  timeContainerText: {
    color: '#ffffff',
    fontSize: 15,
    textAlign: 'center',
  },
  textContainerText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
