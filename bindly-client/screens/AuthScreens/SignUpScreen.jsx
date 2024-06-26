import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Modal, Alert, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import compressImage from "../../utils/compressImage";
import blobToBase64 from "../../utils/blobToBase64";
import placeholder from "../../assets/GroupIcon.png";
import camera from "../../assets/Camera.png";
import cameraIcon from "../../assets/cameraIcon.png";
import galleryIcon from "../../assets/galleryIcon.png";
import trashIcon from "../../assets/trashIcon.png";
import * as ImagePicker from 'expo-image-picker';
import { BASEROOT_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUpScreen = () => {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();
    const { email: email2, setEmail: setEmail2 } = useUserContext();
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(new Date());

    const toggleDatepicker = () => {
        setShow(!show);
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
            }
        } catch (error) {
            console.log(error);
        }
    };

    const removeImage = () => {
        setImageSrc(placeholder);
        setOpenModal(false);
    };

    const submit = async () => {
        if (loading) return; // Prevent double click
        setLoading(true);
        // if (!firstName.trim() || !lastName.trim()) {
        //     setErrorMessage("Please enter both your first and last name.");
        //     setLoading(false);
        //     return;
        // }

        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(email)) {
        //     setErrorMessage("Please enter a valid email address.");
        //     setLoading(false);
        //     return;
        // }

        // if (!password.trim()) {
        //     setErrorMessage("Please enter password.");
        //     setLoading(false);
        //     return;
        // }

        // if (password !== confirmPassword) {
        //     setErrorMessage("The passwords do not match.");
        //     setLoading(false);
        //     return;
        // }

        const today = new Date();
        const birthDate = new Date(date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

       


        if (age < 18) {
            setErrorMessage("You must be at least 18 years old to sign up.");
            setLoading(false);
            return;
        }

        let img = imageSrc;
        if (imageSrc == placeholder) {
            img = "";
        }

        let imgBase64 = "";
        if (img.uri) {
            const response = await fetch(img.uri);
            const blob = await response.blob();
            imgBase64 = await blobToBase64(blob);
        }

        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/auth/signUp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    email: email.toLowerCase(),
                    firstName: firstName,
                    lastName: lastName,
                    password: password,
                    pfp: imgBase64,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                setEmail2(email.toLowerCase());
                await AsyncStorage.setItem('userEmail', JSON.stringify(email.toLowerCase()));
                navigation.navigate('SignIn');
            } else {
                if (body.error) {
                    if (body.error.includes('duplicate key value violates unique constraint "users_pkey"')) {
                        setErrorMessage("Username already taken.");
                    } else if (body.error.includes("User already registered")) {
                        setErrorMessage("Email already taken.");
                    } else if (body.error.includes("at least 6 characters")) {
                        setErrorMessage("Password should be at least 6 characters");
                    }
                }
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const toSignIn = () => {
        navigation.navigate('SignIn');
    };

    const onChange = ({ type }, selectedDate) => {
        if (type == 'set') {
            const currentDate = selectedDate;
            setDate(currentDate);
        } else {
            toggleDatepicker();
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.logoContainer}>
                    <Text style={styles.title}>Sign Up</Text>
                </View>

                <View style={{ marginLeft: 'auto', marginRight: 'auto', position: 'relative', marginBottom: 20 }}>
                    <Image style={{ width: 180, height: 180, borderRadius: 8 }} source={imageSrc} />
                    <Pressable style={{ position: 'absolute', bottom: -15, right: -15, borderColor: 'black', borderWidth: 1, borderRadius: 40 }} onPress={() => setOpenModal(true)}>
                        <Image style={{ width: 50, height: 50, borderRadius: 10 }} source={camera} />
                    </Pressable>
                </View>

                <Modal visible={openModal} transparent={true} onRequestClose={() => setOpenModal(false)}>
                    <TouchableWithoutFeedback onPress={() => setOpenModal(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>User Photo</Text>
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

                <View style={styles.row}>
                    <View style={styles.halfInputContainer}>
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize='none'
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Jesse"
                        />
                    </View>
                    <View style={[styles.halfInputContainer, styles.inputPaddingLeft]}>
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize='none'
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Doe"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize='none'
                        value={email}
                        onChangeText={setEmail}
                        placeholder="hello@123.com"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize='none'
                        value={username}
                        onChangeText={setUsername}
                        placeholder="username"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize='none'
                        value={password}
                        onChangeText={setPassword}
                        placeholder="password"
                        secureTextEntry={true}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize='none'
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="password"
                        secureTextEntry={true}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Birthday</Text>
                    <Pressable onPress={toggleDatepicker} style={styles.datePressable}>
                        <Text>{date.toLocaleDateString()}</Text>
                    </Pressable>
                </View>

                {show && (
                    <View>
                        <DateTimePicker mode="date" display="spinner" value={date} onChange={onChange} style={{ height: 120 }} maximumDate={new Date()} />

                        <View style={styles.centeredRow}>
                            <Pressable style={styles.doneButton} onPress={toggleDatepicker}>
                                <Text style={styles.buttonText}>Done</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {!show && (
                    <View style={styles.centeredRow}>
                        <Pressable style={styles.signUpButton} onPress={submit} disabled={loading}>
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                        </Pressable>
                    </View>
                )}

                {errorMessage.length > 0 && (
                    <View style={styles.centeredRow}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Pressable onPress={toSignIn}>
                        <Text style={styles.linkText}>Already have an account?</Text>
                        <Text style={[styles.linkText, styles.bold]}> Sign in Here</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 16,
        alignItems: 'center',
    },
    title: {
        marginTop: 8,
        fontSize: 24,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    halfInputContainer: {
        width: '50%',
    },
    inputPaddingLeft: {
        paddingLeft: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        color: 'gray',
        marginBottom: 4,
    },
    input: {
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'dodgerblue',
    },
    datePressable: {
        height: 32,
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
    centeredRow: {
        alignItems: 'center',
        marginTop: 16,
    },
    doneButton: {
        backgroundColor: 'dodgerblue',
        padding: 8,
        width: 72,
        borderRadius: 4,
    },
    signUpButton: {
        backgroundColor: 'dodgerblue',
        padding: 8,
        width: 96,
        borderRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        color: 'dodgerblue',
        textAlign: 'center',
    },
    bold: {
        fontWeight: 'bold',
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
});

export default SignUpScreen;
