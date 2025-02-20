"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, RefreshControl } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useUserContext } from "../../UserContext"
import { checkToken } from "../../utils/checkToken"
import BalanceItem from "./components/BalanceItem"

interface CompressedBalance {
  id: string
  amount: number
  payer: string
  receiver: string
}

interface GroupBalance {
  unpaid: {
    [id: string]: {
      id: string
      amount: number
      payer: string
      receiver: string
    }
  }
  paid: {
    [id: string]: {
      id: string
      amount: number
      payer: string
      receiver: string
    }
  }
}

interface BalanceData {
  compressed_balance_dict: CompressedBalance[]
  group_balance_dict: GroupBalance
}

const BalanceScreen: React.FC = () => {
  const [isGroupView, setIsGroupView] = useState(true)
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [unpaidExpanded, setUnpaidExpanded] = useState(true)
  const [paidExpanded, setPaidExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigation = useNavigation()
  const { user } = useUserContext()
  const [refreshing, setRefreshing] = useState(false)


  useEffect(() => {
    fetchBalanceData()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchBalanceData().then(() => setRefreshing(false))
  }, []) 

  const fetchBalanceData = async () => {
    try {
      setIsLoading(true)
      const token = await checkToken()
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/venmoBalance/getBalance/${user?.username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      console.log("data", data)
      setBalanceData(data)
    } catch (error) {
      console.error("Error fetching balance data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderCompressedView = () => {
    if (!balanceData) return null
    return (
      <View style={styles.compressedContainer}>
        {balanceData.compressed_balance_dict.map((b) => (
          <BalanceItem key={b.id} payer={b.payer} receiver={b.receiver} amount={b.amount} isPaid={false} />
        ))}
      </View>
    )
  }

  const renderGroupView = () => {
    if (!balanceData) return null
    const unpaidCount = Object.keys(balanceData.group_balance_dict.unpaid).length
    const paidCount = Object.keys(balanceData.group_balance_dict.paid).length

    return (
      <View style={styles.groupContainer}>
        <Pressable style={styles.sectionHeader} onPress={() => setUnpaidExpanded(!unpaidExpanded)}>
          <Text style={styles.sectionTitle}>Unpaid ({unpaidCount})</Text>
          <Ionicons name={unpaidExpanded ? "chevron-up" : "chevron-down"} size={24} color="#000" />
        </Pressable>
        {unpaidExpanded && renderBalanceItems(balanceData.group_balance_dict.unpaid, false)}

        <Pressable style={styles.sectionHeader} onPress={() => setPaidExpanded(!paidExpanded)}>
          <Text style={styles.sectionTitle}>Paid ({paidCount})</Text>
          <Ionicons name={paidExpanded ? "chevron-up" : "chevron-down"} size={24} color="#000" />
        </Pressable>
        {paidExpanded && renderBalanceItems(balanceData.group_balance_dict.paid, true)}
      </View>
    )
  }

  const renderBalanceItems = (items: GroupBalance["unpaid"] | GroupBalance["paid"], isPaid: boolean) => {
    return Object.entries(items).map(([id, { id: id2, amount, payer, receiver }]) => (
      <BalanceItem
        key={id2}
        payer={payer}
        receiver={receiver}
        amount={payer === user?.username ? -amount : amount}
        isPaid={isPaid}
        groupId={id}
      />
    ))
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
       
        <Text style={styles.title}>Balance</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isGroupView && styles.toggleButtonActive]}
          onPress={() => setIsGroupView(false)}
        >
          <Text style={[styles.toggleText, !isGroupView && styles.toggleTextActive]}>Compressed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isGroupView && styles.toggleButtonActive]}
          onPress={() => setIsGroupView(true)}
        >
          <Text style={[styles.toggleText, isGroupView && styles.toggleTextActive]}>Group</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>{isGroupView ? renderGroupView() : renderCompressedView()}</ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  toggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: "#007AFF",
  },
  toggleText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    flex: 1,
  },
  compressedContainer: {
    flex: 1,
  },
  groupContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
})

export default BalanceScreen

