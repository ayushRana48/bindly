import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

const ConfirmEmailScreen = () => {
    const navigation = useNavigation();

    const toSignIn = () => {
        navigation.navigate('SignIn');
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require("../../assets/logo.png")}
                    style={styles.logo}
                />
            </View>
            <Text style={styles.headerText}>Thank you for signing up!</Text>
            <Text style={styles.subHeaderText}>Please confirm your email address before signing in</Text>
            <View style={styles.signInContainer}>
                <Pressable onPress={toSignIn}>
                    <Text style={styles.signInText}>Sign in Here</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'blue',
        padding: 24,
        marginTop: -50,
        flex: 1,
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 60,
        height: 60,
    },
    headerText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subHeaderText: {
        marginTop: 8,
        fontSize: 16,
        textAlign: 'center',
    },
    signInContainer: {
        marginTop: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        color: 'blue',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default ConfirmEmailScreen;
