import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import placeholder from '../../assets/GroupIcon.png';
import backArrow from '../../assets/backArrow.png';
import settings from '../../assets/settings.png';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
import members from '../../assets/members.png';
import info from '../../assets/info.png';
import { BASEROOT_URL } from "@env";
import PostItem from '../GroupScreens/components/PostItem';

const GroupScreen = () => {
  const route = useRoute();
  const { groupData } = route.params;
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { groupData: gd, setGroupData, setGroups } = useGroupsContext();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUserContext();
  const [posts, setPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [page, setPage] = useState(1);
  const [groupUsers, setGroupUsers] = useState([])
  const [isCreate,setIsCreate]=useState(true)
  const [showModal,setShowModal]=useState(false)
  const [vetos,setVetos]=useState([])
  const postsPerPage = 5; // Number of posts to load at a time

  useEffect(() => {
    if (gd?.group) {
      setImageUrl(gd?.group?.pfp);
      setPosts(gd?.post || []);
      setVisiblePosts((gd?.post || []).slice(0, postsPerPage));
      setGroupUsers(gd?.usergroup)
    }
  }, [gd]);


  useEffect(()=>{
    getNotifyveto()
  },[])


  
  const getNotifyveto=async ()=>{
    try {
      const response = await fetch(`${BASEROOT_URL}/bindly/notifyveto/${user.username}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res = await response.json();
      if(res.length>0){
        setShowModal(true)
        setVetos(res)
      }
    }
    catch(error){
      console.log('error')
    }
  }



  const getGroup = async () => {
    try {
      const isInGroup = await inGroup();

      if (!isInGroup) {
        Alert.alert("Invalid Group", "Group has been deleted or not in group");
        navigation.navigate('GroupsList');
        setGroups(g => g.filter(h => h.groupid !== groupData.groupid));
        return;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const response = await fetch(`${BASEROOT_URL}/bindly/group/${groupData.groupid}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res = await response.json();
      setGroupData(res);
      setPosts(res.post || []);
      setGroupUsers(res?.usergroup)


      setVisiblePosts((res.post || []).slice(0, postsPerPage));

      const response2 = await fetch(`${BASEROOT_URL}/bindly/post/postStatus`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          "username": user.username,
          "groupId": groupData.groupid
        }),
      });



      if (!response2.ok) {
        const errorResponse = await response2.json();
        if(errorResponse.message=='JSON object requested, multiple (or no) rows returned]'){
          setIsCreate(true)
        }

        // throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res2 = await response2.json();


      console.log(res2,'watchTHIIISSS')


      if (res2) {
        setGroupData(g =>{ return {...g, 'isCreate': !res2.data,timecycle:res2.startdate}})
        setIsCreate(!res2.data)
    }


    } catch (error) {
    console.error(error);
    if (error.message === 'JSON object requested, multiple (or no) rows returned') {
      Alert.alert("Invalid Group", "Group has been deleted");
      navigation.navigate('GroupsList');
      setGroups(g => g.filter(h => h.groupid !== groupData.groupid));
    }
  } finally {
    setLoading(false);
  }
};

const inGroup = async () => {
  try {
    const response = await fetch(`${BASEROOT_URL}/bindly/usergroup/inGroup`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify({
        "username": user.username,
        "groupId": groupData.groupid
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || 'Failed to fetch group data');
    }

    const res = await response.json();
    return res.inGroup;
  } catch (error) {
    console.error(error);
  }
  return false;
};

const onRefresh = useCallback(() => {
  setRefreshing(true);
  getGroup().then(() => setRefreshing(false));
}, []);

useEffect(() => {
  getGroup();
}, []);

const back = () => {
  navigation.navigate('GroupsList');
};

const setting = () => {
  if (!loading) {
    navigation.navigate("GroupSetting");
  }
};

const toMembers = () => {
  navigation.navigate("MembersList");
};

const toPost = () => {
  if(!isCreate){
    navigation.navigate("EditPost");
  }
  else{
    navigation.navigate("CreatePost");
  }
};

const toInfo = () => {

  navigation.navigate("Info");

};


const loadMorePosts = () => {
  const nextPage = page + 1;
  const newVisiblePosts = posts.slice(0, nextPage * postsPerPage);
  setVisiblePosts(newVisiblePosts);
  setPage(nextPage);
};

return (
  <View style={styles.container}>
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onMomentumScrollEnd={(e) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
          loadMorePosts();
        }
      }}
      style={{ padding: 24 }}
    >
      <Pressable style={styles.backArrow} onPress={back}>
        <Image style={{ height: 40, width: 40 }} source={backArrow} />
      </Pressable>
      {!loading && (
        <Pressable style={styles.setting} onPress={setting}>
          <Image style={{ height: 40, width: 40 }} source={settings} />
        </Pressable>
      )}
      <View style={styles.logoContainer}>
        <Text style={styles.title}>{groupData.groupname}</Text>

        <View style={{ flexDirection: 'row' }}>
          <View>
            <Image style={{ width: 100, height: 100, borderRadius: 8 }} source={imageUrl.length > 0 && !loading ? { uri: imageUrl } : placeholder} />
          </View>
          {!loading && (
            <View style={{ flexDirection: 'row', width: 160, justifyContent: 'space-between', marginTop: 20, marginLeft: 40 }}>
              <View style={{ textAlign: 'center', alignItems: 'center' }}>
                <Pressable style={styles.headerButton} onPress={toMembers}>
                  <Image style={styles.headerButtonIcon} source={members} />
                </Pressable>
                <Text>Members</Text>
              </View>
              <View style={{ textAlign: 'center', alignItems: 'center' }}>
                <Pressable style={styles.headerButton} onPress={toInfo}>
                  <Image style={styles.headerButtonIcon} source={info} />
                </Pressable>
                <Text>Info</Text>
              </View>
            </View>
          )}
        </View>

        {!loading && (
          <Pressable style={styles.createPost} onPress={toPost}>
            <Text style={{ color: 'white' }}>{!isCreate ? 'Edit Post':'Create Post'}</Text>
          </Pressable>
        )}
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {!loading && visiblePosts.map((post, index) => (
        <PostItem
          key={index}
          postid={post.postid}
          imageLink={post.photolink}
          videoLink={post.videolink}
          username={post.username}
          caption={post.caption}
          users={groupUsers}
          time={post.timepost}
          valid={post.valid}
          veto={post.veto}
        />
      ))}

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
});

export default GroupScreen;
