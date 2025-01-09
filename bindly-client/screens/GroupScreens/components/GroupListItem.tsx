import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from "../../GroupsContext";

// @ts-ignore
import placeholder from '../../../assets/GroupIcon.png';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Group } from "../../../types";

interface GroupListItemProps {
  groupData: Group;
  activeTab: 'current' | 'archive';
}

const GroupListItem: React.FC<GroupListItemProps> = ({ groupData, activeTab }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [imageUrl, setImageUrl] = useState<string>("");
  const {groups}= useGroupsContext()

  useEffect(() => {
    // Append a timestamp to force image refresh
    setImageUrl(groupData?.pfp || "");  
  }, [groupData?.pfp,groups]);



  const toGroup = () => {
    console.log('yoo we are going to the grrooop')
      navigation.navigate("Group", { groupData: groupData });
  }




  return (
    <Pressable style={styles.container} onPress={toGroup}>
      <Image
        style={{ width: 50, height: 50, borderRadius: 8 }}
        source={imageUrl ? { uri: imageUrl } : placeholder}
      />
      <Text style={styles.name}>{groupData?.groupname}</Text>
      <Text style={styles.id}>#{groupData?.groupid?.slice(-4)}</Text>
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
  name: {
    marginLeft: 10,
    fontSize: 18,
  },
  id: {
    color: 'gray',
    marginLeft: 5,
    fontSize: 18,
  },
  status: {
    fontSize: 14,
    marginLeft: 'auto',
  },
});

export default GroupListItem;
