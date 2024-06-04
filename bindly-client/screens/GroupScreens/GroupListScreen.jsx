import React, { useEffect, useState, useMemo,useCallback } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
import GroupListItem from "./components/GroupListItem";
import { BASE_URL } from "@env";

const GroupListScreen = () => {

    const navigation = useNavigation();

    const { groups, setGroups } = useGroupsContext()
    const { user } = useUserContext()
    const [refreshing, setRefreshing] = useState(false);




    const toNewGroup = () => {
        navigation.navigate('NewGroup')

    }


    const getAllGroups = async () => {
        console.log('callllll')

        try {
            const response = await fetch(`${BASE_URL}/bindly/usergroup/getUsergroupByUsername/${user.username}`, {
                headers: { 'Content-Type': 'application/json' },
            });


            const res = await response.json();

            const list = res.map(r => r.groups);
            setGroups(g => [...list])


        }
        catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getAllGroups()
    }, [])

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getAllGroups().then(() => setRefreshing(false));
    }, []);



    // const memoizedGroups = useMemo(() => groups, [groups]);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Pressable  style={styles.newGroup}onPress={toNewGroup}>
                    <Image source={require("../../assets/NewGroupIcon.png")}></Image>
                </Pressable>
                <View>
                    <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', alignItems: 'center', marginTop: 60 }}>Groups</Text>
                </View>
                {
                    groups.length === 0 ?
                        (<Text style={styles.NoGroups}>No Groups</Text>)
                        :
                        (<ScrollView style={styles.groupList}>
                            {
                                groups.map((g, index) => <GroupListItem key={index} groupData={g}></GroupListItem>)
                            }
                        </ScrollView>)
                }
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 32,
        flex: 1,
        // justifyContent: 'center',
    },
    newGroup: {
        position: 'absolute',
        justifyContent: 'flex-start',
        right: 0,
        top: 30,
        zIndex:10,
        width:35,
        height:35,
    },

    NoGroups: {
        fontSize: 20,
        fontFamily: 'bold',
        margin: 'auto'

    },
    groupList: {
        marginTop: 20
    }
});


export default GroupListScreen

