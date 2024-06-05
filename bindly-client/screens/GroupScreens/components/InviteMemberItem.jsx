import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
import placeholder from '../../../assets/GroupIcon.png';
import { BASE_URL } from "@env";

const InviteMemberItem = ({ memberData, changeInviteStatus }) => {
    const navigation = useNavigation();
    const [imageUrl, setImageUrl] = useState("");
    const { groups,groupData } = useGroupsContext()
    const { user } = useUserContext()

    useEffect(() => {


        if (memberData.pfp) {
            setImageUrl(memberData.pfp)

        }

    }, [memberData])


    const sendInvite = async () => {
        fetch(`${BASE_URL}/bindly/invite/createInvite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderid: user.username,
                receiverid: memberData.username,
                groupid: groupData.group.groupid,
            }),
        })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {

                if (status === 200) {
                    changeInviteStatus(memberData.username)
                    // Navigate to confirm email page or handle the success scenario
                } else {

                }
            })
            .catch(error => {
                console.log(error)
                // In case the fetch fails
                Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
            });

    }




    return (
        <Pressable style={styles.container} >
            <Image
                style={{ width: 50, height: 50, borderRadius: 8 }}
                source={imageUrl ? { uri: imageUrl } : placeholder}
            />
            <Text style={styles.name}>{memberData.username}</Text>
            {memberData.invited ? <Text style={{ marginLeft: 'auto',}}>invited</Text> : <Pressable style={styles.status} onPress={sendInvite}>
                <Text style={{ color: 'white', fontWeight: 400, fontSize: 18 }}>+</Text>
            </Pressable>
            }
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
    id: {
        color: 'gray',
        marginLeft: 5,
        fontSize: 18,
    },
    status: {
        fontSize: 14,
        marginLeft: 'auto',
        height: 30,
        width: 30,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#08d43f',
        borderRadius: 8
    },
});

export default InviteMemberItem;
