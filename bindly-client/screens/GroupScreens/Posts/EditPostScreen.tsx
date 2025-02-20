"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserContext } from "../../../UserContext"
import { useGroupsContext } from "../../GroupsContext"
import * as ImagePicker from "expo-image-picker"
import compressPostImage from "../../../utils/compressPostImage"
import type { GroupData, Post } from "../../../types"
import { checkToken } from "../../../utils/checkToken"
import { Ionicons } from "@expo/vector-icons"

const EditPostScreen: React.FC = () => {
  const { setGroupData, groupData } = useGroupsContext()
  const { user } = useUserContext()
  const navigation = useNavigation()

  const [caption, setCaption] = useState("")
  const [image, setImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [postId, setPostId] = useState("")
  const [prevTime, setPrevTime] = useState("")

  useEffect(() => {
    const getPost = async () => {
      let correctPost: Post | undefined
      for (let i = 0; i < groupData?.post.length; i++) {
        if (user?.username === groupData.post[i].username) {
          correctPost = groupData.post[i]
          setCaption(correctPost.caption || "")
          setImage(correctPost.photolink || "")
          setPrevTime(correctPost.timepost)
          setPostId(correctPost.postid)
          break
        }
      }
    }
    getPost()
  }, [groupData, user])

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const removeImage = () => {
    setImage("")
  }

  const cancel = () => {
    navigation.goBack()
  }

  const submit = async () => {
    if (loading) return
    setLoading(true)

    if (!caption.trim()) {
      Alert.alert("Error", "Please enter a caption.")
      setLoading(false)
      return
    }
    if (!image) {
      Alert.alert("Error", "Please add a picture.")
      setLoading(false)
      return
    }

    try {
      const token = await checkToken()
      const time = new Date()
      const compressedImage = await compressPostImage(image)

      // Upload image if it's a new one (not a URL)
      let permanentUrl = image
      if (!image.startsWith("http")) {
        const uploadResponse = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/getPresignedUrl`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            fileName: `${user?.username}-${groupData.group.groupid}`,
            date: time.getTime(),
            isImage: true,
          }),
        })

        const uploadData = await uploadResponse.json()
        if (uploadResponse.status !== 200) {
          throw new Error(uploadData.error || "Failed to get presigned URL")
        }

        const { permanentUrl: newUrl, presignedUrl } = uploadData
        permanentUrl = newUrl

        // Upload image to presigned URL
        const blobResponse = await fetch(compressedImage)
        const blob = await blobResponse.blob()
        await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        })
      }

      // Update post
      const updatePostResponse = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/updatePost/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: user?.username,
          groupId: groupData.group.groupid,
          photolink: permanentUrl,
          caption: caption,
          time: time,
          prevFileName: `${user?.username}-${groupData.group.groupid}-${Date.parse(prevTime)}`,
          timecycle: groupData.timecycle,
        }),
      })

      const updatePostData = await updatePostResponse.json()
      if (updatePostResponse.status !== 200) {
        throw new Error(updatePostData.error || "Failed to update post")
      }

      setGroupData((g: GroupData) => {
        const newPostList = g.post.map((p) => (p.postid === postId ? updatePostData : p))
        return { ...g, post: newPostList, createStatus: "edit" }
      })

      navigation.goBack()
    } catch (error) {
      console.error("Error:", error)
      Alert.alert("Error", "Failed to update post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.cancelButton} onPress={cancel}>
            <Ionicons name="close" size={24} color="#FF3B30" />
          </Pressable>
          <Text style={styles.title}>{groupData.group.groupname}</Text>
          <Pressable style={styles.submitButton} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#007AFF" /> : <Text style={styles.submitButtonText}>Update</Text>}
          </Pressable>
        </View>

        <View style={styles.imageContainer}>
          {image ? (
            <Pressable onPress={() => setModalVisible(true)}>
              <Image source={{ uri: image }} style={styles.selectedImage} />
              <Pressable style={styles.removeImageButton} onPress={removeImage}>
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </Pressable>
            </Pressable>
          ) : (
            <Pressable style={styles.addImageButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={40} color="#007AFF" />
              <Text style={styles.addImageText}>Add Photo</Text>
            </Pressable>
          )}
        </View>

        <TextInput
          style={styles.captionInput}
          multiline
          numberOfLines={4}
          maxLength={1000}
          value={caption}
          onChangeText={setCaption}
          placeholder="Write a caption..."
          placeholderTextColor="#999"
        />
        <Text style={styles.characterCount}>{caption.length}/1000</Text>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
            <Image source={{ uri: image }} style={styles.modalImage} resizeMode="contain" />
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  cancelButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  submitButton: {
    padding: 8,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#007AFF",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  selectedImage: {
    width: 300,
    height: 300,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
  },
  addImageButton: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderStyle: "dashed",
  },
  addImageText: {
    marginTop: 8,
    fontSize: 17,
    color: "#007AFF",
  },
  captionInput: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 12,
    height: 120,
    borderColor: "#C7C7CC",
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 17,
    color: "#000",
  },
  characterCount: {
    marginTop: 8,
    marginRight: 16,
    textAlign: "right",
    fontSize: 13,
    color: "#8E8E93",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "90%",
  },
})

export default EditPostScreen

