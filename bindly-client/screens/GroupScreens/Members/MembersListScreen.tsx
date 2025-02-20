import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { useNavigation, useRoute} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
import MemberListItem from "../components/MemberListItem";
//@ts-ignore
import backArrow from '../../../assets/backArrow.png';
//@ts-ignore
import invite from '../../../assets/invite.png';
import { UserGroup, RootStackParamList } from "../../../types"; // Import UserGroup type
import { checkToken } from "../../../utils/checkToken";

const MembersListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { groups, groupData, setGroupData } = useGroupsContext();
  const { user } = useUserContext();
  const route = useRoute();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [members, setMembers] = useState<UserGroup[]>([]); // Use UserGroup type

  const started = new Date(groupData.group.startdate) < new Date();


  const kickMember = (username: string) => {
    setMembers(m => m.filter(h => h.username !== username));
    setGroupData(g => ({
      ...g,
      usergroup: g.usergroup.filter(h => h.username !== username)
    }));
  };

  const toInvite = () => {
    navigation.navigate('InviteMembers');
  };

  const getAllMembers = async () => {
    try {
      setLoading(true);
      const token = await checkToken();
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/usergroup/getUsergroupByGroup/${groupData.group.groupid}`, {
        headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
      });
      const res: { members: UserGroup[] } = await response.json(); // Ensure response is typed

      console.log(res, 'getAllMembersResflkasjf\n\n');

      setMembers(res.members);
      setGroupData(g => ({
        ...g,
        usergroup: res.members
      }));
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const getGroup = async () => {
    try {
      setLoading(true);
      const token = await checkToken();
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/group/${groupData.group.groupid}`, {
        headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
      });

      const res = await response.json();
      setGroupData(res);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAllMembers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getAllMembers()
      .then(() => getGroup())
      .finally(() => setRefreshing(false));
  }, []);

  const memoizedMembers = useMemo(() => members, [members]);

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <Pressable onPress={() => navigation.goBack()} style={styles.backArrow}>
          <Image source={backArrow} style={{ height: 35, width: 35 }} />
        </Pressable>
        {!started && <Pressable style={styles.invite} onPress={toInvite}>
          <Image style={{ height: 35, width: 35 }} source={invite} />
        </Pressable>}

        <View style={styles.groupname}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{groupData.group.groupname} Members</Text>
        </View>
        {members.length === 0 && groupData.group ? (
          loading ? <ActivityIndicator size="large" style={{ width: 80, marginTop: 20, marginHorizontal: 'auto' }} color={'dodgerblue'} /> : <Text style={styles.NoGroups}>No Members</Text>
        ) : (
          <ScrollView style={styles.groupList}>
            {members.map((m) => <MemberListItem key={m.username} memberData={m} kickMember={kickMember} />)}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 32,
    flex: 1,
  },
  groupname: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 40,
    height: 40,
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
  invite: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 10,
    width: 40,
    height: 40,
    zIndex: 10,
  },
});

export default MembersListScreen;