import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert, Modal, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Keyboard, Platform, ActivityIndicator } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
//@ts-ignore    
import placeholder from "../../../assets/GroupIcon.png";
//@ts-ignore
import camera from "../../../assets/Camera.png";

import compressImage from "../../../utils/compressImage";
import blobToBase64 from "../../../utils/blobToBase64";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, User, Group } from "../../../types";
import ImagePickerModal from "./components/ImagePickerModal";
import GroupForm from "./components/GroupForm";
import { checkToken } from "../../../utils/checkToken";

const NewGroupScreen = () => {
    const today = new Date();

    // Create a new Date object for tomorrow and add 30 minutes
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(tomorrow.getMinutes() + 30);

    const formatLocalDateTime = (date: Date) => {
        return date.toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const [groupName, setGroupName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [startDate, setStartDate] = useState<Date>(tomorrow);
    const [numWeeks, setNumWeeks] = useState<number>(1);
    const [buyIn, setBuyIn] = useState<number>(0);
    const [taskPerWeek, setTaskPerWeek] = useState<number>(1);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [imageSrc, setImageSrc] = useState<{ uri: string } | typeof placeholder>(placeholder);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);



    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const { user, setUser } = useUserContext();
    const { setGroups, setGroupData } = useGroupsContext();

    const cancel = () => {
        navigation.navigate("GroupsList");
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };


    const submit = async () => {
        if (loading) return; // Prevent double click
        setLoading(true);

        // Validate inputs
        if (!groupName.trim()) {
            setErrorMessage("Enter Group Name");
            setLoading(false);
            return;
        }

        if (!description.trim()) {
            setErrorMessage("Please enter description.");
            setLoading(false);
            return;
        }

        if (!startDate) {
            setErrorMessage("Please enter start date.");
            setLoading(false);
            return;
        }

        if (!numWeeks) {
            setErrorMessage("Please enter number of weeks.");
            setLoading(false);
            return;
        }

        if (buyIn < 0 || isNaN(buyIn)) {
            setErrorMessage("Buy-in must be a positive number or zero.");
            setLoading(false);
            return;
        }
        

        if (!taskPerWeek) {
            setErrorMessage("Please enter number of tasks per week");
            setLoading(false);
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
                setLoading(false);
                return;
            }
        }

        // Convert dates to UTC
        const startTime = new Date(startDate)
        const endTime = new Date(endDate)
        startTime.setSeconds(0, 0)
        endTime.setSeconds(0, 0)

        const startDateUTC = startTime.toISOString();
        const endDateUTC = endTime.toISOString();


        try {
            const token = await checkToken();
            const response = await fetch(`http://localhost:3000/bindly/group/createGroup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
                body: JSON.stringify({
                    groupname: groupName,
                    description: description,
                    buyin: buyIn,
                    startdate: startDateUTC,
                    enddate: endDateUTC,
                    hostId: user?.username,
                    image: imgBase64,
                    tasksperweek: taskPerWeek
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                console.log(body, 'body\n')
                setGroups((g: Group[]) => {
                    if (Array.isArray(g)) {
                        return [...g, body];
                    } else {
                        return [body];
                    }
                });


                setGroupData({
                    group: body,
                    usergroup: [{
                        groupid: body.groupid, // Assuming body contains the groupid
                        username: user?.username || '',
                        tokens: [],
                        users: user || undefined
                    }],
                    invite: [],
                    post: []
                });

                setUser((u: User | null) => {
                    if (!u) return null; // Handle the case where user is null
                    return {
                        ...u,
                        balance: u.balance - buyIn,
                    };
                });

                navigation.navigate("Group", { groupData: body });

            } else {
                if (body.error === "Insufficient Funds") {
                    setErrorMessage("Insufficient jkFunds, lower buy in");
                } else {
                    setErrorMessage(body.error || "An error occurred. Please try again.");
                }
            }
        } catch (error) {
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
            setStartDate(selectedDate);
        } else {
            toggleDatePicker();
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <Pressable style={styles.cancel} onPress={cancel}>
                            <Text style={{ color: "red" }}>Cancel</Text>
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


                        <ImagePickerModal
                            visible={openModal}
                            onClose={() => setOpenModal(false)}
                            onImageSelected={(imageUri) => {
                                if (imageUri) {
                                    setImageSrc({ uri: imageUri });
                                } else {
                                    setImageSrc(placeholder); // Reset to placeholder if image is removed
                                }
                            }}
                        />

                        <GroupForm
                            {...{
                                groupName,
                                setGroupName,
                                description,
                                setDescription,
                                startDate,
                                numWeeks,
                                setNumWeeks,
                                buyIn,
                                setBuyIn,
                                taskPerWeek,
                                setTaskPerWeek,
                                formatLocalDateTime,
                                showDatePicker,
                                toggleDatePicker,
                                onDateChange,
                                isEditScreen: false,
                            }}
                        />

                        {!showDatePicker && (
                            <View style={styles.centeredRow}>
                                <Pressable style={styles.signUpButton} onPress={submit} disabled={loading}>
                                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Create</Text>}
                                </Pressable>
                            </View>
                        )}

                        {errorMessage.length > 0 && (
                            <View style={styles.centeredRow}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
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
        height: 40,
        width: 50,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center'
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
