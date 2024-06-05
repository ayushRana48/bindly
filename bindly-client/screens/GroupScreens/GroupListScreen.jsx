import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
import GroupListItem from "./components/GroupListItem";
import { BASE_URL } from "@env";

const GroupListScreen = () => {
    const navigation = useNavigation();
    const { groups, setGroups } = useGroupsContext();
    const { user } = useUserContext();
    const [refreshing, setRefreshing] = useState(false);

    const toNewGroup = () => {
        navigation.navigate('NewGroup');
    };

    const getAllGroups = async () => {
        try {
            const response = await fetch(`${BASE_URL}/bindly/usergroup/getUsergroupByUsername/${user.username}`, {
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();
            const list = res.map(r => r.groups);
            setGroups(g => [...list]);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllGroups();
    }, []);

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
            <ScrollView
                contentContainerStyle={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {
                    groups.length === 0 ?
                        (<Text style={styles.noGroups}>No Groups</Text>) :
                        (
                            <View style={styles.groupList}>
                                {groups.map((g, index) => <GroupListItem key={index} groupData={g} />)}
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
        // position: 'absolute',
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
        width:45,
        height:45,
        right: 20,
        top:40,
        justifyContent:'center',
        alignItems:'center'
    },
    newGroupIcon: {
        // width:38,
        // height:26
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    scrollView: {
        paddingHorizontal: 32,
    },
    noGroups: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    groupList: {
        marginTop: 20,
    },
});

export default GroupListScreen;
