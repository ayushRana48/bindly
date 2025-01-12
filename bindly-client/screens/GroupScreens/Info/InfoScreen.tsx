import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Modal } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
// @ts-ignore
import placeholder from '../../../assets/GroupIcon.png';
// @ts-ignore
import backArrow from '../../../assets/backArrow.png';
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";
import LeaderboardItem from "../components/LeaderboardItem";
import { LeaderboardMember } from "../../../types"; // Import the updated type

const InfoScreen: React.FC = () => {
  const route = useRoute();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();
  const { groupData, setGroupData, setGroups } = useGroupsContext();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([]); // Use the updated type
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (groupData?.group?.pfp) {
      setImageUrl(groupData.group.pfp);
    }
  }, [groupData]);

  const getLeaderBoard = async (): Promise<void> => {
    try {
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/group/getLeaderboard/${groupData.group.groupid}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res = await response.json();
      setLeaderboard(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getLeaderBoard().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    getLeaderBoard();
  }, [groupData?.group?.groupid]);

  const back = (): void => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ padding: 24 }}
      >
        <Pressable style={styles.backArrow} onPress={back}>
          <Image style={{ height: 40, width: 40 }} source={backArrow} />
        </Pressable>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>{groupData.group.groupname}</Text>

          <View style={{ flexDirection: 'row' }}>
            <View>
              <Image
                style={{ width: 100, height: 100, borderRadius: 8 }}
                source={imageUrl.length > 0 && !loading ? { uri: imageUrl } : placeholder}
              />
            </View>
            <View style={{ flex: 1, marginTop: 10, marginLeft: 20 }}>
              <View style={{ flexDirection: 'row', marginBottom: 5, flexWrap: 'wrap' }}>
                <Text style={{ fontWeight: '700' }}>Task Per Week:</Text>
                <Text>{groupData.group.tasksperweek}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 5, flexWrap: 'wrap' }}>
                <Text style={{ fontWeight: '700' }}>Buy in:</Text>
                <Text>$8.00</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 5, flexWrap: 'wrap', paddingRight:10 }}>
                <Text numberOfLines={5} ellipsizeMode="tail" onPress={() => setModalVisible(true)}>
                  <Text style={{ fontWeight: '700' }}>Description: </Text>
                  {groupData.group.description}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 18 }}>Leaderboard</Text>

        {loading && <ActivityIndicator size="large" color="#0000ff" />}

        {!loading && (
          <ScrollView style={{ paddingBottom: 32 }}>
            {leaderboard.map((l) => <LeaderboardItem key={l.username} memberData={l} />)}
          </ScrollView>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Description</Text>
            <ScrollView>
              <Text>{groupData.group.description}</Text>
            </ScrollView>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  setting: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  logoContainer: {
    marginTop: 60,
    marginBottom: 36,
    marginLeft: 20,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    paddingBottom: 10,
    height: 190,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  centeredRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  headerButton: {
    width: 60,
    height: 60,
    padding: 10,
    backgroundColor: '#e3e3e3',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerButtonIcon: {
    width: 30,
    height: 30,
  },
  createPost: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF8D1D',
    width: 180,
    height: 40,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    marginTop: 15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default InfoScreen;