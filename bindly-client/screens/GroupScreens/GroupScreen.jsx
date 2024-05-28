import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import placeholder from '../../assets/GroupIcon.png';
import backArrow from '../../assets/backArrow.png';
import settings from '../../assets/settings.png';


const GroupScreen = () => {
  const route = useRoute();
  const { groupData } = route.params;
  const [imageUrl, setImageUrl] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    // Append a timestamp to force image refresh
    setImageUrl(groupData.pfp);
    
    
  }, [groupData.pfp]);


 

  const back = () => {
    navigation.navigate('GroupsList');
  }

  const setting = () => {
    navigation.navigate("GroupSetting", { groupData: groupData });
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backArrow} onPress={back}>
        <Image style={{ height: 40, width: 40 }} source={backArrow} />
      </Pressable>
      <Pressable style={styles.setting} onPress={setting}>
        <Image style={{ height: 40, width: 40 }} source={settings} />
      </Pressable>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Group</Text>
        <Text style={styles.title}>{groupData.groupname}</Text>
        <Image style={{ width: 100, height: 100, borderRadius: 8 }} source={imageUrl.length>0 ? { uri: imageUrl } : placeholder} />

      </View>
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
    top: 50,
    left: 30,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  setting: {
    position: 'absolute',
    top: 50,
    right: 30,
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
