import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, Modal, Alert, TouchableWithoutFeedback, ScrollView, RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import placeholder from "../../assets/profile.png";
import camera from "../../assets/Camera.png";
import cameraIcon from "../../assets/cameraIcon.png";
import galleryIcon from "../../assets/galleryIcon.png";
import trashIcon from "../../assets/trashIcon.png";
import wallet from "../../assets/wallet.png";
import * as ImagePicker from 'expo-image-picker';
import compressImage from "../../utils/compressImage";
import blobToBase64 from "../../utils/blobToBase64";
import { BASEROOT_URL } from "@env";

const ProfileScreen = () => {

    const { email, user, setEmail, setUser } = useUserContext();
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [openModal, setOpenModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user && user.pfp) {
            setImageSrc({ uri: user.pfp });
        }
    }, [user]);

    const navigation = useNavigation();


    const toWallet = () => {
          navigation.navigate("Wallet");
        
      };

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

        fetch(`${BASEROOT_URL}/bindly/users/updateUser/${user.username}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pfp: imgBase64,
                lastpfpupdate: user.timestamp,
            }),
        })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(async ({ status, body }) => {
                if (status === 200) {
                    setUser({ ...user, pfp: uri });
                } else {
                    Alert.alert("Error", "Failed to update profile picture.");
                }
            })
            .catch(error => {
                console.log(error);
                Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
            });
    };

    const getUser = async () => {
        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/users/email/${email}`, {
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            console.log(data, 'user')

            if (response.status === 200) {
                setUser(data);
            } else if (data.error) {
                console.log('Error received:', data.error);
            }
        } catch (error) {
            console.error('Network or server error:', error);
        }
    };

    const logOut = async () => {
        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/auth/signOut`, {
                headers: { 'Content-Type': 'application/json' },
                method: "POST",
            });
            const data = await response.json();

            if (response.status === 200) {
                setEmail(null);
            } else if (data.error) {
                console.log('Error received:', data.error);
            }
        } catch (error) {
            console.error('Network or server error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await getUser();
        setRefreshing(false);
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.logoContainer}>
                <Image source={require("../../assets/logo.png")} style={styles.logo} />
            </View>

            <View style={{ marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
                <Image style={{ width: 80, height: 80, borderRadius: 8 }} source={imageSrc} />
                <Pressable style={{ position: 'absolute', bottom: -15, right: -15, borderColor: 'black', borderWidth: 1, borderRadius: 20 }} onPress={() => setOpenModal(true)}>
                    <Image style={{ width: 40, height: 40, borderRadius: 8 }} source={camera} />
                </Pressable>
            </View>

                <Pressable style={styles.wallet} onPress={toWallet}>
                    <Image resizeMode="contain"  style={{width:40, height:30, margin:'auto'}} source={wallet} />
                </Pressable>
            

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
                                        <Text>Gallery</Text>
                                    </Pressable>
                                    <Pressable style={styles.modalButton} onPress={removeImage}>
                                        <Image style={{ width: 40, height: 40, marginBottom: 5 }} source={trashIcon} />
                                        <Text>Remove</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Text style={styles.ProfileText}>Profile: {user.username}</Text>
            <Text style={{ fontSize: 20, marginBottom:60 }}>Balance: {user?.balance}</Text>
            {/* <Pressable style={styles.pressableButton} onPress={getUser}>
                <Text>Get User</Text>
            </Pressable> */}

            <Pressable style={styles.pressableButton} onPress={logOut}>
                <Text>Log Out</Text>
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        marginTop: -50,
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
    },
    ProfileText: {
        marginTop: 30,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
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
        height: 80,
    },
    modalButtonText: {
        fontSize: 16,
        color: '#333',
    },
    cancel: {
        position: 'absolute',
        top: 50,
        left: 30,
    },
    wallet: {
        position: 'absolute',
        top: 90,
        right: 20,
        zIndex: 10,
        width:50,
        height:50
      },
});

export default ProfileScreen;