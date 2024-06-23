import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, Modal, Alert, TouchableWithoutFeedback } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
import placeholder from '../../../assets/GroupIcon.png';
import { BASEROOT_URL } from "@env";

const LeaderboardItem = ({ memberData }) => {
    const navigation = useNavigation();
    const [imageUrl, setImageUrl] = useState(placeholder);
    const { groups, groupData, setGroupData } = useGroupsContext();
    const { user:u } = useUserContext();


    useEffect(()=>{
        for(let i=0;i<groupData?.usergroup?.length; i++){
            const user =groupData.usergroup[i]
            if(user.username == memberData.username){
                if(user.users.pfp){
                    setImageUrl({uri:user.users.pfp})
                }
            }
        }
    },[groupData?.usergroup])



    return (
        <Pressable style={styles.container}>
            <Image
                style={{ width: 50, height: 50, borderRadius: 8 }}
                source={imageUrl}
            />
            <Text style={styles.name}>{memberData.place}  {memberData.username}</Text>
            <View style={{marginLeft:'auto'}}>
                <Text style={{fontSize:20}}>${memberData.netMoney}</Text>
                <Text>{memberData.totalCountedPosts} posts</Text>
                <Text>{memberData.totalUnCountedPosts} uncounted</Text>

            </View>
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
});

export default LeaderboardItem;
