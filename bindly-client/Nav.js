
import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/AuthScreens/SignInScreen';
import SignUpScreen from './screens/AuthScreens/SignUpScreen';
import ConfirmEmailScreen from './screens/AuthScreens/ConfirmEmailScreen';
import { StyleSheet, Text, View } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';

export default function Nav() {
    const Stack = createNativeStackNavigator();


    return (
        <NavigationContainer >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name = "SignIn" component={SignInScreen}/>
                <Stack.Screen name = "SignUp" component={SignUpScreen}/>
                <Stack.Screen name = "ConfirmEmail" component={ConfirmEmailScreen}/>
                <Stack.Screen name = "Welcome" component={WelcomeScreen}/>

            </Stack.Navigator>
        </NavigationContainer>
    )
}