import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/AuthScreens/SignInScreen';
import SignUpScreen from './screens/AuthScreens/SignUpScreen';
import ConfirmEmailScreen from './screens/AuthScreens/ConfirmEmailScreen';
import LoggedInNav from './screens/LoggedInNav';
import { useUserContext } from './UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './types';
import SignUpScreen1 from './screens/AuthScreens/SignUpScreen1';
import SignUpScreen2 from './screens/AuthScreens/SignUpScreen2';
import SignUpScreen3 from './screens/AuthScreens/SignUpScreen3';
import ForgotPasswordEmailScreen from './screens/AuthScreens/ForgotPasswordEmailScreen';
import ForgotPasswordOTPScreen from './screens/AuthScreens/ForgotPasswordOTPScreen';
import ForgotPasswordNewPasswordScreen from './screens/AuthScreens/ForgotPasswordNewPasswordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Nav = () => {
    const [initialRoute] = useState<keyof RootStackParamList>('SignIn');
    const { user, setEmail, loading, setLoading } = useUserContext();

    useEffect(() => {
        const getUser = async (): Promise<void> => {
            setLoading(true);
            try {
                const userEmail = await AsyncStorage.getItem('userEmail');
                if (userEmail) {
                    setEmail(userEmail);
                    return;
                }
            } catch (error) {
                console.error('AsyncStorage error:', error);
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator 
                screenOptions={{ 
                    headerShown: false,
                    gestureEnabled: false 
                }}
            >
                {user === null ? (
                    <>
                        <Stack.Screen name="SignIn" component={SignInScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                        <Stack.Screen name="SignUpScreen1" component={SignUpScreen1} />
                        <Stack.Screen name="SignUpScreen2" component={SignUpScreen2} />
                        <Stack.Screen name="SignUpScreen3" component={SignUpScreen3} />
                        <Stack.Screen name="ForgotPasswordEmail" component={ForgotPasswordEmailScreen} />
                        <Stack.Screen name="ForgotPasswordOTP" component={ForgotPasswordOTPScreen} />
                        <Stack.Screen name="ForgotPasswordNewPassword" component={ForgotPasswordNewPasswordScreen} />


                        <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
                    </>
                ) : (
                    <Stack.Screen name="LoggedIn" component={LoggedInNav} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Nav;