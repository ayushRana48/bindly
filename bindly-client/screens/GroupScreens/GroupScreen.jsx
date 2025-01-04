// GroupScreen.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import placeholder from '../../assets/GroupIcon.png';
import backArrow from '../../assets/backArrow.png';
import settings from '../../assets/settings.png';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
import members from '../../assets/members.png';
import info from '../../assets/info.png';
import PostItem from '../GroupScreens/components/PostItem'; // Adjust the path if necessary
import BottomSheetScrollView from '../GroupScreens/components/BottomSheetScrollView'; // Adjust the path
import { TouchableOpacity } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth - 48; // Adjusted for padding/margins

const GroupScreen = () => {
  const route = useRoute();
  const { groupData } = route.params;
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { groupData: gd, setGroupData, setGroups } = useGroupsContext();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUserContext();
  const [posts, setPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [page, setPage] = useState(1);
  const [groupUsers, setGroupUsers] = useState([]);
  const [createStatus, setCreateStatus] = useState('post');
  const [commentsHash, setCommentsHash] = useState({});
  const [viewHeight, setViewHeight] = useState(0);

  const postsPerPage = 5; // Number of posts to load at a time

  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostComments, setSelectedPostComments] = useState([]);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [selectedPostLikes, setSelectedPostLikes] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const bottomSheetRef = useRef(null);
  const bottomSheetRef2 = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
      }
    );
  
    return () => {
      keyboardDidShowListener.remove();  // Cleanup listeners on unmount
      keyboardDidHideListener.remove();
    };
  }, []);

  


  useEffect(() => {
    if (gd?.group) {
      setImageUrl(gd?.group?.pfp);
      setPosts(gd?.post || []);
      setVisiblePosts((gd?.post || []).slice(0, page * postsPerPage));
      setGroupUsers(gd?.usergroup);
    }

    let dict = {};
    if (gd && gd.post) {
      gd.post.forEach((p) => {
        dict[p.postid] = p.comment;
        if (p.comment) {
        }
      });
    }
    setCommentsHash(dict);
  }, [gd]);

  const started = new Date(groupData.startdate) < new Date();
  const ended = new Date(groupData.enddate) < new Date();
  const totalUsers = groupUsers.length;
  const groupId = groupData.groupid;

  const updatePostVeto = (updatedPost) => {
    setGroupData(g => {
      const newPosts = g.post.map(p => (p.postid === updatedPost.postid ? updatedPost : p));
      return { ...g, post: newPosts };
    });
  };
  const updatePostLikes = (updatedPostId, username) => {

    console.log('heeereee',username)
    setGroupData((g) => {
      const newPosts = g.post.map((p) => {
        if (p.postid === updatedPostId) {
          // Check if the username is already in the likes array
          const isLiked = p.likes.includes(username);
  
          // Update likes array by adding or removing the username
          const updatedLikes = isLiked
            ? p.likes.filter((like) => like !== username) // Remove the username if it's already liked
            : [...p.likes, username]; // Add the username if not already liked
  
          // Return the updated post with the modified likes
          console.log('updatedLikes', updatedLikes)
          return { ...p, likes: updatedLikes };
        }
  
        // Return the post unchanged if it's not the target post
        
        return p;
      });
  
      // Return the updated group data with the modified posts array
      return { ...g, post: newPosts };
    });
  };
  

  const removePost = (deletedPostId) => {
    setGroupData(g => {
      const newPosts = g.post.filter(p => p.postid !== deletedPostId);
      return { ...g, post: newPosts };
    });
  };

  const addComment = (comment, postid) => {
    setGroupData(g => {
      const newPosts = g.post.map(p => {
        if (p.postid === postid) {
          const commentList = [...p.comment, { ...comment, users: { pfp: user.pfp } }];
          return { ...p, comment: commentList };
        } else {
          return p;
        }
      });
      return { ...g, post: newPosts };
    });
  };

  useEffect(() => {
    const postStatusCheck = async () => {
      const response2 = await fetch(`http://localhost:3000/bindly/post/postStatus`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          "username": user.username,
          "groupId": groupData.groupid
        }),
      });

      if (!response2.ok) {
        const errorResponse = await response2.json();
        if (errorResponse.message == 'JSON object requested, multiple (or no) rows returned]') {
          setCreateStatus('post');
        }
      }

      const res2 = await response2.json();

      if (res2) {
        setCreateStatus(res2.data);
        if (res2.data != gd?.createStatus) {
          setGroupData(g => { return { ...g, 'createStatus': res2.data, timecycle: res2.startdate } });
        }
      }
    };
    postStatusCheck();
  }, [gd?.post, gd?.createStatus]);

  const getUserPfp = (username) => {
    return usersHashmap[username];
  };

  const getPostComments = (postid) => {
    return commentsHash[postid];
  };

  const usersHash = () => {
    let dict = {};
    if (gd && gd.usergroup) {
      gd.usergroup.forEach(p => {
        dict[p.username] = p.users.pfp;
      });
    }
    return dict;
  };

  const usersHashmap = usersHash();

  const getGroup = async () => {
    try {
      const isInGroup = await inGroup();

      if (!isInGroup) {
        Alert.alert("Invalid Group", "Group has been deleted or not in group");
        navigation.navigate('GroupsList');
        setGroups(g => g.filter(h => h.groupid !== groupData.groupid));
        return;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const response = await fetch(`http://localhost:3000/bindly/group/${groupData.groupid}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res = await response.json();
      setGroupData(res);
      setPosts(res.post || []);
      setGroupUsers(res?.usergroup);

      setVisiblePosts((res.post || []).slice(0, postsPerPage));

      const response2 = await fetch(`http://localhost:3000/bindly/post/postStatus`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          "username": user.username,
          "groupId": groupData.groupid
        }),
      });

      if (!response2.ok) {
        const errorResponse = await response2.json();
        if (errorResponse.message == 'JSON object requested, multiple (or no) rows returned]') {
          setCreateStatus('post');
        }
      }

      const res2 = await response2.json();

      if (res2) {
        setGroupData(g => { return { ...g, 'createStatus': res2.data, timecycle: res2.startdate } });
        setCreateStatus(res2.data);
      }

    } catch (error) {
      console.error(error);
      if (error.message === 'JSON object requested, multiple (or no) rows returned') {
        Alert.alert("Invalid Group", "Group has been deleted");
        navigation.navigate('GroupsList');
        setGroups(g => g.filter(h => h.groupid !== groupData.groupid));
      }
    } finally {
      setLoading(false);
    }
  };

  const inGroup = async () => {
    try {
      const response = await fetch(`http://localhost:3000/bindly/usergroup/inGroup`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify({
          "username": user.username,
          "groupId": groupData.groupid
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res = await response.json();
      return res.inGroup;
    } catch (error) {
      console.error(error);
    }
    return false;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getGroup().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    getGroup();
  }, []);

  const back = () => {
    navigation.navigate('GroupsList');
  };

  const setting = () => {
    if (!loading) {
      navigation.navigate("GroupSetting");
    }
  };

  const toMembers = () => {
    navigation.navigate("MembersList");
  };

  const toPost = () => {
    if (createStatus == 'edit') {
      navigation.navigate("EditPost");
    } else if (createStatus == 'post') {
      navigation.navigate("CreatePost");
    } else {
      Alert.alert('Wait 4 hours from previous post');
    }
  };

  const toInfo = () => {
    navigation.navigate("Info");
  };

  const loadMorePosts = () => {
    const nextPage = page + 1;
    const newVisiblePosts = posts.slice(0, nextPage * postsPerPage);
    setVisiblePosts(newVisiblePosts);
    setPage(nextPage);
  };

  const onOpenCommentsModal = (postid) => {
    const post = posts.find(p => p.postid === postid);
    if (post) {
      setSelectedPostComments(post.comment || []);
      setSelectedPostId(postid);
      setCommentsModalVisible(true);
      bottomSheetRef.current?.expand();
    }
  };

  const onOpenLikesModal = (postid) => {
    const post = posts.find(p => p.postid === postid);
    if (post) {
      setSelectedPostLikes(post.likes || []);
      setSelectedPostId(postid);
      setLikesModalVisible(true);
      bottomSheetRef2.current?.expand();
    }
  };

  const closeCommentsModal = () => {
    setCommentsModalVisible(false);
    setSelectedPostComments([]);
    setSelectedPostId(null);
    setCommentText('');
    if (Keyboard.isVisible) {
      Keyboard.dismiss();
    }
  };

  const closeLikesModal = () => {
    setLikesModalVisible(false);
    setSelectedPostLikes([]);
    setSelectedPostId(null);
  };

  const postComment = async () => {
    if (commentText.trim() === '') {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/bindly/comment/addComment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postid: selectedPostId,
            groupid: groupId,
            username: user.username,
            message: commentText.trim(),
          }),
        }
      );

      const { status, body } = await response.json().then((data) => ({
        status: response.status,
        body: data,
      }));

      if (status === 200) {
        addComment(body, selectedPostId); // Assuming addComment updates the comments in the parent
        setSelectedPostComments(prevComments => [...prevComments, { ...body, users: { pfp: user.pfp } }]);
      }
    } catch (error) {
      console.log('Fetch error: ', error);
      Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
    } finally {
      setCommentText('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onMomentumScrollEnd={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
            loadMorePosts();
          }
        }}
        style={{ padding: 24 }}
      >
        <Pressable style={styles.backArrow} onPress={back}>
          <Image style={{ height: 40, width: 40 }} source={backArrow} />
        </Pressable>
        {!loading && (
          <Pressable style={styles.setting} onPress={setting}>
            <Image style={{ height: 40, width: 40 }} source={settings} />
          </Pressable>
        )}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>{groupData.groupname}</Text>

          <View style={{ flexDirection: 'row' }}>
            <View>
              <Image style={{ width: 100, height: 100, borderRadius: 8 }} source={imageUrl.length > 0 && !loading ? { uri: imageUrl } : placeholder} />
            </View>
            {!loading && (
              <View style={{ flexDirection: 'row', width: 160, justifyContent: 'space-between', marginTop: 20, marginLeft: 40 }}>
                <View style={{ textAlign: 'center', alignItems: 'center' }}>
                  <Pressable style={styles.headerButton} onPress={toMembers}>
                    <Image style={styles.headerButtonIcon} source={members} />
                  </Pressable>
                  <Text>Members</Text>
                </View>
                <View style={{ textAlign: 'center', alignItems: 'center' }}>
                  <Pressable style={styles.headerButton} onPress={toInfo}>
                    <Image style={styles.headerButtonIcon} source={info} />
                  </Pressable>
                  <Text>Info</Text>
                </View>
              </View>
            )}
          </View>

          {(!loading && started && !ended) && (
            <>
              <Pressable style={styles.createPost} onPress={toPost}>
                <Text style={{ color: 'white' }}>{createStatus == 'edit' ? 'Edit Post' : 'Create Post'}</Text>
              </Pressable>
              <Text style={{ textAlign: 'center' }}>Post by {new Date(groupData.startdate).toLocaleTimeString()}</Text>
            </>
          )}

          {(!loading && !started) && <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }} >Starts {new Date(groupData.startdate).toLocaleDateString() + ' ' + new Date(groupData.startdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }</Text>}

          {(!loading && ended) && <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }}>Ended {new Date(groupData.enddate).toLocaleDateString() + ' ' + new Date(groupData.enddate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }</Text>}

        </View>

        {loading && <ActivityIndicator size="large" color="#0000ff" />}

        <View style={{ marginBottom: 60 }}>
          {!loading && visiblePosts.map((post, index) => (
            <PostItem
              key={post.postid}
              postid={post.postid}
              imageLink={post.photolink}
              videoLink={post.videolink}
              username={post.username}
              caption={post.caption}
              pfpLink={getUserPfp(post.username)}
              time={post.timepost}
              valid={post.valid}
              veto={post.veto}
              totalUsers={totalUsers}
              removePost={removePost}
              updatePostVeto={updatePostVeto}
              updatePostLikes={updatePostLikes}
              groupId={groupId}
              userHasVeto={post.veto.includes(user.username)}
              userHasLiked={post.likes.includes(user.username)}
              comments={commentsHash[post.postid]}
              addComment={addComment}
              onOpenCommentsModal={onOpenCommentsModal} // Pass the function
              onOpenLikesModal={onOpenLikesModal}
              likes={post.likes}

            />
          ))}
        </View>
      </ScrollView>

      {/* Comments Modal */}
   

        <BottomSheetScrollView
          ref={bottomSheetRef}
          snapTo="66%"
          backgroundColor="white"
          backDropColor="rgba(0,0,0,0.5)"
          closeFunc={closeCommentsModal}

        >
          <View style={{ ...styles.commentsModalContainer }}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
            </View>
            <ScrollView style={styles.commentsContent}>
              {selectedPostComments.length === 0 ? (
                <Text style={styles.noCommentsText}>No comments yet.</Text>
              ) : (
                selectedPostComments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentRow}>
                      <Image
                        style={styles.commentProfileImage}
                        source={comment.users.pfp ? { uri: comment.users.pfp } : placeholder}
                      />
                      <View style={styles.commentTextContainer}>
                        <Text style={styles.commentUsername}>{comment.username}</Text>
                        <Text style={styles.commentText}>{comment.message}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={320} // Use the dynamically set height
      style={styles.commentInputKeyboardAvoiding}
    >
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                multiline
                maxLength={300}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  postComment();
                  Keyboard.dismiss();
                }}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
          </View>
        </BottomSheetScrollView>


      {/*likes Modal*/}
      <BottomSheetScrollView
        ref={bottomSheetRef2}
        snapTo="66%"
        backgroundColor="white"
        backDropColor="rgba(0,0,0,0.5)"
        closeFunc={closeLikesModal}

      >
        <View style={{ ...styles.commentsModalContainer }}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Likes</Text>
          </View>
          <ScrollView style={styles.commentsContent}>
            {selectedPostLikes.length === 0 ? (
              <Text style={styles.noCommentsText}>No likes ye.</Text>
            ) : (
              selectedPostLikes.map((like) => (
                <View key={like} style={styles.likeItem}>
                  <View style={styles.commentRow}>
                    <Image
                      style={styles.likeProfileImage}
                      source={getUserPfp(like) ? { uri: getUserPfp(like) } : placeholder}
                    />
                    <Text style={styles.likeUsername}>{like}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

        </View>
      </BottomSheetScrollView>
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
    height: 235,
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
  // Comments Modal Styles
  commentsModalContainer: {
    height: '100%', // 2/3 of the screen
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  commentsHeader: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsContent: {
    flex: 1, // Makes ScrollView take up remaining space
    paddingHorizontal: 10,

  },
  commentItem: {
    marginVertical: 8,
  },
  likeItem: {
    marginVertical: 8,
    paddingHorizontal: 16
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  likeProfileImage: {
    width: 35,
    height: 35,
    borderRadius: 4,
  },
  commentTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  likeUsername: {
    fontWeight: 700,
    fontSize: 16,
    marginVertical: 'auto',
    marginLeft: 12
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  commentInputKeyboardAvoiding: {
    // Optional: additional styling if needed
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 0 : 10, // Adjust for iOS bottom padding
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    paddingHorizontal: 5,

  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: 'dodgerblue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
  // No Comments Text
  noCommentsText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 20,
    fontSize: 16,
  },
});

export default GroupScreen;
