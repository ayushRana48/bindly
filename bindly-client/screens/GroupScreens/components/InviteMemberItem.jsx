import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
import placeholder from '../../../assets/GroupIcon.png';
import { BASEROOT_URL } from "@env";

const InviteMemberItem = ({ memberData, changeInviteStatus }) => {
    const navigation = useNavigation();
    const [imageUrl, setImageUrl] = useState("");
    const [inviting, setInviting] = useState(false);
    const { groupData } = useGroupsContext();
    const { user } = useUserContext();

    useEffect(() => {
        if (memberData.pfp) {
            setImageUrl(memberData.pfp);
        }
    }, [memberData]);

    const sendInvite = async () => {
        if (inviting) return; // Prevent multiple requests
        setInviting(true);

        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/invite/createInvite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderid: user.username,
                    receiverid: memberData.username,
                    groupid: groupData.group.groupid,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                changeInviteStatus(memberData.username);
            } else {
                console.error(body.error || "An error occurred. Please try again.");
            }
        } catch (error) {
            console.log("Fetch error: ", error);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setInviting(false);
        }
    };

    return (
        <Pressable style={styles.container}>
            <Image
                style={{ width: 50, height: 50, borderRadius: 8 }}
                source={imageUrl ? { uri: imageUrl } : placeholder}
            />
            <Text style={styles.name}>{memberData.username}</Text>
            {memberData.invited ? (
                <Text style={{ marginLeft: 'auto' }}>Invited</Text>
            ) : (
                <Pressable style={styles.status} onPress={sendInvite} disabled={inviting}>
                    {inviting ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '400', fontSize: 18 }}>+</Text>}
                </Pressable>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        height: 80,
    },
    name: {
        marginLeft: 10,
        fontSize: 18,
    },
    status: {
        fontSize: 14,
        marginLeft: 'auto',
        height: 30,
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#08d43f',
        borderRadius: 8,
    },
    
});

export default InviteMemberItem;
