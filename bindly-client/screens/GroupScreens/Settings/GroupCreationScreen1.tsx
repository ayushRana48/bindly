import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../../types"
import * as ImagePicker from "expo-image-picker"

// @ts-ignore
import placeholder from "../../../assets/GroupIcon.png"
// @ts-ignore
import camera from "../../../assets/Camera.png"
// @ts-ignore
import cameraIcon from "../../../assets/cameraIcon.png"
// @ts-ignore
import galleryIcon from "../../../assets/galleryIcon.png"
// @ts-ignore
import trashIcon from "../../../assets/trashIcon.png"
// @ts-ignore
import backArrow from "../../../assets/backArrow.png"

const GroupCreationScreen1: React.FC = () => {
  const [groupName, setGroupName] = useState("")
  const [description, setDescription] = useState("")
  const [buyIn, setBuyIn] = useState(0)
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [openModal, setOpenModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setImageSrc({ uri: result.assets[0].uri })
      setOpenModal(false)
    }
  }

  const takeImage = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync()
      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.back,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled) {
        setImageSrc({ uri: result.assets[0].uri })
        setOpenModal(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const removeImage = () => {
    setImageSrc(placeholder)
    setOpenModal(false)
  }

  const handleNext = () => {
    if (!groupName.trim() || !description.trim() || buyIn < 0) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    navigation.navigate("GroupCreation2", { groupName, description, buyIn, imageSrc })
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Image style={{ height: 40, width: 40 }} source={backArrow} />
        </Pressable>

        <View style={styles.logoContainer}>
          <Text style={styles.title}>Create Group</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image style={styles.groupImage} source={imageSrc} />
          <Pressable style={styles.cameraButton} onPress={() => setOpenModal(true)}>
            <Image style={styles.cameraIcon} source={camera} />
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the habitual task getting done"
            multiline
          />
          <Text style={styles.infoText}>Describe the habitual task getting done</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Buy In</Text>
          <TextInput
            style={styles.input}
            value={buyIn.toString()}
            onChangeText={(text) => setBuyIn(parseFloat(text) || 0)}
            placeholder="Enter buy in amount"
            keyboardType="numeric"
          />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.buttonContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </View>

        <Modal visible={openModal} transparent onRequestClose={() => setOpenModal(false)}>
          <TouchableWithoutFeedback onPress={() => setOpenModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Group Photo</Text>
                  <View style={styles.modalButtonContainer}>
                    <Pressable style={styles.modalButton} onPress={takeImage}>
                      <Image style={styles.modalButtonIcon} source={cameraIcon} />
                      <Text>Camera</Text>
                    </Pressable>
                    <Pressable style={styles.modalButton} onPress={pickImage}>
                      <Image style={styles.modalButtonIcon} source={galleryIcon} />
                      <Text>Gallery</Text>
                    </Pressable>
                    <Pressable style={styles.modalButton} onPress={removeImage}>
                      <Image style={styles.modalButtonIcon} source={trashIcon} />
                      <Text>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 32,
    flexGrow: 1,
  },
  backArrow: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  cameraButton: {
    position: "absolute",
    bottom: -15,
    right: "50%",
    marginRight: -75,
    overflow: "hidden",
  },
  cameraIcon: {
    width: 50,
    height: 50,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#333",
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    height: 40,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  infoText: {
    color: "gray",
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  button: {
    backgroundColor: "dodgerblue",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 250,
  },
  buttonPressed: {
    backgroundColor: "#1E90FF",
    opacity: 0.9,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 16,
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
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    alignItems: "center",
  },
  modalButtonIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
})

export default GroupCreationScreen1

