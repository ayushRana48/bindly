import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from './ProfileScreens/ProfileScreen';
import GroupScreen from './GroupScreens/GroupListScreen';
import { GroupsProvider } from './GroupsContext';
import NewGroupScreen from './GroupScreens/Settings/NewGroupScreen';
import GroupsNav from './GroupScreens/GroupsNav';
import ActivityNav from './ActivityScreens/ActivityNav';
const Tab = createBottomTabNavigator();
import ProfileNav from './ProfileScreens/ProfileNav';



export default function LoggedInNav() {




    return (
        <GroupsProvider>
            <Tab.Navigator screenOptions={{ headerShown: false }}>
                <Tab.Screen name="Groups" options={{
                    tabBarLabel: 'Groups',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="groups" size={size} color={color} />
                    ),
                }} component={GroupsNav} />

                <Tab.Screen name="Profile" options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={size} color={color} />
                    ),
                }}  component={ProfileNav} />
                <Tab.Screen name="Activities"  options={{
                    tabBarLabel: 'Activity',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="drafts" size={size} color={color} />
                    ),
                }}  component={ActivityNav} />
            </Tab.Navigator>
        </GroupsProvider>
    );
}