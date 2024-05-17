import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../UserContext";

const ProfileScreen = () => {

    const {email,setEmail}= useUserContext();

    const navigation = useNavigation();


    const getUser = async () => {
        try {
            const response = await fetch(`http://localhost:3000/bindly/auth/getUser`, {
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            if (response.status === 200) {
                console.log('Sign in successful, navigating to Profile screen.');
                navigation.navigate('Profile');
            } else if (data.error) {
                console.log('Error received:', data.error);
            }
        } catch (error) {
            console.error('Network or server error:', error);
        }
    }

    const logOut = async () => {
        try {
            const response = await fetch(`http://localhost:3000/bindly/auth/signOut`, {
                headers: { 'Content-Type': 'application/json' },
                method:"POST",
                headers: { 'Content-Type': 'application/json' },

            });
            const data = await response.json();

            if (response.status === 200) {
                setEmail(null)
                console.log('Sign in successful, navigating to Profile screen.');
            } else if (data.error) {
                console.log('Error received:', data.error);
            }
        } catch (error) {
            console.error('Network or server error:', error);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require("../assets/logo.png")}
                    style={styles.logo}
                />
            </View>
            <Text style={styles.ProfileText}>Profile!</Text>
            <Pressable style={styles.pressableButton} onPress={getUser}>
                <Text>Get User</Text>
            </Pressable>

            <Pressable style={styles.pressableButton} onPress={logOut}>
                <Text>Log Out</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        marginTop: -50,
        flex: 1,
        alignItems: 'center', // To centrally align the content
        justifyContent: 'center', // To centrally align the content vertically
        backgroundColor: 'white'
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: 'center', // This centers the image horizontally
    },
    logo: {
        width: 60,
        height: 60,
    },
    ProfileText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center', // Centers the text horizontally
    },
    pressableButton: {
        marginTop: 16,
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    }
});

export default ProfileScreen;
