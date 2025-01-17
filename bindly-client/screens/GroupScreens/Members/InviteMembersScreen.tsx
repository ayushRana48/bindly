import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../../UserContext";
import { useGroupsContext } from "../../GroupsContext";
// @ts-ignore
import backArrow from "../../../assets/backArrow.png";
import InviteMemberItem from "../components/InviteMemberItem";
import { InviteMember } from "../../../types"; // Import InviteMember type

const InviteMembersScreen: React.FC = () => {
  const [users, setUsers] = useState<InviteMember[]>([]); // Use InviteMember type
  const [filteredUsers, setFilteredUsers] = useState<InviteMember[]>([]); // Use InviteMember type
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUserContext();
  const { groupData: gd, setGroupData } = useGroupsContext();

  const changeInviteStatus = (username: string) => {
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
  };

  useEffect(() => {
    const fetchAllAvailableUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/bindly/invite/getAvailableInvites/${gd.group.groupid}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const res: InviteMember[] = await response.json(); // Ensure response is typed
        setUsers(res);
        setFilteredUsers(res);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchAllAvailableUsers();
  }, []);

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
      <Pressable onPress={() => navigation.goBack()} style={styles.backArrow}>
        <Image source={backArrow} style={{ height: 35, width: 35 }} />
      </Pressable>
      <View style={{ marginTop: 80 }}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search members"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      {filteredUsers.length === 0 ? 
        loading ? <ActivityIndicator size="large" style={{ width: 80, marginTop: 20, marginHorizontal: 'auto' }} color={'dodgerblue'} /> : <Text style={styles.noMembers}>No members found</Text>
       : (
        <ScrollView style={styles.groupList}>
          {filteredUsers.map((m) => (
            <InviteMemberItem key={m.username} memberData={m} changeInviteStatus={changeInviteStatus} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 32,
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
  groupList: {
    marginTop: 20,
  },
  backArrow: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    zIndex: 10,
  },
});

export default InviteMembersScreen;