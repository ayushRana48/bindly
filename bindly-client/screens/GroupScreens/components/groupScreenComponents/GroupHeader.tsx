import type React from "react"
import { View, Text, Pressable, Image, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ArrowLeft, Settings, Users, Info, PlusCircle } from "lucide-react-native"

interface GroupHeaderProps {
  loading: boolean
  imageUrl: string
  groupName: string
  started: boolean
  ended: boolean
  startDate: string
  endDate: string
  createStatus: "post" | "edit"
  back: () => void
  setting: () => void
  toMembers: () => void
  toInfo: () => void
  toPost: () => void
  toLeaderboard: () => void
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  loading,
  imageUrl,
  groupName,
  started,
  ended,
  startDate,
  endDate,
  createStatus,
  back,
  setting,
  toMembers,
  toInfo,
  toPost,
  toLeaderboard,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={back}>
          <ArrowLeft color="#000" size={36} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {groupName}
        </Text>
        
          <Pressable style={styles.iconButton} onPress={setting}>
            <Settings color="#000" size={36} />
          </Pressable>
        
      </View>
      <View style={styles.content}>
        <Image
          style={styles.groupImage}
          source={imageUrl ? { uri: imageUrl } : require("../../../../assets/GroupIcon.png")}
        />
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={toLeaderboard}>
            <Users color="black" size={32} />
            <Text style={styles.actionText}>Leaderboard</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={toInfo}>
            <Info color="black" size={32} />
            <Text style={styles.actionText}>Info</Text>
          </Pressable>
        </View>
      </View>
      {!loading && started && !ended && (
        <View style={styles.postSection}>
          <Pressable style={styles.createPostButton} onPress={toPost}>
            <PlusCircle color="#FFF" size={20} />
            <Text style={styles.createPostText}>{createStatus === "edit" ? "Edit Post" : "Create Post"}</Text>
          </Pressable>
          <Text style={styles.deadlineText}>Post by {new Date(startDate).toLocaleTimeString()}</Text>
        </View>
      )}
      {!loading && !started && (
        <Text style={styles.startDateText}>
          Starts{" "}
          {new Date(startDate).toLocaleDateString() +
            " " +
            new Date(startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}
      {!loading && ended && (
        <Text style={styles.endDateText}>
          Ended{" "}
          {new Date(endDate).toLocaleDateString() +
            " " +
            new Date(endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 32,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
    marginTop: 24,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  groupImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  actions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: 16,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: "black",
  },
  postSection: {
    alignItems: "center",
    paddingBottom: 16,
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  createPostText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  deadlineText: {
    marginTop: 8,
    fontSize: 12,
    color: "#8E8E93",
  },
  startDateText: {
    textAlign: "center",
    fontSize: 14,
    color: "#8E8E93",
    paddingBottom: 16,
  },
  endDateText: {
    textAlign: "center",
    fontSize: 14,
    color: "#8E8E93",
    paddingBottom: 16,
  },
})

export default GroupHeader

