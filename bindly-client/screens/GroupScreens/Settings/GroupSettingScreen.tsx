import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert, RefreshControl, ActivityIndicator, Modal } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserContext } from "../../../UserContext";
import { useGroupsContext } from "../../GroupsContext";
// @ts-ignore
import placeholder from "../../../assets/GroupIcon.png";
// @ts-ignore
import backArrow from '../../../assets/backArrow.png';
import { GroupData, RootStackParamList } from "../../../types"; // Import necessary types
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { checkToken } from "../../../utils/checkToken";
const GroupSetting: React.FC = () => {

    const [groupName, setGroupName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [buyIn, setBuyIn] = useState<number>(0);
    const [taskPerWeek, setTaskPerWeek] = useState<number>(0);
    const [imageSrc, setImageSrc] = useState<{ uri: string } | typeof placeholder>(placeholder);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [leaving, setLeaving] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [ending, setEnding] = useState<boolean>(false);
    const [vetoing, setVetoing] = useState<boolean>(false);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user, setUser } = useUserContext();
    const { setGroups, setGroupData, groupData: gd } = useGroupsContext();

    useEffect(() => {
        if (gd?.group) {
            setGroupName(gd.group.groupname);
            setDescription(gd.group.description || '');
            setStartDate(gd.group.startdate.toString());
            setEndDate(gd.group.enddate.toString());
            if (gd.group.pfp) {
                setImageSrc({ uri: gd.group.pfp });
            }
            setBuyIn(gd.group.buyin);
            setTaskPerWeek(gd.group.tasksperweek);
        }
    }, [gd]);

    const back = () => {
        navigation.goBack();
    };

    const formatLocalDateTime = (date: string): string => {
        const date2 = new Date(date);
        return date2.toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getGroup = async () => {
        try {
            const token = await checkToken();
            const response = await fetch(`http://localhost:3000/bindly/group/${gd.group.groupid}`, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            const res: GroupData = await response.json();
            setGroupData(res);
        } catch (error) {
            console.log(error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getGroup().then(() => setRefreshing(false));
    }, []);

    const isPastDate = new Date(gd?.group.startdate) < new Date();

    const toEdit = () => {
        if (isPastDate) {
            Alert.alert("Can't edit already started");
        } else {
            try {
                navigation.navigate("GroupEdit");
            } catch (err) {
                console.log(err);
            }
        }
    };

    const openDeleteModal = () => {
        if (isPastDate) {
            Alert.alert('Can not delete, group already started');
            setDeleting(false);
            return;
        }

        setShowDeleteModal(true);
    };

    const openLeaveModal = () => {
        if (isPastDate) {
            Alert.alert('Can not leave, group already started');
            setLeaving(false);
            return;
        }

        if (user?.username === gd?.group.hostid) {
            Alert.alert('Can not leave, you are the host');
            setLeaving(false);
            return;
        }

        setShowLeaveModal(true);
    };

    const leaveGroup = async () => {
        if (leaving) return;
        setLeaving(true);

        if (isPastDate) {
            Alert.alert('Can not leave, group already started');
            setLeaving(false);
            return;
        }

        if (user?.username === gd?.group.hostid) {
            Alert.alert('Can not leave, you are the host');
            setLeaving(false);
            return;
        }

        try {
            const token = await checkToken();
            const response = await fetch(`http://localhost:3000/bindly/usergroup/leaveGroup`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    username: user?.username || '',
                    groupId: gd.group.groupid,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                setUser(u => u ? { ...u, balance: u.balance + gd.group.buyin } : null);
                setGroups(g => g.filter(h => h.groupid !== gd.group.groupid));
                navigation.navigate("GroupsList");
            } else {
                console.error(body.error || "An error occurred. Please try again.");
            }
        } catch (error) {
            console.log("Fetch error: ", error);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setLeaving(false);
            setShowLeaveModal(false);
        }
    };

    const deleteGroup = async () => {
        if (deleting) return;
        setDeleting(true);

        if (isPastDate) {
            Alert.alert('Can not delete, group already started');
            setDeleting(false);
            return;
        }

        try {
            const token = await checkToken();
            const response = await fetch(`http://localhost:3000/bindly/group/deleteGroup`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    username: user?.username || '',
                    groupId: gd.group.groupid,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                setUser(u => u ? { ...u, balance: u.balance + gd.group.buyin } : null);
                setGroups(g => g.filter(h => h.groupid !== gd.group.groupid));
                navigation.navigate("GroupsList");
            } else {
                console.error(body.error || "An error occurred. Please try again.");
            }
        } catch (error) {
            console.log("Fetch error: ", error);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    useEffect(() => {
        console.log('user in GroupSettingScreen', user?.username);
        console.log('gd in GroupSettingScreen', gd.group.hostid);
        console.log('isPastDate in GroupSettingScreen', isPastDate);
    }, [user, gd]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Pressable style={styles.backArrow} onPress={back}>
                <Image style={{ height: 40, width: 40 }} source={backArrow} />
            </Pressable>

            {user?.username === gd?.group?.hostid && !isPastDate && (
                <Pressable style={styles.edit} onPress={toEdit}>
                    <Text style={styles.editText}>Edit</Text>
                </Pressable>
            )}


            <View style={styles.imageContainer}>
                <Image style={styles.groupImage} source={imageSrc} />
            </View>

            <Text style={styles.groupName}>{groupName}</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Task Description</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.input}>{description}</Text>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Start Time</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.input}>{formatLocalDateTime(startDate)}</Text>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>End Time</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.input}>{formatLocalDateTime(endDate)}</Text>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Buy In</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.input}>{buyIn}</Text>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Tasks Per Week</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.input}>{taskPerWeek}</Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Pressable
                    style={[styles.button, styles.leaveButton, { opacity: isPastDate ? 0.5 : 1 }]}
                    onPress={openLeaveModal}
                    disabled={leaving || isPastDate}
                >
                    {leaving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Leave Group</Text>}
                </Pressable>

                {user?.username === gd?.group?.hostid && (
                    <Pressable
                        style={[styles.button, styles.deleteButton, { opacity: isPastDate ? 0.5 : 1 }]}
                        onPress={openDeleteModal}
                        disabled={deleting || isPastDate}
                    >
                        {deleting ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Delete Group</Text>}
                    </Pressable>
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showLeaveModal}
                onRequestClose={() => setShowLeaveModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Leave Group</Text>
                        <Text style={styles.modalText}>Are you sure you want to leave this group?</Text>
                        <View style={styles.modalButtonContainer}>
                            <Pressable style={[styles.modalButton, styles.leaveButton]} onPress={leaveGroup}>
                                {leaving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Leave</Text>}
                            </Pressable>
                            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowLeaveModal(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Group</Text>
                        <Text style={styles.modalText}>Are you sure you want to delete this group?</Text>
                        <View style={styles.modalButtonContainer}>
                            <Pressable style={[styles.modalButton, styles.deleteButton]} onPress={deleteGroup}>
                                {deleting ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Delete</Text>}
                            </Pressable>
                            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowDeleteModal(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    contentContainer: {
        padding: 32,
        paddingBottom: 50,
    },
    backArrow: {
        position: "absolute",
        top: 50,
        left: 20,
        width: 50,
        height: 50,
        zIndex: 10,
    },
    edit: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
    },
    editText: {
        fontSize: 16,
        color: "dodgerblue",
        fontWeight: "600",
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: "center",
        marginTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    imageContainer: {
        alignItems: "center",
        marginTop: 48,
        marginBottom:16
    },
    groupImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    groupName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
        // alignItems: "center",
    },
    label: {
        color: "#333",
        marginBottom: 4,
        fontSize: 14,
        fontWeight: "600",
    },
    input: {
        
        fontSize: 16,
    },
    textContainer: {
        height: 40,
        backgroundColor: "#f8f8f8",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        fontSize: 16,
        justifyContent: "center",
        // alignItems: "center"
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 24,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: 250,
        marginBottom: 16,
    },
    leaveButton: {
        backgroundColor: "#ed972d",
    },
    deleteButton: {
        backgroundColor: "#f04343",
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        width: 120,
    },
    cancelButton: {
        backgroundColor: "#6c757d",
    },
})

export default GroupSetting

