"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { View, ScrollView, RefreshControl, StyleSheet, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { SafeAreaView } from "react-native-safe-area-context"
import { Bell } from "lucide-react-native"

import { useUserContext } from "../../UserContext"
import InviteList from "./components/InviteList"
import type { Invite, RootStackParamList } from "../../types"
import { checkToken } from "../../utils/checkToken"

const ActivityScreen: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { user } = useUserContext()

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const getAllInvites = async (): Promise<void> => {
    try {
      const token = await checkToken()
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/invite/getInviteByReciever/${user?.username}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      const res: Invite[] = await response.json()
      setInvites(res)
    } catch (error) {
      console.log(error)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    getAllInvites().then(() => setRefreshing(false))
  }, []) 

  useEffect(() => {
    onRefresh()
  }, [onRefresh])

  return (
    <View style={styles.container}>
      
        <View style={styles.header}>
          <Text style={styles.headerText}>Activity</Text>
        </View>

        <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell color="#007AFF" size={24} />
            <Text style={styles.sectionTitle}>Invites</Text>
          </View>
          <InviteList invites={invites} setInvites={setInvites} />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
    paddingTop: 72, 
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#E5E5EA",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
})

export default ActivityScreen

