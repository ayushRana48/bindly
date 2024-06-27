import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from './ProfileScreen';
import WalletScreen from './WalletScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNav() {

    return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="Wallet" component={WalletScreen} />
            </Stack.Navigator>
    );
}
