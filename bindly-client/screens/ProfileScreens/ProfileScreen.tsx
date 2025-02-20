"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useUserContext } from "../../UserContext"
import * as SecureStore from "expo-secure-store"
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaView } from "react-native-safe-area-context"
import { Camera, Wallet, Book, Users, LogOut, ChevronRight, Plus } from "lucide-react-native"

import { removePushTokenAsync } from "../../notificationUtils"
import type { RootStackParamList } from "../../types"
import { checkToken } from "../../utils/checkToken"
import compressImage from "../../utils/compressImage"
import blobToBase64 from "../../utils/blobToBase64"

const LOGGING_URL = "https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/log"

async function logToServer(message: string) {
  console.log(`message: ${message}`)
  try {
    await fetch(LOGGING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ logData: message }),
    })
  } catch (error) {
    console.error("Error logging to server:", error)
  }
}

const ProfileScreen: React.FC = () => {
  const { email, user, setEmail, setUser } = useUserContext()
  const [imageSrc, setImageSrc] = useState({ uri: user?.pfp || "" })
  const [openModal, setOpenModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    if (user && user.pfp) {
      setImageSrc({ uri: user.pfp })
    }
  }, [user])

  const toWallet = () => navigation.navigate("Wallet")
  const toRules = () => navigation.navigate("Rules")
  const toConnection = () => navigation.navigate("Connection")

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      const compressedUri = await compressImage(result.assets[0].uri)
      setImageSrc({ uri: compressedUri })
      setOpenModal(false)
      submitPicture(compressedUri)
    }
  }

  const takeImage = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync()
      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled) {
        const compressedUri = await compressImage(result.assets[0].uri)
        setImageSrc({ uri: compressedUri })
        setOpenModal(false)
        submitPicture(compressedUri)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const removeImage = () => {
    setImageSrc({ uri: "" })
    setOpenModal(false)
    submitPicture("")
  }

  const submitPicture = async (uri: string) => {
    let imgBase64 = ""

    logToServer("submitting pic in profile screen")
    logToServer(`uri here: ${uri}`)

    if (uri) {
      const response = await fetch(uri)
      const blob = await response.blob()
      imgBase64 = await blobToBase64(blob)
    }
    const token = await checkToken()

    fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/users/updateUser/${user?.username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        pfp: imgBase64,
      }),
    })
      .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
      .then(async ({ status, body }) => {
        if (status === 200) {
          if (user) {
            setUser({ ...user, pfp: uri })
          }
        } else {
          Alert.alert("Error", "Failed to update profile picture.")
        }
      })
      .catch((error) => {
        console.log(error)
        Alert.alert("Network Error", "Unable to connect to the server. Please try again later.")
      })
  }

  const getUser = async () => {
    try {
      const token = await checkToken()
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/users/email/${email}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.status === 200) {
        setUser(data)
      } else if (data.error) {
        console.log("Error received:", data.error)
      }
    } catch (error) {
      console.error("Network or server error:", error)
    }
  }

  const logOut = async () => {
    if (loading) {
      console.log("loading")
      return
    }
    setLoading(true)
    try {
      const token = await checkToken()
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/auth/signOut`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        method: "POST",
      })
      const data = await response.json()
      console.log(data, "logout data")
      if (response.status === 200) {
        await SecureStore.deleteItemAsync("accessToken")
        await SecureStore.deleteItemAsync("refreshToken")
        await AsyncStorage.removeItem("userEmail")
        await removePushTokenAsync(user?.username || "")
        console.log("removeTest")
        setEmail("")
      } else if (data.error) {
        console.log("Error received:", data.error)
      }
      else if (data.message == "No user currently signed in") {
        await SecureStore.deleteItemAsync("accessToken")
        await SecureStore.deleteItemAsync("refreshToken")
        await AsyncStorage.removeItem("userEmail")
        await removePushTokenAsync(user?.username || "")
        console.log("removeTest2")
        setEmail("")     
      }
    } catch (error) {
      console.error("Network or server error:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await getUser()
    setRefreshing(false)
  }, []) // Modified: Removed getUser from dependencies

  const renderMenuItem = (icon: React.ReactNode, title: string, onPress: () => void) => (
    <Pressable style={styles.menuItem} onPress={onPress}>
      {icon}
      <Text style={styles.menuItemText}>{title}</Text>
      <ChevronRight color="#8E8E93" size={20} />
    </Pressable>
  )

  return (
    <View style={styles.container}>
   
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile</Text>
        </View>

        <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image style={styles.avatar} source={imageSrc.uri ? imageSrc : require("../../assets/profile.png")} />
            <Pressable style={styles.changeAvatarButton} onPress={() => setOpenModal(true)}>
              <Plus color="#FFFFFF" size={20} />
            </Pressable>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.balance}>Balance: ${user?.balance?.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {renderMenuItem(<Wallet color="#007AFF" size={24} />, "Wallet", toWallet)}
          {renderMenuItem(<Book color="#007AFF" size={24} />, "Rules", toRules)}
          {renderMenuItem(<Users color="#007AFF" size={24} />, "Connections", toConnection)}
        </View>

        <Pressable style={styles.logoutButton} onPress={logOut}>
          {loading ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <>
              <LogOut color="#FFFFFF" size={20} />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </>
          )}
        </Pressable>

        <Modal visible={openModal} transparent={true} onRequestClose={() => setOpenModal(false)}>
          <TouchableWithoutFeedback onPress={() => setOpenModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Change Profile Photo</Text>
                  <View style={styles.modalButtons}>
                    <Pressable style={styles.modalButton} onPress={takeImage}>
                      <Camera color="#007AFF" size={30} />
                      <Text style={styles.modalButtonText}>Camera</Text>
                    </Pressable>
                    <Pressable style={styles.modalButton} onPress={pickImage}>
                      <Image style={styles.modalButtonIcon} source={require("../../assets/galleryIcon.png")} />
                      <Text style={styles.modalButtonText}>Gallery</Text>
                    </Pressable>
                    <Pressable style={styles.modalButton} onPress={removeImage}>
                      <Image style={styles.modalButtonIcon} source={require("../../assets/trashIcon.png")} />
                      <Text style={styles.modalButtonText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  balance: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  menuItemText: {
    fontSize: 17,
    marginLeft: 15,
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    padding: 16,
    marginTop: 40,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    alignItems: "center",
  },
  modalButtonIcon: {
    width: 30,
    height: 30,
    marginBottom: 8,
  },
  modalButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
})

export default ProfileScreen

