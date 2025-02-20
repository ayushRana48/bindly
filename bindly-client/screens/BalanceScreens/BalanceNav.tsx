import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BalanceScreen from './BalanceScreen';
import { RootStackParamList } from '../../types';

type BalanceNavigatorParamList = Pick<RootStackParamList,
  | 'BalanceScreen'

>;

const Stack = createNativeStackNavigator<BalanceNavigatorParamList>();

const BalanceNav: React.FC = () => {
    return (
        <Stack.Navigator 
            screenOptions={{ 
                headerShown: false,
                gestureEnabled: false 
            }}
        >
            <Stack.Screen name="BalanceScreen" component={BalanceScreen} />
        </Stack.Navigator>
    );
};

export default BalanceNav;