import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useUserContext } from "../../UserContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { RootStackParamList } from "../../types"
import * as SecureStore from "expo-secure-store"

// @ts-ignore
import logo from "../../assets/logo.png"

const SignInScreen: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)

  const { email, setEmail, loading: l2 } = useUserContext()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const submit = async (): Promise<void> => {
    if (loading) return
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/bindly/auth/signIn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username.toLowerCase(),
          password: password,
        }),
      })

      const data = await response.json()
      console.log('data in signInScreen', data);

      if (response.status === 200) {
        if (data.error === "Email not verified. Please verify your email to proceed.") {
          navigation.navigate("SignUpScreen3", { email: username })
          return
        }

        await AsyncStorage.setItem("userEmail", username.toLowerCase())
        await SecureStore.setItemAsync("accessToken", data.accessToken)
        await SecureStore.setItemAsync("refreshToken", data.refreshToken)
        setEmail(username.toLowerCase())
      } else {
        setErrorMessage(data.error || "Unknown error occurred.")
      }
    } catch (error) {
      console.error("Sign in error:", error instanceof Error ? error.message : "Unknown error")
      Alert.alert("Network Error", "Unable to connect to the server. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const toSignUp = (): void => {
    navigation.navigate("SignUpScreen1")
  }

  const toForgotPassword = (): void => {
    navigation.navigate("ForgotPasswordEmail")
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "padding"}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
        </View>

        {!l2 && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, isEmailFocused && styles.inputFocused]}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                placeholder="email"
                keyboardType="email-address"
                textContentType="username"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, isPasswordFocused && styles.inputFocused]}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                placeholder="password"
                secureTextEntry={true}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
            </View>

           

            <View style={styles.signInButtonContainer}>
              <Pressable
                style={({ pressed }) => [styles.signInButton, pressed && styles.signInButtonPressed]}
                onPress={submit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </Pressable>
            </View>
            <View style={styles.forgotPasswordContainer}>
              <Pressable onPress={toForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>
            </View>

            {errorMessage.length > 0 && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.footer}>
              <Pressable style={styles.footerPressable} onPress={toSignUp}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <Text style={[styles.footerText, styles.bold]}> Sign Up Here</Text>
              </Pressable>
            </View>
          </>
        )}
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
    marginBottom: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 200,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: "dodgerblue",
    borderWidth: 2,
  },
  forgotPasswordContainer: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    color: "dodgerblue",
    fontSize: 14,
  },
  signInButtonContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  signInButton: {
    backgroundColor: "dodgerblue",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  signInButtonPressed: {
    backgroundColor: "#1E90FF",
    opacity: 0.9,
  },
  signInButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 180,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerPressable: {
    flexDirection: "row",
  },
  footerText: {
    color: "dodgerblue",
  },
  bold: {
    fontWeight: "bold",
  },
})

export default SignInScreen

