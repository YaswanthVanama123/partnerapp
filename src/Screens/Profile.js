// Profile.js

import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

const Profile = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [workerName, setWorkerName] = useState(null);
  const [service, setService] = useState(null);
  const [subService, setSubService] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(process.env.BACKEND_API)
        const token = await EncryptedStorage.getItem('pcs_token');
        const response = await axios.post(
          `${process.env.BackendAPI}/api/profile`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const { profileDetails, averageRating } = response.data;
        const { created_at, worker_name, profile, service, subservices } = profileDetails[0];
        setCreatedAt(created_at);
        setWorkerName(worker_name);
        setProfileImage(profile);
        setService(service);
        setSubService(subservices);
        setAverageRating(parseFloat(averageRating).toFixed(1));
        const feedbackData = profileDetails.map(item => ({
          text: item.comment,
          rating: item.rating,
          customer: item.feedback_name
        }));
        setFeedback(feedbackData);

      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  const getDaysFromCreatedAt = (createdAt) => {
    const createdAtDate = moment(createdAt);
    const today = moment();
    const days = today.diff(createdAtDate, 'days');
    return days;
  };

  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };


  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5 ? '★' : '';
    const emptyStars = '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
    return '★'.repeat(fullStars) + halfStar + emptyStars;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>ClickSolver</Text>
      </View>
      <View style={styles.profileBodyContainer}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: profileImage }} style={styles.profilePicture} />
          <View style={styles.profileDetails}>
            <Text style={styles.workerName}>{workerName}</Text>
            <Text style={styles.profession}>{service}</Text>
          </View>
        </View>
        <View style={styles.about}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.profileAbout}>
            We extend our heartfelt appreciation to {workerName}, a skilled and dedicated {service} with expertise in
            {subService.join(', ')} with over {getDaysFromCreatedAt(createdAt)} days
            of industry experience. Your attention to detail, efficiency, and friendly customer service have
            earned you a reputation for delivering high-quality services to our clients.
          </Text>
        </View>
        <View style={styles.completedJobs}>
          <Text style={styles.jobsTitle}>My Jobs</Text>
          {subService.map((job, index) => (
            <View key={index} style={styles.jobItem}>
              <Text style={styles.jobIcon}>🔧</Text>
              <View style={styles.jobDetail}>
                <Text style={styles.appName}>{job}</Text>
                <Text style={styles.appName}>{formatCreatedAt(createdAt)}</Text>
              </View>
              <Text style={styles.jobRating}>★★★★★</Text>
            </View>
          ))}
        </View>
        <View style={styles.ratingsReviews}>
          <Text style={styles.ratingsTitle}>Ratings & Reviews</Text>
          <Text style={styles.appName}>{averageRating} </Text>
          <Text style={styles.appName}>{renderStars(averageRating)}</Text>
          {feedback.length > 0 ? (
            feedback.map((review, index) => (
              <View style={styles.review} key={index}>
                <Text style={styles.appName}><Text style={styles.reviewCustomer}>{review.customer}</Text> {renderStars(review.rating)}</Text>
                <Text style={styles.appName}>{review.text}</Text>
              </View>
            ))
          ) : (
            <Text>No reviews yet.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  appName: {
    color: '#000'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  profileIcon: {
    fontSize: 24
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 4
  },
  profileBodyContainer: {
    padding: 16
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16
  },
  profileDetails: {
    flex: 1
  },
  workerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'#000'
  },
  profession: {
    fontSize: 18,
    color: '#888'
  },
  about: {
    marginVertical: 16
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  profileAbout: {
    fontSize: 16,
    marginTop: 8,
    color:'#000'
  },
  completedJobs: {
    marginVertical: 16
  },
  jobsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'#000'
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  jobIcon: {
    fontSize: 20,
    marginRight: 8
  },
  jobDetail: {
    flex: 1
  },
  jobRating: {
    fontSize: 20,
    color:'#000'
  },
  ratingsReviews: {
    marginVertical: 16
  },
  ratingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'#000'
  },
  review: {
    marginBottom: 12,
    color:'#000'
  },
  reviewCustomer: {
    fontWeight: 'bold',
    color:'#000'
  }
});

export default Profile;
