import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert, Modal, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView,Keyboard, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import { useGroupsContext } from "../GroupsContext";
import placeholder from "../../assets/GroupIcon.png"
import camera from "../../assets/Camera.png"
import cameraIcon from "../../assets/cameraIcon.png"
import galleryIcon from "../../assets/galleryIcon.png"
import trashIcon from "../../assets/trashIcon.png"
import * as ImagePicker from 'expo-image-picker';
import compressImage from "../../utils/compressImage";
import blobToBase64 from "../../utils/blobToBase64";

const NewGroupScreen = () => {

    const today = new Date();

    // Create a new Date object for tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatLocalDate = (date) => {
        return date.toLocaleDateString();
    };

    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(tomorrow);
    const [numWeeks, setNumWeeks] = useState(0);
    const [buyIn, setBuyIn] = useState(0);
    const [taskPerWeek, setTaskPerWeek] = useState(0);
    const [show, setShow] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [imageSrc, setImageSrc] = useState(placeholder)
    const [openModal, setOpenModal] = useState(false)

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
            setOpenModal(false)
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
                setOpenModal(false)
            }
        } catch (error) {
            console.log(error)
        }
    };

    const removeImage = () => {
        setImageSrc(placeholder)
        setOpenModal(false)
    }

    const navigation = useNavigation();

    const { user } = useUserContext();
    const { setGroups, setGroupData } = useGroupsContext();

    const cancel = () => {
        navigation.navigate("GroupsList")
    }

    const toggleDatepicker = () => {
        setShow(!show)
    }

    const submit = async () => {

        // Validate Names
        if (!groupName.trim()) {
            setErrorMessage("Enter Group Name");
            return;
        }

        // Validate Passwords
        if (!description.trim()) {
            setErrorMessage("Please enter description.");
            return;
        }

        if (!startDate) {
            setErrorMessage("Please enter start date.");
            return;
        }

        if (!numWeeks) {
            setErrorMessage("Please enter number of weeks.");
            return;
        }

        if (!buyIn) {
            setErrorMessage("Please enter buy in");
            return;
        }

        if (!taskPerWeek) {
            setErrorMessage("Please enter number of tasks per week");
            return;
        }

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + numWeeks * 7);

        let img = imageSrc;
        if (imageSrc === placeholder) {
            img = "";
        }

        let imgBase64 = "";

        if (img.uri) {
            try {
                const compressedUri = await compressImage(img.uri);
                const response = await fetch(compressedUri);
                const blob = await response.blob();
                imgBase64 = await blobToBase64(blob);
            } catch (error) {
                console.log("Error compressing or converting image: ", error);
                setErrorMessage("Error processing image. Please try again.");
                return;
            }
        }

        // Convert dates to UTC
        const startDateUTC = new Date(startDate).toISOString();
        const endDateUTC = endDate.toISOString();

        try {
            const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/group/createGroup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupname: groupName,
                    description: description,
                    buyin: buyIn,
                    startdate: startDateUTC,
                    enddate: endDateUTC,
                    hostId: user.username,
                    image: imgBase64,
                    tasksperweek: taskPerWeek
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                setGroups(g => [...g, body]);
                setGroupData({ group: body, usergroup: user, invite: [], post: [], history: [] });
                navigation.navigate("Group", { groupData: body });
            } else {
                console.error(body.error || "An error occurred. Please try again.");
                setErrorMessage(body.error || "An error occurred. Please try again.");
            }
        } catch (error) {
            console.log("Fetch error: ", error);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        }
    };

    const onChange = ({ type }, selectedDate) => {
        if (type == 'set') {
            const currentDate = selectedDate;
            setStartDate(currentDate);
        } else {
            toggleDatepicker();
        }
    }

    return  (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <Pressable style={styles.cancel} onPress={cancel}>
                            <Text style={{ color: "red" }}>cancel</Text>
                        </Pressable>
                        <View style={styles.logoContainer}>
                            <Text style={styles.title}>Create Group</Text>
                        </View>

                        <View style={{ marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
                            <Image style={{ width: 80, height: 80, borderRadius: 8 }} source={imageSrc} />
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

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Group Name</Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize='none'
                                value={groupName}
                                onChangeText={setGroupName}
                                placeholder="group name"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize='none'
                                value={description}
                                onChangeText={setDescription}
                                placeholder="description"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Start Date</Text>
                            <Pressable onPress={toggleDatepicker} style={styles.datePressable}>
                                <Text>{formatLocalDate(startDate)}</Text>
                            </Pressable>
                        </View>

                        {show && (
                            <View>
                                <DateTimePicker mode="date" display="spinner" value={startDate} onChange={onChange} style={{ height: 120 }} minimumDate={tomorrow} />
                                <View style={styles.centeredRow}>
                                    <Pressable style={styles.doneButton} onPress={toggleDatepicker}>
                                        <Text style={styles.buttonText}>Done</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Weeks</Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize='none'
                                value={numWeeks}
                                onChangeText={text => setNumWeeks(text.replace(/[^0-9]/g, ''))}
                                placeholder="5"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Buy In</Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize='none'
                                value={buyIn}
                                onChangeText={text => setBuyIn(text.replace(/[^0-9]/g, ''))}
                                placeholder="202"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Tasks Per Week</Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize='none'
                                value={taskPerWeek}
                                onChangeText={text => setTaskPerWeek(text.replace(/[^0-9]/g, ''))}
                                placeholder="5"
                                keyboardType="numeric"
                            />
                        </View>

                        {!show && (
                            <View style={styles.centeredRow}>
                                <Pressable style={styles.signUpButton} onPress={submit}>
                                    <Text style={styles.buttonText}>Create</Text>
                                </Pressable>
                            </View>
                        )}

                        {errorMessage.length > 0 && (
                            <View style={styles.centeredRow}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                            //d
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 24,
        flexGrow: 1,
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
        height: 80,
    },
    cancel: {
        position: 'absolute',
        top: 30,
        left: 10,
        height:40,
        width:50,
        zIndex:10,
    justifyContent:'center',
    alignItems:'center'
    },
    logoContainer: {
        marginTop: 36,
        marginBottom: 36,
        alignItems: 'center',
    },
    title: {
        marginTop: 8,
        fontSize: 24,
        fontWeight: 'bold',
    },
    label: {
        color: 'gray',
        marginBottom: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        padding: 8,
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
});

export default NewGroupScreen;
