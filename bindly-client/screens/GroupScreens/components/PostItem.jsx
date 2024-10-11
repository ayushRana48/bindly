// PostComponent.js
import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import { Video } from 'expo-av';
import placeholder from '../../../assets/profile.png';
import { useUserContext } from '../../../UserContext';
import commentIcon from '../../../assets/comment.png';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth - 48; // Adjusted for padding/margins
const height = width; // Assuming a 1:1 aspect ratio

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
  comments,
  addComment,
  onOpenCommentsModal, // New prop added
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

  // Functions: addVeto, removeVeto, deletePost
  const addVeto = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/addVeto`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postid: postid,
            username: user.username,
            groupid: groupId,
          }),
        }
      );

      const { status, body } = await response.json().then((data) => ({
        status: response.status,
        body: data,
      }));

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
      const response = await fetch(
        `https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/removeVeto`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postid: postid,
            username: user.username,
            groupid: groupId,
          }),
        }
      );

      const { status, body } = await response.json().then((data) => ({
        status: response.status,
        body: data,
      }));

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
      const response = await fetch(
        `https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/deletePost/${postid}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const { status, body } = await response.json().then((data) => ({
        status: response.status,
        body: data,
      }));

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
      {/* Post Header */}
      <View style={styles.header}>
        <Image style={styles.profileImage} source={profilePicture} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.username}>{username}</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{displayDate(time)}</Text>
            <Text style={[styles.date, { marginLeft: 2 }]}>{displayTime(time)}</Text>
          </View>
        </View>

        {username === user.username && (
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => setExtraModalVisible(true)}
          >
            <Text style={styles.optionsButtonText}>...</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Media Content */}
      <View style={styles.wrapper}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
          onMomentumScrollEnd={handleScroll}
          scrollEnabled={mediaItems.length > 1}
        >
          {mediaItems.map((item, index) => (
            <View key={index} style={styles.mediaContainer}>
              {item.type === 'image' ? (
                <Image style={styles.mediaImage} source={{ uri: imageLink }} />
              ) : (
                <Video
                  style={styles.media}
                  source={{ uri: item.uri }}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                />
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

      {/* Caption and Actions */}
      <View style={styles.captionContainer}>
        <View style={styles.actionsRow}>
          {valid == null && (
            <>
              <TouchableOpacity
                style={styles.commentButton}
                onPress={() => onOpenCommentsModal(postid)} // Updated onPress
              >
                <Image style={styles.commentIcon} source={commentIcon} />
                <Text style={styles.commentCount}>{comments.length}</Text>
              </TouchableOpacity>
              <Text style={styles.vetoCount}>{`${veto.length}/${Math.ceil(totalUsers / 2)}`}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>X</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text style={styles.caption}>
          <Text style={styles.username}>{username}</Text> {caption}
        </Text>
      </View>

      {/* Veto Modal */}
      <Modal
        isVisible={modalVisible}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection={['down']}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        style={styles.modal}
        backdropTransitionOutTiming={0}
      >
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

            {!userHasVeto && (
              <Text style={styles.modalSubtitle}>
                Only veto if you think this post does not demonstrate the group task
              </Text>
            )}
          </View>
          <View style={styles.modalButtons}>
            {!userHasVeto ? (
              <TouchableOpacity style={styles.confirmButton} onPress={addVeto}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Veto</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.confirmButton} onPress={removeVeto}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Remove Veto</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isVisible={extraModalVisible}
        onSwipeComplete={() => setExtraModalVisible(false)}
        swipeDirection={['down']}
        onBackdropPress={() => setExtraModalVisible(false)}
        onBackButtonPress={() => setExtraModalVisible(false)}
        style={styles.modal}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOptions}>
            <TouchableOpacity
              style={styles.deleteOptionButton}
              onPress={() => {
                setExtraModalVisible(false);
                setDeleteConfirmationVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { marginTop: 20 }]}
              onPress={() => setExtraModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={deleteConfirmationVisible}
        onSwipeComplete={() => setDeleteConfirmationVisible(false)}
        swipeDirection={['down']}
        onBackdropPress={() => setDeleteConfirmationVisible(false)}
        onBackButtonPress={() => setDeleteConfirmationVisible(false)}
        style={styles.modal}
        backdropTransitionOutTiming={0}
      >
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
            <TouchableOpacity style={styles.confirmButton} onPress={deletePost}>
              {deleteLoading ? (
                <ActivityIndicator color={'white'} />
              ) : (
                <Text style={styles.buttonText}>Confirm</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDeleteConfirmationVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
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
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 4,
  },
  headerTextContainer: {
    marginLeft: 10,
    marginRight: 'auto',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  date: {
    color: '#757575',
    fontSize: 12,
  },
  optionsButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 10,
    justifyContent: 'center',
  },
  optionsButtonText: {
    fontSize: 18,
    marginBottom: 8,
  },
  wrapper: {
    height: height + 20, // Adjusted to include dots
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    width: width,
    marginHorizontal: 'auto',
  },
  mediaContainer: {
    width: width,
    height: height,
    backgroundColor: '#e3e3e3',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mediaImage: {
    width: width,
    height: width,
  },
  media: {
    width: width,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentIcon: {
    width: 25,
    height: 25,
    borderRadius: 4,
  },
  commentCount: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  vetoCount: {
    marginLeft: 'auto',
    marginRight: 2,
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: 'red',
    width: 25,
    height: 25,
    padding: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  caption: {
    fontSize: 14,
    color: '#333',
  },
  // Modal Styles
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  boldText: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
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
  // Extra Modal Options
  modalOptions: {
    width: '100%',
    alignItems: 'center',
  },
  deleteOptionButton: {
    backgroundColor: 'red',
    width: '100%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default memo(PostComponent, (prevProps, nextProps) => {
  // Compare relevant props to decide whether to re-render
  const areVetoEqual =
    prevProps.veto.length === nextProps.veto.length &&
    prevProps.veto.every((value, index) => value === nextProps.veto[index]);

  const areCommentsEqual =
    prevProps.comments.length === nextProps.comments.length &&
    prevProps.comments.every(
      (comment, index) =>
        comment.id === nextProps.comments[index].id &&
        comment.message === nextProps.comments[index].message &&
        comment.username === nextProps.comments[index].username &&
        comment.users?.pfp === nextProps.comments[index].users?.pfp
    );

  const result =
    prevProps.postid === nextProps.postid &&
    prevProps.imageLink === nextProps.imageLink &&
    prevProps.videoLink === nextProps.videoLink &&
    prevProps.caption === nextProps.caption &&
    prevProps.time === nextProps.time &&
    prevProps.valid === nextProps.valid &&
    areVetoEqual &&
    prevProps.totalUsers === nextProps.totalUsers &&
    prevProps.userHasVeto === nextProps.userHasVeto &&
    areCommentsEqual; // Include comments comparison

  return result;
});
