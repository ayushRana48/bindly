// [{ "groupid": "d88c9f60-8890-4c60-a765-8245b7550b37", "groups": { "buyin": 3, "description": "12", "enddate": "2024-06-09", "groupid": "d88c9f60-8890-4c60-a765-8245b7550b37", "groupname": "bye2", "hostid": "airborm", "lastpfpupdate": "2024-05-19T03:15:51.697+00:00", "pfp": "https://lxnzgnvhkrgxpfsokwos.supabase.co/storage/v1/object/public/groupProfiles/d88c9f60-8890-4c60-a765-8245b7550b37-2024-05-19T03:15:51.697Z.jpg", "startdate": "2024-05-26", "tasksperweek": 3, "timeleft": null, "week": null }, "inviteid": "938f8f61-fcb7-4844-b649-5eacac4e4993", "receiverid": "airborm", "senderid": "airborm" }]


import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet,Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
import placeholder from '../../../assets/GroupIcon.png';

const InviteItem = ({ inviteData,removeInvite }) => {
    const navigation = useNavigation();
    const [imageUrl, setImageUrl] = useState("");
    const [sender, setSender] = useState("");
    const [groupName,setGroupName]= useState("")
    const [inviteId,setInviteId]= useState("")
    const [groupid,setGroupid]= useState("")

    const { groups,setGroups } = useGroupsContext()
    const { user } = useUserContext()


    useEffect(()=>{
        if(inviteData?.groups?.pfp){
            setImageUrl(inviteData?.groups?.pfp)
        }
        setSender(inviteData.senderid)
        setGroupName(inviteData?.groups?.groupname)
        setInviteId(inviteData.inviteid)
        setGroupid(inviteData?.groups?.groupid)

    },[])


    const acceptInvite = async ()=>{
        fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/invite/acceptInvite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inviteId:inviteId ,
                receiverid: user.username,
                groupid: groupid,
            }),
        })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {

                if (status === 200) {
            
                    setGroups(g=>[...g,inviteData.groups])
                    removeInvite(inviteId)

                } else {
                console.log('error',body)
                }
            })
            .catch(error => {
                console.log(error)
                // In case the fetch fails
                Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
            });

    }


    const rejectInvite = async ()=>{
        fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/invite/deleteInvite/${inviteId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {

                if (status === 200) {
                    removeInvite(inviteId)
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
            <View>
                <Text style={styles.groupName}>{groupName}</Text>
                <Text style={styles.sender}>from {sender}</Text>
            </View>

            <View style={styles.options}>
                <Pressable style={styles.accept} onPress={acceptInvite}>
                    <Text style={{color:'white',fontWeight:400, fontSize:18}}>+</Text> 
                </Pressable>

                <Pressable style={styles.decline} onPress={rejectInvite}>
                    <Text style={{color:'white',fontWeight:400, fontSize:18}}>x</Text> 
                </Pressable>
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
    groupName: {
        marginLeft: 10,
        fontSize: 18,
    },
    sender:{
        marginLeft: 10,
        fontSize:12,
        color:'gray'
    },
    id: {
        color: 'gray',
        marginLeft: 5,
        fontSize: 18,
    },
    accept: {
        fontSize: 14,
        height:30,
        width:30,
        padding:2,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#08d43f',
        borderRadius:8,
        marginRight:10
    },
    decline:{
        fontSize: 14,
        height:30,
        width:30,
        padding:2,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#ff7e75',
        borderRadius:8,
        marginRight:10
    },
    options:{
        marginLeft: 'auto',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row'
    }
});

export default InviteItem;
