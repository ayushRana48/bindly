import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from './ProfileScreen';
import GroupScreen from './GroupScreens/GroupListScreen';
import { GroupsProvider } from './GroupsContext';
import NewGroupScreen from './GroupScreens/Settings/NewGroupScreen';
import GroupsNav from './GroupScreens/GroupsNav';
import ActivityNav from './ActivityScreens/ActivityNav';
const Tab = createBottomTabNavigator();



export default function LoggedInNav() {




    return (
        <GroupsProvider>
            <Tab.Navigator screenOptions={{ headerShown: false }}>
                <Tab.Screen name="Groups" component={GroupsNav} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
                <Tab.Screen name="Activities" component={ActivityNav} />

            </Tab.Navigator>
        </GroupsProvider>
    );
}