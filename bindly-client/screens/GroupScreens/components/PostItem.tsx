// PostComponent.js
import React, { useState, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity
} from 'react-native';

//@ts-ignore
import placeholder from '../../../assets/profile.png';
import { useUserContext } from '../../../UserContext';

import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'; // Reanimated imports
import * as Haptics from 'expo-haptics';
import { Comment, Post } from '../../../types';
import PostHeader from './postComponents/PostHeader';
import PostMedia from './postComponents/PostMedia';
import PostActions from './postComponents/PostActions';
import VetoModal from './postComponents/VetoModal';
import DeleteModal from './postComponents/DeleteModal';
import { checkToken } from '../../../utils/checkToken';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth - 48; // Adjusted for padding/margins
const height = width; // Assuming a 1:1 aspect ratio

interface PostItemProps {
  postid: string;
  imageLink: string;
  videoLink: string;
  username: string;
  pfpLink: string;
  caption: string;
  time: Date | string;
  valid: boolean;
  veto: string[];
  totalUsers: number;
  removePost: (postId: string) => void;
  updatePostVeto: (updatedPost: Post) => void;
  groupId: string;
  userHasVeto: boolean;
  userHasLiked: boolean;
  likes: string[];
  updatePostLikes: (postId: string, username: string) => void;
  comments: Comment[];
  onOpenCommentsModal: (postId: string) => void;
  onOpenLikesModal: (postId: string) => void;
}


const PostComponent: React.FC<PostItemProps> = ({
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
  userHasLiked,
  likes,
  updatePostLikes,
  comments,
  onOpenCommentsModal,
  onOpenLikesModal
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [extraModalVisible, setExtraModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState('delete'); // Track modal state


  const scale = useSharedValue(0);


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


  const handleDeletePress = () => {
    // Switch to the confirmation step
    setModalStep('confirm');
  };

  const closeModal = () => {
    // Reset modal to initial step and close
    setModalStep('delete');
    setExtraModalVisible(false);
  };



  const doubleTapLike = async () => {


    if (loading) {
      return;
    }

    scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }, () => {
      //@ts-ignore
      scale.value = withTiming(0, { duration: 300, delay: 500 }); // Heart fades out after some time
    });

    if (userHasLiked) {
      return
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);


    updatePostLikes(postid, user?.username || "");

    let route = 'https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/addLike'
    setLoading(true);
    try {
      const token = await checkToken();
      const response = await fetch(
        route,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
          body: JSON.stringify({
            postid: postid,
            username: user?.username || "",
            groupid: groupId,
          }),
        }
      );

      const { status, body } = await response.json().then((data) => ({
        status: response.status,
        body: data,
      }));



      if (status === 200) {
      }
    } catch (error) {
      console.log('Fetch error: ', error);
      Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
    } finally {
      setModalVisible(false);
      setLoading(false);
    }
  };




  return (
    <View style={styles.container}>


      <PostHeader
        username={username}
        currentUser={user}
        profilePicture={profilePicture}
        time={time}
        onOptionsPress={() => {
          setExtraModalVisible(true);
        }}
      />

      <PostMedia
        imageLink={imageLink}
        videoLink={videoLink}
        userHasLiked={userHasLiked}
        postid={postid}
        groupId={groupId}
        username={user?.username || ""}
        updatePostLikes={updatePostLikes}
      />

      {/* Caption and Actions */}
      <PostActions
        valid={valid}
        userHasLiked={userHasLiked}
        likes={likes}
        comments={comments}
        veto={veto}
        totalUsers={totalUsers}
        username={username}
        caption={caption}
        postid={postid}
        groupId={groupId}
        currentUsername={user?.username || ""}
        updatePostLikes={updatePostLikes}
        onOpenLikesModal={onOpenLikesModal}
        onOpenCommentsModal={onOpenCommentsModal}
        onVetoPress={() => setModalVisible(true)}
      />

      {/* Veto Modal */}
      <VetoModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        userHasVeto={userHasVeto}
        postid={postid}
        groupId={groupId}
        username={user?.username || ""}
        updatePostVeto={updatePostVeto}
      />

      {/* Delete Modal */}

      <DeleteModal
        isVisible={extraModalVisible}
        onClose={closeModal}
        modalStep={modalStep}
        postid={postid}
        removePost={removePost}
        onDeletePress={handleDeletePress}
        groupid={groupId}

      />

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
    height: height, // Adjusted to include dots
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    width: width,
    marginHorizontal: 'auto',
    backgroundColor: 'red'
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
    marginLeft: 8,
    marginRight: 24,
    fontSize: 14,
    color: '#333',
  },
  vetoCount: {
    marginLeft: 'auto',
    marginRight: 8,
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: 'red',
    width: 26,
    height: 26,
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
    height: '30%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
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
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    marginBottom: 15,
    height: 50
  },
  cancelButton: {
    backgroundColor: 'dodgerblue',
    padding: 15,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    height: 50

  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginVertical: 'auto'
  },
  // Extra Modal Options
  modalOptions: {
    width: '100%',
    alignItems: 'center',
  },
  deleteOptionButton: {
    backgroundColor: 'red',
    width: '45%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    height: 50,
    marginTop: 25

  },
  heartContainer: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    zIndex: 1,
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
  const areLikesEqual =
    prevProps.likes.length === nextProps.likes.length &&
    prevProps.likes.every((value, index) => value === nextProps.likes[index]);


  const result =
    prevProps.postid === nextProps.postid &&
    prevProps.imageLink === nextProps.imageLink &&
    prevProps.videoLink === nextProps.videoLink &&
    prevProps.caption === nextProps.caption &&
    prevProps.time === nextProps.time &&
    prevProps.valid === nextProps.valid &&
    areVetoEqual &&
    areLikesEqual &&
    prevProps.totalUsers === nextProps.totalUsers &&
    prevProps.userHasVeto === nextProps.userHasVeto &&
    areCommentsEqual; // Include comments comparison

  return result;
});
