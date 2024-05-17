import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupListScreen from './GroupListScreen';
import NewGroupScreen from './NewGroupScreen';
import GroupScreen from './GroupScreen';
import { useUserContext } from "../../UserContext";

const Stack = createNativeStackNavigator();

export default function GroupsNav() {
    const { user, setEmail } = useUserContext();



    return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="GroupsList" component={GroupListScreen} />
                <Stack.Screen name="NewGroup" component={NewGroupScreen} />
                <Stack.Screen name="Group" component={GroupScreen} />
            </Stack.Navigator>
    );
}
