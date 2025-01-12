import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, Alert, Modal, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
//@ts-ignore
import placeholder from '../../../assets/GroupIcon.png';
import { Invite, Group, RootStackParamList } from "../../../types";

interface InviteItemProps {
    inviteData: Invite;
    removeInvite: (inviteid: string) => void;
}


const InviteItem: React.FC<InviteItemProps> = ({ inviteData, removeInvite }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [imageUrl, setImageUrl] = useState<string>("");
    const [sender, setSender] = useState<string>("");
    const [groupName, setGroupName] = useState<string>("");
    const [inviteId, setInviteId] = useState<string>("");
    const [groupid, setGroupid] = useState<string>("");
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [accepting, setAccepting] = useState<boolean>(false);
    const [rejecting, setRejecting] = useState<boolean>(false);

    const { setGroups } = useGroupsContext();
    const { user, setUser } = useUserContext();

    useEffect(() => {
        if (inviteData?.groups?.pfp) {
            setImageUrl(inviteData.groups.pfp);
        }
        setSender(inviteData.senderid);
        setGroupName(inviteData.groups.groupname);
        setInviteId(inviteData.inviteid);
        setGroupid(inviteData.groups.groupid);
    }, [inviteData]);

    const acceptInvite = async () => {
        if (accepting) return;
        setAccepting(true);

        try {
            const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/invite/acceptInvite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inviteId: inviteId,
                    receiverid: user?.username,
                    groupid: groupid,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                setGroups(g => [...g, inviteData.groups]);
                removeInvite(inviteId);
                setModalVisible(false);
                setUser(u => u ? {...u, balance: body.newBalance} : null);
            } else {
                if (body.error === "JSON object requested, multiple (or no) rows returned") {
                    Alert.alert('Invalid Invite', "Group is deleted");
                    removeInvite(inviteId);
                }
                if (body.error == "Insufficient Funds") {
                    Alert.alert("Insufficient Funds", "buy in is higher than current balance")
                }
                if(body.error=="Group already started"){
                    Alert.alert('Invalid Invite', "Group Already Started");
                    removeInvite(inviteId);
                }
                if(body.error=="Group already ended"){
                    Alert.alert('Invalid Invite', "Group Already Ended");
                    removeInvite(inviteId);
                }
            }
        } catch (error) {
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setAccepting(false);
        }
    };

    const rejectInvite = async () =>{
        if (rejecting) return;
        setRejecting(true);

        try {
            const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/invite/deleteInvite/${inviteId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                removeInvite(inviteId);
            } 
        } catch (error) {
            console.log(error);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setRejecting(false);
        }
    };

    return (
        <Pressable style={styles.container}>
            <Image
                style={{ width: 50, height: 50, borderRadius: 8 }}
                source={imageUrl ? { uri: imageUrl } : placeholder}
            />
            <View>
                <Text style={styles.groupName}>{groupName}</Text>
                <Text style={styles.sender}>from {sender}</Text>
            </View>

            <View style={styles.options}>
                <Pressable style={styles.accept} onPress={() => setModalVisible(true)} disabled={accepting}>
                    {accepting ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '400', fontSize: 18 }}>+</Text>}
                </Pressable>

                <Pressable style={styles.decline} onPress={rejectInvite} disabled={rejecting}>
                    {rejecting ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '400', fontSize: 18 }}>x</Text>}
                </Pressable>
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm</Text>
                        <View style={styles.modalText}>
                            <View style={styles.modalItem}>
                                <Text style={styles.boldText}>Group Name: </Text>
                                <Text>{groupName}</Text>
                            </View>
                            <View style={styles.modalItem}>
                                <Text style={styles.boldText}>Buy In: </Text>
                                <Text>${inviteData?.groups?.buyin.toFixed(2)}</Text>
                            </View>
                            <View style={styles.modalItem}>
                                <Text style={styles.boldText}>Description: </Text>
                                <Text>{inviteData?.groups?.description}</Text>
                            </View>
                            <Text>You can get your buy-in back if you leave the group before {new Date(inviteData?.groups?.startdate).toLocaleDateString() + ' ' + new Date(inviteData?.groups?.startdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }</Text>
                        </View>
                        <View style={styles.modalButtons}>
                            <Pressable style={styles.confirmButton} onPress={acceptInvite} disabled={accepting}>
                                {accepting ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Confirm</Text>}
                            </Pressable>
                            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)} disabled={accepting}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
    groupName: {
        marginLeft: 10,
        fontSize: 18,
    },
    sender: {
        marginLeft: 10,
        fontSize: 12,
        color: 'gray',
    },
    accept: {
        fontSize: 14,
        height: 30,
        width: 30,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#08d43f',
        borderRadius: 8,
        marginRight: 10,
    },
    decline: {
        fontSize: 14,
        height: 30,
        width: 30,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff7e75',
        borderRadius: 8,
        marginRight: 10,
    },
    options: {
        marginLeft: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    boldText: {
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    confirmButton: {
        backgroundColor: '#08d43f',
        padding: 15,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ff7e75',
        padding: 15,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    modalItem: {
        marginBottom: 0,
        flexDirection: 'row',
        fontSize: 28,
    }
});

export default InviteItem;

