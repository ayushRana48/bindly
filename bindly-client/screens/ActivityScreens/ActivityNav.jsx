import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useUserContext } from "../../UserContext";
import ActivityScreen from './ActivityScreen';
import VetoScreen from './VetoScreen';

const Stack = createNativeStackNavigator();

export default function ActivityNav() {
    const { user, setEmail } = useUserContext();



    return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Activity" component={ActivityScreen} />
                <Stack.Screen name="Veto" component={VetoScreen} />
            </Stack.Navigator>
    );
}
