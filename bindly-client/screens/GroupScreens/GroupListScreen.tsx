"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { View, Text, Pressable, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useGroupsContext } from "../GroupsContext"
import { useUserContext } from "../../UserContext"
import GroupListItem from "./components/GroupListItem"
import { registerForPushNotificationsAsync } from "../../notificationUtils"
import type { RootStackParamList, Group } from "../../types"
import { checkToken } from "../../utils/checkToken"
import { SafeAreaView } from "react-native-safe-area-context"
import { Plus, Archive } from "lucide-react-native"

type GroupListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "GroupsList">

const GroupListScreen: React.FC = () => {
  const navigation = useNavigation<GroupListScreenNavigationProp>()
  const { groups, setGroups } = useGroupsContext()
  const { user } = useUserContext()
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"current" | "archive">("current")
  const [archiveGroups, setArchiveGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const checkTokenAndRegister = async () => {
      await registerForPushNotificationsAsync(user?.username || "")
    }
    checkTokenAndRegister()
  }, [user])

  const toNewGroup = () => {
    setActiveTab("current")
    navigation.navigate("GroupCreation1")
  }

  const getAllGroups = async () => {
    try {
      setLoading(true)
      const token = await checkToken()
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/usergroup/getUsergroupByUsername/${user?.username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const res = await response.json()
      setGroups(res.current.map((r: any) => r.groups))
      setArchiveGroups(res.archive.map((r: any) => r.groups))
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    getAllGroups()
  }, []) // Removed user dependency

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    getAllGroups().then(() => setRefreshing(false))
  }, [])

  const renderItem = ({ item }: { item: Group }) => <GroupListItem groupData={item} activeTab={activeTab} />

  const EmptyListComponent = () => (
    <View style={styles.emptyList}>
      <Text style={styles.emptyListText}>No groups found</Text>
      <Pressable style={styles.createGroupButton} onPress={toNewGroup}>
        <Text style={styles.createGroupButtonText}>Create Group</Text>
      </Pressable>
    </View>
  )

  return (
    <View style={styles.container} >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Groupss</Text>
          <Pressable style={styles.newGroupButton} onPress={toNewGroup}>
            <Plus color="#007AFF" size={24} />
          </Pressable>
        </View>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === "current" && styles.activeTab]}
            onPress={() => setActiveTab("current")}
          >
            <Text style={[styles.tabText, activeTab === "current" && styles.activeTabText]}>Current</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "archive" && styles.activeTab]}
            onPress={() => setActiveTab("archive")}
          >
            <Archive color={activeTab === "archive" ? "#007AFF" : "#8E8E93"} size={18} />
            <Text style={[styles.tabText, activeTab === "archive" && styles.activeTabText]}>Archive</Text>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} color="#007AFF" />
        ) : (
          <FlatList
            data={activeTab === "current" ? groups : archiveGroups}
            renderItem={renderItem}
            keyExtractor={(item) => item.groupid}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={EmptyListComponent}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
    paddingTop: 64,
   
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
  },
  newGroupButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#8E8E93",
    marginLeft: 4,
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 48,
  },
  emptyListText: {
    fontSize: 18,
    color: "#8E8E93",
    marginBottom: 16,
  },
  createGroupButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createGroupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default GroupListScreen

