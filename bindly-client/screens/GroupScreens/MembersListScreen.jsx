import React, { useEffect, useState, useMemo } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
import MemberListItem from "./components/MemberListItem";
import backArrow from '../../assets/backArrow.png';
import invite from '../../assets/invite.png';


const MembersListScreen = () => {
  const navigation = useNavigation();
  const { groups, groupData:g2, setGroupData } = useGroupsContext();
  const { user } = useUserContext();
  const route = useRoute();



  const [members, setMembers] = useState([]);

  const kickMember = (username)=>{
    setMembers(m => m.filter(h=>h.username!==username))
    setGroupData(g => ({
      ...g,
      usergroup: g.group.usergroup.filter(h => h.username !== username)
    }));
  }


  const toInvite = ()=>{
    navigation.navigate('InviteMembers')
  }



  const getAllMembers = async () => {
    try {
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/usergroup/getUsergroupByGroup/${g2.group.groupid}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await response.json();


      setMembers(res.members);
      setGroupData(g => ({
        ...g,
       usergroup: res.members
        }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllMembers();
  }, []);

  const memoizedMembers = useMemo(() => members, [members]);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backArrow}>
        <Image source={backArrow} style={{ height: 40, width: 40 }}></Image>
      </Pressable>
      <Pressable style={styles.invite} onPress={toInvite} >
            <Image style={{height:40,width:40}} source={invite}></Image>
        </Pressable>

    <View style={styles.groupname}>
        <Text style={{fontSize:15}}>{g2.group.groupname} Members</Text>
       
      </View>

     

      {members.length === 0 && g2.group? (
        <Text style={styles.NoGroups}>No Members</Text>
      ) : (
        <ScrollView style={styles.groupList}>
            {members.map((m)=><MemberListItem memberData={m} kickMember={kickMember}></MemberListItem>)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 32,
    flex: 1,
  },
  groupname:{
    justifyContent:'center',
    alignItems:'center',
    marginTop:60,
  },    
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 30,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  NoGroups: {
    fontSize: 20,
    fontFamily: 'bold',
    textAlign: 'center',
  },
  groupList: {
    marginTop: 20,
  },
  invite:{
    flexDirection:'row',
    alignItems:'center',
    position:'absolute',
    top: 50,
    right: 30,
    width: 50,
    height: 50,
    zIndex: 10,
  },
});

export default MembersListScreen;
