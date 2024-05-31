import React, { useEffect, useState,useMemo } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
import GroupListItem from "./components/GroupListItem";

const GroupListScreen = () => {

    const navigation = useNavigation();

    const { groups, setGroups } = useGroupsContext()
    const {user} = useUserContext()



    const toNewGroup=()=>{
        navigation.navigate('NewGroup')
     
    }


    const getAllGroups= async()=>{

        try{
            const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/usergroup/getUsergroupByUsername/${user.username}`, {
                headers: { 'Content-Type': 'application/json' },
            });


            const res = await response.json();

            const list = res.map(r=>r.groups);
            setGroups(g=>[...list])
           

        }
        catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        getAllGroups()
    },[])


    const memoizedGroups = useMemo(() => groups, [groups]);

    return (
        <View style={styles.container}>
            <Pressable onPress={toNewGroup}>
                <Image source={require("../../assets/NewGroupIcon.png")} style={styles.newGroup}></Image>
            </Pressable>
            <View>
            <Text style={{fontSize:30, fontWeight:'bold',textAlign:'center',alignItems:'center', marginTop:60}}>Groups</Text>
            </View>
            {
                memoizedGroups.length === 0 ?
                    (<Text style={styles.NoGroups}>No Groups</Text>)
                    :
                    (<ScrollView style={styles.groupList}>
                        {
                            memoizedGroups.map((g, index) => <GroupListItem key={index} groupData={g}></GroupListItem>)
                        }
                    </ScrollView>)
            }
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
        top: 30
    },

    NoGroups:{
        fontSize:20,
        fontFamily:'bold',
        margin:'auto'

    },
    groupList:{
        marginTop:20
    }
});


export default GroupListScreen

