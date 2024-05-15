import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';


const SignInScreen = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")



    const navigation = useNavigation();


    const submit = async () => {
        console.log('Attempting sign in for:', username, password);

        try {
            const response = await fetch(`http://localhost:3000/bindly/auth/signIn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: username,
                    password: password,
                }),
            });

            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }

            const data = await response.json();
            console.log('Response data:', data);

            // if (!response.ok) {
            //     console.log('Error received:', data.error);
            //     throw new Error(data.error || 'Unknown error occurred'); // Use the error from the response if available.
            // }

            if (response.status === 200) {
                // Navigate to confirm email page or handle the success scenario
                console.log('Sign in successful, navigating to welcome screen.');
                navigation.navigate('Welcome');
            } else {
                // Handling different error messages from the server
                if (data.error) {
                    console.log('Error received:', data.error);
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
            // In case the fetch fails
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        }
    };



    const toSignUp = () => {
        console.log('sdsd')
        navigation.navigate('SignUp');
    }


    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                />
            </View>

            <Text style={styles.label}>Username</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={username}
                onChangeText={setUsername}
                placeholder="username"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={password}
                onChangeText={setPassword}
                placeholder="password"
            />

            <View style={styles.signInButtonContainer}>
                <Pressable style={styles.signInButton} onPress={submit}>
                    <Text style={styles.signInButtonText}>Sign In</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 24,
        flex: 1,
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


export default SignInScreen

