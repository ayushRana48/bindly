import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, Modal, Alert,TouchableWithoutFeedback } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
import placeholder from '../../../assets/GroupIcon.png';

const MemberListItem = ({ memberData,kickMember }) => {
    const navigation = useNavigation();
    const [imageUrl, setImageUrl] = useState("");
    const [isModalVisible, setModalVisible] = useState(false);
    const { groups,groupData,setGroupData } = useGroupsContext();
    const { user } = useUserContext();

    const isPastDate = new Date(groupData.group.startdate) < new Date();

    useEffect(() => {
        if (memberData.users.pfp) {
            setImageUrl(memberData.users.pfp);
        }
    }, [memberData]);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const changeHost = async () => {
        try {
            const response = await fetch('https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/group/changeHost', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user.username,
                    groupId: groupData.group.groupid,
                    newHost: memberData.username,
                }),
            });
            setGroupData(g => ({
                ...g,
                group: {
                  ...g.group,
                  host: memberData.username
                }
              }));
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Host changed successfully");
            } else {
                Alert.alert("Error", data.error);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            toggleModal();
        }
    };


    const kickUser = async () => {
        try {
            const response = await fetch('https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/usergroup/kickUser', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user.username,
                    groupId: groupData.group.groupid,
                    kickedUser: memberData.username,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "User kicked successfully");
                kickMember(memberData.username)
            } else {
                Alert.alert("Error", data.error);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            toggleModal();
        }
    };

    

    return (
        <Pressable style={styles.container}>
            <Image
                style={{ width: 50, height: 50, borderRadius: 8 }}
                source={imageUrl ? { uri: imageUrl } : placeholder}
            />
            <Text style={styles.name}>{memberData.username}</Text>
           {memberData.username == groupData.group.hostid && <Text style={{fontWeight:'bold',marginLeft:20}}>H</Text>}
            {user.username == groupData.group.hostid && user.username!==memberData.username && !isPastDate &&
                <Pressable style={styles.status} onPress={toggleModal}>
                    <Text>i</Text>
                </Pressable>
            }

            <Modal
                transparent={true}
                visible={isModalVisible}
                onRequestClose={toggleModal}
                animationType="slide"
            >
                <TouchableWithoutFeedback onPress={toggleModal}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Pressable style={styles.option} onPress={changeHost}>
                                    <Text style={styles.optionText}>Promote to Host</Text>
                                </Pressable>
                                <Pressable style={[styles.option, styles.redOption]} onPress={kickUser}>
                                    <Text style={[styles.optionText, styles.redText]}>Kick from Group</Text>
                                </Pressable>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
        borderRadius: 15,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        borderTopLeftRadius: 17,
        borderTopRightRadius: 17,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },
    option: {
        padding: 20,
        width: '100%',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 18,
    },
    redOption: {
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },
    redText: {
        color: 'red',
    }
});

export default MemberListItem;
