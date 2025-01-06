import * as React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GroupsProvider } from './GroupsContext';
import GroupsNav from './GroupScreens/GroupsNav';
import ActivityNav from './ActivityScreens/ActivityNav';
import ProfileNav from './ProfileScreens/ProfileNav';

type TabParamList = {
  Groups: undefined;
  Profile: undefined;
  Activities: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const LoggedInNav: React.FC = () => {
  return (
    <GroupsProvider>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen 
          name="Groups" 
          component={GroupsNav}
          options={{
            tabBarLabel: 'Groups',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="groups" size={size} color={color} />
            ),
          }} 
        />

        <Tab.Screen 
          name="Profile" 
          component={ProfileNav}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}  
        />

        <Tab.Screen 
          name="Activities" 
          component={ActivityNav}
          options={{
            tabBarLabel: 'Activity',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="drafts" size={size} color={color} />
            ),
          }}  
        />
      </Tab.Navigator>
    </GroupsProvider>
  );
};

export default LoggedInNav;