import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Video } from 'expo-av';
import placeholder from '../../../assets/profile.png';
import { useUserContext } from '../../../UserContext';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth - 48; // Adjusted for padding/margins
const height = width * (16 / 9); // Assuming a 16:9 aspect ratio

const PostComponent = ({
  postid,
  imageLink,
  videoLink,
  username,
  pfpLink,
  caption,
  time,
  valid,
  veto,
  totalUsers,
  removePost,
  updatePostVeto,
  groupId,
  userHasVeto,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [extraModalVisible, setExtraModalVisible] = useState(false);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);

  const { user } = useUserContext();

  const profilePicture = pfpLink ? { uri: pfpLink } : placeholder;

  // Define mediaItems based on imageLink and videoLink
  const mediaItems = [];

  if (imageLink) {
    mediaItems.push({ type: 'image', uri: imageLink });
  }

  if (videoLink) {
    mediaItems.push({ type: 'video', uri: videoLink });
  }

  // State to track current index
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const displayDate = (time) => {
    const date = new Date(time);
    return date.toLocaleDateString();
  };

  const displayTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const addVeto = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/addVeto`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postid: postid,
          username: user.username,
          groupid: groupId,
        }),
      });

      const { status, body } = await response.json().then((data) => ({ status: response.status, body: data }));

      if (status === 200) {
        updatePostVeto(body);
      }
    } catch (error) {
      console.log('Fetch error: ', error);
      Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
    } finally {
      setModalVisible(false);
      setLoading(false);
    }
  };

  const removeVeto = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/removeVeto`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postid: postid,
          username: user.username,
          groupid: groupId,
        }),
      });

      const { status, body } = await response.json().then((data) => ({ status: response.status, body: data }));

      if (status === 200) {
        updatePostVeto(body);
      }
    } catch (error) {
      console.log('Fetch error: ', error);
      Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
    } finally {
      setModalVisible(false);
      setLoading(false);
    }
  };

  const deletePost = async () => {
    if (deleteLoading) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/deletePost/${postid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const { status, body } = await response.json().then((data) => ({ status: response.status, body: data }));

      if (status === 200) {
        removePost(postid);
      }
    } catch (error) {
      console.log('Fetch error: ', error);
      Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
    } finally {
      setDeleteConfirmationVisible(false);
      setDeleteLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={{ width: 45, height: 45, borderRadius: 4 }} source={profilePicture}></Image>
        <View>
          <Text style={{ ...styles.username, marginLeft: 10, marginRight: 'auto' }}>{username}</Text>
          <View style={{ flexDirection: 'row', marginLeft: 10 }}>
            <Text style={styles.date}>{displayDate(time)}</Text>
            <Text style={{ ...styles.date, marginLeft: 2 }}>{displayTime(time)}</Text>
          </View>
        </View>

        {username === user.username && (
          <Pressable
            style={{ width: 30, height: 30, alignItems: 'center', marginLeft: 'auto', marginRight: 10, justifyContent: 'center' }}
            onPress={() => setExtraModalVisible(true)}
          >
            <Text style={{ fontSize: 18, marginBottom: 8 }}>...</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.wrapper}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
          onMomentumScrollEnd={handleScroll}
          scrollEnabled={mediaItems.length>1}
        >
          {mediaItems.map((item, index) => (
            <View key={index} style={styles.mediaContainer}>
              {item.type === 'image' ? (
                <Image key="image" style={{ width: width, height: width, margin: 'auto' }} source={{ uri: imageLink }} /> 
              ) : (
                <Video
                  style={styles.media}
                  source={{ uri: item.uri }}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                />
              )}
              {valid == null && totalUsers > 2 && (
                <Pressable
                  onPress={() => setModalVisible(true)}
                  style={{
                    backgroundColor: 'red',
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    width: 40,
                    height: 40,
                    padding: 2,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Dots Indicator */}
        {mediaItems.length > 1 && (
          <View style={styles.dotContainer}>
            {mediaItems.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { opacity: currentIndex === index ? 1 : 0.3 },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.captionContainer}>
        <View style={{ flexDirection: 'row' }}>
          {valid == null && totalUsers>2 && (
            <Text style={{ marginLeft: 'auto' }}>{`${veto.length}/${Math.ceil(totalUsers / 2)} vetos`}</Text>
          )}
        </View>
        <Text style={styles.caption}>
          <Text style={styles.username}>{username}</Text> {caption}
        </Text>
      </View>

      {/* Veto Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Veto</Text>
            <View style={styles.modalText}>
              <View style={styles.modalItem}>
                {!userHasVeto ? (
                  <Text style={styles.boldText}>Are you sure you want to veto this post?</Text>
                ) : (
                  <Text style={styles.boldText}>Are you sure you want to remove your veto?</Text>
                )}
              </View>

              {!userHasVeto && <Text>Only veto if you think this post does not demonstrate the group task</Text>}
            </View>
            <View style={styles.modalButtons}>
              {!userHasVeto ? (
                <Pressable style={styles.confirmButton} onPress={addVeto}>
                  {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Veto</Text>}
                </Pressable>
              ) : (
                <Pressable style={styles.confirmButton} onPress={removeVeto}>
                  {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Remove Veto</Text>}
                </Pressable>
              )}

              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        transparent={true}
        visible={extraModalVisible}
        animationType="slide"
        onRequestClose={() => setExtraModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setExtraModalVisible(false);
                  setDeleteConfirmationVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
              <Pressable style={{ ...styles.confirmButton, marginTop: 20 }} onPress={() => setExtraModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={deleteConfirmationVisible}
        animationType="slide"
        onRequestClose={() => setDeleteConfirmationVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <View style={styles.modalText}>
              <View style={styles.modalItem}>
                <Text style={styles.boldText}>
                  This action cannot be undone. Are you sure you want to delete this post?
                </Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <Pressable style={styles.confirmButton} onPress={deletePost}>
                {deleteLoading ? (
                  <ActivityIndicator color={'white'} />
                ) : (
                  <Text style={styles.buttonText}>Confirm</Text>
                )}
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setDeleteConfirmationVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  header: {
    paddingLeft: 14,
    paddingRight: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: width,
    margin: 'auto',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  wrapper: {
    height: height + 20, // Adjusted to include dots
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    width:width-24,
    marginHorizontal:'auto'
  },
  mediaContainer: {
    width: width-24,
    height: height,
    backgroundColor: '#e3e3e3',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  media: {
    width: width-24,
    height: height,
  },
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'skyblue',
    marginHorizontal: 3,
  },
  captionContainer: {
    paddingLeft: 14,
    paddingRight: 14,
    width: width,
    margin: 'auto',
  },
  caption: {
    fontSize: 14,
  },
  date: {
    color: '#757575',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  boldText: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: 'dodgerblue',
    padding: 15,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff7e75',
    padding: 15,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modalItem: {
    marginBottom: 0,
    flexDirection: 'row',
    fontSize: 24,
  },
});

export default memo(PostComponent, (prevProps, nextProps) => {
  // Compare relevant props to decide whether to re-render
  const areVetoEqual =
    prevProps.veto.length === nextProps.veto.length &&
    prevProps.veto.every((value, index) => value === nextProps.veto[index]);

  const result =
    prevProps.postid === nextProps.postid &&
    prevProps.imageLink === nextProps.imageLink &&
    prevProps.videoLink === nextProps.videoLink &&
    prevProps.caption === nextProps.caption &&
    prevProps.time === nextProps.time &&
    prevProps.valid === nextProps.valid &&
    areVetoEqual &&
    prevProps.totalUsers === nextProps.totalUsers &&
    prevProps.userHasVeto === nextProps.userHasVeto;

  return result;
});
