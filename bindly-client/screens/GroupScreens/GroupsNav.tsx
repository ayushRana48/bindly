import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupListScreen from './GroupListScreen';
import NewGroupScreen from './Settings/NewGroupScreen';
import GroupScreen from './GroupScreen';
import GroupEditScreen from './Settings/GroupEditScreen';
import MembersListScreen from './Members/MembersListScreen';
import InviteMembersScreen from './Members/InviteMembersScreen';
import CreatePostScreen from './Posts/CreatePostScreen';
import EditPostScreen from './Posts/EditPostScreen';
import InfoScreen from './Info/InfoScreen';
import ArchiveGroupScreen from './ArchiveGroupScreen';
import GroupSettingScreen from './Settings/GroupSettingScreen';
import { useUserContext } from "../../UserContext";
import { RootStackParamList } from '../../types';
import GroupCreationScreen1 from './Settings/GroupCreationScreen1';
import GroupCreationScreen2 from './Settings/GroupCreationScreen2';
import LeaderboardScreen from './LeaderboardScreen';


type GroupNavigatorParamList = Pick<RootStackParamList, 
    | 'GroupsList' 
    | 'NewGroup' 
    | 'Group' 
    | 'GroupEdit' 
    | 'MembersList'
    | 'InviteMembers'
    | 'CreatePost'
    | 'EditPost'
    | 'Info'
    | 'ArchiveGroup'
    | 'GroupSetting'
    | 'GroupCreation1'
    | 'GroupCreation2'
    | 'Leaderboard'
>;

const Stack = createNativeStackNavigator<GroupNavigatorParamList>();


const GroupsNav: React.FC = () => {
    const { user, setEmail } = useUserContext();

    return (
        <Stack.Navigator 
            screenOptions={{ 
                headerShown: false, 
                gestureEnabled: false 
            }}
        >
            <Stack.Screen name="GroupsList" component={GroupListScreen} />
            <Stack.Screen name="NewGroup" component={NewGroupScreen} />
            <Stack.Screen name="Group" component={GroupScreen} />
            <Stack.Screen name="GroupEdit" component={GroupEditScreen} />
            <Stack.Screen name="MembersList" component={MembersListScreen} />
            <Stack.Screen name="InviteMembers" component={InviteMembersScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="EditPost" component={EditPostScreen} />
            <Stack.Screen name="Info" component={InfoScreen} />
            <Stack.Screen name="ArchiveGroup" component={ArchiveGroupScreen} />
            <Stack.Screen name="GroupSetting" component={GroupSettingScreen} />
            <Stack.Screen name="GroupCreation1" component={GroupCreationScreen1} />
            <Stack.Screen name="GroupCreation2" component={GroupCreationScreen2} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        </Stack.Navigator>
    );
};

export default GroupsNav;