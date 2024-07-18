import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/AuthScreens/SignInScreen';
import SignUpScreen from './screens/AuthScreens/SignUpScreen';
import ConfirmEmailScreen from './screens/AuthScreens/ConfirmEmailScreen';
import ProfileScreen from './screens/ProfileScreens/ProfileScreen';
import LoggedInNav from './screens/LoggedInNav';
import { useUserContext } from './UserContext';
import { BASEROOT_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function Nav() {
    const [initialRoute, setInitialRoute] = useState('SignIn');
    const {user,setEmail,loading,setLoading}= useUserContext();


    useEffect(() => {
        const getUser = async () => {
            setLoading(true)
            const userEmail = await AsyncStorage.getItem('userEmail');
            console.log('userEmail set Here',userEmail)
            if(userEmail){
                setEmail(userEmail)
                return
            }
            setLoading(false)
            // try {
            //     const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/auth/getUser`, {
            //         headers: { 'Content-Type': 'application/json' },
            //     });
            //     const data = await response.json();

            //     if (response.status === 200) {
            //         if(data.user){
            //             setEmail(data.user.email)
            //         }
            //         else{                
            //             setLoading(false)
            //         }
            //     } else if (data.error) {
            //         console.log('Error received:', data.error);
            //     }

            // } catch (error) {
            //     setLoading(false)
            //     console.error('Network or server error:', error);
            // }
        }

        getUser();
    }, []);

  
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false,gestureEnabled: false }}>
                {user==null ?
                    (
                        <><Stack.Screen name="SignIn" component={SignInScreen} />
                            <Stack.Screen name="SignUp" component={SignUpScreen} />
                            <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
                        </>)
                    :
                    (
                        <>
                            <Stack.Screen name="LoggedIn" component={LoggedInNav} />
                        </>)}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
