"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, Pressable, Image, StyleSheet, Modal, Alert, TouchableWithoutFeedback } from "react-native"
import { useGroupsContext } from "../../GroupsContext"
import { useUserContext } from "../../../UserContext"
import type { UserGroup } from "../../../types"
// @ts-ignore
import placeholder from "../../../assets/profile.png"
import { checkToken } from "../../../utils/checkToken"

interface MemberListItemProps {
  memberData: UserGroup
  kickMember: (username: string) => void
}

const MemberListItem: React.FC<MemberListItemProps> = ({ memberData, kickMember }) => {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isModalVisible, setModalVisible] = useState<boolean>(false)
  const { groupData, setGroupData } = useGroupsContext()
  const { user } = useUserContext()

  const isPastDate = new Date(groupData.group.startdate) < new Date()

  useEffect(() => {
    if (memberData.users?.pfp) {
      setImageUrl(memberData.users.pfp)
    }
  }, [memberData])

  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  const changeHost = async () => {
    try {
      const token = await checkToken()
      const response = await fetch(`http://localhost:3000/bindly/group/changeHost`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: user?.username,
          groupId: groupData.group.groupid,
          newHost: memberData.username,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        Alert.alert("Success", "Host changed successfully")
        setGroupData((g: any) => ({
          ...g,
          group: {
            ...g.group,
            hostid: memberData.username,
          },
        }))
      } else {
        Alert.alert("Error", data.error)
      }
    } catch (error: any) {
      Alert.alert("Error", error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      toggleModal()
    }
  }

  const kickUser = async () => {
    try {
      const token = await checkToken()
      const response = await fetch(`http://localhost:3000/bindly/usergroup/kickUser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: user?.username,
          groupId: groupData.group.groupid,
          kickedUser: memberData.username,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        Alert.alert("Success", "User kicked successfully")
        kickMember(memberData.username)
      } else {
        Alert.alert("Error", data.error)
      }
    } catch (error: any) {
      Alert.alert("Error", error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      toggleModal()
    }
  }

  return (
    <View style={styles.container}>
      <Image style={styles.avatar} source={imageUrl ? { uri: imageUrl } : placeholder} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{memberData.username}</Text>
        {memberData.username === groupData.group.hostid && (
          <View style={styles.hostBadge}>
            <Text style={styles.hostBadgeText}>Host</Text>
          </View>
        )}
      </View>
      {user?.username === groupData.group.hostid && user?.username !== memberData.username && !isPastDate && (
        <Pressable style={styles.optionsButton} onPress={toggleModal}>
          <Text style={styles.optionsButtonText}>•••</Text>
        </Pressable>
      )}

      <Modal transparent={true} visible={isModalVisible} onRequestClose={toggleModal} animationType="fade">
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Pressable style={styles.modalOption} onPress={changeHost}>
                <Text style={styles.modalOptionText}>Promote to Host</Text>
              </Pressable>
              <Pressable style={[styles.modalOption, styles.kickOption]} onPress={kickUser}>
                <Text style={[styles.modalOptionText, styles.kickOptionText]}>Kick from Group</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  hostBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  hostBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  optionsButton: {
    padding: 10,
  },
  optionsButtonText: {
    fontSize: 18,
    color: "#555",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  kickOption: {
    borderBottomWidth: 0,
  },
  kickOptionText: {
    color: "red",
  },
})

export default MemberListItem

