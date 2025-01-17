import React, { useEffect, useState, useCallback } from "react";
import { UserProvider, useUserContext } from "../../UserContext";
import { View, ScrollView, RefreshControl, StyleSheet, Text, Pressable } from "react-native";
import InviteList from "./components/InviteList";
import { useNavigation } from '@react-navigation/native';
import { Invite, NotifyVeto, RootStackParamList } from "../../types";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const ActivityScreen: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [notifyVeto, setNotifyVeto] = useState<NotifyVeto[]>([]);
  const { user } = useUserContext();
  const [newVetoLength, setNewVetoLength] = useState<number>(0);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const getAllInvites = async (): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:3000/bindly/invite/getInviteByReciever/${user?.username}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const res: Invite[] = await response.json();
      setInvites(res);
    } catch (error) {
      console.log(error);
    }
  };

  const getNotifyVeto = async (): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:3000/bindly/notifyveto/${user?.username}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res: NotifyVeto[] = await response.json();
      if (res.length > 0) {
        setNotifyVeto(res);
        setNewVetoLength(res.length);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  // Rest of the component remains the same
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([getAllInvites(), getNotifyVeto()]).then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    onRefresh();
  }, []);

  const toVetoScreen=()=>{
    setNewVetoLength(0)
    navigation.navigate('Veto')
  }
  

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', alignItems: 'center', marginTop: 60 }}>Activity</Text>


        <Pressable style={{borderBottomColor:'gray',borderBottomWidth:1, marginTop: 30, padding:4,flexDirection:'row',alignItems:'center' }} onPress={toVetoScreen}>
          <Text style={{ fontSize: 18, fontWeight: 'bold'}}>Vetos</Text>
          {notifyVeto && newVetoLength>0 && <View style={{width:30,height:30,borderRadius:15,backgroundColor:'red',marginLeft:'auto',marginRight:10}}>
            <Text style={{margin: 'auto',color:'white', textAlign:'center',alignItems:'center',fontSize:15,fontWeight:'bold'}}>{newVetoLength}</Text>
        
          </View>}

          {notifyVeto && newVetoLength>0 ?<Text style={{color:'black',fontSize:20,fontWeight:'bold'}}>{">"}</Text>:
          <Text style={{color:'black',fontSize:20,fontWeight:'bold', marginLeft:'auto'}}>{">"}</Text>}

          
        </Pressable>

        <View style={{borderBottomColor:'gray',borderBottomWidth:1, marginTop: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold'}}>Invites</Text>
        </View>

        <InviteList invites={invites} setInvites={setInvites} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 32,
  },
  scrollView: {
    flexGrow: 1,
  },
});

export default ActivityScreen;
