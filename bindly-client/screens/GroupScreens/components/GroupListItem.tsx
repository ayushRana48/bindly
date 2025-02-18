import type React from "react"
import { View, Text, Pressable, Image, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList, Group } from "../../../types"
import { useEffect, useState } from "react"
import { useGroupsContext } from "../../GroupsContext"
interface GroupListItemProps {
  groupData: Group
  activeTab: "current" | "archive"
}

const GroupListItem: React.FC<GroupListItemProps> = ({ groupData, activeTab }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [imageUrl, setImageUrl] = useState<string>("");
  const {groups}= useGroupsContext()

  useEffect(() => {
    // Append a timestamp to force image refresh
    setImageUrl(groupData?.pfp || "");  
  }, [groupData?.pfp,groups]);

  
  const toGroup = () => {
    navigation.navigate("Group", { groupData: groupData })
  }

  return (
    <Pressable style={styles.container} onPress={toGroup}>
      <Image
        style={styles.image}
        source={groupData?.pfp ? { uri: groupData.pfp } : require("../../../assets/GroupIcon.png")}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{groupData?.groupname}</Text>
        <Text style={styles.id}>#{groupData?.groupid?.slice(-4)}</Text>
      </View>
      {activeTab === "archive" && (
        <View style={styles.archivedBadge}>
          <Text style={styles.archivedText}>Archived</Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  id: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 2,
  },
  archivedBadge: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  archivedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
})

export default GroupListItem

