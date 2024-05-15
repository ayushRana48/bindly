import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
    const navigation = useNavigation();

    const back = () => {
        console.log('sdsd')
        navigation.navigate('SignIn');
    }



    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require("../assets/logo.png")}
                    style={styles.logo}
                />
            </View>
            <Text style={styles.welcomeText}>Welcome!</Text>
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
        backgroundColor:'white'
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: 'center', // This centers the image horizontally
    },
    logo: {
        width: 60,
        height: 60,
    },
    welcomeText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center', // Centers the text horizontally
    }
});

export default WelcomeScreen;
