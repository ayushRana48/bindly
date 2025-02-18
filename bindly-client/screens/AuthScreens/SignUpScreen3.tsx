import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../types"
import { useUserContext } from "../../UserContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"


type SignUpScreen3RouteProp = RouteProp<RootStackParamList, "SignUpScreen3">

const SignUpScreen3: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute<SignUpScreen3RouteProp>()
  const { email } = route.params
  const { setEmail } = useUserContext();

  const handleVerification = async () => {
    // Here you would typically call your API to verify the code
    // For now, we'll just navigate to the main app
    if (verificationCode.length === 6) {
      try{
        const response = await fetch(`http://localhost:3000/bindly/auth/verifyCode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token: verificationCode, type: "signup" }),
        });
        const data = await response.json();
        if (response.status === 200) {
          await SecureStore.setItemAsync("accessToken", data.accessToken);
          await SecureStore.setItemAsync("refreshToken", data.refreshToken);
          await AsyncStorage.setItem('userEmail', email.toLowerCase());
          setEmail(data.user.email);
        } else {
          setErrorMessage(data.error || "Unable to verify code.");
        }
      }
      catch(error){
        Alert.alert("Error", "Network error. Please try again.");
      }
    } else {
      setErrorMessage("Please enter a valid 6-digit code")
    }
  }

  const resendCode = async () => {
    try {
      const response = await fetch(`http://localhost:3000/bindly/auth/resendCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert("Success", "Verification code resent. Check your email.");
      } else {
        Alert.alert("Error", data.error || "Unable to resend code.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Verify Your Email</Text>
        </View>

        <Text style={styles.instructions}>
          We've sent a 6-digit verification code to {email}. Please enter the code below to complete your registration.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
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
            onPress={handleVerification}
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
    color: 'dodgerblue',
    textAlign: 'center',
  },
  bold: {
    fontWeight: "bold",
  },
})

export default SignUpScreen3

