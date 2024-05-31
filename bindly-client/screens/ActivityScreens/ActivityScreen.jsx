import React, { useEffect, useState, useCallback } from "react";
import { UserProvider, useUserContext } from "../../UserContext";
import { View, ScrollView, RefreshControl, StyleSheet,Text } from "react-native";
import InviteList from "./components/InviteList";

const ActivityScreen = () => {
  const [invites, setInvites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useUserContext()

  const getAllInvites = async () => {
    try {
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/invite/getInviteByReciever/${user.username}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await response.json();
      setInvites(res);
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getAllInvites().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    getAllInvites();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{fontSize:30, fontWeight:'bold',textAlign:'center',alignItems:'center', marginTop:60}}>Activity</Text>

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
