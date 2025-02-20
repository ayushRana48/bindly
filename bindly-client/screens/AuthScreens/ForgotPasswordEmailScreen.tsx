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
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../types"
// @ts-ignore
import backArrow from "../../assets/backArrow.png"

const ForgotPasswordEmailScreen: React.FC = () => {
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const handleGetCode = async () => {
    try {
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/auth/forgetPasswordCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.status === 200) {
        navigation.navigate("ForgotPasswordOTP", { email })
      } else {
        setErrorMessage(data.error || "Unable to send verification code.")
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
          <Text style={styles.title}>Forgot Password</Text>
        </View>

        <Text style={styles.instructions}>
          Enter your email address and we'll send you a code to reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.buttonContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleGetCode}>
            <Text style={styles.buttonText}>Get Code</Text>
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

export default ForgotPasswordEmailScreen

