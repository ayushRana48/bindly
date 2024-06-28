import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert, RefreshControl, ActivityIndicator, Modal } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../../UserContext";
import { useGroupsContext } from "../../GroupsContext";
import { useRoute } from '@react-navigation/native';
import placeholder from "../../../assets/GroupIcon.png";
import backArrow from '../../../assets/backArrow.png';
import { BASEROOT_URL } from "@env";

const GroupSetting = () => {
    const route = useRoute();

    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [buyIn, setBuyIn] = useState(0);
    const [taskPerWeek, setTaskPerWeek] = useState(0);
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [refreshing, setRefreshing] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [ending, setEnding] = useState(false);
    const [vetoing, setVetoing] = useState(false);

    const navigation = useNavigation();
    const { user, setUser } = useUserContext();
    const { setGroups, setGroupData, groupData: gd } = useGroupsContext();

    useEffect(() => {
        if (gd?.group) {
            setGroupName(gd?.group.groupname);
            setDescription(gd?.group.description);
            setStartDate(gd?.group.startdate);
            setEndDate(gd?.group.enddate);
            if (gd?.group.pfp) {
                setImageSrc({ uri: gd?.group.pfp });
            }
            setBuyIn(gd?.group.buyin);
            setTaskPerWeek(gd?.group.tasksperweek);
        }
    }, [gd]);

    const back = () => {
        navigation.goBack();
    };

    const formatLocalDateTime = (date) => {
        const date2 = new Date(date);
        return date2.toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getGroup = async () => {
        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/group/${gd.group.groupid}`, {
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();
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

    // const toEdit = () => {
    //     if (isPastDate) {
    //         Alert.alert("Can't edit already started");
    //     } else {
    //         try {
    //             navigation.navigate("GroupEdit");
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     }
    // };

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

        if (user.username === gd?.group.hostid) {
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

        if (user.username === gd?.group.hostid) {
            Alert.alert('Can not leave, you are the host');
            setLeaving(false);
            return;
        }

        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/usergroup/leaveGroup`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    groupId: gd.group.groupid,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                setGroups(g => g.filter(h => h.groupid !== gd.group.groupid));
                navigation.navigate("GroupsList");
                setGroupData(null);
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
            const response = await fetch(`${BASEROOT_URL}/bindly/group/deleteGroup`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    groupId: gd.group.groupid,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                setGroups(g => g.filter(h => h.groupid !== gd.group.groupid));
                navigation.navigate("GroupsList");
                setGroupData(null);
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

  

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Pressable style={styles.cancel} onPress={back}>
                <Image style={{ height: 40, width: 40 }} source={backArrow} />
            </Pressable>

            {/* {user.username === gd.group.hostid && (
                <Pressable style={styles.edit} onPress={toEdit}>
                    <Text style={{ color: isPastDate ? "gray" : "blue" }}>Edit</Text>
                </Pressable>
            )} */}

            <View style={styles.logoContainer}>
                <Text style={styles.title}>Group Settings</Text>
            </View>

            <View style={styles.centeredImage}>
                <Image style={styles.image} source={imageSrc} />
            </View>

            <Text style={styles.groupName}>{groupName}</Text>

            <Text style={styles.label}>Description</Text>
            <Text style={styles.input}>{description}</Text>

            <Text style={styles.label}>Start Time</Text>
            <Text style={styles.input}>{formatLocalDateTime(startDate)}</Text>
            <Text style={styles.label}>End Time</Text>
            <Text style={styles.input}>{formatLocalDateTime(endDate)}</Text>

            <Text style={styles.label}>Buy In</Text>
            <Text style={styles.input}>{buyIn}</Text>

            <Text style={styles.label}>Tasks Per Week</Text>
            <Text style={styles.input}>{taskPerWeek}</Text>

            <View style={{ alignItems: 'center' }}>
                <Pressable
                    style={[styles.leaveGroup, { backgroundColor: isPastDate ? 'gray' : '#ed972d' }]}
                    onPress={openLeaveModal}
                    disabled={leaving}
                >
                    {leaving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Leave Group</Text>}
                </Pressable>
            </View>

            {user.username === gd.group.hostid && (
                <View style={{ alignItems: 'center' }}>
                    <Pressable
                        style={[styles.deleteGroup, { backgroundColor: isPastDate ? 'gray' : '#f04343' }]}
                        onPress={openDeleteModal}
                        disabled={deleting}
                    >
                        {deleting ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Delete Group</Text>}
                    </Pressable>
                </View>
            )}

           

            <Modal
                animationType="slide"
                transparent={true}
                visible={showLeaveModal}
                onRequestClose={() => setShowLeaveModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to leave?</Text>
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.button, styles.buttonLeave]}
                                onPress={leaveGroup}
                            >
                                {leaving ? <ActivityIndicator color="white" /> : <Text style={styles.textStyle}>Leave</Text>}
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setShowLeaveModal(false)}
                            >
                                <Text style={styles.textStyle}>Cancel</Text>
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
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to delete?</Text>
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.button, styles.buttonDelete]}
                                onPress={deleteGroup}
                            >
                                {deleting ? <ActivityIndicator color="white" /> : <Text style={styles.textStyle}>Delete</Text>}
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.textStyle}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        paddingTop: 24,
        paddingHorizontal: 16,
    },
    contentContainer: {
        paddingBottom: 50, // Add padding to the bottom
    },
    cancel: {
        zIndex: 10,
        height: 40,
        width: 40,
        position: 'absolute',
        top: 20,
        left: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    edit: {
        position: 'absolute',
        top: 20,
        right: 10,
        zIndex: 10,
        height: 40,
        width: 40,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
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
    input: {
        marginBottom: 12,
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        padding: 8,
    },
    viewMembers: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'dodgerblue',
        width: 180,
        height: 40,
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    leaveGroup: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ed972d',
        width: 180,
        height: 40,
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    deleteGroup: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f04343',
        width: 180,
        height: 40,
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    centeredImage: {
        alignItems: 'center',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    groupName: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginHorizontal: 10,
        width: 100,
        alignItems: 'center',
    },
    buttonLeave: {
        backgroundColor: '#ed972d',
    },
    buttonDelete: {
        backgroundColor: '#f04343',
    },
    buttonCancel: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default GroupSetting;
