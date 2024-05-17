import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Image } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import placeholder from '../../../assets/GroupIcon.png';
import { useUserContext } from "../../../UserContext";

const GroupListItem = ({ groupData }) => {

    const navigation = useNavigation();
    const { user } = useUserContext();

    useEffect(() => {
        console.log(groupData,'sldslkdaslkd');
    }, []);

    const toGroup =()=>{
        navigation.navigate("Group", { groupData: groupData });
    }

    return (
        <Pressable style={styles.container} onPress={toGroup}>
            <Image style={{ width: 50, height: 50, borderRadius: 8 }} source={groupData?.pfp ? { uri: groupData.pfp } : placeholder}></Image>
            <Text style={styles.name}>{groupData?.groupname}</Text>
            <Text style={styles.id}>#{groupData?.groupid.slice(-4)}</Text>
            <Text style={styles.status}>Not Started</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 5,
        flexDirection: 'row',
        alignItems:'center',
        borderBottomWidth:1,
        borderBottomColor:'#f2f2f2',
        height:80,
    },
    name:{
        marginLeft:10,
        fontSize:18
    },
    id:{
        color:'gray',
        marginLeft:5,
        fontSize:18
    },
    status:{
        fontSize:14,
        marginLeft:'auto'
    }
});

export default GroupListItem;
