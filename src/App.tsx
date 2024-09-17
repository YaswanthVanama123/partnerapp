
import React, { useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import axios from 'axios';
import HomeScreen from './Screens/Home';
import MyServicesScreen from './Screens/MyServices';
import AccountScreen from './Screens/Account';
import Maps from './Screens/Maps';
import Login from './Components/Login';
import SkillRegistration from './Screens/MyServices';
import Profile from './Screens/Profile';
import WorkerAcceptance from './Components/Acceptance';
import EncryptedStorage from 'react-native-encrypted-storage';
import Navigation from './Screens/Navigation';
import WorkerNavigation from './Components/WorkerNavigation';
import TimingScreen from './Components/TimingScreen';
import OTPVerification from './Components/OtpVerification';
import PaymentScreen from './Components/PaymentScreen';
import WorkersLocation from './Screens/WorkerLocation';
import Notifications from './Components/Notifications';
import LoginAuth from './Screens/LoginAuth';
import TaskConfirmation from './Components/TaskConfirmation';
import LocationTracking from './Components/LocationTracking';
import HelloWorld from './Screens/HelloWorld'
import SplashScreen from 'react-native-splash-screen';
import Feather from 'react-native-vector-icons/Feather'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import ProfileScreen from './Screens/ProfileScreen';
import Bookings from './Screens/Bookings';
import SendSMS from './Screens/SendSMS';
import OtpScreen from './Screens/OtpSend';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
 
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
            return <Feather name={iconName} size={size} color={color} />;
          } else if (route.name === 'MyServices') {
            iconName = focused ? 'bookmark' : 'bookmark';
            return <Feather name={iconName} size={size} color={color} />;
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notification' : 'notification';
            return <Entypo name={iconName} size={size} color={color} />;
          } else if (route.name === 'Account') {
            iconName = focused ? 'account-outline' : 'account-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          }
          else if (route.name === 'LoginAuth') {
            iconName = focused ? 'app-registration' : 'app-registration';
            return <MaterialIcons name={iconName} size={size} color={color} />;
          }
          else if (route.name === 'Profile') {
            iconName = focused ? 'add-to-photos' : 'add-to-photos';
            return <MaterialIcons name={iconName} size={size} color={color} />;
          }

          // You can return any component that you like here!
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      {/* <Tab.Screen name="MyServices" component={MyServicesScreen} options={{ headerShown: false }} /> */}
      <Tab.Screen name="MyServices" component={Bookings} options={{ headerShown: false }} /> 
      <Tab.Screen name="Notification" component={Notifications} options={{ headerShown: false }} /> 
      {/* <Tab.Screen name="Account" component={AccountScreen} options={{ headerShown: false }} /> */}
      {/* <Tab.Screen name="Maps" component={Maps} options={{ headerShown: false }} /> */}
      {/* <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }} />*/}
      {/* <Tab.Screen name="LoginAuth" component={LoginAuth} options={{ headerShown: false }} />  */}
      {/* <Tab.Screen name="LoginAuth" component={SendSMS} options={{ headerShown: false }} />  */}
      <Tab.Screen name="LoginAuth" component={OtpScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Account" component={ProfileScreen} options={{ headerShown: false }} />

      {/* <Tab.Screen name="Tracking" component={LocationTracking} options={{ headerShown: false }} /> */}
      {/* <Tab.Screen name="Loc" component={HelloWorld} options={{ headerShown: false }} />   */}
      {/* <Tab.Screen name="Navigation" component={Navigation} options={{ headerShown: false }} /> */}
      {/* <Tab.Screen name="Wlocation" component={WorkersLocation} options={{ headerShown: false }} /> */}
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const navigationRef = useRef(null);
  const [fcm,setFcm] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          // Request multiple permissions, including background location
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, // Optional if you want to send notifications
          ]);
    
          // Check if each permission was granted
          if (
            granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.ACCESS_BACKGROUND_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('All location permissions granted');
          } else {
            console.log('Location permission denied');
          }
    
          if (granted['android.permission.POST_NOTIFICATIONS'] === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission granted');
          } else {
            console.log('Notification permission denied');
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };
    const requesBackgroundtLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
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
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    }


    async function requestNotificationPermission() {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Notification Permission",
          message:
            "This app needs access to your notifications " +
            "so you can receive important updates.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the notifications");
      } else {
        console.log("Notification permission denied");
      }
    }

    const getTokens = async () => {
      try {
        const token = await messaging().getToken();
        console.log("work",token)
        setFcm(token)
        // Store or update the FCM token in encrypted storage
        await EncryptedStorage.setItem('fcm_token', token);

        // Retrieve pcs_token from storage
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        
        // Send the token to the backend
        
        await axios.post(`${process.env.BackendAPI}/api/worker/store-fcm-token`, 
          { fcmToken: token },
          { headers: { Authorization: `Bearer ${pcs_token}` } }
        );

      } catch (error) {
        console.error('Error storing FCM token in the backend:', error);
      }
    };

    requestUserPermission();
    getTokens();
    requestNotificationPermission();

    // Create notification channel
    PushNotification.createChannel(
      { 
        channelId: "default-channel-id", 
        channelName: "Default Channel", 
        channelDescription: "A default channel", 
        soundName: "default", 
        importance: 4, 
        vibrate: true, 
      },
      (created) => console.log(`createChannel returned '${created}'`) 
    );

    const storeNotificationInBackend = async (notification, fcm) => {
      try {
        const pcs_token = await EncryptedStorage.getItem('pcs_token');
        const fcmToken = await EncryptedStorage.getItem('fcm_token');
        await axios.post(
          `${process.env.BackendAPI}/api/worker/store-notification`, 
          { notification, fcmToken }, // data object
          { headers: { Authorization: `Bearer ${pcs_token}` } } // configuration with headers
        );
    
        console.log('Notification stored in backend:', notification);
      } catch (error) {
        console.error('Failed to store notification in backend:', error);
      }
    };
    
     
    const storeNotificationLocally = async (notification) => {
      console.log("stored in locally is it true",notification)
      try {
        const existingNotifications = await EncryptedStorage.getItem('notifications');
        let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    
        notifications.push(notification);
    
        await EncryptedStorage.setItem('notifications', JSON.stringify(notifications));
        console.log('Notification stored locally:', notification);
    
        // Also store in backend
        storeNotificationInBackend(notification);
      } catch (error) {
        console.error('Failed to store notification locally:', error);
      }
    };
    



    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

      const notification = {
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
        userNotificationId: remoteMessage.data.user_notification_id, // Include the user_notification_id
        receivedAt: new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()),
      };
      
  
      storeNotificationLocally(notification);
  
      PushNotification.localNotification({
        autoCancel: false, // Prevent auto cancel
        ongoing: true,
        channelId: "default-channel-id", 
        title: remoteMessage.notification.title, 
        message: remoteMessage.notification.body, 
        playSound: true, 
        soundName: 'default', 
        data: remoteMessage.data, 
        userInfo: remoteMessage.data, 
        actions: ["Dismiss"], // Add a dismiss action button
      });
    });
    
    PushNotification.configure({
      onNotification: function(notification) {
        const userNotificationId = notification.data.user_notification_id;
        const route = notification.data.route;
        if (notification.action === "Dismiss") {
          // Handle the dismiss action, remove the notification
          console.log("hi")
          PushNotification.cancelLocalNotifications({ id: notification.id });
        } else if (notification.userInteraction) {
          // Handle the user interaction (tap on the notification)
          console.log("User notification ID from foreground state:", userNotificationId);
          if (userNotificationId && navigationRef.current) {
            navigationRef.current.dispatch(
              CommonActions.navigate(route, { encodedId : userNotificationId })
            );
          }
        }
      },
      actions: ["Dismiss"], // Add a dismiss action button
    });
    

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', JSON.stringify(remoteMessage));
      const notification = {
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
        userNotificationId: remoteMessage.data.user_notification_id, // Include the user_notification_id
        receivedAt: new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()),
      };
      storeNotificationLocally(notification);
    });

    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', JSON.stringify(remoteMessage));
      const userNotificationId = remoteMessage.data.user_notification_id;
      const route = remoteMessage.data.route;
      console.log("User notification ID from background state:", userNotificationId);
      if (userNotificationId && navigationRef.current) {
        navigationRef.current.dispatch(
          CommonActions.navigate(route, { userNotificationId })
        );
      }
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', JSON.stringify(remoteMessage));
        const notification = {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          data: remoteMessage.data,
          userNotificationId: remoteMessage.data.user_notification_id, // Include the user_notification_id
          receivedAt: new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(new Date()),
        };
        storeNotificationLocally(notification);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);

  useEffect(() =>{
    SplashScreen.hide()
  },[])


  return (
    <NavigationContainer ref={navigationRef}>
      <HelloWorld />

      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="SkillRegistration" component={SkillRegistration} options={{ title: 'SkillRegistration', headerShown: false }} />
        <Stack.Screen name="Acceptance" component={WorkerAcceptance} options={{ title: 'Acceptance' }} />
        <Stack.Screen name='WorkerNavigation' component={WorkerNavigation} options={{title: 'WorkerNavigation'}} />
        <Stack.Screen name='TimingScreen' component={TimingScreen} options={{ title: 'TimingScreen' }} />
        <Stack.Screen name='OtpVerification' component={OTPVerification} options={{ title: 'OtpVerification'}} />
        <Stack.Screen name='PaymentScreen' component={PaymentScreen} options={{title: 'PaymentScreen'}} />
        <Stack.Screen name='TaskConfirmation' component={TaskConfirmation} options={{title: 'TaskConfirmation'}} />
        <Stack.Screen name='Profile' component={Profile} options={{title: 'Profile'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
