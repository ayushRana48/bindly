import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
import placeholder from '../../../assets/GroupIcon.png';

const MemberListItem = ({ memberData,groupData }) => {
    const navigation = useNavigation();
    const [imageUrl, setImageUrl] = useState("");
    const { groups } = useGroupsContext()
    const { user } = useUserContext()
    

    return (
        <Pressable style={styles.container} >
            <Image
                style={{ width: 50, height: 50, borderRadius: 8 }}
                source={imageUrl ? { uri: imageUrl } : placeholder}
            />
            <Text style={styles.name}>{memberData.username}</Text>
            {user.username == groupData.hostid && 
                <Pressable style={styles.status}>
                    <Text>i</Text> 
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
        height:15,
        width:15,
        justifyContent:'center',
        alignItems:'center'
    },
});

export default MemberListItem;