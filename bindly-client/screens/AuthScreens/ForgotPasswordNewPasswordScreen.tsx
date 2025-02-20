import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../types"
import * as SecureStore from "expo-secure-store"
// @ts-ignore
import backArrow from "../../assets/backArrow.png"
import { useUserContext } from "../../UserContext"


type ForgotPasswordNewPasswordScreenRouteProp = RouteProp<RootStackParamList, "ForgotPasswordNewPassword">

const ForgotPasswordNewPasswordScreen: React.FC = () => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute<ForgotPasswordNewPasswordScreenRouteProp>()
  const { email, token } = route.params
  const { setEmail } = useUserContext()

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    try {
        console.log("email", email)
        console.log("token", token)
        console.log("newPassword", newPassword)
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/auth/resetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, newPassword }),
      })

      const data = await response.json()

      if (response.status === 200) {
        navigation.navigate("SignIn")
      } else {
        setErrorMessage(data.error || "Unable to reset password. Please try again.")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.")
    }
  }

  const back = () => {
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable style={styles.backArrow} onPress={back}>
            <Image style={{ height: 40, width: 40 }} source={backArrow} />  
        </Pressable>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Reset Password</Text>
        </View>

        <Text style={styles.instructions}>Enter your new password below.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
          />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleResetPassword}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 32,
    flexGrow: 1,
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  instructions: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
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
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    zIndex: 10,
  },
})

export default ForgotPasswordNewPasswordScreen

