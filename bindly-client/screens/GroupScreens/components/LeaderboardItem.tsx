"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, Image, StyleSheet } from "react-native"
import { useGroupsContext } from "../../GroupsContext"
// @ts-ignore
import placeholder from "../../../assets/profile.png"

interface LeaderboardItemProps {
  memberData: {
    username: string
    place: number
    netMoney: number
    totalCountedPosts: number
    totalUnCountedPosts: number
    users?: {
      pfp?: string
    }
  }
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ memberData }) => {
  const [imageUrl, setImageUrl] = useState<any>(placeholder)
  const { groupData } = useGroupsContext()

  useEffect(() => {
    const user = groupData?.usergroup?.find((user) => user?.username === memberData.username)
    if (user?.users?.pfp) {
      setImageUrl({ uri: user.users.pfp })
    }
  }, [groupData?.usergroup, memberData.username])


  const losingMoney = (): boolean => {
    return groupData?.group?.buyin > memberData.netMoney 
  }

  return (
    <View style={styles.container}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>{memberData.place}</Text>
      </View>
      <Image style={styles.avatar} source={imageUrl} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{memberData.username}</Text>
        <Text style={styles.subText}>
          {memberData.totalCountedPosts} posts • {memberData.totalUnCountedPosts} uncounted
        </Text>
      </View>
      <View style={styles.moneyContainer}>
        <Text style={losingMoney() ? styles.moneyRed : styles.money}>${memberData.netMoney.toFixed(2)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 10,
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: "#777",
  },
  moneyContainer: {
    alignItems: "flex-end",
  },
  money: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  moneyRed: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4C4C",
  },
})

export default LeaderboardItem

