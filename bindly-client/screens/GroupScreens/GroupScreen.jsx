import React, { useEffect, useState,useCallback } from "react";
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator, ScrollView,RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import placeholder from '../../assets/GroupIcon.png';
import backArrow from '../../assets/backArrow.png';
import settings from '../../assets/settings.png';
import { useGroupsContext } from "../GroupsContext";

const GroupScreen = () => {
  const route = useRoute();
  const { groupData } = route.params;
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { groupData: gd, setGroupData } = useGroupsContext();
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    // Append a timestamp to force image refresh
    if (gd?.group) {
      setImageUrl(gd?.group?.pfp);
    }
    else{
      setImageUrl(groupData.pfp);
    }
  }, [gd]);

  const getGroup = async () => {
    console.log('call')
    try {
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/group/${groupData.groupid}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();
      setGroupData(res);
    } catch (error) {
      console.log(error, 'sdsdsd');
    } finally {
      setLoading(false);
    }
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

 
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Pressable style={styles.backArrow} onPress={back}>
          <Image style={{ height: 40, width: 40 }} source={backArrow} />
        </Pressable>
        {!loading && (
          <Pressable style={styles.setting} onPress={setting}>
            <Image style={{ height: 40, width: 40 }} source={settings} />
          </Pressable>
        )}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Group</Text>
          <Text style={styles.title}>{groupData.groupname}</Text>
          <Image style={{ width: 100, height: 100, borderRadius: 8 }} source={imageUrl.length > 0 && !loading  ? { uri: imageUrl } : placeholder} />
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 24,
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
    marginTop: 36,
    marginBottom: 36,
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  centeredRow: {
    alignItems: 'center',
    marginTop: 16,
  },
});

export default GroupScreen;
