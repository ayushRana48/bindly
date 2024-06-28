import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import { BASEROOT_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';


const SignInScreen = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const { email, setEmail } = useUserContext();
    const navigation = useNavigation();

    useEffect(()=>{    console.log(BASEROOT_URL)
    },[])

    const submit = async () => {
        if (loading) return; // Prevent double click
        setLoading(true);
        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/auth/signIn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: username.toLowerCase(),
                    password: password,
                }),
            });


            const data = await response.json();


            if (response.status === 200) {
                setEmail(username.toLowerCase());
                //here username refers to email
                await AsyncStorage.setItem('userEmail', JSON.stringify(username.toLowerCase()));
            } else {
                if (data.error) {
                    if (data.error.includes('Invalid login credentials')) {
                        setErrorMessage("Invalid login credentials");
                    } else {
                        setErrorMessage(data.error);
                    }
                } else {
                    setErrorMessage('Unknown error occurred.');
                }
            }
        } catch (error) {
            console.error('Sign in error:', error.message);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const toSignUp = () => {
        navigation.navigate('SignUp');
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.logo}
                    />
                </View>

                <View>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize='none'
                        value={username}
                        onChangeText={setUsername}
                        placeholder="email"
                        keyboardType="email-address"
                    />
                </View>

                <View>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize='none'
                        value={password}
                        onChangeText={setPassword}
                        placeholder="password"
                        secureTextEntry={true}
                    />
                </View>

                <View style={styles.signInButtonContainer}>
                    <Pressable style={styles.signInButton} onPress={submit} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.signInButtonText}>Sign In</Text>}
                    </Pressable>
                </View>

                {errorMessage.length > 0 &&
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                }

                <View style={styles.footer}>
                    <Pressable style={styles.footerPressable} onPress={toSignUp}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <Text style={[styles.footerText, styles.bold]}> Sign Up Here</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 32,
        flexGrow: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 200,
        height: 200,
    },
    label: {
        color: 'gray',
    },
    input: {
        marginBottom: 16,
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'dodgerblue', // focus styles are not directly possible, manage via state if needed
    },
    signInButtonContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    signInButton: {
        backgroundColor: 'dodgerblue',
        padding: 8,
        width: 96,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    errorContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerPressable: {
        flexDirection: 'row',
    },
    footerText: {
        color: 'dodgerblue',
    },
    bold: {
        fontWeight: 'bold',
    }
});

export default SignInScreen;
