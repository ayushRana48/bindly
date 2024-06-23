import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupListScreen from './GroupListScreen';
import NewGroupScreen from './Settings/NewGroupScreen';
import GroupScreen from './GroupScreen';
import { useUserContext } from "../../UserContext";
import GroupEditScreen from './Settings/GroupEditScreen';
import MembersListScreen from './Members/MembersListScreen';
import InviteMembersScreen from './Members/InviteMembersScreen';
import CreatePostScreen from './Posts/CreatePostScreen'
import EditPostScreen from './Posts/EditPostScreen';
import InfoScreen from './Info/InfoScreen';
import ArchiveGroupScreen from './ArchiveGroupScreen';
import GroupSettingScreen from './Settings/GroupSettingScreen';

const Stack = createNativeStackNavigator();

export default function GroupsNav() {
    const { user, setEmail } = useUserContext();



    return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="GroupsList" component={GroupListScreen} />
                <Stack.Screen name="NewGroup" component={NewGroupScreen} />
                <Stack.Screen name="Group" component={GroupScreen} />
                <Stack.Screen name="GroupEdit" component={GroupEditScreen} />
                <Stack.Screen name = "MembersList" component={MembersListScreen}/>
                <Stack.Screen name = "InviteMembers" component={InviteMembersScreen}/>
                <Stack.Screen name = "CreatePost" component={CreatePostScreen}/>
                <Stack.Screen name = "EditPost" component={EditPostScreen}/>
                <Stack.Screen name = "Info" component={InfoScreen}/>
                <Stack.Screen name = "ArchiveGroup" component={ArchiveGroupScreen}/>
                <Stack.Screen name="GroupSetting" component={GroupSettingScreen} />


            </Stack.Navigator>
    );
}
