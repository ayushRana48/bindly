import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupListScreen from './GroupListScreen';
import NewGroupScreen from './NewGroupScreen';
import GroupScreen from './GroupScreen';
import { useUserContext } from "../../UserContext";
import GroupSetting from './GroupSettingScreen';
import GroupEditScreen from './GroupEditScreen';
import MembersListScreen from './MembersListScreen';
import InviteMembersScreen from './InviteMembersScreen';

const Stack = createNativeStackNavigator();

export default function GroupsNav() {
    const { user, setEmail } = useUserContext();



    return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="GroupsList" component={GroupListScreen} />
                <Stack.Screen name="NewGroup" component={NewGroupScreen} />
                <Stack.Screen name="Group" component={GroupScreen} />
                <Stack.Screen name="GroupSetting" component={GroupSetting} />
                <Stack.Screen name="GroupEdit" component={GroupEditScreen} />
                <Stack.Screen name = "MembersList" component={MembersListScreen}/>
                <Stack.Screen name = "InviteMembers" component={InviteMembersScreen}/>

            </Stack.Navigator>
    );
}
