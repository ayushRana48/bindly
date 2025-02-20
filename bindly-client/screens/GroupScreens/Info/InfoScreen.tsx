"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Modal,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
// @ts-ignore
import placeholder from "../../../assets/GroupIcon.png"
// @ts-ignore
import backArrow from "../../../assets/backArrow.png"
import { useGroupsContext } from "../../GroupsContext"
import { useUserContext } from "../../../UserContext"
import MemberListItem from "../components/MemberListItem"
import type { UserGroup } from "../../../types"
import { checkToken } from "../../../utils/checkToken"
import { ArrowLeft } from "lucide-react-native"

const InfoScreen: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const navigation = useNavigation()
  const { groupData, setGroupData } = useGroupsContext()
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [members, setMembers] = useState<UserGroup[]>([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { user } = useUserContext()

  useEffect(() => {
    if (groupData?.group?.pfp) {
      setImageUrl(groupData.group.pfp)
    }
  }, [groupData])

  const getMembers = async (): Promise<void> => {
    try {
      const token = await checkToken()
      const response = await fetch(
        `https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/usergroup/getUsergroupByGroup/${groupData.group.groupid}`,
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        },
      )

      if (!response.ok) {
        const errorResponse = await response.json()
        throw new Error(errorResponse.error || "Failed to fetch members data")
      }

      const res = await response.json()
      setMembers(res.members)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    getMembers().then(() => setRefreshing(false))
  }, [getMembers]) // Added getMembers as a dependency

  useEffect(() => {
    getMembers()
  }, [groupData?.group?.groupid]) // Removed getMembers as a dependency

  const back = (): void => {
    navigation.goBack()
  }

  const goToInviteMembers = (): void => {
    // @ts-ignore
    navigation.navigate('InviteMembers');
  }

  const kickMember = (username: string) => {
    setMembers((m) => m.filter((member) => member.username !== username))
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{ padding: 24 }}
      >
         <Pressable style={styles.iconButton} onPress={back}>
          <ArrowLeft color="#000" size={36} />
        </Pressable>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>{groupData.group.groupname}</Text>

          <View style={{ flexDirection: "row" }}>
            <View>
              <Image
                style={{ width: 100, height: 100, borderRadius: 8 }}
                source={imageUrl.length > 0 && !loading ? { uri: imageUrl } : placeholder}
              />
            </View>
            <View style={{ flex: 1, marginTop: 10, marginLeft: 20 }}>
              <View style={{ flexDirection: "row", marginBottom: 5, flexWrap: "wrap" }}>
                <Text style={{ fontWeight: "700" }}>Task Per Week:</Text>
                <Text>{groupData.group.tasksperweek}</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 5, flexWrap: "wrap" }}>
                <Text style={{ fontWeight: "700" }}>Buy in:</Text>
                <Text>$8.00</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 5, flexWrap: "wrap", paddingRight: 10 }}>
                <Text numberOfLines={5} ellipsizeMode="tail" onPress={() => setModalVisible(true)}>
                  <Text style={{ fontWeight: "700" }}>Description: </Text>
                  {groupData.group.description}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>

          <Pressable style={styles.inviteButton} onPress={goToInviteMembers}>
            <Text style={styles.inviteButtonText}>Invite Members</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Members</Text>

        {loading && <ActivityIndicator size="large" color="#0000ff" />}

        {!loading && (
          <View style={{ paddingBottom: 32 }}>
            {members.map((member) => (
              <MemberListItem key={member.username} memberData={member} kickMember={kickMember} />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Description</Text>
            <ScrollView>
              <Text>{groupData.group.description}</Text>
            </ScrollView>
            <Pressable style={[styles.button, styles.buttonClose]} onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  logoContainer: {
    marginLeft: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1,
    paddingBottom: 10,
    height: 190,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF8D1D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    marginTop: 15,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  inviteButton: {
    backgroundColor: "dodgerblue",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "80%",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  inviteButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  iconButton: {
    padding: 8,
    marginTop: 20,
  },
})

export default InfoScreen

