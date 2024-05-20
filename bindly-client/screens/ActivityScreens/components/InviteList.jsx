import React, { useEffect, useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../../UserContext";
import InviteItem from "./InviteItem";

const InviteList = () => {
    const navigation = useNavigation();
    const { user } = useUserContext();
    const [invites, setInvites] = useState([]);

    const removeInvite = (inviteid) => {
        setInvites(i => i.filter(j => j.inviteid !== inviteid));
    };

    const getAllInvites = async () => {
        console.log('call');

        try {
            const response = await fetch(`http://localhost:3000/bindly/invite/getInviteByReciever/${user.username}`, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response, 'jellodsad');

            const res = await response.json();
            console.log(res, 'helloRes');
            setInvites(res);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllInvites();
    }, []);

    const memoizedInvites = useMemo(() => invites, [invites]);

    return (
        <View style={styles.container}>
            <Pressable style={{ zIndex: '10', width: 20, height: 80, backgroundColor: 'green' }} onPress={getAllInvites}>
                <Text>p me</Text>
            </Pressable>

            {memoizedInvites.length === 0 ? (
                <Text style={styles.NoGroups}>No Groups</Text>
            ) : (
                <ScrollView style={styles.groupList}>
                    {memoizedInvites.map((i) => (
                        <InviteItem key={i.inviteid} inviteData={i} removeInvite={removeInvite} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 32,
        flex: 1,
    },
    newGroup: {
        position: 'absolute',
        justifyContent: 'flex-start',
        right: 0,
        top: 30
    },
    NoGroups: {
        fontSize: 20,
        fontFamily: 'bold',
        margin: 'auto'
    },
    groupList: {
        marginTop: 80
    }
});

export default InviteList;
