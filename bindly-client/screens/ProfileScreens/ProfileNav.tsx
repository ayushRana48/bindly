import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from './ProfileScreen';
import WalletScreen from './WalletScreen';
import RulesScreen from './RulesScreen';
import ConnectionScreen from './ConnectionScreen';
import { RootStackParamList } from '../../types';

type ProfileNavigatorParamList = Pick<RootStackParamList,
  | 'ProfileScreen'
  | 'Wallet'
  | 'Rules'
  | 'Connection'
>;

const Stack = createNativeStackNavigator<ProfileNavigatorParamList>();

const ProfileNav: React.FC = () => {
    return (
        <Stack.Navigator 
            screenOptions={{ 
                headerShown: false,
                gestureEnabled: false 
            }}
        >
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Rules" component={RulesScreen} />
            <Stack.Screen name="Connection" component={ConnectionScreen} />
        </Stack.Navigator>
    );
};

export default ProfileNav;