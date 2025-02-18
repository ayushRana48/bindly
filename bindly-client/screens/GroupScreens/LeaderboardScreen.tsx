"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Pressable, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useGroupsContext } from "../GroupsContext"
import LeaderboardItem from "./components/LeaderboardItem"
import type { LeaderboardMember } from "../../types"
import { checkToken } from "../../utils/checkToken"
// @ts-ignore
import backArrow from "../../assets/backArrow.png"

const LeaderboardScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const navigation = useNavigation()
  const { groupData } = useGroupsContext()
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([])

  const getLeaderBoard = async (): Promise<void> => {
    try {
      const token = await checkToken()
      const response = await fetch(`http://localhost:3000/bindly/group/getLeaderboard/${groupData.group.groupid}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorResponse = await response.json()
        throw new Error(errorResponse.error || "Failed to fetch leaderboard data")
      }

      const res = await response.json()
      setLeaderboard(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    getLeaderBoard().then(() => setRefreshing(false))
  }, [getLeaderBoard])

  useEffect(() => {
    getLeaderBoard()
  }, [groupData?.group?.groupid])

  const back = (): void => {
    navigation.goBack()
  }

  const renderItem = ({ item }: { item: LeaderboardMember }) => <LeaderboardItem memberData={item} />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backArrow} onPress={back}>
          <Image style={styles.backArrowImage} source={backArrow} />
        </Pressable>
        <Text style={styles.title}>{groupData.group.groupname} Leaderboard</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(item) => item.username}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backArrow: {
    padding: 10,
  },
  backArrowImage: {
    height: 24,
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 34,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default LeaderboardScreen

