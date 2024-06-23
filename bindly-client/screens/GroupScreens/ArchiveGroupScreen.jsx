import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import placeholder from '../../assets/GroupIcon.png';
import backArrow from '../../assets/backArrow.png';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
import members from '../../assets/members.png';
import info from '../../assets/info.png';
import { BASEROOT_URL } from "@env";
import PostItem from '../GroupScreens/components/PostItem';
import LeaderboardItem from "./components/LeaderboardItem";

const ArchiveGroupScreen = () => {
  const route = useRoute();
  const { groupData } = route.params;
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useUserContext();
  const [leaderboard,setLeaderboard]=useState({})



  useEffect(() => {
   setImageUrl(groupData.pfp)
  }, [groupData]);



  useEffect(()=>{
    getLeaderBoard()
  },[])



  
  const getLeaderBoard = async () => {

    try {
      const response = await fetch(`${BASEROOT_URL}/bindly/group/getLeaderboard/${groupData.groupid}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res = await response.json();

      setLeaderboard(res)

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

const back = () => {
  navigation.navigate('GroupsList');
};





return (
  <View style={styles.container}>
    <ScrollView
      style={{ padding: 24 }}
    >
      <Pressable style={styles.backArrow} onPress={back}>
        <Image style={{ height: 40, width: 40 }} source={backArrow} />
      </Pressable>
     
      <View style={styles.logoContainer}>
        <Text style={styles.title}>{groupData.groupname}</Text>

        <View style={{ flexDirection: 'row' }}>
          <View>
            <Image style={{ width: 100, height: 100, borderRadius: 8 }} source={imageUrl.length > 0 && !loading ? { uri: imageUrl } : placeholder} />
          </View>
            <View style={{ flexDirection: 'row', width: 160, justifyContent: 'space-between', marginTop: 20, marginLeft: 40 }}>
                <Text>{groupData.description}</Text>
            </View>
          
        </View>
      </View>

      <Text style={{textAlign:'center', fontSize:18}}>Leaderboard</Text>

        {loading && <ActivityIndicator size="large" color="#0000ff" />}

        {!loading &&
          (< ScrollView style={{paddingBottom:32}}>
            {leaderboard.map((l) => <LeaderboardItem key={l.username} memberData={l}></LeaderboardItem>)}
          </ScrollView>
          )}

    </ScrollView>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  setting: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  logoContainer: {
    marginTop: 60,
    marginBottom: 36,
    marginLeft: 20,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    paddingBottom: 10,
    height: 235,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  centeredRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  headerButton: {
    width: 60,
    height: 60,
    padding: 10,
    backgroundColor: '#e3e3e3',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerButtonIcon: {
    width: 30,
    height: 30,
  },
  createPost: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF8D1D',
    width: 180,
    height: 40,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  setting: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  logoContainer: {
    marginTop: 60,
    marginBottom: 36,
    marginLeft: 20,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    paddingBottom: 10,
    height: 190,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  centeredRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  headerButton: {
    width: 60,
    height: 60,
    padding: 10,
    backgroundColor: '#e3e3e3',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerButtonIcon: {
    width: 30,
    height: 30,
  },
  createPost: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF8D1D',
    width: 180,
    height: 40,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default ArchiveGroupScreen;
