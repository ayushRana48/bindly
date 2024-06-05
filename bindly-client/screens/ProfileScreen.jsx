import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, Modal, Alert, TouchableWithoutFeedback } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../UserContext";
import placeholder from "../assets/GroupIcon.png"
import camera from "../assets/Camera.png"
import cameraIcon from "../assets/cameraIcon.png"
import galleryIcon from "../assets/galleryIcon.png"
import trashIcon from "../assets/trashIcon.png"
import * as ImagePicker from 'expo-image-picker';
import compressImage from "../utils/compressImage";
import blobToBase64 from "../utils/blobToBase64";
import { BASE_URL } from "@env";

const ProfileScreen = () => {

    const { email, user, setEmail } = useUserContext();
    const [imageSrc, setImageSrc] = useState(placeholder)
    const [openModal, setOpenModal] = useState(false)


    useEffect(() => {
        if (user.pfp) {
            setImageSrc({ uri: user.pfp })
        }
    }, [user])


    const navigation = useNavigation();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const compressedUri = await compressImage(result.assets[0].uri);
            setImageSrc({ uri: compressedUri });
            setOpenModal(false);
            submitPicture(compressedUri);
        }
    };

    const takeImage = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
            let result = await ImagePicker.launchCameraAsync({
                cameraType: ImagePicker.CameraType.front,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const compressedUri = await compressImage(result.assets[0].uri);
                setImageSrc({ uri: compressedUri });
                setOpenModal(false);
                submitPicture(compressedUri);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const removeImage = () => {
        setImageSrc(placeholder);
        setOpenModal(false);
        submitPicture("");
    };

    const submitPicture = async (uri) => {
        let imgBase64 = "";
        if (uri) {
            const response = await fetch(uri);
            const blob = await response.blob();
            imgBase64 = await blobToBase64(blob);
        }


        fetch(`${BASE_URL}/bindly/users/updateUser/${user.username}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pfp: imgBase64,
                lastpfpupdate: user.timestamp
            }),
        })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(async ({ status, body }) => {
                if (status === 200) {
                    // Handle the success scenario
                } else {
                    // Handle different error messages from the server
                }
            })
            .catch(error => {
                console.log(error);
                Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
            });
    };

    const getUser = async () => {
        try {
            const response = await fetch(`${BASE_URL}/bindly/auth/getUser`, {
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            if (response.status === 200) {
            } else if (data.error) {
                console.log('Error received:', data.error);
            }
        } catch (error) {
            console.error('Network or server error:', error);
        }
    }

    const logOut = async () => {
        try {
            const response = await fetch(`${BASE_URL}/bindly/auth/signOut`, {
                headers: { 'Content-Type': 'application/json' },
                method: "POST",
                headers: { 'Content-Type': 'application/json' },

            });
            const data = await response.json();

            if (response.status === 200) {
                setEmail(null)
            } else if (data.error) {
                console.log('Error received:', data.error);
            }
        } catch (error) {
            console.error('Network or server error:', error);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require("../assets/logo.png")}
                    style={styles.logo}
                />
            </View>

            <View style={{ marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
                <Image style={{ width: 80, height: 80, borderRadius: 8 }} source={imageSrc}>
                </Image>
                <Pressable style={{ position: 'absolute', bottom: -15, right: -15, borderColor: 'black', borderWidth: 1, borderRadius: 20 }} onPress={() => setOpenModal(true)}>
                    <Image style={{ width: 40, height: 40, borderRadius: 8 }} source={camera} />
                </Pressable>
            </View>

            <Modal visible={openModal} transparent={true} onRequestClose={() => setOpenModal(false)}>
                <TouchableWithoutFeedback onPress={() => setOpenModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Group Photo</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
                                    <Pressable style={styles.modalButton} onPress={takeImage}>
                                        <Image style={{ width: 40, height: 40, marginBottom: 5 }} source={cameraIcon} />
                                        <Text>Camera</Text>
                                    </Pressable>
                                    <Pressable style={styles.modalButton} onPress={pickImage}>
                                        <Image style={{ width: 40, height: 40, marginBottom: 5 }} source={galleryIcon} />
                                        <Text >Gallery</Text>
                                    </Pressable>
                                    <Pressable style={styles.modalButton} onPress={removeImage}>
                                        <Image style={{ width: 40, height: 40, marginBottom: 5 }} source={trashIcon} />
                                        <Text >Remove</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Text style={styles.ProfileText}>Profile!</Text>
            <Pressable style={styles.pressableButton} onPress={getUser}>
                <Text>Get User</Text>
            </Pressable>

            <Pressable style={styles.pressableButton} onPress={logOut}>
                <Text>Log Out</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        marginTop: -50,
        flex: 1,
        alignItems: 'center', // To centrally align the content
        justifyContent: 'center', // To centrally align the content vertically
        backgroundColor: 'white'
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: 'center', // This centers the image horizontally
    },
    logo: {
        width: 60,
        height: 60,
    },
    ProfileText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center', // Centers the text horizontally
    },
    pressableButton: {
        marginTop: 16,
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 350,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        margin: 'auto',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        paddingTop: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
        width: 80,
        height: 80
    },
    modalButtonText: {
        fontSize: 16,
        color: '#333',
    },
    cancel: {
        position: 'absolute',
        top: 50,
        left: 30
    },
});

export default ProfileScreen;
