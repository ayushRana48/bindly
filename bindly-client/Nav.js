import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/AuthScreens/SignInScreen';
import SignUpScreen from './screens/AuthScreens/SignUpScreen';
import ConfirmEmailScreen from './screens/AuthScreens/ConfirmEmailScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoggedInNav from './screens/LoggedInNav';
import { useUserContext } from './UserContext';

const Stack = createNativeStackNavigator();

export default function Nav() {
    const [initialRoute, setInitialRoute] = useState('SignIn');
    const {user,setEmail}= useUserContext();


    useEffect(() => {
        const getUser = async () => {
            console.log('here')
            try {
                const response = await fetch(`http://localhost:3000/bindly/auth/getUser`, {
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();

                if (response.status === 200) {
                    if(data.user){
                        setEmail(data.user.email)
                        console.log('Sign in successful, navigating to Profile screen.');
                    }
                } else if (data.error) {
                    console.log('Error received:', data.error);
                }
            } catch (error) {
                console.error('Network or server error:', error);
            }
        }

        getUser();
    }, []);

  
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
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
