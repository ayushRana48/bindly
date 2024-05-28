import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRoute } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import placeholder from "../../assets/GroupIcon.png"
import InviteMemberItem from "./components/InviteMemberItem";

const InviteMembersScreen = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const route = useRoute();
  const { groupData } = route.params;

  const{user} = useUserContext()


  // Fetch all users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/users', {
          headers: { 'Content-Type': 'application/json' },
        });
        const res = await response.json();
        setUsers(res);
        setFilteredUsers(res);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
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
  }, [searchTerm, users]);

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
            {filteredUsers.map((m)=><InviteMemberItem memberData={m} groupData={groupData}></InviteMemberItem>)}
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
