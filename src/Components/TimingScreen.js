import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, BackHandler } from "react-native";
import { useNavigation, useRoute,CommonActions, useFocusEffect } from "@react-navigation/native";
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from "axios";

const TimingScreen = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const route = useRoute();
  const { encodedId } = route.params;
  const navigation = useNavigation();
  const [decodedId, setDecodedId] = useState(null);
  const [startTime,setStartTime] = useState(null)

  useEffect(() => {
    if (encodedId) {
      const decoded = atob(encodedId);
      setDecodedId(decoded);
    }
  }, [encodedId]); 

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

  const getCurrentTimestamp = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();

    // Ensure date is valid
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
  
    // IST is UTC+5:30
    const istOffset = 5 * 60 + 30; // offset in minutes
  
    // Get UTC time components
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();
  
    // Adjust for IST
    minutes += istOffset;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes %= 60;
    }
    if (hours >= 24) {
      hours %= 24;
    }
    // const hours = String(date.getUTCHours()).padStart(2, "0");
    // const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    // const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  
    return `${hours}:${minutes}:${seconds}`;
  };
  
  const differenceTime = (dateString) => {
    const startedTime = getCurrentTimestamp(dateString);
    const [hh, mm, ss] = startedTime.split(":").map(Number);
  
    const currentTime = getCurrentTimestamp();
    const [hr, mr, sr] = currentTime.split(":").map(Number);
  
    let hours = hr - hh;
    let minutes = mr - mm;
    let seconds = sr - ss;
  
    // Adjust for negative seconds
    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
  
    // Adjust for negative minutes
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
  
    // Adjust for negative hours
    if (hours < 0) {
      hours += 24; // Assumes the time difference is within 24 hours
    }
  
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  


  useEffect(() => {
    const startTiming = async () => {
      if (decodedId) {
        try {
          // Get the start_work_time token from EncryptedStorage
          const storedStartTime = await EncryptedStorage.getItem('start_work_time');
          console.log("stored Start",storedStartTime)
          let startTimeData = [];
  
          if (storedStartTime) {
      
            // Parse the stored start_work_time data (assuming it's an array of objects)
            startTimeData = JSON.parse(storedStartTime);
            
            // Find the object with matching encodedId
            const matchingEntry = startTimeData.find(entry => entry.encoded_id === encodedId);
  
            if (matchingEntry) {
              // If a matching entry is found, update the startTime state with worked_time
              console.log(matchingEntry.worked_time)
              await EncryptedStorage.removeItem('start_work_time');
              const time = matchingEntry.worked_time
              const convertedTime =  differenceTime(time)
              const [hh, mm, ss] = convertedTime.split(":");
              setHours(parseInt(hh));
              setMinutes(parseInt(mm));
              setSeconds(parseInt(ss));
              setStartTime(matchingEntry.convertedTime);
            
              return; // Exit early since start_work_time is already set
            }
          }
   
          // If no matching entry is found, call the backend BackendAPI to start timing
          const response = await axios.post(`${process.env.BackendAPI}/api/work/time/started`, {
            notification_id: decodedId,
          });
  
          const { worked_time } = response.data;
          console.log("work  ",worked_time)
          const convertedTime =  differenceTime(worked_time)
          const [hh, mm, ss] = convertedTime.split(":");
          setHours(parseInt(hh));
          setMinutes(parseInt(mm));
          setSeconds(parseInt(ss));
          // Add the new timing data to the start_work_time array
          startTimeData.push({ encoded_id: encodedId, worked_time });
  
          // Store the updated start_work_time array back in EncryptedStorage
          await EncryptedStorage.setItem('start_work_time', JSON.stringify(startTimeData));
  
          // Update the startTime state with the new worked_time
          setStartTime(worked_time);
  
          // console.log("Timing started:", response);
        } catch (error) {
          console.error("Error starting timing:", error);
        }
      }
    };
  
    startTiming();
  }, [decodedId]);
  


  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    if (seconds === 60) {
      setMinutes((prevMinutes) => prevMinutes + 1);
      setSeconds(0);
    }
    if (minutes === 60) {
      setHours((prevHours) => prevHours + 1);
      setMinutes(0);
    }
  }, [seconds, minutes]); 



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time Tracking</Text>
      </View>
      <View style={styles.timeBoxes}>
        <TimeBox label="Hours" value={hours} style={styles.timeValueText}/>
        <TimeBox label="Minutes" value={minutes} style={styles.timeValueText}/>
        <TimeBox label="Seconds" value={seconds} style={styles.timeValueText}/>
      </View>
      <View style={styles.chargeInfo}>
        <Text style={styles.mainText}>The minimum charge is 149₹</Text>
        <Text style={styles.subText}>Next Every half hour, you will be charged for 49₹</Text>
        <Text style={styles.subText}>The minimum charge is 30 minutes</Text>
      </View>
      <View style={styles.progressWrapper}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>Progress</Text>
          <Text style={styles.progressPercentage}>50%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBar} />
        </View>
      </View>
 
    </View>
  );
};

const TimeBox = ({ label, value }) => (
  <View style={styles.timeBox}>
    <Text style={styles.timeValue}>
      {value.toString().padStart(2, "0")}
    </Text>
    <Text style={styles.timeLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'#000'
  },
  timeBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    color:'#000'
  },
  timeBox: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
        color:'#000'
  },
  timeLabel: {
    fontSize: 18,
    color:'#000'
  },
  chargeInfo: {
    marginBottom: 20,
  },
  mainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'#000'
  },
  subText: {
    fontSize: 14,
    color:'#000'
  },
  progressWrapper: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color:'#000'
  },
  progressPercentage: {
    fontSize: 16,
    color:'#000'
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#ccc',
  },
  progressBar: {
    height: 10,
    width: '50%',
    backgroundColor: 'blue',
  },
  buttonContainer: {
    alignItems: 'center',
  },
});

export default TimingScreen;
