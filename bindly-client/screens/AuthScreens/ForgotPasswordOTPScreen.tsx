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
// @ts-ignore
import backArrow from "../../assets/backArrow.png"

type ForgotPasswordOTPScreenRouteProp = RouteProp<RootStackParamList, "ForgotPasswordOTP">

const ForgotPasswordOTPScreen: React.FC = () => {
  const [otp, setOtp] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute<ForgotPasswordOTPScreenRouteProp>()
  const { email } = route.params

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch(`http://localhost:3000/bindly/auth/verifyOtpForReset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp }),
      })

      const data = await response.json()
      console.log("data otp", data)

      if (response.status === 200) {
        navigation.navigate("ForgotPasswordNewPassword", { email, token: data.session.access_token })
      } else {
        setErrorMessage(data.error || "Invalid OTP. Please try again.")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.")
    }
  }

  const resendCode = async () => {
    try {
      const response = await fetch(`http://localhost:3000/bindly/auth/forgetPasswordCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log("data", data)

      if (response.status === 200) {
        Alert.alert("Success", "Verification code resent. Check your email.")
      } else {
        Alert.alert("Error", data.error || "Unable to resend code.")
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
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backArrow} onPress={back}>
            <Image style={{ height: 40, width: 40 }} source={backArrow} />
        </Pressable>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Verify OTP</Text>
        </View>

        <Text style={styles.instructions}>Enter the 6-digit code we sent to {email}.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>OTP Code</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <Pressable onPress={resendCode}>
          <Text style={[styles.linkText, styles.bold]}>Resend Code</Text>
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleVerifyOTP}
          >
            <Text style={styles.buttonText}>Verify</Text>
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
  linkText: {
    color: "dodgerblue",
    textAlign: "center",
    marginBottom: 16,
  },
  bold: {
    fontWeight: "bold",
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

export default ForgotPasswordOTPScreen

