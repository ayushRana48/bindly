import React, { useEffect, useState,useCallback } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert,RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import { useGroupsContext } from "../GroupsContext";
import { useRoute } from '@react-navigation/native';
import placeholder from "../../assets/GroupIcon.png";
import backArrow from '../../assets/backArrow.png';
import { BASE_URL } from "@env";

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


    const navigation = useNavigation();
    const { user } = useUserContext();
    const { setGroups, setGroupData, groupData: gd } = useGroupsContext();



    useEffect(() => {
        if (gd?.group) {
            setGroupName(gd?.group.groupname);
            setDescription(gd?.group.description);
            setStartDate(new Date(gd?.group.startdate).toLocaleDateString());
            setEndDate(new Date(gd?.group.enddate).toLocaleDateString());
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

    const getGroup = async () => {
        console.log('call')
        try {
          const response = await fetch(`${BASE_URL}/bindly/group/${gd.group.groupid}`, {
            headers: { 'Content-Type': 'application/json' },
          });
    
          const res = await response.json();
          setGroupData(res);
        } catch (error) {
          console.log(error, 'sdsdsd');
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

    const toMembers = () => {
        navigation.navigate("MembersList");
    };

    const leaveGroup = async () => {
        if (isPastDate) {
            Alert.alert('Can not leave, group already started')
            return;
        }

        if (user.username === gd?.group.hostid) {
            Alert.alert('Can not leave, you are the host')
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/bindly/usergroup/leaveGroup`, {
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
        }
    }

    const deleteGroup = async () => {
        if (isPastDate) {
            Alert.alert('Can not delete, group already started')
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/bindly/group/deleteGroup`, {
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
        }
    }

    return (
        <ScrollView style={styles.container}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
            <Pressable style={styles.cancel} onPress={back}>
                <Image style={{ height: 40, width: 40 }} source={backArrow} />
            </Pressable>

            {user.username === gd.group.hostid && (
                <Pressable style={styles.edit} onPress={toEdit}>
                    <Text style={{ color: isPastDate ? "gray" : "blue" }}>Edit</Text>
                </Pressable>
            )}

            <View style={styles.logoContainer}>
                <Text style={styles.title}>Group Settings</Text>
            </View>

            <View style={{ marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
                <Image style={{ width: 80, height: 80, borderRadius: 8 }} source={imageSrc} />
            </View>

            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{groupName}</Text>

            <Text style={styles.label}>Description</Text>
            <Text style={styles.input}>{description}</Text>

            <Text style={styles.label}>Start Date</Text>
            <Text style={styles.input}>{startDate}</Text>
            <Text style={styles.label}>End Date</Text>
            <Text style={styles.input}>{endDate}</Text>

            <Text style={styles.label}>Buy In</Text>
            <Text style={styles.input}>{buyIn}</Text>

            <Text style={styles.label}>Tasks Per Week</Text>
            <Text style={styles.input}>{taskPerWeek}</Text>

            <View style={{ alignItems: 'center' }}>
                <Pressable style={styles.viewMembers} onPress={toMembers}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>View Members</Text>
                </Pressable>
            </View>

            <View style={{ alignItems: 'center' }}>
                <Pressable
                    style={[styles.leaveGroup, { backgroundColor: isPastDate ? 'gray' : '#ed972d' }]}
                    onPress={leaveGroup}
                >
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Leave Group</Text>
                </Pressable>
            </View>

            {user.username === gd.group.hostid && (
                <View style={{ alignItems: 'center' }}>
                    <Pressable
                        style={[styles.deleteGroup, { backgroundColor: isPastDate ? 'gray' : '#f04343' }]}
                        onPress={deleteGroup}
                    >
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Delete Group</Text>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 24,
        flex: 1,
    },
    cancel: {
        backgroundColor: 'red',
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
});

export default GroupSetting;
