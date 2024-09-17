import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import EncryptedStorage from "react-native-encrypted-storage";

const OTPVerification = ({ route }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const { encodedId } = route.params; // Get encodedId from route params
  const navigation = useNavigation();
  const [decodedId, setDecodedId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (encodedId) {
      const decoded = atob(encodedId); // Decode the encoded ID
      setDecodedId(decoded);
    }
  }, [encodedId]);

  const handleChange = (text, index) => {
    if (/^[0-9]$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text !== "" && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const checkCancellationStatus = async () => {
    try {
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
      const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
          
      // Send data to the backend
      await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
        encodedId: '',
        screen: ''
      }, {
        headers: {
          Authorization: `Bearer ${pcs_token}`
        }
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

  const handleKeyDown = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    if (decodedId) {
      const intervalId = setInterval(checkCancellationStatus, 3000); // Check every 3 seconds
      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [decodedId]);

  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");

    try {
      const jwtToken = await EncryptedStorage.getItem("pcs_token");
      const response = await axios.post(
        `${process.env.BackendAPI}/api/pin/verification`,
        {
          notification_id: decodedId,
          otp: enteredOtp,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const {timeResult} = response.data

      if (response.status === 200) {
        const pcs_token = await EncryptedStorage.getItem('pcs_token'); 
        await EncryptedStorage.setItem('start_time', timeResult);

        // Send data to the backend
        await axios.post(`${process.env.BackendAPI}/api/worker/action`, {
          encodedId: encodedId,
          screen: 'TimingScreen'
        }, {
          headers: {
            Authorization: `Bearer ${pcs_token}`
          }
        });
        Alert.alert("Success", "OTP is correct");
        
        navigation.navigate("TimingScreen", { encodedId: encodedId });
      } else if(response.status === 205){
        Alert.alert("User Cancelled the service")
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
          })
        );
      }
      
      else {
        setError("OTP is incorrect");
        Alert.alert("Error", "OTP is incorrect");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("OTP is incorrect");
      Alert.alert("Error", "OTP is incorrect");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyDown(e, index)}
            maxLength={1}
            keyboardType="numeric"
            ref={(el) => (inputRefs.current[index] = el)}
          />
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  otpInput: {
    width: 40,
    height: 40,
    textAlign: "center",
    fontSize: 18,
    borderBottomWidth: 2,
    borderColor: "#ddd",
    marginHorizontal: 5,
    color:'#000'
  },
  error: {
    color: "red",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
