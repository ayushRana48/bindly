import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert, Modal, TouchableWithoutFeedback } from "react-native";
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

const GroupEditScreen = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { setGroups, setGroupData, groupData: gd } = useGroupsContext();
    const { user } = useUserContext();

    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);
    const [numWeeks, setNumWeeks] = useState(0);
    const [buyIn, setBuyIn] = useState(0);
    const [taskPerWeek, setTaskPerWeek] = useState(0);
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [openModal, setOpenModal] = useState(false);
    const [groupid, setGroupid] = useState('');
    const [timeStamp, setTimeStamp] = useState('');

    const parseDateString = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    };

    const setNumWeeksF = (startDate, endDate) => {
        const start = parseDateString(startDate);
        const end = parseDateString(endDate);

        const timeDiff = end.getTime() - start.getTime();
        const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));

        if (diffDays % 7 !== 0) {
            throw new Error(`The difference between startDate and endDate must be a multiple of 7. Start Date: ${startDate}, End Date: ${endDate}`);
        }

        const diffWeeks = diffDays / 7;
        setNumWeeks(diffWeeks.toString());
    };

    const formatDateString = (dateString) => {
        const date = parseDateString(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    useEffect(() => {
        if (gd.group) {
            setGroupName(gd.group.groupname);
            setDescription(gd.group.description);
            setStartDate(gd.group.startdate);
            setNumWeeksF(gd.group.startdate, gd.group.enddate);

            if (gd.group.pfp) {
                setImageSrc({ uri: gd.group.pfp });
            }

            setBuyIn(gd.group.buyin.toString());
            setTaskPerWeek(gd.group.tasksperweek.toString());
            setGroupid(gd.group.groupid);
            setTimeStamp(gd.group.lastpfpupdate);
        }
    }, [gd]);

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

    const navigation = useNavigation();

    const cancel = () => {
        navigation.goBack();
    };

    const toggleDatepicker = () => {
        setShow(!show);
    };

    const submit = async () => {
        if (!groupName.trim()) {
            console.error("Enter Group Name");
            return;
        }
        if (!description.trim()) {
            console.error("Please enter description.");
            return;
        }
        if (!startDate) {
            console.error("Please enter start date.");
            return;
        }
        if (!numWeeks) {
            console.error("Please enter number of weeks.");
            return;
        }
        if (!buyIn) {
            console.error("Please enter buy in");
            return;
        }
        if (!taskPerWeek) {
            console.error("Please enter number of tasks per week");
            return;
        }

        const endDate = parseDateString(startDate);
        endDate.setDate(endDate.getDate() + numWeeks * 7);

        let img = imageSrc;
        if (imageSrc === placeholder) {
            img = "";
        }

        if (groupid) {
            try {
                let imgBase64 = "";
                if (img.uri) {
                    const response = await fetch(img.uri);
                    const blob = await response.blob();
                    imgBase64 = await blobToBase64(blob);
                }

                const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/group/updateGroup/${groupid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        groupname: groupName,
                        description: description,
                        buyin: buyIn,
                        startdate: startDate,
                        enddate: endDate.toISOString().split('T')[0],
                        hostid: user.username,
                        pfp: imgBase64,
                        tasksperweek: taskPerWeek,
                        lastpfpupdate: timeStamp,
                    }),
                });

                const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

                if (status === 200) {
                    setGroups(currentGroups => {
                        return currentGroups.map(group =>
                            group.groupid === body.groupid ? body : group
                        );
                    });

                    setGroupData(g => ({
                        ...g,
                        group: {
                            ...g.group,
                            groupname: groupName,
                            description: description,
                            buyin: buyIn,
                            startdate: startDate,
                            enddate: endDate.toISOString().split('T')[0],
                            hostid: user.username,
                            pfp: body.pfp,
                            tasksperweek: taskPerWeek,
                            lastpfpupdate: timeStamp,
                        },
                    }));
                    navigation.navigate("Group", { groupData: body });
                } else {
                    console.error(body.error || "An error occurred. Please try again.");
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            console.error("No group ID provided.");
        }
    };

    const onChange = ({ type }, selectedDate) => {
        if (type == 'set') {
            const currentDate = selectedDate;
            setStartDate(currentDate.toISOString().split('T')[0]);
        } else {
        }
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.cancel} onPress={cancel}>
                <Text style={{ color: "red" }}>cancel</Text>
            </Pressable>
            <View style={styles.logoContainer}>
                <Text style={styles.title}>Edit Group</Text>
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

            <Text style={styles.label}>Group Name</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={groupName}
                onChangeText={setGroupName}
                placeholder="group name"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={description}
                onChangeText={setDescription}
                placeholder="description"
            />

            <Text style={styles.label}>Start Date</Text>
            <Pressable onPress={toggleDatepicker} style={styles.datePressable}>
            <Text>{formatDateString(startDate)}</Text>
            </Pressable>

            {show && (
                <View>
                    <DateTimePicker mode="date" display="spinner" value={parseDateString(startDate)} onChange={onChange} style={{ height: 120 }} minimumDate={tomorrow} />
                    <View style={styles.centeredRow}>
                        <Pressable style={styles.doneButton} onPress={toggleDatepicker}>
                            <Text style={styles.buttonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            <Text style={styles.label}>Weeks</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={numWeeks}
                onChangeText={text => setNumWeeks(text.replace(/[^0-9]/g, ''))}
                placeholder="5"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Buy In</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={buyIn}
                onChangeText={text => setBuyIn(text.replace(/[^0-9]/g, ''))}
                placeholder="202"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Tasks Per Week</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={taskPerWeek}
                onChangeText={text => setTaskPerWeek(text.replace(/[^0-9]/g, ''))}
                placeholder="5"
                keyboardType="numeric"
            />

            {!show && (
                <View style={styles.centeredRow}>
                    <Pressable style={styles.signUpButton} onPress={submit}>
                        <Text style={styles.buttonText}>Confirm</Text>
                    </Pressable>
                </View>
            )}

            {errorMessage.length > 0 && (
                <View style={styles.centeredRow}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 24,
        flex: 1,
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
    logoContainer: {
        marginTop: 36,
        marginBottom: 36,
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
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
    DateInputContainer: {
        width: '75%',
    },
    WeekInputContainer: {
        width: '25%',
    },
    inputPaddingLeft: {
        paddingLeft: 4,
    },
    label: {
        color: 'gray',
        marginBottom: 4,
    },
    input: {
        marginBottom: 12,
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
        marginBottom: 12,
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

export default GroupEditScreen;
