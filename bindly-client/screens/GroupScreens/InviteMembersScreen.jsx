import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRoute } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import placeholder from "../../assets/GroupIcon.png"
import InviteMemberItem from "./components/InviteMemberItem";

const InviteMembersScreen = () => {
  const [users, setUsers] = useState([]);
  const [usersInGroup,setUsersInGroup]=useState([])
  const [invites,setInvites]=useState([])
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const route = useRoute();
  const { groupData } = route.params;

  const{user} = useUserContext()

  const changeInviteStatus = (username) => {
    const updatedUsers = users.map(user => {
      if (user.username === username) {
        return {
          ...user,
          invited: true
        };
      }
      return user;
    });
    setUsers(updatedUsers);
  }


  // Fetch all users when the component mounts
  useEffect(() => {

    const fetchAllAvailableUsers = async () => {
      console.log(`http://localhost3000/bindly/invite/getAvailableInvites/${groupData.groupid}`)
      try {
        const response = await fetch(`http://localhost:3000/bindly/invite/getAvailableInvites/${groupData.groupid}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const res = await response.json();
        console.log(res)
        setUsers(res);
        setFilteredUsers(res);
        console.log(res,'getAvailableInvites')
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllAvailableUsers()
  }, []);

  // Filter users based on the search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered.slice(0, 10));
    }
  }, [searchTerm, users,usersInGroup]);

  return (
    <View style={styles.container}>
        <View style={{marginTop:80}}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search members"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      </View>
      {filteredUsers.length === 0 ? (
        <Text style={styles.noMembers}>No members found</Text>
      ) : (
        <ScrollView style={styles.groupList}>
            {filteredUsers.map((m)=><InviteMemberItem key={m.username} memberData={m} groupData={groupData} changeInviteStatus={changeInviteStatus}></InviteMemberItem>)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
  },
  noMembers: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  memberItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  memberUsername: {
    fontSize: 18,
  },
  groupList:{
    marginTop:20
}
});

export default InviteMembersScreen;
