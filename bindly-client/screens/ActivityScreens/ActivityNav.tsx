import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUserContext } from "../../UserContext";
import ActivityScreen from './ActivityScreen';
import VetoScreen from './VetoScreen';
import { RootStackParamList } from '../../types';

type ActivityNavigatorParamList = Pick<RootStackParamList,
  | 'Activity'
  | 'Veto'
>;

const Stack = createNativeStackNavigator<ActivityNavigatorParamList>();

const ActivityNav: React.FC = () => {
    return (
        <Stack.Navigator 
            screenOptions={{ 
                headerShown: false,
                gestureEnabled: false 
            }}
        >
            <Stack.Screen name="Activity" component={ActivityScreen} />
            <Stack.Screen name="Veto" component={VetoScreen} />
        </Stack.Navigator>
    );
};

export default ActivityNav;