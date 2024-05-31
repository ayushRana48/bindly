import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import InviteItem from "./InviteItem";

const InviteList = ({ invites, setInvites }) => {
    const removeInvite = (inviteid) => {
        setInvites(i => i.filter(j => j.inviteid !== inviteid));
    };

    const memoizedInvites = useMemo(() => invites, [invites]);

    return (
        <View style={styles.container}>
            {memoizedInvites.length === 0 ? (
                <Text style={styles.NoGroups}>No Invites</Text>
            ) : (
                <View style={styles.groupList}>
                    {memoizedInvites.map((i) => (
                        <InviteItem key={i.inviteid} inviteData={i} removeInvite={removeInvite} />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
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
        marginTop: 20
    }
});

export default InviteList;
