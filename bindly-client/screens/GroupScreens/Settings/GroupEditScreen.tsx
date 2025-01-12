import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Keyboard, Platform, ActivityIndicator, TouchableWithoutFeedback, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "../../../UserContext";
import { useGroupsContext } from "../../GroupsContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
// @ts-ignore
import placeholder from "../../../assets/GroupIcon.png";
//@ts-ignore
import camera from "../../../assets/Camera.png";
import ImagePickerModal from "./components/ImagePickerModal";
import GroupForm from "./components/GroupForm";
import compressImage from "../../../utils/compressImage";
import blobToBase64 from "../../../utils/blobToBase64";

const GroupEditScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useUserContext();
    const { setGroups, setGroupData, groupData: gd } = useGroupsContext();

    const [groupName, setGroupName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [numWeeks, setNumWeeks] = useState<number>(0);
    const [buyIn, setBuyIn] = useState<number>(0);
    const [taskPerWeek, setTaskPerWeek] = useState<number>(0);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [imageSrc, setImageSrc] = useState<{ uri: string } | typeof placeholder>(placeholder);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [groupId, setGroupId] = useState<string>("");
    const [timeStamp, setTimeStamp] = useState<string>("");

    useEffect(() => {
        if (gd.group) {
            setGroupName(gd.group.groupname);
            setDescription(gd.group.description || "");
            setStartDate(new Date(gd.group.startdate));
            setNumWeeks(calculateWeeks(gd.group.startdate, gd.group.enddate));
            setImageSrc(gd.group.pfp ? { uri: gd.group.pfp } : placeholder);
            setBuyIn(gd.group.buyin);
            setTaskPerWeek(gd.group.tasksperweek);
            setGroupId(gd.group.groupid);
            setTimeStamp(gd.group?.lastpfpupdate?.toString() || "");
        }
    }, [gd]);

    const calculateWeeks = (startDate: Date, endDate: Date): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        return Math.ceil(diffDays / 7);
    };

    const formatLocalDateTime = (date: Date): string =>
        date.toLocaleTimeString([], { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

    const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === "set" && selectedDate) {
            setStartDate(selectedDate);
        } else {
            toggleDatePicker();
        }
    };

    const cancel = () => navigation.goBack();

    const submit = async () => {
        if (loading) return;
        setLoading(true);

        if (!groupName.trim() || !description.trim() || !startDate || !numWeeks || !buyIn || !taskPerWeek) {
            setErrorMessage("Please fill out all fields.");
            setLoading(false);
            return;
        }

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + numWeeks * 7);

        const startDateUTC = startDate.toISOString();
        const endDateUTC = endDate.toISOString();

        try {
            let imgBase64 = "";
            if (imageSrc.uri) {
                const compressedUri = await compressImage(imageSrc.uri);
                const blob = await (await fetch(compressedUri)).blob();
                imgBase64 = await blobToBase64(blob);
            }

            const response = await fetch(`http://localhost:3000/bindly/group/updateGroup/${groupId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupname: groupName,
                    description,
                    buyin: buyIn,
                    startdate: startDateUTC,
                    enddate: endDateUTC,
                    hostid: user?.username,
                    pfp: imgBase64,
                    tasksperweek: taskPerWeek,
                    lastpfpupdate: timeStamp,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));
            if (status === 200) {
                setGroups(currentGroups => currentGroups.map(group => (group.groupid === body.groupid ? body : group)));
                setGroupData({ ...gd, group: body });
                navigation.navigate("Group", { groupData: body });
            } else {
                setErrorMessage(body.error || "An error occurred. Please try again.");
            }
        } catch (error) {
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <Pressable style={styles.cancel} onPress={cancel}>
                            <Text style={{ color: "red" }}>Cancel</Text>
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

                        <ImagePickerModal
                            visible={openModal}
                            onClose={() => setOpenModal(false)}
                            onImageSelected={imageUri => setImageSrc(imageUri ? { uri: imageUri } : placeholder)}
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


export default GroupEditScreen;

