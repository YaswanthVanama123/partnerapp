import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, StyleSheet } from 'react-native';
import { useNavigation,CommonActions } from '@react-navigation/native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';

const SkillRegistration = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [proofPic, setProofPic] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [subService, setSubService] = useState([]);
    const [agree, setAgree] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false); 
    const navigation = useNavigation();
    const [selectedSubServices, setSelectedSubServices] = useState([]);

    useEffect(() => {
        fetchServices();
        checkRegistrationStatus();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${process.env.BackendAPI}/api/servicecategories`);
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const displayImage = async (setImage) => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.error('ImagePicker Error: ', response.error);
            } else {
                const uri = response.assets[0].uri;
                try {
                    const imageUrl = await uploadImage(uri);
                    setImage(imageUrl);
                } catch (error) {
                    console.error("Error uploading image:", error);
                }
            }
        });
    };

    const checkRegistrationStatus = async () => {
        const jwtToken = await EncryptedStorage.getItem('pcs_token');
        if (jwtToken) {
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
                if (response.status === 200) {
                    navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: 'Tabs', state: { routes: [{ name: 'Home' }] } }],
                        })
                      );
                }
            } catch (error) {
                console.error('There was an error fetching the data!', error);
            }
        }
    };

    const uploadImage = async (uri) => {
        const apiKey = "287b4ba48139a6a59e75b5a8266bbea2"; // Replace with your ImgBB API key
        const apiUrl = "https://api.imgbb.com/1/upload";

        const formData = new FormData();
        formData.append("key", apiKey);
        formData.append("image", {
            uri,
            type: 'image/jpeg',
            name: 'photo.jpg',
        });

        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to upload image.");
        }

        const data = await response.json();
        return data.data.url;
    };

    const handleServiceChange = async (selected) => {
        setSelectedService(selected);

        try {
            const response = await axios.post(`${process.env.BackendAPI}/api/subservice/checkboxes`, { selectedService: selected });
            setSubService(response.data);
        } catch (error) {
            console.error('Error fetching subservices:', error);
        }
    };

    const handleCheckboxChange = (subServiceName) => {
        setSelectedSubServices((prevSelected) => {
            if (prevSelected.includes(subServiceName)) {
                // If the item is already selected, remove it
                return prevSelected.filter(name => name !== subServiceName);
            } else {
                // Otherwise, add the item to the selected list
                return [...prevSelected, subServiceName];
            }
        });
    };
    

    const handleSubmit = async () => {
        const checkedServices = subService.filter(sub => document.getElementById(sub.service_name)?.checked).map(sub => sub.service_name);

        const data = {
            selectedService,
            checkedServices,
            profilePic,
            proofPic,
            agree
        };

        const jwtToken = await EncryptedStorage.getItem('pcs_token');
        try {
            const response = await axios.post(`${process.env.BackendAPI}/api/worker/skill/registration/filled`, data, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            console.log('Submission response:', response.data);
            // Handle successful submission
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = async () => {
        await EncryptedStorage
        .removeItem('pcs_token');
        navigation.navigate('Login');
    };

    return (
      <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
              <View style={styles.navbar}>
                  <View style={styles.navbarLeft}>
                      <Text style={styles.title}>Click Solver</Text>
                  </View>
              </View>
          </View>
          <View style={styles.skillRegistrationContainer}>
              <Text style={styles.skillHead1}>Register as a Click Solver Worker</Text>
              <Text style={styles.skillPara}>Fill out the form to become a service provider with Click Solver.</Text>
              
              <View style={styles.personalInfo}>
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                  <View style={styles.flexDirection}>
                      <View style={styles.profileContainer}>
                          <TouchableOpacity style={styles.profilePic} onPress={() => displayImage(setProfilePic)}>
                              {profilePic && <Image source={{ uri: profilePic }} style={styles.image} />}
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.customFileInput} onPress={() => displayImage(setProfilePic)}>
                              <Text style={styles.skillPara}>Choose Profile Picture</Text>
                          </TouchableOpacity>
                      </View>
                      <View style={styles.profileContainer}>
                          <TouchableOpacity style={styles.proofPic} onPress={() => displayImage(setProofPic)}>
                              {proofPic && <Image source={{ uri: proofPic }} style={styles.image} />}
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.customFileInput} onPress={() => displayImage(setProofPic)}>
                              <Text style={styles.skillPara}>Choose Proof Picture</Text>
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>

              <View style={styles.categoryRegistration}>
                  <Text style={styles.sectionTitle}>Skill Registration</Text>
                  <View style={styles.formGroup}>
                      <Text style={styles.skillPara}>Select Service Category</Text>
                      <Picker
                            style={styles.skillPicker}
                          selectedValue={selectedService}
                          onValueChange={(itemValue) => handleServiceChange(itemValue)}
                      >
                          <Picker.Item label="Select a category" value="" />
                          {services.map((service) => (
                              <Picker.Item key={service.service_id} label={service.service_name} value={service.service_name} />
                          ))}
                      </Picker>
                  </View>
              </View>

              <View style={styles.skillRegistration}>
                  <Text style={styles.sectionTitle}>Category Registration</Text>
                  <View style={styles.formGroupCheck}>
                  {subService.map((sub) => (
                    <View key={sub.service_id} style={styles.checkboxContainer}>
                        <CheckBox
                            value={selectedSubServices.includes(sub.service_name)}
                            onValueChange={() => handleCheckboxChange(sub.service_name)}
                            style={styles.checkBoxes}
                        />
                        <Text style={styles.skillPara}>{sub.service_name}</Text>
                    </View>
                  ))}
                  </View>
                  <TouchableOpacity style={styles.addSkillButton}>
                      <Text>+ Add New Skill</Text>
                  </TouchableOpacity>
              </View>

              <View style={styles.termsConditions}>
                  <CheckBox
                      value={agree}
                      onValueChange={() => setAgree(!agree)}
                  />
                  <Text>
                      I agree to the Click Solver <Text style={styles.link}>Terms and Conditions</Text>
                  </Text>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
          </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    skillPara:{
        color:'#000'
    },
    checkBoxes:{
        borderWidth: 1,
        borderColor:'#000',
    },
    skillPicker:{
        borderColor:'#000',
        color:'#000'
    },
    header: {
        marginBottom: 20,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navbarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color:'#000'
    },
    profileIcon: {
        padding: 10,
    },
    profileIconText: {
        fontSize: 16,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    skillRegistrationContainer: {
        marginBottom: 20,
    },
    skillHead1: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color:'#000'
    },
    personalInfo: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color:'#000'
    },
    flexDirection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profileContainer: {
        alignItems: 'center',
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    proofPic: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    customFileInput: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    categoryRegistration: {
        marginBottom: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    formGroupCheck: {
        marginBottom: 20,
        color:'#000'
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        color:'#000'
    },
    addSkillButton: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        alignItems: 'center',
    },
    termsConditions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    link: {
        color: 'blue',
    },
    submitButton: {
        padding: 10,
        backgroundColor: '#000',
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default SkillRegistration;
