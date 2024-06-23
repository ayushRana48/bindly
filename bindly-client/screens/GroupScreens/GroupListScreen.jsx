import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, Image, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
import GroupListItem from "./components/GroupListItem";
import { BASEROOT_URL } from "@env";

const GroupListScreen = () => {
    const navigation = useNavigation();
    const { groups, setGroups } = useGroupsContext();
    const { user } = useUserContext();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("current");
    const [archiveGroup, setArchiveGroup] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);

    const toNewGroup = () => {
        setActiveTab("current")
        navigation.navigate('NewGroup');
    };

    const getAllGroups = async () => {
        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/usergroup/getUsergroupByUsername/${user.username}`, {
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();
            const groupList= res.current.map(r=>r.groups)
            setGroups(groupList);
            const groupList2= res.archive.map(r=>r.groups)
            setArchiveGroup(groupList2);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllGroups();
    }, []);


    useEffect(() => {
        if (activeTab === "current") {
            setFilteredGroups(groups);
        } else {
            setFilteredGroups(archiveGroup);
        }
    }, [activeTab, groups, archiveGroup]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getAllGroups().then(() => setRefreshing(false));
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.newGroup} onPress={toNewGroup}>
                    <Image source={require("../../assets/NewGroupIcon.png")} style={styles.newGroupIcon} />
                </Pressable>
                <Text style={styles.headerText}>Groups</Text>
            </View>
            <View style={styles.tabs}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === "current" && styles.activeTab]} 
                    onPress={() => setActiveTab("current")}
                >
                    <Text style={styles.tabText}>Current</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === "archive" && styles.activeTab]} 
                    onPress={() => setActiveTab("archive")}
                >
                    <Text style={styles.tabText}>Archive</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {
                    filteredGroups.length === 0 ?
                        (<Text style={styles.noGroups}>No Groups</Text>) :
                        (
                            <View style={styles.groupList}>
                                {filteredGroups.map((g, index) => <GroupListItem key={index} groupData={g} activeTab={activeTab} />)}
                            </View>
                        )
                }
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    header: {
        paddingTop: 60,
        width: '100%',
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
    },
    newGroup: {
        position: 'absolute',
        width: 45,
        height: 45,
        right: 20,
        top: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    newGroupIcon: {
        // width:38,
        // height:26
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tab: {
        paddingVertical: 15,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderColor: 'black',
    },
    tabText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollView: {
        paddingHorizontal: 32,
    },
    noGroups: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
    groupList: {
        marginTop: 20,
    },
});

export default GroupListScreen;
